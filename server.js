const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// JSON 파싱 미들웨어 (크기 제한 증가)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 환경변수 디버그
console.log('Environment variables:', {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 30) + '...' : 'NOT SET',
  hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
});

// Supabase 클라이언트 설정 (환경변수 사용 - 보안 강화)
const supabaseUrl = process.env.SUPABASE_URL || 'MISSING_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'MISSING_SUPABASE_KEY';

// 보안 검증
if (supabaseUrl === 'MISSING_SUPABASE_URL' || supabaseKey === 'MISSING_SUPABASE_KEY') {
  console.error('❌ 보안 오류: .env 파일에 SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 설정해주세요!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Supabase 클라이언트 초기화 완료:', {
  url: supabaseUrl,
  keyPrefix: supabaseKey.substring(0, 30) + '...',
  keySource: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'ENV_VAR' : 'HARDCODED'
});

// Supabase 연결 테스트
console.log('Supabase 설정 확인:', {
  url: supabaseUrl,
  hasKey: !!supabaseKey
});


// 기본 라우트를 로그인 페이지로 설정
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// 테스트 메뉴 페이지에 접근할 수 있는 라우트 추가
app.get('/test-menu', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 관리자용 이미지 설정 도구 라우트 추가
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'compare-images.html'));
});

// API 엔드포인트들
// 공개 설정 제공 API (클라이언트에서 Supabase 설정 가져오기)
app.get('/api/config', (req, res) => {
  res.json({
    supabaseUrl: process.env.SUPABASE_URL,
    anon_key: process.env.SUPABASE_ANON_KEY
  });
});

// Supabase 인증 API
app.post('/api/supabase/auth', async (req, res) => {
  try {
    const { action } = req.body;
    
    console.log('Supabase 인증 요청:', action);
    
    switch (action) {
      case 'getUser':
        // 요청 헤더에서 Authorization 토큰 확인
        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7);
          // 토큰으로 세션 설정
          await supabase.auth.setSession({ access_token: token, refresh_token: '' });
        }
        const result = await supabase.auth.getUser();
        res.json(result);
        break;
        
      default:
        res.status(400).json({ error: 'Unknown action' });
    }
    
  } catch (error) {
    console.error('인증 처리 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// 연결 상태 확인
app.get('/api/status', async (req, res) => {
  try {
    console.log('연결 상태 확인 중...');
    
    // 먼저 간단한 상태 체크
    res.json({
      message: '서버가 정상적으로 실행 중입니다',
      timestamp: new Date().toISOString(),
      status: 'ok'
    });
    
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ 
      error: error.message,
      status: 'error'
    });
  }
});

// 이미지 세트 목록 조회
app.get('/api/image-sets', async (req, res) => {
  try {
    console.log('이미지 세트 조회 시작...');
    console.log('사용 중인 Supabase URL:', supabaseUrl);
    console.log('사용 중인 API 키 앞부분:', supabaseKey.substring(0, 30) + '...');
    
    const { data, error } = await supabase
      .from('image_sets')
      .select('*')
      .order('id', { ascending: true });
    
    console.log('Supabase 응답:', { data, error });
    
    if (error) {
      console.error('Supabase 오류 상세:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }
    
    // ID 매핑: URL에서 요청하는 ID를 실제 DB ID로 변환
    const mappedData = data
      .filter(item => item.original_image_url && item.modified_image_url) // 유효한 이미지만
      .map((item, index) => ({
        ...item,
        display_id: index + 1, // URL에서 사용할 ID (1부터 시작)
        actual_id: item.id     // 실제 DB ID
      }));
    
    console.log('성공적으로 데이터 조회:', mappedData?.length, '개 항목 (유효한 이미지만)');
    res.json(mappedData);
  } catch (error) {
    console.error('Image sets fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 특정 이미지 세트의 정답 데이터 조회
app.get('/api/answer-points/:imageSetId', async (req, res) => {
  try {
    const { imageSetId } = req.params;
    const { data, error } = await supabase
      .from('answer_points')
      .select('*')
      .eq('image_set_id', imageSetId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
      res.status(404).json({ error: '해당 이미지 세트에 대한 정답 데이터가 없습니다.' });
        return;
      }
      throw error;
    }
    
    res.json(data);
  } catch (error) {
    console.error('Answer points fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 게임 결과 저장 API
app.post('/api/save-game-result', async (req, res) => {
  try {
    const { imageSetId, score, elapsedTime, foundCount, totalCount, completedAt } = req.body;
    
    console.log('💾 게임 결과 저장 요청:', {
      imageSetId,
      score,
      elapsedTime: `${Math.floor(elapsedTime / 60000)}분 ${Math.floor((elapsedTime % 60000) / 1000)}초`,
      foundCount,
      totalCount,
      completedAt
    });
    
    // 게임 결과 데이터 삽입
    const { data, error } = await supabase
      .from('game_results')
      .insert({
        image_set_id: parseInt(imageSetId),
        score: parseInt(score),
        elapsed_time: parseInt(elapsedTime),
        found_count: parseInt(foundCount),
        total_count: parseInt(totalCount),
        completion_rate: Math.round((foundCount / totalCount) * 100),
        completed_at: completedAt
      })
      .select()
      .single();
    
    if (error) {
      // 테이블이 없는 경우 안내 메시지
      if (error.code === '42P01') {
        console.log('🛠️ game_results 테이블이 없습니다.');
        
        return res.status(500).json({
          error: '게임 결과 테이블이 없습니다. Supabase 대시보드에서 수동으로 생성해주세요.',
          sql: `CREATE TABLE game_results (
            id BIGSERIAL PRIMARY KEY,
            image_set_id INTEGER NOT NULL,
            score INTEGER NOT NULL DEFAULT 0,
            elapsed_time INTEGER NOT NULL DEFAULT 0,
            found_count INTEGER NOT NULL DEFAULT 0,
            total_count INTEGER NOT NULL DEFAULT 0,
            completion_rate INTEGER NOT NULL DEFAULT 0,
            completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          ALTER TABLE game_results DISABLE ROW LEVEL SECURITY;`
        });
      }
      
      console.error('❌ 게임 결과 저장 실패:', error);
      return res.status(500).json({ error: error.message });
    }
    
    console.log('✅ 게임 결과 저장 성공:', data);
    
    res.json({
      success: true,
      message: '게임 결과가 성공적으로 저장되었습니다.',
      data: data
    });
    
  } catch (error) {
    console.error('❌ 게임 결과 저장 API 오류:', error);
    res.status(500).json({ 
      error: '게임 결과 저장 중 오류가 발생했습니다.',
      details: error.message 
    });
  }
});

// 게임 결과 조회 API (모든 결과)
app.get('/api/game-results', async (req, res) => {
  try {
    const query = supabase
      .from('game_results')
      .select('*')
      .order('completed_at', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) {
      console.error('게임 결과 조회 오류:', error);
      return res.status(500).json({ error: '데이터 조회 실패' });
    }
    
    res.json({ results: data });
  } catch (error) {
    console.error('서버 오류:', error);
    res.status(500).json({ error: '서버 내부 오류' });
  }
});

// 게임 결과 조회 API (특정 이미지 세트)
app.get('/api/game-results/:imageSetId', async (req, res) => {
  try {
    const { imageSetId } = req.params;
    
    let query = supabase
      .from('game_results')
      .select('*')
      .order('completed_at', { ascending: false });
    
    if (imageSetId) {
      query = query.eq('image_set_id', imageSetId);
    }
    
    const { data, error } = await query.limit(100);
    
    if (error) {
      throw error;
    }
    
    console.log(`📊 게임 결과 조회 ${imageSetId ? `(이미지 세트 ${imageSetId})` : '(전체)'}: ${data.length}개`);
    
    res.json({
      success: true,
      results: data,
      count: data.length
    });
    
  } catch (error) {
    console.error('❌ 게임 결과 조회 오류:', error);
    res.status(500).json({ 
      error: error.message,
      results: [],
      count: 0 
    });
  }
});
// 테이블 생성 API
app.post('/api/create-tables', async (req, res) => {
  try {
    console.log('테이블 생성 강제 시도...');
    
    // 1. image_sets 테이블 생성 시도
    try {
      console.log('image_sets 테이블 생성 중...');
      const createImageSetsResult = await supabase.rpc('create_table_image_sets');
      console.log('image_sets rpc 결과:', createImageSetsResult);
    } catch (rpcError) {
      console.log('RPC 실패, 다른 방법 시도...');
      
      // RPC가 없다면 직접 쿼리 시도
      const imageSetsSql = `
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'image_sets') THEN
            CREATE TABLE image_sets (
              id SERIAL PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              original_image_url TEXT,
              modified_image_url TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            ALTER TABLE image_sets DISABLE ROW LEVEL SECURITY;
            
            INSERT INTO image_sets (name, original_image_url, modified_image_url) VALUES 
            ('샘플 이미지 세트 1', 'https://via.placeholder.com/800x600/FF0000/FFFFFF?text=Original+1', 'https://via.placeholder.com/800x600/00FF00/FFFFFF?text=Modified+1'),
            ('샘플 이미지 세트 2', 'https://via.placeholder.com/800x600/0000FF/FFFFFF?text=Original+2', 'https://via.placeholder.com/800x600/FFFF00/FFFFFF?text=Modified+2'),
            ('샘플 이미지 세트 3', 'https://via.placeholder.com/800x600/FF00FF/FFFFFF?text=Original+3', 'https://via.placeholder.com/800x600/00FFFF/FFFFFF?text=Modified+3');
          END IF;
        END $$;
      `;
      
      // Supabase REST API로 직접 SQL 실행 시도
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey
        },
        body: JSON.stringify({ sql: imageSetsSql })
      });
      
      console.log('SQL 직접 실행 응답:', response.status);
    }
    
    // 2. answer_points 테이블 생성 시도
    try {
      const answerPointsSql = `
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'answer_points') THEN
            CREATE TABLE answer_points (
              id BIGSERIAL PRIMARY KEY,
              image_set_id INTEGER NOT NULL,
              image_width INTEGER NOT NULL,
              image_height INTEGER NOT NULL,
              points JSONB DEFAULT '[]'::jsonb,
              regions JSONB DEFAULT '[]'::jsonb,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            ALTER TABLE answer_points DISABLE ROW LEVEL SECURITY;
          END IF;
        END $$;
      `;
      
      const response2 = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey
        },
        body: JSON.stringify({ sql: answerPointsSql })
      });
      
      console.log('answer_points 테이블 생성 응답:', response2.status);
    } catch (error2) {
      console.log('answer_points 생성 오류:', error2.message);
    }
    
    // 3. 테이블 존재 여부 재확인
    const { data: imageSetsTest, error: imageSetsError } = await supabase
      .from('image_sets')
      .select('count(*)')
      .limit(1);
    
    const { data: answerPointsTest, error: answerPointsError } = await supabase
      .from('answer_points')
      .select('count(*)')
      .limit(1);
    
    const status = {
      image_sets: imageSetsError ? 'missing' : 'exists',
      answer_points: answerPointsError ? 'missing' : 'exists'
    };
    
    res.json({ 
      message: '테이블 생성을 시도했습니다.', 
      status: status,
      note: '여전히 실패한다면 Supabase 대시보드에서 직접 생성해주세요.',
      sql_for_manual_creation: {
        image_sets: `
CREATE TABLE image_sets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  original_image_url TEXT,
  modified_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE image_sets DISABLE ROW LEVEL SECURITY;
INSERT INTO image_sets (name, original_image_url, modified_image_url) VALUES 
('샘플 이미지 세트 1', 'https://via.placeholder.com/800x600/FF0000/FFFFFF?text=Original+1', 'https://via.placeholder.com/800x600/00FF00/FFFFFF?text=Modified+1'),
('샘플 이미지 세트 2', 'https://via.placeholder.com/800x600/0000FF/FFFFFF?text=Original+2', 'https://via.placeholder.com/800x600/FFFF00/FFFFFF?text=Modified+2');
        `,
        answer_points: `
CREATE TABLE answer_points (
  id BIGSERIAL PRIMARY KEY,
  image_set_id INTEGER NOT NULL,
  image_width INTEGER NOT NULL,
  image_height INTEGER NOT NULL,
  points JSONB DEFAULT '[]'::jsonb,
  regions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE answer_points DISABLE ROW LEVEL SECURITY;
        `
      }
    });
    
  } catch (error) {
    console.error('테이블 생성 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// 정답 데이터 저장
app.post('/api/answer-points', async (req, res) => {
  try {
    const { image_set_id, image_width, image_height, points, regions } = req.body;
    
    // 이미지 크기 정보 검증
    if (!image_width || !image_height || image_width <= 0 || image_height <= 0) {
      console.error('🚫 이미지 크기 정보 오류:', { image_width, image_height });
      return res.status(400).json({ 
        error: '이미지 크기 정보가 유효하지 않습니다. naturalSize 기준으로 저장해주세요.',
        details: { image_width, image_height }
      });
    }
    
    console.log('💾 정답 데이터 저장 요청:', {
      image_set_id,
      이미지크기: `${image_width}x${image_height}`,
      regions: regions?.length || 0,
      points: points?.length || 0
    });
    
    // 기존 데이터가 있는지 확인
    const { data: existingData, error: checkError } = await supabase
      .from('answer_points')
      .select('id')
      .eq('image_set_id', image_set_id)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }
    
    // 좌표 데이터 검증 (모든 좌표가 이미지 크기 내에 있는지 확인)
    if (regions && regions.length > 0) {
      let invalidCoordinates = false;
      regions.forEach((region, regionIdx) => {
        region.forEach((point, pointIdx) => {
          if (point.x < 0 || point.x > image_width || point.y < 0 || point.y > image_height) {
            console.error(`🚫 좌표 범위 초과: region[${regionIdx}][${pointIdx}] = (${point.x}, ${point.y})`);
            invalidCoordinates = true;
          }
        });
      });
      
      if (invalidCoordinates) {
        return res.status(400).json({ 
          error: '좌표가 이미지 크기를 벗어납니다. naturalSize 기준으로 좌표를 확인해주세요.',
          details: { image_width, image_height }
        });
      }
    }
    
    if (existingData) {
      // 업데이트
      const { data, error } = await supabase
        .from('answer_points')
        .update({
          image_width,
          image_height,
          points,
          regions,
          created_at: new Date().toISOString()
        })
        .eq('image_set_id', image_set_id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      res.json({ 
        message: '정답 데이터가 업데이트되었습니다.', 
        data,
        imageSize: `${image_width}x${image_height}`,
        regions: regions?.length || 0
      });
    } else {
      // 새로 삽입
      const { data, error } = await supabase
        .from('answer_points')
        .insert({
          image_set_id,
          image_width,
          image_height,
          points,
          regions
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      res.json({ 
        message: '정답 데이터가 저장되었습니다.', 
        data,
        imageSize: `${image_width}x${image_height}`,
        regions: regions?.length || 0
      });
    }
    
  } catch (error) {
    console.error('Answer points save error:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      severity: error.severity
    });
    
    // 권한 오류인 경우 특별 처리
    if (error.code === '42501') {
      res.status(500).json({ 
        error: '데이터베이스 권한 오류: answer_points 테이블에 접근할 수 없습니다. 테이블을 생성하거나 권한을 확인해주세요.',
        code: error.code,
        hint: 'Supabase에서 answer_points 테이블을 생성하고 RLS를 비활성화해주세요.'
      });
    } else if (error.code === '42P01') {
      res.status(500).json({ 
        error: 'answer_points 테이블이 존재하지 않습니다. 테이블을 먼저 생성해주세요.',
        code: error.code
      });
    } else {
      res.status(500).json({ error: error.message, code: error.code });
    }
  }
});

// 이미지 URL 업데이트 API (Storage 이미지 사용)
app.post('/api/update-image-urls', async (req, res) => {
  try {
    console.log('실제 Storage 이미지로 URL 업데이트 시작...');
    
    // Supabase Storage의 public URL 생성
    const originalImageUrl = `${supabaseUrl}/storage/v1/object/public/original/original.png`;
    const modifiedImageUrl = `${supabaseUrl}/storage/v1/object/public/modified/modified.png`;
    
    console.log('생성된 URL:', {
      original: originalImageUrl,
      modified: modifiedImageUrl
    });
    
    const updateResults = [];
    
    // ID 3번 이미지 세트 업데이트 (첫 번째 이미지 세트)
    const { data: data3, error: error3 } = await supabase
      .from('image_sets')
      .update({
        original_image_url: originalImageUrl,
        modified_image_url: modifiedImageUrl,
        name: '실제 이미지 세트 1'
      })
      .eq('id', 3)
      .select()
      .single();
    
    if (error3) {
      console.error('ID 3 업데이트 오류:', error3);
    } else {
      updateResults.push({ id: 3, status: 'success', data: data3 });
      console.log('ID 3 업데이트 성공:', data3);
    }
    
    // ID 4번은 비활성화 (실제 이미지가 1세트만 있으므로)
    const { data: data4, error: error4 } = await supabase
      .from('image_sets')
      .update({
        name: '비활성화된 세트 (이미지 없음)',
        original_image_url: null,
        modified_image_url: null
      })
      .eq('id', 4)
      .select()
      .single();
    
    if (error4) {
      console.error('ID 4 업데이트 오류:', error4);
    } else {
      updateResults.push({ id: 4, status: 'disabled', data: data4 });
      console.log('ID 4 비활성화 완료:', data4);
    }
    
    const successCount = updateResults.filter(r => r.status === 'success').length;
    
    res.json({
      message: `실제 Storage 이미지로 업데이트되었습니다. (${successCount}개 활성화, ${updateResults.length - successCount}개 비활성화)`,
      results: updateResults,
      success: successCount > 0,
      storage_urls: {
        original: originalImageUrl,
        modified: modifiedImageUrl
      }
    });
    
  } catch (error) {
    console.error('URL 업데이트 오류:', error);
    res.status(500).json({ 
      error: error.message,
      success: false
    });
  }
});

// Supabase 설정 업데이트 API
app.post('/api/update-config', async (req, res) => {
  try {
    const { url, key } = req.body;
    
    if (!url || !key) {
      return res.status(400).json({ 
        success: false, 
        error: 'Supabase URL과 API Key가 필요합니다.' 
      });
    }
    
    // 여기서는 단순히 성공 응답만 반환 (실제 설정 저장은 클라이언트에서 처리)
    res.json({ 
      success: true, 
      message: '설정이 저장되었습니다.',
      config: {
        url: url,
        key: key.substring(0, 10) + '...' // 보안을 위해 앞 10자만 표시
      }
    });
  } catch (error) {
    console.error('Config update error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Storage 이미지 목록 조회 API
app.get('/api/storage/list-images', async (req, res) => {
  try {
    console.log('Storage 이미지 목록 조회 중...');
    
    // original 버킷에서 이미지 목록 가져오기
    const { data: originalFiles, error: originalError } = await supabase
      .storage
      .from('original')
      .list('', {
        limit: 100,
        offset: 0
      });
    
    if (originalError) {
      throw originalError;
    }
    
    // modified 버킷에서 이미지 목록 가져오기
    const { data: modifiedFiles, error: modifiedError } = await supabase
      .storage
      .from('modified')
      .list('', {
        limit: 100,
        offset: 0
      });
    
    if (modifiedError) {
      throw modifiedError;
    }
    
    // 이미지 파일만 필터링
    const originalImages = originalFiles
      .filter(file => file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i))
      .map(file => file.name);
    
    const modifiedImages = modifiedFiles
      .filter(file => file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i))
      .map(file => file.name);
    
    res.json({
      original: originalImages,
      modified: modifiedImages,
      message: `원본 이미지 ${originalImages.length}개, 수정 이미지 ${modifiedImages.length}개 발견`
    });
    
  } catch (error) {
    console.error('Storage 이미지 목록 조회 오류:', error);
    res.status(500).json({ 
      error: error.message,
      original: [],
      modified: []
    });
  }
});

// 이미지 프록시 API (CORS 오류 해결)
app.get('/api/storage/image/:bucket/:filename', async (req, res) => {
  try {
    const { bucket, filename } = req.params;
    
    // Supabase Storage URL 환경변수 사용
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${filename}`;
    
    // fetch로 이미지 가져오기
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    // 이미지 데이터를 버퍼로 변환
    const imageBuffer = await response.arrayBuffer();
    
    // 응답 헤더 설정 (CORS 허용)
    res.set({
      'Content-Type': response.headers.get('content-type') || 'image/jpeg',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Cache-Control': 'public, max-age=3600',
      'Content-Length': imageBuffer.byteLength
    });
    
    // 이미지 버퍼를 클라이언트로 전달
    res.send(Buffer.from(imageBuffer));
    
  } catch (error) {
    console.error('이미지 프록시 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// 정적 파일 제공은 라우트 설정 이후에 배치
app.use(express.static(path.join(__dirname)));

// 서버 시작
app.listen(PORT, '0.0.0.0', () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  console.log(`모바일 접근: http://192.168.0.21:${PORT}`);
  console.log(`테스트 메뉴는 http://localhost:${PORT}/test-menu 에서 접근 가능합니다.`);
  console.log(`틀린그림찾기는 http://localhost:${PORT}/compare-images.html 에서 접근 가능합니다.`);
}); 