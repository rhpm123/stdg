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
      
      // 이벤트 리스너 설정
      this.setupEventListeners();
      
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
  setupEventListeners() {
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