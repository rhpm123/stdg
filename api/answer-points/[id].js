const { createClient } = require('@supabase/supabase-js');

// Supabase 클라이언트 생성
let supabase;
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

module.exports = async (req, res) => {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // URL에서 image_set_id 추출
    const { id } = req.query;
    const imageSetId = parseInt(id);

    if (!imageSetId || isNaN(imageSetId)) {
      return res.status(400).json({ error: '유효하지 않은 이미지 세트 ID입니다.' });
    }

    console.log(`정답 포인트 조회 시작 - image_set_id: ${imageSetId}`);
    
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase 클라이언트가 초기화되지 않았습니다' });
    }

    // Supabase에서 정답 포인트 데이터 조회
    const { data, error } = await supabase
      .from('answer_points')
      .select(`
        id,
        image_set_id,
        image_width,
        image_height,
        points,
        regions,
        created_at
      `)
      .eq('image_set_id', imageSetId)
      .single(); // 하나의 결과만 기대

    if (error) {
      console.error('Supabase 쿼리 오류:', error);
      
      // 데이터가 없는 경우와 다른 오류를 구분
      if (error.code === 'PGRST116') {
        return res.status(404).json({ 
          error: `이미지 세트 ID ${imageSetId}에 대한 정답 데이터를 찾을 수 없습니다.`,
          image_set_id: imageSetId
        });
      }
      
      return res.status(500).json({ 
        error: 'Supabase 데이터 조회 실패',
        details: error.message 
      });
    }

    if (!data) {
      return res.status(404).json({ 
        error: `이미지 세트 ID ${imageSetId}에 대한 정답 데이터를 찾을 수 없습니다.`,
        image_set_id: imageSetId
      });
    }

    console.log(`✅ 정답 포인트 조회 완료 - image_set_id: ${imageSetId}`);
    
    return res.status(200).json(data);

  } catch (error) {
    console.error('❌ 정답 포인트 조회 API 오류:', error);
    return res.status(500).json({ 
      error: '정답 포인트 조회 중 오류가 발생했습니다.',
      details: error.message 
    });
  }
}; 