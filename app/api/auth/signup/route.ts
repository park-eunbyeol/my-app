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
        console.log('[Signup API] Attempting sign up for:', email, 'with name:', name);

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: name
                }
            }
        });

        if (error) {
            console.error('[Signup API] Supabase Auth Error:', error.message);
            return NextResponse.json({ success: false, message: error.message }, { status: 400 });
        }

        // Save user name to users table
        if (data.user && name) {
            const { error: dbError } = await supabase
                .from('users')
                .upsert({
                    email: email,
                    name: name
                } as any, { onConflict: 'email' });

            if (dbError) {
                console.error('[Signup API] Failed to save user name:', dbError.message);
                // Don't fail the signup, just log the error
            } else {
                console.log('[Signup API] User name saved successfully');
            }
        }

        console.log('[Signup API] Signup request successful');
        return NextResponse.json({ success: true, user: data.user, message: '회원가입 요청이 완료되었습니다. 이메일 확인을 부탁드립니다.' });
    } catch (err: any) {
        console.error('[Signup API] Internal Crash:', err.message);
        return NextResponse.json({ success: false, message: '서버 내부 오류: ' + err.message }, { status: 500 });
    }
}
