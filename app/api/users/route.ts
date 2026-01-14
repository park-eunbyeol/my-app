import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// 스티비 공개 구독 API 엔드포인트 (주소록 466239 전용)
const STIBEE_PUBLIC_API_URL = "https://stibee.com/api/v1.0/lists/kk3NKQX6RorIi23gl1_fgSoapKIgTg==/public/subscribers";

/**
 * 스티비 공개 API를 이용한 구독자 자동 등록
 */
async function subscribeToStibee(email: string, name?: string) {
    try {
        console.log(`[Stibee Sync] Attempting to subscribe: ${email}`);

        // 스티비 공개 API는 보통 form-data 형식을 기대함
        const formData = new URLSearchParams();
        formData.append('email', email);
        if (name) formData.append('name', name);
        // 필수 동의 항목 처리 (HTML 폼 기반)
        formData.append('stb_policy', 'stb_policy_true');

        const response = await fetch(STIBEE_PUBLIC_API_URL, {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'Referer': 'https://page.stibee.com/subscriptions/466239', // 정확한 구독 페이지 주소
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
        });

        const status = response.status;
        const text = await response.text();
        console.log(`[Stibee Sync] Status: ${status}`);
        console.log(`[Stibee Sync] Raw Response: ${text.substring(0, 500)}`);

        try {
            const json = JSON.parse(text);
            if (json.code === '0000' || response.ok) {
                console.log('[Stibee Sync] Success reported by Stibee');
            } else {
                console.warn('[Stibee Sync] Error response:', json);
            }
            return json;
        } catch (e) {
            console.error('[Stibee Sync] Parse error or non-JSON:', text);
            return { raw: text };
        }
    } catch (error) {
        console.error('[Stibee Sync] Network/Fetch Error:', error);
        return null;
    }
}

// GET: 사용자 목록 조회
export async function GET(request: Request) {
    console.log('[Users API] GET request received');

    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const email = searchParams.get('email');

        // 페이지네이션 계산
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        // 쿼리 빌더
        let query = supabase
            .from('users')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);

        // 이메일 필터
        if (email) {
            query = query.ilike('email', `%${email}%`);
        }

        const { data, error, count } = await query;

        if (error) {
            console.error('[Users API] Supabase error:', error);
            return NextResponse.json(
                {
                    success: false,
                    message: `데이터 조회 오류: ${error.message}`,
                },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            data,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
            },
        });
    } catch (err: any) {
        console.error('[Users API] Server error:', err);
        return NextResponse.json(
            {
                success: false,
                message: `서버 오류가 발생했습니다: ${err.message}`,
            },
            { status: 500 }
        );
    }
}

// POST: 사용자 생성/신청 처리
export async function POST(request: Request) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    console.log('[Users API] POST request received. Supabase URL configured:', url ? 'Yes' : 'No');
    if (url) {
        const maskedUrl = url.replace(/(https?:\/\/)(.*)(\.supabase\.co)/, '$1***$3');
        console.log('[Users API] Confirmed endpoint (masked):', maskedUrl);
    }

    try {
        const body = await request.json();
        const {
            email,
            name,
            phone,
            cafeName,
            plan,
            interestedServices,
            agreePrivacy,
            agreeMarketing,
            source,
            userId
        } = body;

        if (!email) {
            return NextResponse.json(
                { success: false, message: '이메일은 필수 입력 항목입니다.' },
                { status: 400 }
            );
        }

        // camelCase를 snake_case로 변환하여 삽입
        console.log('[Users API] Attempting to upsert:', {
            email,
            name,
            phone,
            cafe_name: cafeName,
            plan,
            interested_services: interestedServices,
            agree_privacy: agreePrivacy,
            agree_marketing: agreeMarketing,
        });

        // camelCase를 snake_case로 변환하여 삽입
        console.log('[Users API] Attempting to upsert into Supabase');
        const { data, error } = await supabase
            .from('users')
            .upsert({
                email,
                name: name || '',
                phone: phone || '',
                cafe_name: cafeName || '',
                plan: plan || '',
                interested_services: interestedServices || [],
                agree_privacy: !!agreePrivacy,
                agree_marketing: !!agreeMarketing,
            } as any, {
                onConflict: 'email',
                ignoreDuplicates: false
            })
            .select()
            .single();

        if (error) {
            console.error('[Users API] Supabase DB error:', JSON.stringify(error, null, 2));
            return NextResponse.json(
                {
                    success: false,
                    message: `데이터베이스 저장 오류: ${error.message}`,
                    errorDetails: error
                },
                { status: 400 }
            );
        }

        console.log('[Users API] Insertion success:', data);

        // 새 신청 알림 메일 발송
        try {
            if (process.env.RESEND_API_KEY) {
                // 신청 경로에 따라 제목과 테마색 결정
                const isNewsletter = source === 'newsletter';
                const isFreeDiagnosis = source === 'hero_diagnosis' || source === 'header_button' || (source === 'landing_page' && !plan);
                const isPartnership = !isNewsletter && !isFreeDiagnosis;

                const typeText = isNewsletter ? '뉴스레터 구독' : (isFreeDiagnosis ? '무료 진단' : '파트너십');
                const title = isNewsletter ? '📧 새로운 뉴스레터 구독' : (isFreeDiagnosis ? '🔍 새로운 무료 진단 신청' : '🤝 새로운 파트너십 신청');
                const accentColor = isNewsletter ? '#059669' : (isFreeDiagnosis ? '#2563eb' : '#d97706');
                const willSyncStibee = isNewsletter || agreeMarketing;

                await resend.emails.send({
                    from: 'CafeDream <onboarding@resend.dev>',
                    to: [process.env.NOTIFICATION_EMAIL || 'yjm3625@gmail.com'],
                    subject: `[카페드림] ${title}: ${name || email.split('@')[0]}님`,
                    html: `
                        <div style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                            <h2 style="color: ${accentColor}; border-bottom: 2px solid ${accentColor}; padding-bottom: 10px;">${title} 접수</h2>
                            <p style="margin-bottom: 20px;">카페드림 랜딩페이지를 통해 새로운 <strong>${typeText}</strong> 신청이 들어왔습니다. 내용을 확인해 주세요.</p>
                            
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; font-weight: bold; background-color: #fafafa; width: 120px;">성함</td>
                                    <td style="padding: 12px; border-bottom: 1px solid #f0f0f0;">${name || '-'}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; font-weight: bold; background-color: #fafafa;">카페/업체명</td>
                                    <td style="padding: 12px; border-bottom: 1px solid #f0f0f0;">${cafeName || '-'}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; font-weight: bold; background-color: #fafafa;">이메일</td>
                                    <td style="padding: 12px; border-bottom: 1px solid #f0f0f0;">${email}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; font-weight: bold; background-color: #fafafa;">연락처</td>
                                    <td style="padding: 12px; border-bottom: 1px solid #f0f0f0;">${phone || '-'}</td>
                                </tr>
                                ${isPartnership ? `
                                <tr>
                                    <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; font-weight: bold; background-color: #fafafa;">선택 플랜</td>
                                    <td style="padding: 12px; border-bottom: 1px solid #f0f0f0;">${plan || '-'}</td>
                                </tr>
                                ` : ''}
                                 <tr>
                                    <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; font-weight: bold; background-color: #fafafa;">신청 경로</td>
                                    <td style="padding: 12px; border-bottom: 1px solid #f0f0f0;">
                                        <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; background-color: ${accentColor}1A; color: ${accentColor}; font-weight: bold;">
                                            ${source === 'newsletter' ? '뉴스레터 구독박스' : (isFreeDiagnosis ? '무료 진단 폼' : '파트너십 신청 폼')}
                                        </span>
                                        ${willSyncStibee ? `
                                        <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; background-color: #f1f5f9; color: #475569; font-size: 0.85em; margin-left: 5px; border: 1px solid #e2e8f0;">
                                            스티비 자동동기화 대상
                                        </span>
                                        ` : ''}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; font-weight: bold; background-color: #fafafa;">신청 일시</td>
                                    <td style="padding: 12px; border-bottom: 1px solid #f0f0f0;">${new Date().toLocaleString('ko-KR')}</td>
                                </tr>
                            </table>
                            
                            <div style="margin-top: 30px; padding: 15px; background-color: #f8fafc; border-radius: 5px; font-size: 0.9em; color: #64748b;">
                                * 이 메일은 카페드림 시스템에 의해 자동으로 발송되었습니다. <br/>
                                ${willSyncStibee ? '* 해당 신청자는 스티비 주소록에 자동으로 추가 요청되었습니다. (Double Opt-in 확인 필요)' : '* 빠른 시일 내에 신청 내용을 검토해 주시기 바랍니다.'}
                            </div>
                        </div>
                    `
                });
                console.log('[Users API] Notification email sent successfully');
            }
        } catch (emailError) {
            console.error('[Users API] Email notification failed:', emailError);
            // 메일 발송 실패가 전체 프로세스를 중단시키지 않음
        }

        // 스티비 자동 동기화 (뉴스레터 신청 시 또는 전체 신청 시)
        // 여기서는 뉴스레터 신청(source === 'newsletter')일 때 우선 실행
        if (source === 'newsletter' || agreeMarketing) {
            await subscribeToStibee(email, name);
        }

        return NextResponse.json({
            success: true,
            message: '신청이 성공적으로 완료되었습니다.',
            data
        });
    } catch (err: any) {
        console.error('[Users API] Global catch error:', err);

        const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const maskedUrl = url ? url.replace(/(https?:\/\/)(.*)(\.supabase\.co)/, '$1***$3') : 'NOT_FOUND';

        let detailedMessage = err.message || '알 수 없는 서버 오류';
        if (detailedMessage.includes('fetch failed')) {
            detailedMessage = `Supabase 연결 대기 중 오류 (fetch failed). URL: ${maskedUrl}. .env.local 설정 후 서버를 재시작해 주세요.`;
        }

        return NextResponse.json(
            {
                success: false,
                message: detailedMessage,
                diagnostics: {
                    url_set: !!url,
                    url_len: url.length,
                    key_set: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
                    masked_url: maskedUrl,
                    node_version: process.version,
                    env: process.env.NODE_ENV
                }
            },
            { status: 500 }
        );
    }
}
