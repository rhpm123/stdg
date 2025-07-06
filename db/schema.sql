-- 틀린그림찾기 웹앱을 위한 데이터베이스 스키마
-- 이 스크립트는 Supabase SQL 에디터에서 실행할 수 있습니다.

-- 스키마 생성
CREATE SCHEMA IF NOT EXISTS app_public;

-- 확장 모듈 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. 이미지 세트 테이블 생성
CREATE TABLE IF NOT EXISTS app_public.image_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  original_image_url TEXT NOT NULL,
  modified_image_url TEXT NOT NULL,
  public_image_url TEXT,
  difficulty INTEGER DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE app_public.image_sets IS '틀린그림찾기 이미지 세트';
COMMENT ON COLUMN app_public.image_sets.id IS '이미지 세트 고유 ID';
COMMENT ON COLUMN app_public.image_sets.title IS '이미지 세트 제목';
COMMENT ON COLUMN app_public.image_sets.description IS '이미지 세트 설명';
COMMENT ON COLUMN app_public.image_sets.original_image_url IS '원본 이미지 URL';
COMMENT ON COLUMN app_public.image_sets.modified_image_url IS '수정된 이미지 URL';
COMMENT ON COLUMN app_public.image_sets.public_image_url IS '게임에서 사용되는 공개 이미지 URL';
COMMENT ON COLUMN app_public.image_sets.difficulty IS '난이도 (1-5)';
COMMENT ON COLUMN app_public.image_sets.active IS '활성화 여부';
COMMENT ON COLUMN app_public.image_sets.created_at IS '생성 시간';
COMMENT ON COLUMN app_public.image_sets.updated_at IS '마지막 업데이트 시간';

-- 업데이트 시간 자동 갱신을 위한 트리거
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_image_sets_modtime
BEFORE UPDATE ON app_public.image_sets
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- 2. 틀린 부분 좌표 테이블 생성
CREATE TABLE IF NOT EXISTS app_public.differences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_set_id UUID NOT NULL REFERENCES app_public.image_sets(id) ON DELETE CASCADE,
  x_coord INTEGER NOT NULL CHECK (x_coord >= 0),
  y_coord INTEGER NOT NULL CHECK (y_coord >= 0),
  radius INTEGER NOT NULL DEFAULT 20 CHECK (radius > 0),
  hint_text TEXT,
  hint_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE app_public.differences IS '틀린 부분 좌표';
COMMENT ON COLUMN app_public.differences.id IS '틀린 부분 고유 ID';
COMMENT ON COLUMN app_public.differences.image_set_id IS '연결된 이미지 세트 ID';
COMMENT ON COLUMN app_public.differences.x_coord IS 'X 좌표';
COMMENT ON COLUMN app_public.differences.y_coord IS 'Y 좌표';
COMMENT ON COLUMN app_public.differences.radius IS '클릭 허용 반경';
COMMENT ON COLUMN app_public.differences.hint_text IS '힌트 텍스트';
COMMENT ON COLUMN app_public.differences.hint_order IS '힌트 표시 순서';
COMMENT ON COLUMN app_public.differences.created_at IS '생성 시간';
COMMENT ON COLUMN app_public.differences.updated_at IS '마지막 업데이트 시간';

-- 업데이트 시간 트리거 추가
CREATE TRIGGER update_differences_modtime
BEFORE UPDATE ON app_public.differences
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_differences_image_set_id ON app_public.differences(image_set_id);

-- 3. 사용자 진행 상황 테이블 생성
CREATE TABLE IF NOT EXISTS app_public.user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL, -- Supabase Auth의 사용자 ID
  image_set_id UUID NOT NULL REFERENCES app_public.image_sets(id) ON DELETE CASCADE,
  found_differences INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  score INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0, -- 초 단위
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- 복합 고유 키: 사용자-이미지 세트 조합은 유일해야 함
  UNIQUE(user_id, image_set_id)
);

COMMENT ON TABLE app_public.user_progress IS '사용자 게임 진행 상태';
COMMENT ON COLUMN app_public.user_progress.id IS '진행 상태 고유 ID';
COMMENT ON COLUMN app_public.user_progress.user_id IS '사용자 ID';
COMMENT ON COLUMN app_public.user_progress.image_set_id IS '이미지 세트 ID';
COMMENT ON COLUMN app_public.user_progress.found_differences IS '찾은 틀린 부분 수';
COMMENT ON COLUMN app_public.user_progress.completed IS '완료 여부';
COMMENT ON COLUMN app_public.user_progress.score IS '획득 점수';
COMMENT ON COLUMN app_public.user_progress.time_spent IS '소요 시간(초)';
COMMENT ON COLUMN app_public.user_progress.started_at IS '게임 시작 시간';
COMMENT ON COLUMN app_public.user_progress.completed_at IS '게임 완료 시간';

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON app_public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_image_set_id ON app_public.user_progress(image_set_id);

-- 4. 발견한 틀린 부분 기록 테이블 생성
CREATE TABLE IF NOT EXISTS app_public.found_differences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_progress_id UUID NOT NULL REFERENCES app_public.user_progress(id) ON DELETE CASCADE,
  difference_id UUID NOT NULL REFERENCES app_public.differences(id) ON DELETE CASCADE,
  found_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 복합 고유 키: 사용자 진행 상태-틀린 부분 조합은 유일해야 함
  UNIQUE(user_progress_id, difference_id)
);

COMMENT ON TABLE app_public.found_differences IS '사용자가 발견한 틀린 부분 기록';
COMMENT ON COLUMN app_public.found_differences.id IS '기록 고유 ID';
COMMENT ON COLUMN app_public.found_differences.user_progress_id IS '사용자 진행 상태 ID';
COMMENT ON COLUMN app_public.found_differences.difference_id IS '틀린 부분 ID';
COMMENT ON COLUMN app_public.found_differences.found_at IS '발견 시간';

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_found_differences_user_progress_id ON app_public.found_differences(user_progress_id);

-- 5. 보안 정책 설정 (RLS)
-- image_sets 테이블 RLS (Row Level Security)
ALTER TABLE app_public.image_sets ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 활성화된 이미지 세트를 볼 수 있음
CREATE POLICY view_image_sets ON app_public.image_sets
  FOR SELECT USING (active = true);
  
-- 관리자만 이미지 세트를 추가/수정/삭제할 수 있음
CREATE POLICY manage_image_sets ON app_public.image_sets
  FOR ALL TO authenticated
  USING (auth.uid() IN (
    SELECT auth.uid() FROM auth.users
    WHERE auth.uid() IN (SELECT user_id FROM app_public.admin_users)
  ));

-- differences 테이블 RLS
ALTER TABLE app_public.differences ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 활성화된 이미지 세트의 차이점을 볼 수 있음
CREATE POLICY view_differences ON app_public.differences
  FOR SELECT USING (
    image_set_id IN (
      SELECT id FROM app_public.image_sets WHERE active = true
    )
  );
  
-- 관리자만 차이점을 추가/수정/삭제할 수 있음
CREATE POLICY manage_differences ON app_public.differences
  FOR ALL TO authenticated
  USING (auth.uid() IN (
    SELECT auth.uid() FROM auth.users
    WHERE auth.uid() IN (SELECT user_id FROM app_public.admin_users)
  ));

-- user_progress 테이블 RLS
ALTER TABLE app_public.user_progress ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 진행 상황만 볼 수 있음
CREATE POLICY view_own_progress ON app_public.user_progress
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
  
-- 사용자는 자신의 진행 상황만 추가/수정할 수 있음
CREATE POLICY manage_own_progress ON app_public.user_progress
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);
  
-- found_differences 테이블 RLS
ALTER TABLE app_public.found_differences ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신이 발견한 틀린 부분만 볼 수 있음
CREATE POLICY view_own_found_differences ON app_public.found_differences
  FOR SELECT TO authenticated
  USING (
    user_progress_id IN (
      SELECT id FROM app_public.user_progress WHERE user_id = auth.uid()
    )
  );
  
-- 사용자는 자신이 발견한 틀린 부분만 추가할 수 있음
CREATE POLICY add_own_found_differences ON app_public.found_differences
  FOR INSERT TO authenticated
  WITH CHECK (
    user_progress_id IN (
      SELECT id FROM app_public.user_progress WHERE user_id = auth.uid()
    )
  );

-- 관리자 사용자 테이블 생성
CREATE TABLE IF NOT EXISTS app_public.admin_users (
  user_id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE app_public.admin_users IS '관리자 권한을 가진 사용자 목록';
COMMENT ON COLUMN app_public.admin_users.user_id IS '관리자 사용자 ID';
COMMENT ON COLUMN app_public.admin_users.created_at IS '관리자 권한 부여 시간';

-- 저장 프로시저: 이미지 세트 및 틀린 부분 등록
CREATE OR REPLACE FUNCTION register_image_set(
  p_title VARCHAR(255),
  p_description TEXT,
  p_original_image_url TEXT,
  p_modified_image_url TEXT,
  p_difficulty VARCHAR(20),
  p_difference_points JSONB
) RETURNS UUID AS $$
DECLARE
  v_image_set_id UUID;
  v_point JSONB;
BEGIN
  -- 이미지 세트 등록
  INSERT INTO app_public.image_sets (title, description, original_image_url, modified_image_url, difficulty)
  VALUES (p_title, p_description, p_original_image_url, p_modified_image_url, p_difficulty)
  RETURNING id INTO v_image_set_id;
  
  -- 틀린 부분 좌표 등록
  FOR v_point IN SELECT * FROM jsonb_array_elements(p_difference_points)
  LOOP
    INSERT INTO app_public.differences (image_set_id, x_coord, y_coord, radius)
    VALUES (
      v_image_set_id,
      (v_point->>'x')::INT,
      (v_point->>'y')::INT,
      (v_point->>'radius')::INT
    );
  END LOOP;
  
  RETURN v_image_set_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 