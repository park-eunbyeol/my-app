import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    console.log('>>> [Signup API] POST request start');
    try {
        const body = await request.json().catch(e => {
            console.error('[Signup API] Failed to parse JSON body');
            return null;
        });

        if (!body) return NextResponse.json({ success: false, message: 'Invalid JSON' }, { status: 400 });

        const { email, password, name } = body;

        // 입력 검증
        if (!email || !password) {
            return NextResponse.json({ success: false, message: '이메일과 비밀번호는 필수입니다.' }, { status: 400 });
        }

        console.log('[Signup API] Attempting sign up for:', email, 'with name:', name);

        // 먼저 인증 시도 (이미 가입된 경우를 확인)
        let authData = null;
        let authError = null;

        // 이미 인증된 사용자인지 확인
        const { data: existingUser } = await supabase
            .from('users')
            .select('email, id')
            .eq('email', email)
            .maybeSingle();

        if (existingUser) {
            // 이미 users 테이블에 있으면 name만 업데이트 (upsert로 처리)
            if (name) {
                const { error: updateError } = await supabase
                    .from('users')
                    .upsert({
                        email: email,
                        name: name
                    } as any, { onConflict: 'email' });

                if (updateError) {
                    console.error('[Signup API] Failed to update user name:', updateError.message);
                } else {
                    console.log('[Signup API] User name updated successfully');
                }
            }
            
            // 이미 가입된 사용자이지만 auth.users에는 없을 수 있으므로 인증 시도
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { name: name || '' }
                }
            });

            authData = signUpData;
            authError = signUpError;
        } else {
            // 새 사용자인 경우 회원가입 시도
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { name: name || '' }
                }
            });

            authData = signUpData;
            authError = signUpError;
        }

        // 인증 오류 처리 (이미 가입된 경우는 무시)
        if (authError && !authError.message.includes('already registered') && !authError.message.includes('User already registered')) {
            console.error('[Signup API] Supabase Auth Error:', authError.message);
            return NextResponse.json({ success: false, message: authError.message }, { status: 400 });
        }

        // users 테이블에 저장/업데이트 (auth.users의 id 사용)
        if (authData?.user) {
            const userId = authData.user.id;
            const { error: dbError } = await supabase
                .from('users')
                .upsert({
                    id: userId,
                    email: email,
                    name: name || null
                } as any, { onConflict: 'email' });

            if (dbError) {
                console.error('[Signup API] Failed to save user to database:', dbError.message);
                // DB 오류가 있어도 인증은 성공했으므로 계속 진행
            } else {
                console.log('[Signup API] User saved to database successfully');
            }
        } else if (existingUser) {
            // auth.users에는 없지만 users 테이블에는 있는 경우 (인증만 다시 시도)
            console.log('[Signup API] User already exists in database');
        }

        console.log('[Signup API] Signup request successful');
        return NextResponse.json({ 
            success: true, 
            user: authData?.user || existingUser, 
            message: authData?.session 
                ? '회원가입 및 로그인에 성공했습니다.' 
                : '회원가입 요청이 완료되었습니다. 이메일 확인을 부탁드립니다.' 
        });
    } catch (err: any) {
        console.error('[Signup API] Internal Crash:', err.message);
        console.error('[Signup API] Error stack:', err.stack);
        return NextResponse.json({ success: false, message: '서버 내부 오류: ' + err.message }, { status: 500 });
    }
}
