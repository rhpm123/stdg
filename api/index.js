const express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Express 앱 생성
const app = express();

// JSON 파싱 미들웨어
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS 설정 (Vercel 배포용)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// 보안 미들웨어
// Rate Limiting (간단한 인메모리 방식)
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1분
const RATE_LIMIT_MAX_REQUESTS = 100; // 분당 100요청

app.use((req, res, next) => {
  const clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection?.remoteAddress || 'unknown';
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  // 클라이언트 IP 별 요청 기록 관리
  if (!rateLimitStore.has(clientIp)) {
    rateLimitStore.set(clientIp, []);
  }
  
  const requests = rateLimitStore.get(clientIp);
  
  // 오래된 요청 레코드 제거
  while (requests.length > 0 && requests[0] < windowStart) {
    requests.shift();
  }
  
  // 요청 리미트 검사
  if (requests.length >= RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({ 
      error: '요청이 너무 빠릇니다. 잠시 후 다시 시도해주세요.',
      retryAfter: Math.ceil(RATE_LIMIT_WINDOW / 1000)
    });
  }
  
  // 현재 요청 기록
  requests.push(now);
  
  // 메모리 정리 (주기적으로 오래된 데이터 제거)
  if (Math.random() < 0.01) { // 1% 확률로 정리
    for (const [ip, timestamps] of rateLimitStore.entries()) {
      const validTimestamps = timestamps.filter(t => t > windowStart);
      if (validTimestamps.length === 0) {
        rateLimitStore.delete(ip);
      } else {
        rateLimitStore.set(ip, validTimestamps);
      }
    }
  }
  
  next();
});

// 입력 데이터 검증 미들웨어
app.use((req, res, next) => {
  // JSON 페이로드 크기 제한 및 구조 검증
  if (req.method === 'POST' && req.headers['content-type']?.includes('application/json')) {
    try {
      const bodyStr = JSON.stringify(req.body);
      if (bodyStr.length > 10000) { // 10KB 제한
        return res.status(413).json({ error: '요청 데이터가 너무 큽니다.' });
      }
    } catch (error) {
      return res.status(400).json({ error: '잘못된 JSON 형식입니다.' });
    }
  }
  
  next();
});

// 보안 헤더 추가 (백업 - vercel.json이 작동하지 않을 경우)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});
// 환경변수 검증
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 환경변수 누락: SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY');
}

// Supabase 클라이언트 초기화
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

console.log('Vercel 서버리스 함수 초기화:', {
  supabaseUrl: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'MISSING',
  hasKey: !!supabaseKey
});

// 공개 설정 제공 API (클라이언트에서 Supabase 설정 가져오기)
app.get('/api/config', (req, res) => {
  res.json({
    supabaseUrl: process.env.SUPABASE_URL,
    anon_key: process.env.SUPABASE_ANON_KEY
  });
});

// 이미지 세트 목록 조회
app.get('/api/image-sets', async (req, res) => {
  try {
    console.log('이미지 세트 조회 시작...');
    
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase 클라이언트가 초기화되지 않았습니다' });
    }
    
    const { data, error } = await supabase
      .from('image_sets')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) {
      console.error('Supabase 오류:', error);
      throw error;
    }
    
    // ID 매핑: URL에서 요청하는 ID를 실제 DB ID로 변환
    const mappedData = data
      .filter(item => item.original_image_url && item.modified_image_url)
      .map((item, index) => ({
        ...item,
        display_id: index + 1,
        actual_id: item.id
      }));
    
    console.log('성공적으로 데이터 조회:', mappedData?.length, '개 항목');
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
    
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase 클라이언트가 초기화되지 않았습니다' });
    }
    
    const { data, error } = await supabase
      .from('answer_points')
      .select('*')
      .eq('image_set_id', imageSetId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
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
    
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase 클라이언트가 초기화되지 않았습니다' });
    }
    
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

// Vercel 서버리스 함수로 내보내기
module.exports = (req, res) => {
  return app(req, res);
};