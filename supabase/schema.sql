-- Users 테이블 생성
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  cafe_name TEXT,
  plan TEXT,
  interested_services TEXT[],
  agree_privacy BOOLEAN DEFAULT false,
  agree_marketing BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 이메일 인덱스 생성 (빠른 검색을 위해)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 생성일 인덱스 (정렬을 위해)
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Updated_at 트리거 생성
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽을 수 있도록 허용
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
CREATE POLICY "Allow public select" ON users FOR SELECT USING (true);

-- 비인증 사용자도 삽입 가능하도록 허용 (회원가입/구독용)
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;
CREATE POLICY "Allow public insert" ON users FOR INSERT WITH CHECK (true);

-- 비인증 사용자도 자신의 정보를 업데이트 가능하도록 허용 (Upsert 대응)
DROP POLICY IF EXISTS "Enable update for users based on email" ON users;
CREATE POLICY "Allow public update" ON users FOR UPDATE USING (true) WITH CHECK (true);

-- 코멘트 추가
COMMENT ON TABLE users IS '커피 구독 서비스 사용자 정보';
COMMENT ON COLUMN users.id IS '사용자 고유 ID (UUID)';
COMMENT ON COLUMN users.email IS '사용자 이메일 (고유값)';
COMMENT ON COLUMN users.name IS '사용자 이름';
COMMENT ON COLUMN users.phone IS '전화번호';
COMMENT ON COLUMN users.cafe_name IS '카페 이름';
COMMENT ON COLUMN users.plan IS '선택한 플랜';
COMMENT ON COLUMN users.interested_services IS '관심 서비스 목록';
COMMENT ON COLUMN users.agree_privacy IS '개인정보 처리방침 동의';
COMMENT ON COLUMN users.agree_marketing IS '마케팅 정보 수신 동의';
COMMENT ON COLUMN users.created_at IS '생성 일시';
COMMENT ON COLUMN users.updated_at IS '수정 일시';
