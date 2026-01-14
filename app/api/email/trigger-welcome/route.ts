import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log('Welcome email trigger request:', body);

        // 이 부분에서 실제 이메일 발송 서비스(SendGrid 등) 연동 로직이 들어갑니다.

        return NextResponse.json({
            success: true,
            message: '웰컴 이메일이 발송 대기열에 추가되었습니다.'
        });
    } catch {
        return NextResponse.json({
            success: false,
            message: '이메일 발송 처리 중 오류가 발생했습니다.'
        }, { status: 500 });
    }
}
