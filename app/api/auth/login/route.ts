import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    console.log('>>> [Login API] POST request start');
    try {
        const body = await request.json().catch(e => {
            console.error('[Login API] Failed to parse JSON body');
            return null;
        });

        if (!body) return NextResponse.json({ success: false, message: 'Invalid JSON' }, { status: 400 });

        const { email, password } = body;
        console.log('[Login API] Attempting sign in for:', email);

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error('[Login API] Supabase Auth Error:', error.message);
            return NextResponse.json({ success: false, message: error.message }, { status: 400 });
        }

        // Fetch user's name from users table
        const { data: userData } = await supabase
            .from('users')
            .select('name')
            .eq('email', email)
            .maybeSingle();

        const userNameFromDB = (userData as { name: string | null } | null)?.name;
        const userNameFromMeta = data.user?.user_metadata?.name;
        const userName = userNameFromDB || userNameFromMeta || null;

        console.log('[Login API] Login successful, user name found:', userName);

        return NextResponse.json({
            success: true,
            user: {
                id: data.user.id,
                email: data.user.email,
                name: userName
            },
            message: '로그인에 성공했습니다.'
        });
    } catch (err: any) {
        console.error('[Login API] Internal Crash:', err.message);
        return NextResponse.json({ success: false, message: '서버 내부 오류: ' + err.message }, { status: 500 });
    }
}
