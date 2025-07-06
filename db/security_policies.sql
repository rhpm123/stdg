-- 모든 테이블에 RLS 활성화
ALTER TABLE image_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE differences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE found_differences ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 관리자 확인 함수
CREATE OR REPLACE FUNCTION is_admin(uid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM admin_users
    WHERE user_id = uid
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- 자신의 사용자 진행 상황인지 확인하는 함수
CREATE OR REPLACE FUNCTION is_own_progress(uid UUID, progress_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM user_progress
    WHERE id = progress_id AND user_id = uid
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- image_sets 테이블 정책
-- 모든 사용자가 활성 상태의 이미지 세트 조회 가능
DROP POLICY IF EXISTS "모든 사용자 이미지 세트 조회" ON image_sets;
CREATE POLICY "모든 사용자 이미지 세트 조회" ON image_sets
  FOR SELECT
  USING (active = true);

-- 관리자만 이미지 세트 관리 가능
DROP POLICY IF EXISTS "관리자 이미지 세트 관리" ON image_sets;
CREATE POLICY "관리자 이미지 세트 관리" ON image_sets
  FOR ALL
  USING (is_admin(auth.uid()));

-- differences 테이블 정책
-- 모든 사용자가 활성 이미지 세트의 차이점 조회 가능
DROP POLICY IF EXISTS "모든 사용자 차이점 조회" ON differences;
CREATE POLICY "모든 사용자 차이점 조회" ON differences
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM image_sets
      WHERE image_sets.id = differences.image_set_id
      AND image_sets.active = true
    )
  );

-- 관리자만 차이점 관리 가능
DROP POLICY IF EXISTS "관리자 차이점 관리" ON differences;
CREATE POLICY "관리자 차이점 관리" ON differences
  FOR ALL
  USING (is_admin(auth.uid()));

-- user_progress 테이블 정책
-- 사용자는 자신의 진행 상황만 조회 및 관리 가능
DROP POLICY IF EXISTS "사용자 자신의 진행 상황 관리" ON user_progress;
CREATE POLICY "사용자 자신의 진행 상황 관리" ON user_progress
  FOR ALL
  USING (user_id = auth.uid());

-- 관리자는 모든 진행 상황 조회 가능
DROP POLICY IF EXISTS "관리자 모든 진행 상황 조회" ON user_progress;
CREATE POLICY "관리자 모든 진행 상황 조회" ON user_progress
  FOR SELECT
  USING (is_admin(auth.uid()));

-- found_differences 테이블 정책
-- 사용자는 자신이 발견한 차이점만 관리 가능
DROP POLICY IF EXISTS "사용자 발견한 차이점 관리" ON found_differences;
CREATE POLICY "사용자 발견한 차이점 관리" ON found_differences
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM user_progress
      WHERE user_progress.id = found_differences.user_progress_id
      AND user_progress.user_id = auth.uid()
    )
  );

-- 관리자는 모든 발견된 차이점 조회 가능
DROP POLICY IF EXISTS "관리자 모든 발견 차이점 조회" ON found_differences;
CREATE POLICY "관리자 모든 발견 차이점 조회" ON found_differences
  FOR SELECT
  USING (is_admin(auth.uid()));

-- admin_users 테이블 정책
-- 관리자만 접근 가능
DROP POLICY IF EXISTS "관리자만 admin_users 조회" ON admin_users;
CREATE POLICY "관리자만 admin_users 조회" ON admin_users
  FOR SELECT
  USING (is_admin(auth.uid()));

-- 슈퍼 관리자만 admin_users 관리 가능 (별도 설정 필요)
DROP POLICY IF EXISTS "슈퍼 관리자 admin_users 관리" ON admin_users;
CREATE POLICY "슈퍼 관리자 admin_users 관리" ON admin_users
  FOR ALL
  USING (auth.uid() IN (
    SELECT user_id FROM admin_users WHERE user_id = auth.uid() LIMIT 1
  )); 