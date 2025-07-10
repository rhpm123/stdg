/**
 * 틀린그림찾기 게임 - Orientation Controller 모듈
 * 모바일 기기에서 가로모드를 강제하는 기능을 담당합니다.
 * 
 * @author Shrimp Task Manager
 * @version 1.0.0
 */

class OrientationController {
  constructor() {
    this.isSupported = false;
    this.isLandscape = false;
    this.callbacks = [];
    this.initialized = false;
    
    // 브라우저 지원 여부 확인
    this.checkOrientationSupport();
  }

  /**
   * Screen Orientation API 지원 여부 확인
   */
  checkOrientationSupport() {
    try {
      // Screen Orientation API 지원 확인
      this.isSupported = !!(screen && screen.orientation && screen.orientation.lock);
      
      console.log('🔄 Orientation API 지원 상태:', {
        screenOrientation: !!screen.orientation,
        lockFunction: !!(screen.orientation && screen.orientation.lock),
        userAgent: navigator.userAgent,
        isSupported: this.isSupported
      });
      
      return this.isSupported;
    } catch (error) {
      console.warn('⚠️ Orientation API 확인 중 오류:', error);
      this.isSupported = false;
      return false;
    }
  }

  /**
   * Orientation Controller 초기화
   */
  initOrientation() {
    try {
      console.log('🚀 Orientation Controller 초기화 시작');
      
      // 현재 orientation 상태 확인
      this.updateOrientationState();
      
      // orientation 이벤트 리스너 설정
      this.setupOrientationListeners();
      
      // 풀스크린 이벤트 리스너 설정
      this.setupFullscreenListeners();
      
      // 초기 상태 설정
      // 게임 상태에 orientation 정보 추가
      if (typeof gameState !== 'undefined') {
        gameState.orientation = {
          isLandscape: this.isLandscape,
          isForced: false,
          isFullscreen: false,
          controller: this
        };
      }
      
      this.initialized = true;
      console.log('✅ Orientation Controller 초기화 완료:', {
        isSupported: this.isSupported,
        currentOrientation: this.isLandscape ? 'landscape' : 'portrait'
      });
      
      // 초기화 완료 콜백 실행
      this.triggerCallbacks('initialized', { isLandscape: this.isLandscape });
      
    } catch (error) {
      console.error('❌ Orientation Controller 초기화 실패:', error);
    }
  }

  /**
   * 현재 orientation 상태 업데이트
   */
  updateOrientationState() {
    try {
      // Screen Orientation API 사용 가능 시
      if (this.isSupported && screen.orientation) {
        const orientation = screen.orientation.type || screen.orientation;
        this.isLandscape = orientation.includes('landscape');
      }
      // 폴백: window.orientation 사용
      else if (typeof window.orientation !== 'undefined') {
        // window.orientation: 0(portrait), 90/-90(landscape), 180(portrait upside down)
        this.isLandscape = Math.abs(window.orientation) === 90;
      }
      // 폴백: CSS 미디어쿼리 사용
      else {
        this.isLandscape = window.matchMedia('(orientation: landscape)').matches;
      }
      
      console.log('📱 Orientation 상태 업데이트:', {
        isLandscape: this.isLandscape,
        method: this.isSupported ? 'Screen API' : 'Fallback'
      });
      
    } catch (error) {
      console.warn('⚠️ Orientation 상태 확인 실패:', error);
      // 기본값: 가로모드로 가정
      this.isLandscape = window.innerWidth > window.innerHeight;
    }
  }

  /**
   * 이벤트 리스너 설정
   */
  setupOrientationListeners() {
    try {
      console.log('🎧 Orientation 이벤트 리스너 설정');
      
      // Screen Orientation API 이벤트
      if (this.isSupported && screen.orientation) {
        screen.orientation.addEventListener('change', () => {
          this.handleOrientationChange('screen-api');
        });
      }
      
      // 폴백: orientationchange 이벤트 (iOS Safari 등)
      window.addEventListener('orientationchange', () => {
        // orientationchange는 실제 회전 완료 전에 발생하므로 지연
        setTimeout(() => {
          this.handleOrientationChange('orientation-change');
        }, 100);
      });
      
      // 폴백: resize 이벤트
      window.addEventListener('resize', () => {
        this.handleOrientationChange('resize');
      });
      
      // Fullscreen 상태 변경 이벤트
      document.addEventListener('fullscreenchange', () => {
        this.handleFullscreenChange();
      });
      
      console.log('✅ 이벤트 리스너 설정 완료');
      
    } catch (error) {
      console.error('❌ 이벤트 리스너 설정 실패:', error);
    }
  }

  /**
   * 가로모드 강제 전환
   */
  async lockLandscape() {
    try {
      console.log('🔒 가로모드 강제 전환 시도');
      
      if (!this.isSupported) {
        console.warn('⚠️ Screen Orientation API 미지원 - 폴백 모드');
        this.triggerCallbacks('lockFailed', { reason: 'api-not-supported' });
        return false;
      }
      
      try {
        // landscape-primary 우선 시도
        await screen.orientation.lock('landscape-primary');
        console.log('✅ 가로모드 잠금 성공 (landscape-primary)');
        
        // 게임 상태 업데이트
        if (typeof gameState !== 'undefined' && gameState.orientation) {
          gameState.orientation.isForced = true;
        }
        
        this.triggerCallbacks('lockSuccess', { orientation: 'landscape-primary' });
        return true;
        
      } catch (primaryError) {
        console.warn('⚠️ landscape-primary 실패, landscape 시도:', primaryError.message);
        
        try {
          // landscape 시도
          await screen.orientation.lock('landscape');
          console.log('✅ 가로모드 잠금 성공 (landscape)');
          
          if (typeof gameState !== 'undefined' && gameState.orientation) {
            gameState.orientation.isForced = true;
          }
          
          this.triggerCallbacks('lockSuccess', { orientation: 'landscape' });
          return true;
          
        } catch (secondaryError) {
          console.error('❌ 가로모드 잠금 실패:', secondaryError.message);
          this.triggerCallbacks('lockFailed', { 
            reason: 'lock-failed', 
            error: secondaryError.message 
          });
          return false;
        }
      }
      
    } catch (error) {
      console.error('❌ 가로모드 강제 전환 중 오류:', error);
      this.triggerCallbacks('lockFailed', { reason: 'unexpected-error', error: error.message });
      return false;
    }
  }

  /**
   * Orientation 변경 이벤트 처리
   */
  handleOrientationChange(source = 'unknown') {
    try {
      const previousState = this.isLandscape;
      this.updateOrientationState();
      
      console.log('🔄 Orientation 변경 감지:', {
        source: source,
        from: previousState ? 'landscape' : 'portrait',
        to: this.isLandscape ? 'landscape' : 'portrait',
        changed: previousState !== this.isLandscape
      });
      
      // 상태가 실제로 변경된 경우에만 처리
      if (previousState !== this.isLandscape) {
        // 게임 상태 업데이트
        if (typeof gameState !== 'undefined' && gameState.orientation) {
          gameState.orientation.isLandscape = this.isLandscape;
        }
        
        // 콜백 실행
        this.triggerCallbacks('orientationChange', {
          isLandscape: this.isLandscape,
          previousState: previousState,
          source: source
        });
      }
      
    } catch (error) {
      console.error('❌ Orientation 변경 처리 실패:', error);
    }
  }

  /**
   * 풀스크린 상태 변경 처리
   */
  handleFullscreenChange() {
    try {
      const isFullscreen = !!(document.fullscreenElement || 
                            document.webkitFullscreenElement || 
                            document.mozFullScreenElement);
      
      console.log('🖥️ 풀스크린 상태 변경:', isFullscreen ? 'ON' : 'OFF');
      
      // 게임 상태 업데이트
      if (typeof gameState !== 'undefined' && gameState.orientation) {
        gameState.orientation.isFullscreen = isFullscreen;
      }
      
      // 콜백 실행
      this.triggerCallbacks('fullscreenChange', { isFullscreen: isFullscreen });
      
    } catch (error) {
      console.error('❌ 풀스크린 상태 변경 처리 실패:', error);
    }
  }

  /**
   * 콜백 함수 실행
   */
  triggerCallbacks(eventType, data = {}) {
    try {
      this.callbacks.forEach(callback => {
        if (typeof callback === 'function') {
          callback(eventType, data);
        } else if (callback.type === eventType && typeof callback.fn === 'function') {
          callback.fn(data);
        }
      });
    } catch (error) {
      console.error('❌ 콜백 실행 실패:', error);
    }
  }

  /**
   * 콜백 함수 등록
   */
  addCallback(callback, eventType = null) {
    try {
      if (typeof callback === 'function') {
        if (eventType) {
          this.callbacks.push({ type: eventType, fn: callback });
        } else {
          this.callbacks.push(callback);
        }
        console.log('✅ 콜백 등록 완료:', eventType || 'all-events');
      }
    } catch (error) {
      console.error('❌ 콜백 등록 실패:', error);
    }
  }

  /**
   * 콜백 함수 제거
   */
  removeCallback(callback) {
    try {
      const index = this.callbacks.findIndex(cb => 
        cb === callback || cb.fn === callback
      );
      if (index !== -1) {
        this.callbacks.splice(index, 1);
        console.log('✅ 콜백 제거 완료');
      }
    } catch (error) {
      console.error('❌ 콜백 제거 실패:', error);
    }
  }

  /**
   * 현재 상태 반환
   */
  getCurrentState() {
    return {
      isSupported: this.isSupported,
      isLandscape: this.isLandscape,
      initialized: this.initialized,
      isFullscreen: !!(document.fullscreenElement || 
                      document.webkitFullscreenElement || 
                      document.mozFullScreenElement),
      orientation: this.isSupported && screen.orientation ? 
                   (screen.orientation.type || screen.orientation) : 'unknown'
    };
  }

  /**
   * 컨트롤러 정리
   */
  destroy() {
    try {
      console.log('🧹 Orientation Controller 정리 시작');
      
      // 콜백 제거
      this.callbacks = [];
      
      // 게임 상태에서 orientation 정보 제거
      if (typeof gameState !== 'undefined' && gameState.orientation) {
        delete gameState.orientation;
      }
      
      this.initialized = false;
      console.log('✅ Orientation Controller 정리 완료');
      
    } catch (error) {
      console.error('❌ Orientation Controller 정리 실패:', error);
    }
  }

  /**
   * 유틸리티 메서드들
   */
  
  // 현재 가로모드 여부 반환
  isCurrentlyLandscape() {
    return this.isLandscape;
  }
  
  // API 지원 여부 반환
  isOrientationAPISupported() {
    return this.isSupported;
  }
  
  // 디바이스가 모바일인지 확인
  isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  
  /**
   * 풀스크린 모드 관리 시스템
   */
  
  /**
   * 풀스크린 API 지원 여부 확인
   */
  checkFullscreenSupport() {
    const docElement = document.documentElement;
    return !!(
      docElement.requestFullscreen ||
      docElement.webkitRequestFullscreen ||
      docElement.mozRequestFullScreen ||
      docElement.msRequestFullscreen
    );
  }
  
  /**
   * 풀스크린 모드 진입
   */
  async enterFullscreen() {
    try {
      const docElement = document.documentElement;
      
      console.log('🖥️ 풀스크린 모드 진입 시도');
      
      // 브라우저별 풀스크린 API 호출
      if (docElement.requestFullscreen) {
        await docElement.requestFullscreen();
      } else if (docElement.webkitRequestFullscreen) {
        await docElement.webkitRequestFullscreen();
      } else if (docElement.mozRequestFullScreen) {
        await docElement.mozRequestFullScreen();
      } else if (docElement.msRequestFullscreen) {
        await docElement.msRequestFullscreen();
      } else {
        console.warn('⚠️ 이 브라우저는 풀스크린 API를 지원하지 않습니다');
        return false;
      }
      
      // 게임 상태 업데이트
      if (typeof gameState !== 'undefined' && gameState.orientation) {
        gameState.orientation.isFullscreen = true;
      }
      
      console.log('✅ 풀스크린 모드 진입 성공');
      return true;
      
    } catch (error) {
      console.error('❌ 풀스크린 모드 진입 실패:', error);
      
      // 사용자 제스처가 필요한 경우의 에러 처리
      if (error.name === 'NotAllowedError') {
        console.warn('⚠️ 풀스크린 모드는 사용자 상호작용 후에만 가능합니다');
      }
      
      return false;
    }
  }
  
  /**
   * 풀스크린 모드 해제
   */
  async exitFullscreen() {
    try {
      console.log('🖥️ 풀스크린 모드 해제 시도');
      
      // 브라우저별 풀스크린 해제 API 호출
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        await document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen();
      }
      
      // 게임 상태 업데이트
      if (typeof gameState !== 'undefined' && gameState.orientation) {
        gameState.orientation.isFullscreen = false;
      }
      
      console.log('✅ 풀스크린 모드 해제 성공');
      return true;
      
    } catch (error) {
      console.error('❌ 풀스크린 모드 해제 실패:', error);
      return false;
    }
  }
  
  /**
   * 현재 풀스크린 상태 확인
   */
  isFullscreen() {
    return !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );
  }
  
  /**
   * 풀스크린 변경 이벤트 처리
   */
  handleFullscreenChange() {
    const isCurrentlyFullscreen = this.isFullscreen();
    
    console.log('🖥️ 풀스크린 상태 변경:', {
      isFullscreen: isCurrentlyFullscreen,
      timestamp: new Date().toISOString()
    });
    
    // 게임 상태 동기화
    if (typeof gameState !== 'undefined' && gameState.orientation) {
      gameState.orientation.isFullscreen = isCurrentlyFullscreen;
    }
    
    // 콜백 실행
    this.triggerCallbacks('fullscreenChange', {
      isFullscreen: isCurrentlyFullscreen,
      timestamp: Date.now()
    });
    
    // 풀스크린 해제 시 가로모드 유지 체크
    if (!isCurrentlyFullscreen && this.isLandscape) {
      console.log('🔄 풀스크린 해제됨, 가로모드 상태 유지 확인');
      setTimeout(() => {
        this.handleOrientationChange('fullscreen-exit');
      }, 100);
    }
  }
  
  /**
   * 풀스크린 이벤트 리스너 설정
   */
  setupFullscreenListeners() {
    // 풀스크린 변경 이벤트 리스너들
    const fullscreenEvents = [
      'fullscreenchange',
      'webkitfullscreenchange',
      'mozfullscreenchange',
      'MSFullscreenChange'
    ];
    
    fullscreenEvents.forEach(event => {
      document.addEventListener(event, () => {
        this.handleFullscreenChange();
      });
    });
    
    console.log('🎧 풀스크린 이벤트 리스너 설정 완료');
  }
  
  /**
   * 게임 시작 시 풀스크린 모드 자동 진입
   */
  async enterFullscreenForGame() {
    // 모바일 기기이고 가로모드일 때만 풀스크린 시도
    if (this.isMobileDevice() && this.isLandscape) {
      console.log('🎮 게임 시작: 모바일 가로모드에서 풀스크린 모드 진입 시도');
      return await this.enterFullscreen();
    } else {
      console.log('ℹ️ 풀스크린 조건 미충족:', {
        isMobile: this.isMobileDevice(),
        isLandscape: this.isLandscape
      });
      return false;
    }
  }
}

// 전역 인스턴스 생성 (선택적)
if (typeof window !== 'undefined') {
  window.OrientationController = OrientationController;
  
  // 자동 초기화 (DOMContentLoaded 시)
  document.addEventListener('DOMContentLoaded', () => {
    if (!window.orientationController) {
      window.orientationController = new OrientationController();
      console.log('🌐 전역 OrientationController 인스턴스 생성');
    }
  });
} 