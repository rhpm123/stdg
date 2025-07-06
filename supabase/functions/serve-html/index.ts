// JWT 인증 없이 공개적으로 HTML을 제공하는 Edge Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// HTML 템플릿들
const htmlTemplates = {
  home: `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>틀린그림찾기 앱</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      margin: 0;
      padding: 20px;
      min-height: 100vh;
    }
    
    .container {
      max-width: 900px;
      margin: 0 auto;
    }
    
    h1 {
      text-align: center;
      margin-bottom: 40px;
      color: white;
      font-size: 3rem;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    
    .main-game {
      background: white;
      border-radius: 20px;
      padding: 40px;
      margin-bottom: 40px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
    
    .main-game h2 {
      color: #2c3e50;
      margin-bottom: 20px;
      font-size: 2rem;
    }
    
    .main-game p {
      color: #7f8c8d;
      font-size: 1.1rem;
      margin-bottom: 30px;
    }
    
    .play-button {
      display: inline-block;
      padding: 20px 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 15px;
      font-size: 1.3rem;
      font-weight: bold;
      transition: all 0.3s ease;
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
      cursor: pointer;
    }
    
    .play-button:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.3);
    }
    
    .menu {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .menu-item {
      background: rgba(255, 255, 255, 0.9);
      border-radius: 15px;
      padding: 25px;
      text-align: center;
      transition: all 0.3s ease;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    
    .menu-item:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      background: white;
    }
    
    .menu-item h3 {
      margin-top: 0;
      color: #2c3e50;
      font-size: 1.2rem;
    }
    
    .menu-item p {
      color: #7f8c8d;
      font-size: 0.9rem;
      margin-bottom: 20px;
    }
    
    .menu-item a {
      display: inline-block;
      padding: 12px 24px;
      background-color: #3498db;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-size: 0.9rem;
      transition: background-color 0.3s ease;
    }
    
    .menu-item a:hover {
      background-color: #2980b9;
    }
    
    .footer {
      text-align: center;
      margin-top: 50px;
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.9rem;
    }
    
    @media (max-width: 768px) {
      h1 {
        font-size: 2.2rem;
      }
      
      .main-game {
        padding: 30px 20px;
      }
      
      .play-button {
        padding: 15px 30px;
        font-size: 1.1rem;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎮 틀린그림찾기</h1>
    
    <div class="main-game">
      <h2>게임 시작하기</h2>
      <p>두 이미지의 차이점을 찾아보세요! 직관적이고 재미있는 게임이 기다리고 있습니다.</p>
      <a href="?page=select" class="play-button">🎯 게임 선택하기</a>
    </div>
    
    <div class="menu">
      <div class="menu-item">
        <h3>🔧 관리자 도구</h3>
        <p>이미지를 업로드하고 차이점을 설정하는 관리자 전용 도구입니다.</p>
        <a href="?page=admin">관리자 도구 열기</a>
      </div>
      
      <div class="menu-item">
        <h3>📊 연결 상태 확인</h3>
        <p>Supabase 데이터베이스와 스토리지 연결 상태를 확인합니다.</p>
        <a href="/functions/v1/health-check">상태 확인</a>
      </div>
      
      <div class="menu-item">
        <h3>🎲 직접 게임하기</h3>
        <p>특정 이미지 세트로 바로 게임을 시작할 수 있습니다.</p>
        <a href="?page=play&id=3">바로 게임하기</a>
      </div>
    </div>
    
    <div class="footer">
      <p>PROJECT_GUIDE에 따라 체계적으로 개발된 틀린그림찾기 웹앱</p>
    </div>
  </div>
</body>
</html>`,

  select: `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>게임 선택 - 틀린그림찾기</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      margin: 0;
      padding: 20px;
      min-height: 100vh;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    h1 {
      text-align: center;
      color: white;
      font-size: 2.5rem;
      margin-bottom: 40px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    .game-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 30px;
      margin-bottom: 40px;
    }
    .game-card {
      background: white;
      border-radius: 15px;
      padding: 25px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      transition: transform 0.3s ease;
    }
    .game-card:hover {
      transform: translateY(-5px);
    }
    .game-card h3 {
      color: #2c3e50;
      margin-bottom: 15px;
      font-size: 1.3rem;
    }
    .game-card p {
      color: #7f8c8d;
      margin-bottom: 20px;
    }
    .play-btn {
      display: inline-block;
      padding: 15px 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 10px;
      font-weight: bold;
      transition: all 0.3s ease;
    }
    .play-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    }
    .back-btn {
      display: inline-block;
      padding: 12px 24px;
      background-color: #95a5a6;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .back-btn:hover {
      background-color: #7f8c8d;
    }
  </style>
</head>
<body>
  <div class="container">
    <a href="?" class="back-btn">← 홈으로 돌아가기</a>
    
    <h1>🎮 게임 선택</h1>
    
    <div class="game-grid">
      <div class="game-card">
        <h3>🌸 봄 풍경</h3>
        <p>아름다운 봄 풍경 속에서 차이점을 찾아보세요!</p>
        <a href="?page=play&id=1" class="play-btn">게임 시작</a>
      </div>
      
      <div class="game-card">
        <h3>🏖️ 여름 바다</h3>
        <p>시원한 바다 풍경에서 숨겨진 차이점을 발견하세요!</p>
        <a href="?page=play&id=2" class="play-btn">게임 시작</a>
      </div>
      
      <div class="game-card">
        <h3>🍂 가을 단풍</h3>
        <p>알록달록한 가을 풍경의 차이점을 찾아보세요!</p>
        <a href="?page=play&id=3" class="play-btn">게임 시작</a>
      </div>
      
      <div class="game-card">
        <h3>❄️ 겨울 설경</h3>
        <p>하얀 눈 덮인 겨울 풍경에서 차이점을 찾아보세요!</p>
        <a href="?page=play&id=4" class="play-btn">게임 시작</a>
      </div>
    </div>
  </div>
</body>
</html>`,

  admin: `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>관리자 도구 - 틀린그림찾기</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      margin: 0;
      padding: 20px;
      min-height: 100vh;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
    h1 {
      text-align: center;
      color: #2c3e50;
      margin-bottom: 30px;
    }
    .back-btn {
      display: inline-block;
      padding: 10px 20px;
      background-color: #95a5a6;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .info {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 10px;
      margin: 20px 0;
      border-left: 4px solid #3498db;
    }
  </style>
</head>
<body>
  <div class="container">
    <a href="?" class="back-btn">← 홈으로 돌아가기</a>
    
    <h1>🔧 관리자 도구</h1>
    
    <div class="info">
      <h3>📋 현재 상태</h3>
      <p>관리자 도구가 개발 중입니다. 곧 이미지 업로드 및 차이점 설정 기능이 추가될 예정입니다.</p>
    </div>
    
    <div class="info">
      <h3>🛠️ 예정 기능</h3>
      <ul>
        <li>이미지 업로드</li>
        <li>차이점 좌표 설정</li>
        <li>게임 레벨 관리</li>
        <li>사용자 통계 확인</li>
      </ul>
    </div>
  </div>
</body>
</html>`
};

// 공개 접속 가능한 핸들러 (JWT 인증 없음)
serve(async (req) => {
  // CORS 처리
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const page = url.searchParams.get('page') || 'home';
    
    console.log(`공개 HTML 페이지 요청: ${page}`);
    
    // 페이지에 따른 HTML 반환
    let htmlContent = htmlTemplates[page] || htmlTemplates.home;
    
    // HTML을 올바른 Content-Type으로 반환
    return new Response(htmlContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
    });
    
  } catch (error) {
    console.error('HTML 서비스 오류:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'HTML 서비스 오류',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}); 