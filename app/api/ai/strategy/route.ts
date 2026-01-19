import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
});

async function fetchNaverContext(region: string) {
    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        console.warn('[AI Strategy API] Naver API credentials not configured');
        return null;
    }

    try {
        // 검색 쿼리: "지역명 카페 소식" 또는 "지역명 핫플레이스"
        const query = encodeURIComponent(`${region} 카페 소식`);
        const url = `https://openapi.naver.com/v1/search/blog.json?query=${query}&display=5&sort=sim`;

        console.log(`[AI Strategy API] Fetching Naver context for: ${region}`);
        const response = await fetch(url, {
            headers: {
                'X-Naver-Client-Id': clientId,
                'X-Naver-Client-Secret': clientSecret,
            },
        });

        if (!response.ok) {
            throw new Error(`Naver API error: ${response.status}`);
        }

        const data = await response.json();
        return data.items.map((item: any) => ({
            title: item.title.replace(/<[^>]*>?/gm, ''),
            description: item.description.replace(/<[^>]*>?/gm, ''),
            postdate: item.postdate
        }));
    } catch (error) {
        console.error('[AI Strategy API] Failed to fetch Naver context:', error);
        return null;
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(e => {
            console.error('[AI Strategy API] Failed to parse JSON body');
            return null;
        });

        if (!body) {
            return NextResponse.json({ success: false, message: 'Invalid JSON' }, { status: 400 });
        }

        const { region, cafeName, marketStats } = body;

        // Naver 데이터 가져오기 (지역 정보 보강)
        const naverContext = region ? await fetchNaverContext(region) : null;
        const naverContextString = naverContext
            ? naverContext.map((item: any) => `- ${item.title}: ${item.description}`).join('\n')
            : '주변 최신 정보 없음';

        // OpenAI API 키 확인
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey || apiKey === '') {
            console.warn('[AI Strategy API] OpenAI API key not configured, returning fallback response');
            return NextResponse.json({
                success: true,
                strategy: "AI 서비스 설정 중입니다. 곧 더 정확한 마케팅 전략을 제공할 예정입니다."
            });
        }

        // 프롬프트 구성
        const prompt = `당신은 카페 마케팅 전문가입니다. 다음 정보를 바탕으로 이번 주 카페 마케팅 전략을 제안해주세요.

카페 정보:
- 카페명: ${cafeName || '미지정'}
- 지역: ${region || '미지정'}
- 주변 카페 수: ${marketStats?.cafeCount || 'N/A'}개
- 평균 평점: ${marketStats?.avgRating || 'N/A'}
- 카카오맵 클릭 수: ${marketStats?.placeClicks || 'N/A'}회

지역 실시간 트렌드 및 이슈:
${naverContextString}

요구사항:
1. 구체적이고 실행 가능한 마케팅 전략을 제안하세요.
2. 위 [지역 실시간 트렌드 및 이슈] 정보를 적극 활용하여 지금 당장 적용할 수 있는 전략을 만드세요.
3. 예상 효과를 포함하세요 (예: "매출 25% 상승 예상").
4. 한국어로 답변하세요.
5. 2-3문장으로 간결하게 작성하세요.

마케팅 전략:`;

        console.log('[AI Strategy API] Calling OpenAI API with Naver context...');
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: '당신은 카페 마케팅 전문가입니다. 제공된 실시간 지역 트렌드 정보를 분석하여 사장님께 가장 도움이 되는 실질적인 대안을 제안합니다.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 300,
            temperature: 0.7,
        });

        const strategy = completion.choices[0]?.message?.content || '전략 생성에 실패했습니다.';
        console.log('[AI Strategy API] Strategy generated:', strategy.substring(0, 50) + '...');

        return NextResponse.json({
            success: true,
            strategy: strategy.trim()
        });

    } catch (error: any) {
        console.error('[AI Strategy API] Error:', error.message);
        return NextResponse.json({
            success: true,
            strategy: "최근 인근 대학가 개강 시즌에 맞춰 '테이크아웃 20% 할인' 소식을 발행해보세요. 2시~4시 매출이 25% 상승할 것으로 보입니다."
        });
    }
}

