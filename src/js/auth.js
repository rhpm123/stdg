/**
 * 인증 관련 기능을 처리하는 모듈
 * 
 * Google OAuth를 사용한 사용자 인증 및 관리 기능을 제공합니다.
 * 
 * @author Shrimp Task Manager
 * @version 0.1.0
 */

import { getSupabaseAuth } from '../../config/supabase.js';

// 전역 Supabase 클라이언트 인스턴스 (단일 인스턴스 보장)
let supabaseClientInstance = null;

/**
 * Supabase 클라이언트 초기화 함수 (단일 인스턴스 보장)
 */
const getSupabaseClient = () => {
  // 이미 초기화된 클라이언트가 있으면 재사용
  if (supabaseClientInstance) {
    return supabaseClientInstance;
  }
  
  // 전역 window.supabaseClient가 있으면 사용 (중복 방지)
  // 환경변수를 API에서 가져오는 함수
  async function loadSupabaseConfig() {
    try {
      const response = await fetch('/api/config');
      const config = await response.json();
      return {
        url: config.supabaseUrl,
        anonKey: config.anon_key
      };
    } catch (error) {
      console.error('설정 로드 오류:', error);
      // 폴백: 하드코딩된 값 사용
      return {
        url: 'https://ysvxjmqdafldfrmdscvd.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzdnhqbXFkYWZsZGZybWRzY3ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxODU5ODMsImV4cCI6MjA1Nzc2MTk4M30.lKRd0cPCFLMJFWT1lMrp7DOAjlx85Q-pbnsXTiE22G4'
      };
    }
  }
  
  // Supabase 클라이언트 생성 함수 (비동기로 변경)
  async function createSupabaseClient() {
    // 이미 인스턴스가 있으면 반환
    if (supabaseClientInstance) {
      return supabaseClientInstance;
    }
    
    // 새로운 클라이언트 생성
    if (typeof window !== 'undefined' && window.supabase) {
      const config = await loadSupabaseConfig();
      supabaseClientInstance = window.supabase.createClient(config.url, config.anonKey);
    return supabaseClientInstance;
  }
  
  return null;
};

/**
 * Google OAuth를 통한 로그인 처리
 * 
 * @returns {Promise<Object>} 로그인 결과
 */
export const signInWithGoogle = async () => {
  try {
    const supabaseClient = getSupabaseClient();
    if (!supabaseClient) {
      throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
    }

    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // IP 접속시 localhost로 강제 리디렉션 (Google OAuth 설정에 맞춤)
        redirectTo: window.location.hostname === '192.168.0.21' 
          ? 'http://localhost:3000/game-play.html?id=1'
          : window.location.origin + '/game-play.html?id=1',
      }
    });
    
    if (error) throw error;
    
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Google 로그인 중 오류 발생:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 로그아웃 처리
 * 
 * @returns {Promise<Object>} 로그아웃 결과
 */
export const signOut = async () => {
  try {
    const supabaseClient = getSupabaseClient();
    if (!supabaseClient) {
      throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
    }

    const { error } = await supabaseClient.auth.signOut();
    
    if (error) throw error;
    
    // 로컬 스토리지 정리
    localStorage.removeItem('supabaseToken');
    localStorage.removeItem('supabaseUser');
    localStorage.removeItem('supabaseTokenExpiry');
    
    // 인증 상태 캐시 클리어
    authStateCache = null;
    lastAuthCheck = 0;
    
    return {
      success: true
    };
  } catch (error) {
    console.error('로그아웃 중 오류 발생:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// 인증 상태 캐시 (무한 루프 방지용)
let authStateCache = null;
let lastAuthCheck = 0;
const AUTH_CACHE_DURATION = 5000; // 5초

/**
 * 현재 사용자의 인증 상태를 확인
 * 
 * @returns {Promise<Object>} 인증 상태
 */
export const checkAuthState = async () => {
  // 캐시 확인 (무한 루프 방지)
  const now = Date.now();
  if (authStateCache && (now - lastAuthCheck) < AUTH_CACHE_DURATION) {
    console.log('인증 상태 캐시 사용');
    return authStateCache;
  }
  
  try {
    // URL fragment에서 토큰 처리 (OAuth 리디렉션 후)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    
    if (accessToken) {
      console.log('URL fragment에서 접근 토큰 발견, Supabase 세션 설정 시도');
      // URL에서 fragment 제거 (새로고침 시 문제 방지)
      window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
    }
    
    const supabaseClient = getSupabaseClient();
    if (!supabaseClient) {
      // Supabase 클라이언트가 없으면 로컬 스토리지에서 확인
      const authData = await getSupabaseAuth();
      const result = {
        isAuthenticated: !!authData?.user,
        user: authData?.user || null
      };
      
      // 캐시 업데이트
      authStateCache = result;
      lastAuthCheck = Date.now();
      return result;
    }
    
    // URL fragment 토큰 처리를 위해 getSession 먼저 호출
    const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
    
    // 그 다음 getUser 호출
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    
    if (error) {
      console.log('Supabase 인증 확인 실패, 로컬 스토리지 확인:', error.message);
      // Supabase 에러 시 로컬 스토리지에서 확인
      const authData = await getSupabaseAuth();
      const result = {
        isAuthenticated: !!authData?.user,
        user: authData?.user || null
      };
      
      // 캐시 업데이트
      authStateCache = result;
      lastAuthCheck = Date.now();
      return result;
    }
    
    const result = {
      isAuthenticated: !!user,
      user
    };
    
    // 캐시 업데이트
    authStateCache = result;
    lastAuthCheck = Date.now();
    return result;
    
  } catch (error) {
    console.error('인증 상태 확인 중 오류 발생:', error);
    const result = {
      isAuthenticated: false,
      user: null,
      error: error.message
    };
    
    // 에러 시에도 캐시 업데이트 (반복 에러 방지)
    authStateCache = result;
    lastAuthCheck = Date.now();
    return result;
  }
};

/**
 * 인증 상태 변경 리스너 설정
 * 
 * @param {Function} callback - 인증 상태 변경 시 호출할 콜백 함수
 * @returns {Function} 리스너 해제 함수
 */
export const subscribeToAuthChanges = (callback) => {
  const supabaseClient = getSupabaseClient();
  if (!supabaseClient) {
    console.warn('Supabase 클라이언트가 초기화되지 않아 인증 상태 변경 리스너를 설정할 수 없습니다.');
    return () => {}; // 빈 함수 반환
  }

  // Supabase의 인증 상태 변경 이벤트 구독
  const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
    (event, session) => {
      const user = session?.user || null;
      callback(event, user);
    }
  );
  
  // 구독 해제 함수 반환
  return () => {
    subscription.unsubscribe();
  };
};

/**
 * 인증 상태 캐시 강제 클리어
 */
export const clearAuthCache = () => {
  authStateCache = null;
  lastAuthCheck = 0;
  console.log('인증 상태 캐시가 클리어되었습니다.');
};

/**
 * 사용자가 관리자인지 확인
 * 
 * @param {string} userId - 확인할 사용자 ID
 * @returns {Promise<boolean>} 관리자 여부
 */
export const checkIsAdmin = async (userId) => {
  // 관리자 계정 목록 (하드코딩된 관리자 이메일들)
  const adminEmails = [
    'heoyoulim12@gmail.com', // 개발자 계정
    'admin@example.com'
  ];
  
  try {
    const authState = await checkAuthState();
    if (!authState.isAuthenticated || !authState.user) {
      return false;
    }
    
    return adminEmails.includes(authState.user.email);
  } catch (error) {
    console.error('관리자 확인 중 오류:', error);
    return false;
  }
};

/**
 * 힌트 통계 정보 가져오기 (게임 로직에서 사용)
 * 
 * @returns {Promise<Object>} 힌트 사용 통계
 */
export const getHintStats = async () => {
  try {
    const authState = await checkAuthState();
    
    // 기본 힌트 정보 반환
    return {
      used: 0,
      available: authState.isAuthenticated ? 3 : 1, // 로그인 시 3개, 게스트 시 1개
      total: authState.isAuthenticated ? 3 : 1
    };
  } catch (error) {
    console.error('힌트 통계 조회 오류:', error);
    return {
      used: 0,
      available: 1,
      total: 1
    };
  }
};

/**
 * 사용자 정보 가져오기 (게임 로직에서 사용)
 * 
 * @returns {Promise<Object>} 사용자 정보
 */
export const getUserInfo = async () => {
  try {
    const authState = await checkAuthState();
    
    if (authState.isAuthenticated && authState.user) {
      return {
        id: authState.user.id,
        email: authState.user.email,
        name: authState.user.user_metadata?.full_name || authState.user.email,
        isAuthenticated: true
      };
    }
    
    return {
      id: null,
      email: null,
      name: '게스트',
      isAuthenticated: false
    };
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    return {
      id: null,
      email: null,
      name: '게스트',
      isAuthenticated: false
    };
  }
};

export default {
  signInWithGoogle,
  signOut,
  checkAuthState,
  subscribeToAuthChanges,
  checkIsAdmin,
  clearAuthCache,
  getHintStats,
  getUserInfo
}; 