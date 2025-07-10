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
      
      // 브라우저별 상세 지원 정보 수집
      const supportInfo = this.getBrowserSupportInfo();
      
      console.log('🔄 Orientation API 지원 상태:', {
        screenOrientation: !!screen.orientation,
        lockFunction: !!(screen.orientation && screen.orientation.lock),
        isSupported: this.isSupported,
        browser: supportInfo.browser,
        supportLevel: supportInfo.supportLevel,
        fallbackMethod: supportInfo.fallbackMethod
      });
      
      // 폴백 메커니즘 우선순위 설정
      this.setupFallbackPriority(supportInfo);
      
    } catch (error) {
      console.error('❌ Orientation API 지원 체크 오류:', error);
      this.isSupported = false;
      this.setupFallbackPriority({ supportLevel: 'none' });
    }
  }
  
  /**
   * 브라우저별 상세 지원 정보 수집
   */
  getBrowserSupportInfo() {
    const userAgent = navigator.userAgent;
    const vendor = navigator.vendor || '';
    
    // 브라우저 및 플랫폼 감지
    const browserInfo = {
      isIOS: /iPad|iPhone|iPod/.test(userAgent),
      isSafari: /Safari/.test(userAgent) && /Apple Computer/.test(vendor),
      isChrome: /Chrome/.test(userAgent) && /Google Inc/.test(vendor),
      isFirefox: /Firefox/.test(userAgent),
      isEdge: /Edg/.test(userAgent),
      isSamsung: /SamsungBrowser/.test(userAgent),
      isAndroid: /Android/.test(userAgent),
      isWebView: /wv|WebView/.test(userAgent)
    };
    
    let browser = 'Unknown';
    let supportLevel = 'none';
    let fallbackMethod = 'css-only';
    
    // iOS Safari 감지 및 지원 정보
    if (browserInfo.isIOS && browserInfo.isSafari) {
      browser = 'iOS Safari';
      // iOS 13+ 에서 제한적 지원, 하지만 사용자 제스처 필요
      supportLevel = 'limited';
      fallbackMethod = 'orientationchange-event';
    }
    // Android Chrome 감지
    else if (browserInfo.isAndroid && browserInfo.isChrome) {
      browser = 'Android Chrome';
      // Chrome 38+ 에서 Screen Orientation API 지원
      supportLevel = this.isSupported ? 'full' : 'partial';
      fallbackMethod = this.isSupported ? 'screen-orientation-api' : 'orientationchange-event';
    }
    // Samsung Internet 감지
    else if (browserInfo.isSamsung) {
      browser = 'Samsung Internet';
      // Samsung Internet 일부 버전에서 지원
      supportLevel = this.isSupported ? 'full' : 'partial';
      fallbackMethod = this.isSupported ? 'screen-orientation-api' : 'orientationchange-event';
    }
    // Firefox Mobile 감지
    else if (browserInfo.isFirefox && browserInfo.isAndroid) {
      browser = 'Firefox Mobile';
      supportLevel = this.isSupported ? 'full' : 'partial';
      fallbackMethod = 'orientationchange-event';
    }
    // Edge Mobile 감지
    else if (browserInfo.isEdge && (browserInfo.isAndroid || browserInfo.isIOS)) {
      browser = 'Edge Mobile';
      supportLevel = this.isSupported ? 'full' : 'partial';
      fallbackMethod = 'orientationchange-event';
    }
    // WebView 감지
    else if (browserInfo.isWebView) {
      browser = 'WebView';
      supportLevel = 'limited';
      fallbackMethod = 'css-media-query';
    }
    // 기타 모바일 브라우저
    else if (browserInfo.isAndroid || browserInfo.isIOS) {
      browser = 'Mobile Browser';
      supportLevel = this.isSupported ? 'partial' : 'none';
      fallbackMethod = 'css-media-query';
    }
    // 데스크탑 브라우저
    else {
      browser = 'Desktop Browser';
      supportLevel = this.isSupported ? 'full' : 'none';
      fallbackMethod = 'none';
    }
    
    return {
      browser,
      supportLevel,
      fallbackMethod,
      browserInfo
    };
  }
  
  /**
   * 폴백 메커니즘 우선순위 설정
   */
  setupFallbackPriority(supportInfo) {
    this.fallbackMethods = [];
    
    // 지원 수준에 따른 폴백 메서드 우선순위 설정
    switch (supportInfo.supportLevel) {
      case 'full':
        this.fallbackMethods = [
          'screen-orientation-api',
          'orientationchange-event',
          'css-media-query'
        ];
        break;
        
      case 'partial':
      case 'limited':
        this.fallbackMethods = [
          'orientationchange-event',
          'css-media-query',
          'visual-indicator-only'
        ];
        break;
        
      case 'none':
      default:
        this.fallbackMethods = [
          'css-media-query',
          'visual-indicator-only'
        ];
        break;
    }
    
    console.log('🔧 폴백 메서드 우선순위 설정:', this.fallbackMethods);
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
          controller: this,
          
          // Bottom-bar 상태 관리 (v2.0)
          bottomBarMode: 'auto',     // 'auto', 'full', 'compact', 'minimal', 'hidden'
          lastBottomBarMode: 'auto', // 이전 bottom-bar 모드 
          bottomBarManager: null,    // BottomBarManager 인스턴스
          
          // 모드별 설정 프리셋
          presets: {
            landscape: {
              bottomBarMode: 'auto',     // 가로모드에서는 자동 조절
              enableFullscreen: true,    // 풀스크린 허용
              showOrientationOverlay: false  // 회전 안내 숨김
            },
            portrait: {
              bottomBarMode: 'hidden',   // 세로모드에서는 bottom-bar 숨김
              enableFullscreen: false,   // 풀스크린 비활성화
              showOrientationOverlay: true   // 회전 안내 표시
            }
          }
        };
        
        // BottomBarManager 연결 설정
        this.setupBottomBarConnection();
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
   * BottomBarManager 연결 설정 (v2.0)
   */
  setupBottomBarConnection() {
    try {
      console.log('🔗 BottomBarManager 연결 설정 시작...');
      
      // 전역 bottomBarManager가 있는지 확인
      if (typeof window.bottomBarManager !== 'undefined') {
        gameState.orientation.bottomBarManager = window.bottomBarManager;
        
        // BottomBarManager가 활성화되어 있는지 확인
        if (window.bottomBarManager.isEnabled && window.bottomBarManager.isEnabled()) {
          // BottomBarManager에 orientation 변경 콜백 등록
          if (typeof window.bottomBarManager.onModeChange === 'function') {
            window.bottomBarManager.onModeChange((data) => {
              console.log('📱 BottomBarManager 모드 변경:', data);
              
              // gameState에 모드 변경 반영
              if (gameState.orientation) {
                gameState.orientation.lastBottomBarMode = data.previous;
                gameState.orientation.bottomBarMode = data.current;
              }
            });
            
            // 초기 모드 설정
            this.updateBottomBarMode();
            
            console.log('✅ BottomBarManager 연결 완료');
          } else {
            console.log('ℹ️ BottomBarManager.onModeChange 메소드가 없음 (안전 모드)');
          }
        } else {
          console.log('ℹ️ BottomBarManager가 비활성화됨 (안전 모드)');
        }
      
        
      } else {
        // BottomBarManager가 아직 로드되지 않았을 경우 대기
        let attempts = 0;
        const maxAttempts = 50; // 5초 대기 (100ms × 50)
        
        const waitForBottomBarManager = () => {
          attempts++;
          
          if (typeof window.bottomBarManager !== 'undefined') {
            console.log(`✅ BottomBarManager 대기 완료 (${attempts}회 시도)`);
            this.setupBottomBarConnection(); // 재귀 호출
          } else if (attempts < maxAttempts) {
            setTimeout(waitForBottomBarManager, 100);
          } else {
            console.warn('⚠️ BottomBarManager 로드 대기 시간 초과');
          }
        };
        
        waitForBottomBarManager();
      }
      
    } catch (error) {
      console.error('❌ BottomBarManager 연결 설정 실패:', error);
    }
  }

  /**
   * 현재 orientation 상태 업데이트 (다중 감지 메서드)
   */
  updateOrientationState() {
    try {
      const previousState = this.isLandscape;
      let detectionMethod = 'unknown';
      
      // 방법 1: Screen Orientation API (최우선)
      if (screen && screen.orientation) {
        const orientation = screen.orientation.type || screen.orientation;
        this.isLandscape = orientation.includes('landscape');
        detectionMethod = 'screen-orientation-api';
      }
      // 방법 2: window.orientation (iOS Safari 등)
      else if (typeof window.orientation !== 'undefined') {
        // window.orientation: 0(portrait), 90/-90(landscape), 180(portrait upside down)
        this.isLandscape = Math.abs(window.orientation) === 90;
        detectionMethod = 'window-orientation';
      }
      // 방법 3: CSS 미디어쿼리 (폴백)
      else if (window.matchMedia) {
        this.isLandscape = window.matchMedia('(orientation: landscape)').matches;
        detectionMethod = 'css-media-query';
      }
      // 방법 4: 화면 크기 비교 (최후 폴백)
      else {
        this.isLandscape = window.innerWidth > window.innerHeight;
        detectionMethod = 'window-dimensions';
      }
      
      // 브라우저별 특별 처리
      this.applyBrowserSpecificFixes();
      
      // 상태 변경 감지 및 로깅
      if (previousState !== this.isLandscape) {
        console.log('📱 Orientation 상태 변경 감지:', {
          from: previousState ? 'landscape' : 'portrait',
          to: this.isLandscape ? 'landscape' : 'portrait',
          method: detectionMethod,
          timestamp: new Date().toISOString()
        });
      } else {
        // 상태 변경이 없어도 주기적으로 상세 정보 로그 (디버깅용)
        console.log('📊 Orientation 상태 확인:', {
          isLandscape: this.isLandscape,
          method: detectionMethod,
          screenOrientation: screen.orientation ? screen.orientation.type : 'unknown',
          windowOrientation: window.orientation || 'unknown',
          windowSize: `${window.innerWidth}x${window.innerHeight}`,
          cssMatches: window.matchMedia ? window.matchMedia('(orientation: landscape)').matches : 'unknown'
        });
      }
      
    } catch (error) {
      console.error('❌ Orientation 상태 업데이트 오류:', error);
      // 오류 발생 시 기본값으로 폴백
      this.isLandscape = window.innerWidth > window.innerHeight;
    }
  }
  
  /**
   * 브라우저별 특별 처리 적용
   */
  applyBrowserSpecificFixes() {
    const userAgent = navigator.userAgent;
    
    // iOS Safari 특별 처리
    if (/iPad|iPhone|iPod/.test(userAgent) && /Safari/.test(userAgent)) {
      this.applyIOSSafariFixes();
    }
    // Samsung Internet 특별 처리
    else if (/SamsungBrowser/.test(userAgent)) {
      this.applySamsungInternetFixes();
    }
    // Android Chrome 특별 처리
    else if (/Android/.test(userAgent) && /Chrome/.test(userAgent)) {
      this.applyAndroidChromeFixes();
    }
    // Firefox Mobile 특별 처리
    else if (/Firefox/.test(userAgent) && /Mobile/.test(userAgent)) {
      this.applyFirefoxMobileFixes();
    }
  }
  
  /**
   * iOS Safari 특별 처리
   */
  applyIOSSafariFixes() {
    // iOS Safari에서는 때때로 orientation 이벤트가 지연됨
    // 추가 검증을 위해 100ms 후 재확인
    if (this.iosFixTimeout) {
      clearTimeout(this.iosFixTimeout);
    }
    
    this.iosFixTimeout = setTimeout(() => {
      const recheckLandscape = Math.abs(window.orientation || 0) === 90;
      if (recheckLandscape !== this.isLandscape) {
        console.log('🍎 iOS Safari 보정: orientation 상태 재확인');
        this.isLandscape = recheckLandscape;
        this.handleOrientationChange('ios-safari-fix');
      }
    }, 100);
  }
  
  /**
   * Samsung Internet 특별 처리
   */
  applySamsungInternetFixes() {
    // Samsung Internet의 경우 화면 크기 기반 추가 검증
    const aspectRatio = window.innerWidth / window.innerHeight;
    const isLandscapeByRatio = aspectRatio > 1.0;
    
    if (isLandscapeByRatio !== this.isLandscape) {
      console.log('📱 Samsung Internet 보정: 화면 비율 기반 재조정');
      this.isLandscape = isLandscapeByRatio;
    }
  }
  
  /**
   * Android Chrome 특별 처리
   */
  applyAndroidChromeFixes() {
    // Android Chrome에서는 주소창 숨김/표시로 인한 높이 변화 고려
    const minDimension = Math.min(window.innerWidth, window.innerHeight);
    const maxDimension = Math.max(window.innerWidth, window.innerHeight);
    const ratio = maxDimension / minDimension;
    
    // 너무 극단적인 비율 변화는 주소창 효과일 가능성
    if (ratio > 2.5) {
      console.log('🤖 Android Chrome 보정: 주소창 효과 고려');
    }
  }
  
  /**
   * Firefox Mobile 특별 처리
   */
  applyFirefoxMobileFixes() {
    // Firefox Mobile의 경우 CSS 미디어쿼리 재확인
    if (window.matchMedia) {
      const cssLandscape = window.matchMedia('(orientation: landscape)').matches;
      if (cssLandscape !== this.isLandscape) {
        console.log('🦊 Firefox Mobile 보정: CSS 미디어쿼리 우선 적용');
        this.isLandscape = cssLandscape;
      }
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
   * 가로모드 강제 전환 시도 (다중 폴백 메커니즘)
   */
  async lockLandscape() {
    console.log('🔄 가로모드 강제 전환 시도 시작');
    
    // 이미 가로모드인 경우
    if (this.isLandscape) {
      console.log('ℹ️ 이미 가로모드입니다');
      return true;
    }
    
    // 폴백 메서드를 순차적으로 시도
    for (const method of this.fallbackMethods) {
      console.log(`🔧 ${method} 방법 시도 중...`);
      
      const result = await this.tryLockMethod(method);
      if (result) {
        console.log(`✅ ${method} 방법으로 가로모드 전환 성공`);
        return true;
      } else {
        console.log(`❌ ${method} 방법 실패, 다음 방법 시도`);
      }
    }
    
    console.warn('⚠️ 모든 가로모드 전환 방법 실패, 사용자 수동 회전 필요');
    return false;
  }
  
  /**
   * 특정 방법으로 가로모드 강제 시도
   */
  async tryLockMethod(method) {
    try {
      switch (method) {
        case 'screen-orientation-api':
          return await this.tryScreenOrientationAPI();
          
        case 'orientationchange-event':
          return await this.tryOrientationChangePrompt();
          
        case 'css-media-query':
          return this.tryCSSMediaQueryDetection();
          
        case 'visual-indicator-only':
          return this.tryVisualIndicatorOnly();
          
        default:
          console.warn(`⚠️ 알 수 없는 폴백 방법: ${method}`);
          return false;
      }
    } catch (error) {
      console.error(`❌ ${method} 방법 중 오류 발생:`, error);
      return false;
    }
  }
  
  /**
   * Screen Orientation API 사용 시도
   */
  async tryScreenOrientationAPI() {
    if (!this.isSupported) {
      return false;
    }
    
    try {
      // landscape-primary 우선 시도
      await screen.orientation.lock('landscape-primary');
      console.log('✅ landscape-primary 모드 설정 성공');
      return true;
    } catch (primaryError) {
      console.log('❌ landscape-primary 실패, landscape 시도');
      
      try {
        // 일반 landscape 시도
        await screen.orientation.lock('landscape');
        console.log('✅ landscape 모드 설정 성공');
        return true;
      } catch (landscapeError) {
        console.log('❌ landscape 모드도 실패:', landscapeError.message);
        
        // 사용자 제스처 필요한 경우
        if (landscapeError.name === 'NotAllowedError') {
          console.warn('⚠️ 사용자 제스처가 필요합니다. 게임 시작 버튼 클릭 시 재시도됩니다.');
        }
        return false;
      }
    }
  }
  
  /**
   * orientationchange 이벤트 기반 프롬프트
   */
  async tryOrientationChangePrompt() {
    // CSS 오버레이를 통한 시각적 안내만 제공
    // 실제 회전은 사용자가 수동으로 해야 함
    console.log('📱 사용자 수동 회전 유도 - CSS 오버레이 활성화');
    
    // 회전 안내 오버레이가 표시되도록 CSS에 의존
    // orientation.css에서 @media (orientation: portrait) 처리
    
    return new Promise((resolve) => {
      // 10초간 대기하며 회전 감지
      const timeout = setTimeout(() => {
        console.log('⏰ 회전 대기 시간 초과');
        resolve(false);
      }, 10000);
      
      // orientation 변경 감지
      const checkOrientation = () => {
        if (this.isLandscape) {
          clearTimeout(timeout);
          console.log('✅ 사용자가 가로모드로 회전함');
          resolve(true);
        }
      };
      
      // 500ms마다 orientation 상태 확인
      const checkInterval = setInterval(() => {
        this.updateOrientationState();
        checkOrientation();
        
        if (this.isLandscape) {
          clearInterval(checkInterval);
        }
      }, 500);
      
      // 타임아웃 시 interval 정리
      setTimeout(() => {
        clearInterval(checkInterval);
      }, 10000);
    });
  }
  
  /**
   * CSS 미디어쿼리 기반 감지
   */
  tryCSSMediaQueryDetection() {
    // CSS 미디어쿼리로 현재 orientation 감지
    const isLandscapeByCSS = window.matchMedia('(orientation: landscape)').matches;
    
    if (isLandscapeByCSS) {
      this.isLandscape = true;
      console.log('✅ CSS 미디어쿼리로 가로모드 감지됨');
      return true;
    } else {
      console.log('📱 CSS 미디어쿼리: 세로모드 감지, 회전 안내 표시');
      // 회전 안내 오버레이가 자동으로 표시됨 (orientation.css)
      return false;
    }
  }
  
  /**
   * 시각적 안내만 제공
   */
  tryVisualIndicatorOnly() {
    console.log('📱 시각적 회전 안내만 제공 - 사용자 수동 회전 필요');
    
    // 회전 안내 오버레이만 표시하고 사용자 수동 회전 유도
    // 실제 강제 회전은 불가능하므로 false 반환
    return false;
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
          
          // Bottom-bar 모드 업데이트 (v2.0)
          this.updateBottomBarMode();
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
   * Bottom-bar 모드 업데이트 (v2.0)
   */
  updateBottomBarMode() {
    try {
      if (typeof gameState === 'undefined' || !gameState.orientation) {
        return;
      }
      
      const orientation = gameState.orientation;
      const currentMode = this.isLandscape ? 'landscape' : 'portrait';
      const preset = orientation.presets[currentMode];
      
      // 이전 모드 저장
      orientation.lastBottomBarMode = orientation.bottomBarMode;
      
      // 새로운 모드 설정
      orientation.bottomBarMode = preset.bottomBarMode;
      
      console.log('📱 Bottom-bar 모드 업데이트:', {
        orientation: currentMode,
        previousMode: orientation.lastBottomBarMode,
        newMode: orientation.bottomBarMode,
        preset: preset
      });
      
      // BottomBarManager가 있으면 모드 적용
      if (orientation.bottomBarManager && typeof orientation.bottomBarManager.setMode === 'function') {
        this.applyBottomBarMode(orientation.bottomBarManager, preset);
      } else if (typeof window.bottomBarManager !== 'undefined') {
        // 전역 bottomBarManager 사용
        orientation.bottomBarManager = window.bottomBarManager;
        this.applyBottomBarMode(window.bottomBarManager, preset);
      }
      
      // Orientation 오버레이 표시/숨김 처리
      this.updateOrientationOverlay(preset.showOrientationOverlay);
      
      // 시각적 피드백 제공
      this.showOrientationFeedback(currentMode);
      
    } catch (error) {
      console.error('❌ Bottom-bar 모드 업데이트 실패:', error);
    }
  }
  
  /**
   * BottomBarManager에 모드 적용
   */
  applyBottomBarMode(bottomBarManager, preset) {
    try {
      // 모드별 처리
      if (preset.bottomBarMode === 'hidden') {
        // 세로모드: bottom-bar 숨김
        if (bottomBarManager.bottomBar) {
          bottomBarManager.bottomBar.style.display = 'none';
          bottomBarManager.bottomBar.classList.add('orientation-hidden');
        }
      } else if (preset.bottomBarMode === 'auto') {
        // 가로모드: 자동 크기 조절
        if (bottomBarManager.bottomBar) {
          bottomBarManager.bottomBar.style.display = '';
          bottomBarManager.bottomBar.classList.remove('orientation-hidden');
        }
        
        // 동적 계산 재실행
        if (typeof bottomBarManager.calculateOptimalHeight === 'function') {
          bottomBarManager.calculateOptimalHeight();
        }
      } else {
        // 특정 모드 강제 설정
        if (bottomBarManager.bottomBar) {
          bottomBarManager.bottomBar.style.display = '';
          bottomBarManager.bottomBar.classList.remove('orientation-hidden');
        }
        
        if (typeof bottomBarManager.setMode === 'function') {
          bottomBarManager.setMode(preset.bottomBarMode);
        }
      }
      
      console.log('✅ BottomBarManager 모드 적용 완료:', preset.bottomBarMode);
      
    } catch (error) {
      console.error('❌ BottomBarManager 모드 적용 실패:', error);
    }
  }
  
  /**
   * Orientation 오버레이 표시/숨김
   */
  updateOrientationOverlay(show) {
    try {
      const overlay = document.querySelector('.orientation-overlay');
      
      if (overlay) {
        if (show) {
          overlay.style.display = 'flex';
          overlay.classList.add('active');
          console.log('🔄 Orientation 오버레이 표시');
        } else {
          overlay.style.display = 'none';
          overlay.classList.remove('active');
          console.log('🔄 Orientation 오버레이 숨김');
        }
      }
      
    } catch (error) {
      console.error('❌ Orientation 오버레이 업데이트 실패:', error);
    }
  }
  
  /**
   * Orientation 변경 시각적 피드백
   */
  showOrientationFeedback(mode) {
    try {
      // 임시 피드백 메시지 표시
      const feedbackElement = document.createElement('div');
      feedbackElement.className = 'orientation-feedback';
      feedbackElement.textContent = mode === 'landscape' ? 
        '📱 가로모드로 최적화됨' : '↻ 가로모드로 회전해주세요';
      
      // 스타일 적용
      Object.assign(feedbackElement.style, {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        zIndex: '10001',
        opacity: '0',
        transition: 'opacity 0.3s ease-in-out',
        textAlign: 'center',
        maxWidth: '80%',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
      });
      
      document.body.appendChild(feedbackElement);
      
      // 애니메이션 효과
      setTimeout(() => {
        feedbackElement.style.opacity = '1';
      }, 10);
      
      // 2초 후 제거
      setTimeout(() => {
        feedbackElement.style.opacity = '0';
        setTimeout(() => {
          if (feedbackElement.parentNode) {
            feedbackElement.parentNode.removeChild(feedbackElement);
          }
        }, 300);
      }, 2000);
      
      console.log(`💫 Orientation 피드백 표시: ${mode}`);
      
    } catch (error) {
      console.error('❌ Orientation 피드백 표시 실패:', error);
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