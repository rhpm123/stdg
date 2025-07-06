-- 이미지 세트 테이블
CREATE TABLE IF NOT EXISTS image_sets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  original_image_url TEXT NOT NULL,
  modified_image_url TEXT NOT NULL,
  public_image_url TEXT,
  difficulty SMALLINT NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  active BOOLEAN NOT NULL DEFAULT true,
  total_differences INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 틀린 부분 위치 좌표 테이블
CREATE TABLE IF NOT EXISTS differences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_set_id UUID REFERENCES image_sets(id) ON DELETE CASCADE NOT NULL,
  x_coord INTEGER NOT NULL,
  y_coord INTEGER NOT NULL,
  radius INTEGER NOT NULL DEFAULT 20,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 사용자 진행 상황 테이블
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_set_id UUID REFERENCES image_sets(id) ON DELETE CASCADE NOT NULL,
  found_differences INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  score INTEGER NOT NULL DEFAULT 0,
  time_spent INTEGER NOT NULL DEFAULT 0, -- 초 단위
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, image_set_id)
);

-- 발견한 틀린 부분 기록 테이블
CREATE TABLE IF NOT EXISTS found_differences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_progress_id UUID REFERENCES user_progress(id) ON DELETE CASCADE NOT NULL,
  difference_id UUID REFERENCES differences(id) ON DELETE CASCADE NOT NULL,
  found_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_progress_id, difference_id)
);

-- 관리자 사용자 테이블
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_image_sets_difficulty ON image_sets(difficulty);
CREATE INDEX IF NOT EXISTS idx_image_sets_active ON image_sets(active);
CREATE INDEX IF NOT EXISTS idx_differences_image_set_id ON differences(image_set_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_image_set_id ON user_progress(image_set_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_score ON user_progress(score);
CREATE INDEX IF NOT EXISTS idx_found_differences_user_progress_id ON found_differences(user_progress_id);

-- 트리거 함수 - 이미지 세트의 총 차이점 수 업데이트
CREATE OR REPLACE FUNCTION update_image_set_differences_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE image_sets
    SET total_differences = total_differences + 1,
        updated_at = now()
    WHERE id = NEW.image_set_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE image_sets
    SET total_differences = GREATEST(total_differences - 1, 0),
        updated_at = now()
    WHERE id = OLD.image_set_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS trigger_update_differences_count ON differences;
CREATE TRIGGER trigger_update_differences_count
AFTER INSERT OR DELETE ON differences
FOR EACH ROW
EXECUTE FUNCTION update_image_set_differences_count();

-- 트리거 함수 - 레코드 업데이트 시간 자동 갱신
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 업데이트 시간 트리거 생성
DROP TRIGGER IF EXISTS trigger_update_image_sets_timestamp ON image_sets;
CREATE TRIGGER trigger_update_image_sets_timestamp
BEFORE UPDATE ON image_sets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_differences_timestamp ON differences;
CREATE TRIGGER trigger_update_differences_timestamp
BEFORE UPDATE ON differences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 