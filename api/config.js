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
    // 클라이언트에 필요한 설정 정보 반환
    const config = {
      supabaseUrl: process.env.SUPABASE_URL,
      anon_key: process.env.SUPABASE_ANON_KEY
    };

    return res.status(200).json(config);

  } catch (error) {
    console.error('❌ 설정 조회 API 오류:', error);
    return res.status(500).json({ 
      error: '설정 조회 중 오류가 발생했습니다.',
      details: error.message 
    });
  }
}; 