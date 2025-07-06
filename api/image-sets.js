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
    console.log('이미지 세트 조회 시작...');
    
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase 클라이언트가 초기화되지 않았습니다' });
    }

    // Supabase에서 이미지 세트 데이터 조회
    const { data, error } = await supabase
      .from('image_sets')
      .select(`
        id,
        name,
        original_image_url,
        modified_image_url,
        difficulty,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase 쿼리 오류:', error);
      return res.status(500).json({ 
        error: 'Supabase 데이터 조회 실패',
        details: error.message 
      });
    }

    if (!data || data.length === 0) {
      console.log('조회된 이미지 세트가 없습니다.');
      return res.status(404).json({ 
                error: '이미지 세트를 찾을 수 없습니다.',
        count: 0 
      });
    }

    console.log(`✅ 이미지 세트 ${data.length}개 조회 완료`);
    
    return res.status(200).json(data);

  } catch (error) {
    console.error('❌ 이미지 세트 조회 API 오류:', error);
    return res.status(500).json({ 
      error: '이미지 세트 조회 중 오류가 발생했습니다.',
      details: error.message 
    });
  }
}; 