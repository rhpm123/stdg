/**
 * 틀린그림찾기 웹앱 메인 스크립트
 * 
 * 이 파일은 애플리케이션의 주요 로직을 관리합니다.
 * - 페이지 내비게이션
 * - 사용자 인증
 * - 게임 로직 초기화
 * 
 * @author Shrimp Task Manager
 * @version 0.1.0
 */

// 모듈 가져오기
import supabaseClient, { getCurrentUser } from '../../config/supabase.js';
import authModule from './auth.js';
import gameModule from './game.js';
import utils from './utils.js';

// DOM 요소
const elements = {
  // 내비게이션 요소
  navHome: document.getElementById('nav-home'),
  navPlay: document.getElementById('nav-play'),
  navLeaderboard: document.getElementById('nav-leaderboard'),
  navAbout: document.getElementById('nav-about'),
  
  // 섹션 요소
  homeSection: document.getElementById('home-section'),
  gameSelectSection: document.getElementById('game-select-section'),
  gamePlaySection: document.getElementById('game-play-section'),
  leaderboardSection: document.getElementById('leaderboard-section'),
  aboutSection: document.getElementById('about-section'),
  adminSection: document.getElementById('admin-section'),
  
  // 인증 요소
  authLoginSection: document.getElementById('auth-login-section'),
  authUserSection: document.getElementById('auth-user-section'),
  loginButton: document.getElementById('login-button'),
  logoutButton: document.getElementById('logout-button'),
  userAvatar: document.getElementById('user-avatar'),
  userName: document.getElementById('user-name'),
  
  // 홈 화면 요소
  playNowBtn: document.getElementById('play-now-btn'),
  featuredGamesGrid: document.getElementById('featured-games-grid'),
  
  // 게임 선택 화면 요소
  difficultyFilters: document.querySelectorAll('.btn-filter'),
  gameSelectGrid: document.getElementById('game-select-grid'),
  
  // 게임 플레이 화면 요소
  gameTitle: document.getElementById('game-title'),
  gameTime: document.getElementById('game-time'),
  foundCount: document.getElementById('found-count'),
  currentScore: document.getElementById('current-score'),
  originalImage: document.getElementById('original-image'),
  modifiedImage: document.getElementById('modified-image'),
  hintButton: document.getElementById('hint-button'),
  exitGameButton: document.getElementById('exit-game-button'),
  
  // 게임 완료 모달
  gameCompleteModal: document.getElementById('game-complete-modal'),
  resultTime: document.getElementById('result-time'),
  resultScore: document.getElementById('result-score'),
  playAgainButton: document.getElementById('play-again-button'),
  selectOtherButton: document.getElementById('select-other-button')
};

// 상태 관리
const state = {
  currentSection: 'home',
  user: null,
  isAdmin: false,
  currentGame: null,
  gameTimer: null,
  gameStartTime: 0,
  foundDifferences: 0,
  totalDifferences: 0,
  score: 0
};

/**
 * 페이지 내비게이션 처리
 * @param {string} sectionId - 표시할 섹션 ID
 */
const navigateTo = (sectionId) => {
  // 모든 섹션 숨기기
  document.querySelectorAll('.section').forEach(section => {
    section.classList.add('hidden');
  });
  
  // 네비게이션 활성 상태 업데이트
  document.querySelectorAll('.main-nav a').forEach(navItem => {
    navItem.classList.remove('active');
  });
  
  // 선택한 섹션 표시
  document.getElementById(`${sectionId}-section`).classList.remove('hidden');
  
  // 해당 네비게이션 항목 활성화
  const navItem = document.getElementById(`nav-${sectionId}`);
  if (navItem) navItem.classList.add('active');
  
  // 상태 업데이트
  state.currentSection = sectionId;
};

/**
 * 사용자 인터페이스 상태 업데이트
 * @param {Object|null} user - 현재 사용자 객체 또는 null
 */
const updateUIWithUser = async (user) => {
  if (user) {
    // 사용자가 로그인한 경우
    state.user = user;
    
    // 관리자 권한 확인
    state.isAdmin = await authModule.checkIsAdmin(user.id);
    
    // 사용자 정보 표시
    elements.userName.textContent = user.user_metadata?.full_name || user.email;
    
    // 프로필 이미지 설정
    if (user.user_metadata?.avatar_url) {
      elements.userAvatar.src = user.user_metadata.avatar_url;
    } else {
      // 기본 아바타 이미지 설정
      elements.userAvatar.src = '../src/assets/default-avatar.png';
    }
    
    // UI 업데이트
    elements.authLoginSection.classList.add('hidden');
    elements.authUserSection.classList.remove('hidden');
    
    // 관리자인 경우 관리자 섹션 접근 권한 부여
    if (state.isAdmin) {
      const adminLinkItem = document.createElement('li');
      const adminLink = document.createElement('a');
      adminLink.id = 'nav-admin';
      adminLink.href = '#';
      adminLink.textContent = '관리자';
      adminLink.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('admin');
      });
      
      adminLinkItem.appendChild(adminLink);
      document.querySelector('.main-nav ul').appendChild(adminLinkItem);
    }
  } else {
    // 로그아웃 상태
    state.user = null;
    state.isAdmin = false;
    
    // UI 업데이트
    elements.authLoginSection.classList.remove('hidden');
    elements.authUserSection.classList.add('hidden');
    
    // 관리자 메뉴 제거
    const adminLink = document.getElementById('nav-admin');
    if (adminLink) {
      adminLink.parentElement.remove();
    }
    
    // 홈 화면으로 이동
    navigateTo('home');
  }
};

/**
 * 이벤트 리스너 설정
 */
const setupEventListeners = () => {
  // 내비게이션 이벤트 리스너
  elements.navHome.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('home');
  });
  
  elements.navPlay.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('game-select');
  });
  
  elements.navLeaderboard.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('leaderboard');
  });
  
  elements.navAbout.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('about');
  });
  
  // 로그인 버튼 클릭
  elements.loginButton.addEventListener('click', async () => {
    await authModule.signInWithGoogle();
  });
  
  // 로그아웃 버튼 클릭
  elements.logoutButton.addEventListener('click', async () => {
    const result = await authModule.signOut();
    if (result.success) {
      updateUIWithUser(null);
    }
  });
  
  // Play Now 버튼 클릭
  elements.playNowBtn.addEventListener('click', () => {
    navigateTo('game-select');
  });
  
  // 난이도 필터 클릭
  elements.difficultyFilters.forEach(filter => {
    filter.addEventListener('click', function() {
      elements.difficultyFilters.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      const difficulty = this.dataset.difficulty;
      loadGamesByDifficulty(difficulty === 'all' ? null : parseInt(difficulty));
    });
  });
  
  // 게임 종료 버튼 클릭
  elements.exitGameButton.addEventListener('click', () => {
    // 게임 타이머 정지
    if (state.gameTimer) {
      clearInterval(state.gameTimer);
      state.gameTimer = null;
    }
    
    navigateTo('game-select');
  });
  
  // 다시 플레이 버튼 클릭
  elements.playAgainButton.addEventListener('click', () => {
    hideGameCompleteModal();
    
    // 현재 게임을 다시 시작
    if (state.currentGame) {
      startGame(state.currentGame.id);
    }
  });
  
  // 다른 게임 선택 버튼 클릭
  elements.selectOtherButton.addEventListener('click', () => {
    hideGameCompleteModal();
    navigateTo('game-select');
  });
};

/**
 * 추천 게임 목록 로드
 */
const loadFeaturedGames = async () => {
  try {
    elements.featuredGamesGrid.innerHTML = '<div class="game-loading">로딩 중...</div>';
    
    const result = await gameModule.getImageSets(null, 6, 0);
    
    if (!result.success) throw new Error(result.error);
    
    renderGameGrid(elements.featuredGamesGrid, result.imageSets);
  } catch (error) {
    console.error('추천 게임 로드 중 오류 발생:', error);
    elements.featuredGamesGrid.innerHTML = '<div class="error-message">게임 로딩 실패</div>';
  }
};

/**
 * 난이도별 게임 목록 로드
 * @param {number|null} difficulty - 필터링할 난이도
 */
const loadGamesByDifficulty = async (difficulty) => {
  try {
    elements.gameSelectGrid.innerHTML = '<div class="game-loading">로딩 중...</div>';
    
    const result = await gameModule.getImageSets(difficulty, 20, 0);
    
    if (!result.success) throw new Error(result.error);
    
    renderGameGrid(elements.gameSelectGrid, result.imageSets);
  } catch (error) {
    console.error('게임 목록 로드 중 오류 발생:', error);
    elements.gameSelectGrid.innerHTML = '<div class="error-message">게임 로딩 실패</div>';
  }
};

/**
 * 게임 그리드 렌더링
 * @param {HTMLElement} container - 그리드 컨테이너 요소
 * @param {Array} games - 게임 목록
 */
const renderGameGrid = (container, games) => {
  if (!games || games.length === 0) {
    container.innerHTML = '<div class="empty-message">게임이 없습니다.</div>';
    return;
  }
  
  // 기존 내용 초기화
  container.innerHTML = '';
  
  // 각 게임 카드 추가
  games.forEach(game => {
    const gameCard = document.createElement('div');
    gameCard.className = 'game-card';
    gameCard.dataset.id = game.id;
    
    gameCard.innerHTML = `
      <img src="${game.public_image_url}" alt="${game.title}" class="game-card-image">
      <div class="game-card-content">
        <h3 class="game-card-title">${game.title}</h3>
        <p class="game-card-description">${game.description || '설명 없음'}</p>
        <div class="game-card-meta">
          <span class="difficulty-badge difficulty-${game.difficulty}">${utils.difficultyToText(game.difficulty)}</span>
        </div>
      </div>
    `;
    
    // 게임 카드 클릭 이벤트
    gameCard.addEventListener('click', () => {
      startGame(game.id);
    });
    
    container.appendChild(gameCard);
  });
};

/**
 * 게임 시작
 * @param {string} gameId - 게임 ID
 */
const startGame = async (gameId) => {
  try {
    // 게임 데이터 로드
    const result = await gameModule.getImageSetDetails(gameId);
    
    if (!result.success) throw new Error(result.error);
    
    // 게임 상태 초기화
    state.currentGame = result.imageSet;
    state.foundDifferences = 0;
    state.totalDifferences = result.differences.length;
    state.score = 0;
    
    // UI 업데이트
    elements.gameTitle.textContent = state.currentGame.title;
    elements.foundCount.textContent = `0/${state.totalDifferences}`;
    elements.currentScore.textContent = '0';
    elements.gameTime.textContent = '00:00';
    
    // 이미지 로드
    elements.originalImage.src = state.currentGame.original_image_url;
    elements.modifiedImage.src = state.currentGame.modified_image_url;
    
    // 게임 섹션으로 이동
    navigateTo('game-play');
    
    // 게임 타이머 시작
    startGameTimer();
    
    // 게임 진행 상황 생성
    if (state.user) {
      await gameModule.saveGameProgress(state.user.id, gameId, {
        found_differences: 0,
        completed: false,
        score: 0,
        time_spent: 0,
        started_at: new Date().toISOString()
      });
    }
    
    // 추가적인 게임 초기화 로직은 향후 구현 예정
  } catch (error) {
    console.error('게임 시작 중 오류 발생:', error);
    alert('게임을 시작할 수 없습니다. 다시 시도해주세요.');
    navigateTo('game-select');
  }
};

/**
 * 게임 타이머 시작
 */
const startGameTimer = () => {
  state.gameStartTime = Date.now();
  
  if (state.gameTimer) {
    clearInterval(state.gameTimer);
  }
  
  state.gameTimer = setInterval(() => {
    const elapsedTime = Math.floor((Date.now() - state.gameStartTime) / 1000);
    elements.gameTime.textContent = utils.formatTime(elapsedTime);
  }, 1000);
};

/**
 * 게임 완료 모달 표시
 * @param {number} score - 획득한 점수
 * @param {number} timeSpent - 소요 시간(초)
 */
const showGameCompleteModal = (score, timeSpent) => {
  elements.resultScore.textContent = score;
  elements.resultTime.textContent = utils.formatTime(timeSpent);
  
  elements.gameCompleteModal.classList.remove('hidden');
  elements.gameCompleteModal.classList.add('show');
};

/**
 * 게임 완료 모달 숨기기
 */
const hideGameCompleteModal = () => {
  elements.gameCompleteModal.classList.remove('show');
  setTimeout(() => {
    elements.gameCompleteModal.classList.add('hidden');
  }, 300);
};

/**
 * 앱 초기화
 */
const initApp = async () => {
  try {
    // 인증 상태 확인
    const { isAuthenticated, user } = await authModule.checkAuthState();
    updateUIWithUser(user);
    
    // 인증 상태 변경 리스너 설정
    authModule.subscribeToAuthChanges((event, user) => {
      updateUIWithUser(user);
    });
    
    // 이벤트 리스너 설정
    setupEventListeners();
    
    // 추천 게임 로드
    loadFeaturedGames();
    
    // 기본 홈 화면 표시
    navigateTo('home');
    
    console.log('앱 초기화 완료!');
  } catch (error) {
    console.error('앱 초기화 중 오류 발생:', error);
  }
};

// 진입점
document.addEventListener('DOMContentLoaded', () => {
  console.log('틀린그림찾기 앱 초기화 중...');
  initApp();
}); 