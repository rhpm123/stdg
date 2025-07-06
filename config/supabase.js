/**
 * Supabase 클라이언트 설정
 * 
 * @author Shrimp Task Manager
 * @version 0.1.1
 */

// 중앙 Supabase 클라이언트 설정
import { PUBLIC_ENV } from './public-config.js';

// 스토리지 버킷 이름 상수
export const BUCKETS = PUBLIC_ENV.BUCKETS;

/**
 * 현재 사용자의 인증 상태를 가져옵니다.
 * @returns {Promise<Object>} 사용자 인증 정보 (session과 user 포함)
 */
export async function getSupabaseAuth() {
  try {
    // 로컬 스토리지에서 인증 토큰 정보 확인
    const tokenStr = localStorage.getItem('supabaseToken');
    const userStr = localStorage.getItem('supabaseUser');
    
    if (!tokenStr || !userStr) {
      console.log('로컬 스토리지에 인증 정보가 없습니다');
      return null;
    }
    
    try {
      // 사용자 정보 파싱
      const user = JSON.parse(userStr);
      
      // 토큰 유효성 확인
      const response = await fetch('/api/supabase/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenStr}`
        },
        body: JSON.stringify({
          action: 'getUser'
        })
      });
      
      const result = await response.json();
      
      if (result.success && result.data) {
        return {
          session: {
            access_token: tokenStr,
            expires_at: parseInt(localStorage.getItem('supabaseTokenExpiry') || '0')
          },
          user: result.data.user || user
        };
      }
      
      console.log('인증 토큰이 만료되었거나 유효하지 않습니다');
      return null;
    } catch (parseError) {
      console.error('인증 정보 파싱 오류:', parseError);
      return null;
    }
  } catch (error) {
    console.error('인증 상태 확인 오류:', error);
    return null;
  }
}

/**
 * MCP를 통한 Supabase 데이터베이스 쿼리 함수
 * 
 * @param {string} table - 쿼리할 테이블 이름
 * @param {Object} options - 쿼리 옵션
 * @param {string} options.select - 선택할 열 (기본값: '*')
 * @param {Object} options.filter - 필터링 조건 (예: {id: 1})
 * @param {number} options.limit - 결과 제한 수
 * @returns {Promise<Object>} - 쿼리 결과
 */
export async function queryData(table, options = {}) {
  try {
    // 서버 API를 통해 쿼리 요청
    const response = await fetch('/api/supabase/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        table,
        select: options.select,
        filter: options.filter,
        limit: options.limit
      })
    });
    
    if (!response.ok) {
      throw new Error(`서버 API 오류: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('데이터 쿼리 오류:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * MCP를 통한 Supabase 인증 관련 함수
 */
export const auth = {
  /**
   * 사용자 등록
   * 
   * @param {string} email - 사용자 이메일
   * @param {string} password - 사용자 비밀번호
   * @returns {Promise<Object>} - 등록 결과
   */
  async signUp(email, password) {
    try {
      const response = await fetch('/api/supabase/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'signUp',
          email,
          password
        })
      });
      
      if (!response.ok) {
        throw new Error(`서버 API 오류: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('사용자 등록 오류:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * 사용자 로그인
   * 
   * @param {string} email - 사용자 이메일
   * @param {string} password - 사용자 비밀번호
   * @returns {Promise<Object>} - 로그인 결과
   */
  async signIn(email, password) {
    try {
      const response = await fetch('/api/supabase/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'signIn',
          email,
          password
        })
      });
      
      if (!response.ok) {
        throw new Error(`서버 API 오류: ${response.status}`);
      }
      
      const result = await response.json();
      
      // 로그인 성공 시 토큰 저장
      if (result.success && result.data && result.data.session) {
        localStorage.setItem('supabaseToken', result.data.session.access_token);
        localStorage.setItem('supabaseTokenExpiry', String(Date.now() + 3600000)); // 1시간 후 만료
        
        if (result.data.user) {
          localStorage.setItem('supabaseUser', JSON.stringify(result.data.user));
        }
        
        console.log('인증 토큰이 저장되었습니다.');
      }
      
      return result;
    } catch (error) {
      console.error('로그인 오류:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * 사용자 로그아웃
   * 
   * @returns {Promise<Object>} - 로그아웃 결과
   */
  async signOut() {
    try {
      const response = await fetch('/api/supabase/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'signOut'
        })
      });
      
      if (!response.ok) {
        throw new Error(`서버 API 오류: ${response.status}`);
      }
      
      // 로그아웃 시 토큰 제거
      localStorage.removeItem('supabaseToken');
      localStorage.removeItem('supabaseUser');
      localStorage.removeItem('supabaseTokenExpiry');
      console.log('인증 토큰이 제거되었습니다.');
      
      return await response.json();
    } catch (error) {
      console.error('로그아웃 오류:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * 현재 사용자 정보 가져오기
   * 
   * @returns {Promise<Object>} - 사용자 정보
   */
  async getUser() {
    try {
      const response = await fetch('/api/supabase/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'getUser'
        })
      });
      
      if (!response.ok) {
        throw new Error(`서버 API 오류: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('사용자 정보 가져오기 오류:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

/**
 * MCP를 통한 Supabase 실시간 업데이트 구독 함수
 * 
 * @param {string} table - 구독할 테이블 이름
 * @param {string} event - 구독할 이벤트 (INSERT, UPDATE, DELETE)
 * @param {function} callback - 이벤트 발생 시 호출할 콜백 함수
 * @returns {Object} - 구독 객체 (구독 해제용)
 */
export function subscribeToChanges(table, event, callback) {
  // SSE(Server-Sent Events) 연결 설정
  const eventSource = new EventSource(`/api/supabase/realtime?table=${table}&event=${event}`);
  
  // 연결 이벤트 처리
  eventSource.addEventListener('connected', (e) => {
    console.log('실시간 업데이트 연결됨:', JSON.parse(e.data));
  });
  
  // 테이블 변경 이벤트 처리
  eventSource.addEventListener('change', (e) => {
    const data = JSON.parse(e.data);
    callback(data);
  });
  
  // 오류 처리
  eventSource.onerror = (error) => {
    console.error('실시간 업데이트 오류:', error);
    eventSource.close();
  };
  
  // 구독 객체 반환
  return {
    unsubscribe: () => {
      eventSource.close();
      console.log(`${table} 테이블 구독 해제됨`);
    }
  };
}

/**
 * 서버 API를 통한 Supabase 스토리지 작업 함수
 * 이 방식은 API 키를 클라이언트 코드에 노출하지 않고 서버를 통해 안전하게 작업합니다.
 * 
 * @param {string} bucket - 버킷 이름
 * @param {string} path - 경로
 * @returns {Promise<Object>} - 결과 객체
 */
export async function listImages(bucket, path) {
  try {
    // 서버 API를 통해 이미지 목록 요청
    const response = await fetch(`/api/supabase/storage/list?bucket=${bucket}&path=${path}`);
    
    if (!response.ok) {
      throw new Error(`서버 API 오류: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('이미지 목록 조회 오류:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Supabase 스토리지에 이미지를 업로드합니다.
 * @param {File} file - 업로드할 파일 객체
 * @param {string} bucket - 대상 버킷 이름 ('original', 'modified', 'thumbnails', 'profile' 중 하나)
 * @param {string} path - 스토리지 내 저장 경로 (폴더/파일명 형식, 확장자 제외)
 * @param {Object} options - 추가 옵션 (메타데이터 등)
 * @returns {Promise<Object>} 업로드 결과 객체
 */
export async function uploadImage(file, bucket = 'original', path = '', options = {}) {
  try {
    if (!file) {
      throw new Error('파일이 제공되지 않았습니다.');
    }

    console.log(`업로드 시작: 버킷=${bucket}, 경로=${path}, 파일크기=${file.size} 바이트, 타입=${file.type}`);
    
    // FormData 생성
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);
    formData.append('path', path);
    
    // 사용자 인증 정보 가져오기
    const auth = await getSupabaseAuth();
    console.log('인증 상태:', auth ? '인증됨' : '인증되지 않음');
    
    // 인증 토큰 및 사용자 정보 추출
    const token = auth?.session?.access_token;
    const userId = auth?.user?.id;
    
    if (!token || !userId) {
      throw new Error('로그인이 필요합니다. 로그인 후 다시 시도해주세요.');
        }
    
    // 메타데이터에 사용자 ID 추가
    formData.append('metadata', JSON.stringify({
      owner_id: userId,
      created_at: new Date().toISOString(),
      is_public: bucket === 'thumbnails' || bucket === 'profile', // 섬네일과 프로필은 공개로 설정
      ...options.metadata
    }));
    
    // 요청 헤더 설정 (인증 토큰 포함)
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    
    console.log('인증 토큰을 요청에 추가했습니다.');
    
    // 서버 API 호출
    console.log('서버 API 요청 전송 중...');
    const response = await fetch('/api/supabase/storage/upload', {
      method: 'POST',
      headers: headers,
      body: formData
    });
    
    console.log('서버 응답 상태:', response.status);
    
    const result = await response.json();
    
    if (!response.ok) {
      console.log('서버 응답 오류:', result);
      console.log('오류 상세 정보:', result);
      throw new Error(`서버 API 오류: ${response.status} - ${result.error}`);
    }
    
    return {
      success: true,
      url: result.url,
      data: result.data,
      path: path,
      bucket: bucket
    };
  } catch (error) {
    console.log('이미지 업로드 오류:', error);
    throw new Error(`${error.message}`);
  }
}

/**
 * 이미지 삭제 함수
 * 서버 API를 통해 이미지를 삭제합니다.
 * 
 * @param {string} bucket - 삭제할 버킷 이름
 * @param {string} path - 삭제할 파일 경로
 * @returns {Promise<Object>} - 삭제 결과
 */
export async function deleteImage(bucket, path) {
  try {
    // 서버 API를 통해 파일 삭제 요청
    const response = await fetch(`/api/supabase/storage/delete?bucket=${bucket}&path=${path}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`서버 API 오류: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('이미지 삭제 오류:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 이미지 URL 가져오기 함수
 * 서버 API를 통해 공개 URL을 가져옵니다.
 * 
 * @param {string} bucket - 버킷 이름
 * @param {string} path - 파일 경로
 * @returns {Promise<string>} - 공개 URL
 */
export async function getImageUrl(bucket, path) {
  try {
    const response = await fetch(`/api/supabase/storage/url?bucket=${bucket}&path=${path}`);
    
    if (!response.ok) {
      throw new Error(`서버 API 오류: ${response.status}`);
    }
    
    const result = await response.json();
    return result.url;
  } catch (error) {
    console.error('이미지 URL 가져오기 오류:', error);
    throw error;
  }
}

// Supabase 관련 설정이나 인스턴스는 노출하지 않음
// 대신 모든 작업은 서버 API를 통해 수행 