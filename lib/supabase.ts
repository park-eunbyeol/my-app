import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// 환경 변수 검증
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
        '⚠️ Supabase environment variables are missing. Please check .env.local'
    );
}

// 타입 안전한 Supabase 클라이언트 생성
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
    },
});

// 클라이언트 가져오기 함수 (선택적)
export const getSupabase = () => {
    return supabase;
};

// 타입 내보내기
export type { Database };
