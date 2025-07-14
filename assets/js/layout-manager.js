/**
 * 틀린그림찾기 게임 - 통합 레이아웃 관리 시스템
 * 바텀바와 사이드바 전환 및 통합 관리를 담당합니다.
 * bottom-bar-manager.js의 모든 기능을 통합했습니다.
 */

class LayoutManager {
  constructor() {
    console.log('🚀 통합 LayoutManager 초기화 시작...');
    
    // 사이드바 크기 설정
    this.sidebarWidth = {
      desktop: 280,
      tablet: 240, 
      mobile: 200,
      mini: 160
    };
    
    // 바텀바 크기 설정 (기존 bottom-bar-manager 기능)
    this.bottomBarHeight = {
      desktop: 80,
      tablet: 70,
      mobile: 65,
      mini: 60
    };
    
    this.currentMode = 'bottom-bar'; // 'bottom-bar' | 'sidebar'
    this.isInitialized = false;
    this.deviceType = 'desktop';
    
    // DOM 요소 참조
    this.bottomBar = null;
    this.rightSidebar = null;
    this.mainContent = null;
    
    // 동기화 매핑 (바텀바 → 사이드바)
    this.syncMapping = {
      'score': 'sidebarScore',
      'timer': 'sidebarTimer', 
      'found': 'sidebarFound',
      'lives': 'sidebarLives',
      'startBtn': 'sidebarStartBtn',
      'hintBtn': 'sidebarHintBtn',
      'healthBarFill': 'sidebarHealthBarFill',
      'healthBarText': 'sidebarHealthBarText'
    };
    
    console.log('🔧 LayoutManager 구성 요소 초기화 완료');
  }

  /**
   * 통합 레이아웃 시스템 초기화
   */
  init() {
    try {
      console.log('🔄 통합 레이아웃 시스템 초기화 중...');
      
      // DOM 요소 확보
      this.acquireDOMElements();
      
      // 디바이스 타입 감지
      this.detectDeviceType();
      
      // CSS 변수 설정
      this.setupCSS();
      
      // 이벤트 리스너 설정
      this.setupEventListeners();
      
      // 초기 레이아웃 모드 결정
      this.determineInitialMode();
      
      // ✅ 사이드바 초기 상태 동기화
      setTimeout(() => {
        this.initializeSidebarState();
      }, 100); // DOM 완전 로딩 후 실행
      
      this.isInitialized = true;
      
      console.log('✅ 통합 LayoutManager 초기화 완료');
      return true;
    } catch (error) {
      console.error('❌ LayoutManager 초기화 실패:', error);
      return false;
    }
  }

  /**
   * DOM 요소 확보
   */
  acquireDOMElements() {
    this.bottomBar = document.querySelector('.bottom-bar');
    this.rightSidebar = document.querySelector('.right-sidebar');
    this.mainContent = document.querySelector('.main-content');
    
    console.log('📍 DOM 요소 확보:', {
      bottomBar: !!this.bottomBar,
      rightSidebar: !!this.rightSidebar,
      mainContent: !!this.mainContent
    });
  }

  /**
   * 디바이스 타입 감지
   */
  detectDeviceType() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    if (width >= 1024) {
      this.deviceType = 'desktop';
    } else if (width >= 768) {
      this.deviceType = 'tablet';
    } else if (width >= 480) {
      this.deviceType = 'mobile';
    } else {
      this.deviceType = 'mini';
    }
    
    console.log(`📱 디바이스 감지: ${this.deviceType} (${width}×${height}px)`);
  }

  /**
   * CSS 변수 설정 (통합 시스템)
   */
  setupCSS() {
    const root = document.documentElement;
    
    // 사이드바 관련 CSS 변수
    const sidebarWidth = this.sidebarWidth[this.deviceType];
    root.style.setProperty('--game-right-sidebar-width', `${sidebarWidth}px`);
    
    // 바텀바 관련 CSS 변수 (기존 bottom-bar-manager 기능)
    const bottomBarHeight = this.bottomBarHeight[this.deviceType];
    root.style.setProperty('--dynamic-bottom-bar-height', `${bottomBarHeight}px`);
    root.style.setProperty('--game-bottom-bar-height', `${bottomBarHeight}px`);
    
    // 메인 콘텐츠 높이 계산
    const headerHeight = 60; // 고정 헤더 높이
    const mainContentHeight = `calc(100vh - ${headerHeight}px - ${bottomBarHeight}px)`;
    root.style.setProperty('--main-content-height', mainContentHeight);
    
    // ✅ 반응형 사이드바 너비 시스템 로깅
    console.log('📐 반응형 사이드바 너비 설정:', {
      deviceType: this.deviceType,
      sidebarWidth: `${sidebarWidth}px`,
      bottomBarHeight: `${bottomBarHeight}px`,
      viewportSize: `${window.innerWidth}×${window.innerHeight}px`,
      cssVariable: getComputedStyle(root).getPropertyValue('--game-right-sidebar-width').trim()
    });
  }

  /**
   * 이벤트 리스너 설정
   */
  setupEventListeners() {
    // 화면 크기 변경 감지 (디바운스 적용)
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.handleResize();
      }, 150);
    });
    
    // 화면 회전 감지
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.handleResize();
      }, 200);
    });
    
    // ✅ 사이드바 버튼 이벤트 핸들러 연결
    this.setupSidebarButtonHandlers();
    
    console.log('👂 이벤트 리스너 설정 완료');
  }

  /**
   * 화면 크기 변경 처리
   */
  handleResize() {
    const startTime = performance.now();
    const beforeDevice = this.deviceType;
    const beforeWidth = this.sidebarWidth[this.deviceType];
    
    console.log('📱 화면 크기 변경 감지, 레이아웃 재계산 중...');
    
    this.detectDeviceType();
    this.setupCSS();
    
    // 현재 모드에 따라 레이아웃 재조정
    if (this.currentMode === 'sidebar') {
      this.applySidebarMode();
    } else {
      this.applyBottomBarMode();
    }
    
    const endTime = performance.now();
    const afterWidth = this.sidebarWidth[this.deviceType];
    
    // ✅ 반응형 시스템 성능 및 변경사항 로깅
    console.log('🔄 반응형 사이드바 너비 재계산 완료:', {
      deviceChange: `${beforeDevice} → ${this.deviceType}`,
      widthChange: `${beforeWidth}px → ${afterWidth}px`,
      changed: beforeDevice !== this.deviceType,
      performanceMs: (endTime - startTime).toFixed(2),
      currentMode: this.currentMode,
      viewportSize: `${window.innerWidth}×${window.innerHeight}px`
    });
  }

  /**
   * 초기 레이아웃 모드 결정
   */
  determineInitialMode() {
    // 데스크톱에서는 사이드바, 모바일에서는 바텀바를 기본으로 설정
    if (this.deviceType === 'desktop') {
      this.switchToSidebar();
    } else {
      this.switchToBottomBar();
    }
    
    console.log(`🎯 초기 레이아웃 모드: ${this.currentMode}`);
  }

  /**
   * 바텀바에서 사이드바로 전환
   */
  switchToSidebar() {
    this.currentMode = 'sidebar';
    this.applySidebarMode();
    console.log('🔄 사이드바 모드로 전환됨');
  }

  /**
   * 사이드바에서 바텀바로 전환
   */
  switchToBottomBar() {
    this.currentMode = 'bottom-bar';
    this.applyBottomBarMode();
    console.log('🔄 바텀바 모드로 전환됨');
  }

  /**
   * 사이드바 모드 적용
   */
  applySidebarMode() {
    if (this.bottomBar) {
      this.bottomBar.style.display = 'none';
    }
    
    if (this.rightSidebar) {
      this.rightSidebar.style.display = 'block';
    }
    
    // 메인 콘텐츠 영역 조정 (사이드바용)
    if (this.mainContent) {
      this.mainContent.style.marginRight = `${this.sidebarWidth[this.deviceType]}px`;
      this.mainContent.style.marginBottom = '0';
    }
    
    console.log('📐 사이드바 모드 레이아웃 적용 완료');
  }

  /**
   * 바텀바 모드 적용
   */
  applyBottomBarMode() {
    if (this.rightSidebar) {
      this.rightSidebar.style.display = 'none';
    }
    
    if (this.bottomBar) {
      this.bottomBar.style.display = 'block';
    }
    
    // 메인 콘텐츠 영역 조정 (바텀바용)
    if (this.mainContent) {
      this.mainContent.style.marginRight = '0';
      this.mainContent.style.marginBottom = `${this.bottomBarHeight[this.deviceType]}px`;
    }
    
    console.log('📐 바텀바 모드 레이아웃 적용 완료');
  }

  /**
   * 요소 동기화 (바텀바 ↔ 사이드바)
   */
  syncToSidebar(elementType, value) {
    try {
      const sidebarElements = {
        score: document.getElementById('sidebarScore'),
        timer: document.getElementById('sidebarTimer'),
        found: document.getElementById('sidebarFound'),
        lives: document.getElementById('sidebarLives')
      };
      
      const element = sidebarElements[elementType];
      if (element) {
        // 안전한 값 처리
        const safeValue = value !== null && value !== undefined ? String(value) : '';
        element.textContent = safeValue;
        console.log(`🔗 사이드바 동기화: ${elementType} = ${safeValue}`);
        return true;
      } else {
        console.warn(`⚠️ 사이드바 요소를 찾을 수 없음: ${elementType}`);
        return false;
      }
    } catch (error) {
      console.error(`❌ 사이드바 동기화 실패 (${elementType}):`, error);
      return false;
    }
  }

  /**
   * 모든 요소 일괄 동기화
   */
  syncAllElements() {
    Object.keys(this.syncMapping).forEach(bottomBarId => {
      const bottomElement = document.getElementById(bottomBarId);
      const sidebarId = this.syncMapping[bottomBarId];
      const sidebarElement = document.getElementById(sidebarId);
      
      if (bottomElement && sidebarElement) {
        if (bottomElement.tagName === 'BUTTON' && sidebarElement.tagName === 'BUTTON') {
          // 버튼의 경우 상태와 텍스트 동기화
          sidebarElement.disabled = bottomElement.disabled;
          sidebarElement.textContent = bottomElement.textContent;
        } else {
          // 일반 요소의 경우 텍스트만 동기화
          sidebarElement.textContent = bottomElement.textContent;
        }
      }
    });
    
    console.log('🔄 모든 요소 일괄 동기화 완료');
  }

  /**
   * 바텀바 강제 숨김 (완전 제거용)
   */
  forceHideBottomBar() {
    if (this.bottomBar) {
      this.bottomBar.style.setProperty('display', 'none', 'important');
      this.bottomBar.style.setProperty('visibility', 'hidden', 'important');
      this.bottomBar.style.setProperty('opacity', '0', 'important');
      this.bottomBar.style.setProperty('height', '0', 'important');
      this.bottomBar.style.setProperty('overflow', 'hidden', 'important');
    }
    
    console.log('🚫 바텀바 강제 숨김 적용');
  }

  /**
   * 사이드바 버튼 이벤트 핸들러 설정
   */
  setupSidebarButtonHandlers() {
    // 사이드바 시작 버튼
    const sidebarStartBtn = document.getElementById('sidebarStartBtn');
    const originalStartBtn = document.getElementById('startBtn');
    
    if (sidebarStartBtn && originalStartBtn) {
      sidebarStartBtn.addEventListener('click', () => {
        originalStartBtn.click(); // 원본 버튼 클릭 이벤트 트리거
        console.log('🎮 사이드바 시작 버튼 클릭됨');
      });
    }
    
    // 사이드바 힌트 버튼
    const sidebarHintBtn = document.getElementById('sidebarHintBtn');
    const originalHintBtn = document.getElementById('hintBtn');
    
    if (sidebarHintBtn && originalHintBtn) {
      sidebarHintBtn.addEventListener('click', () => {
        originalHintBtn.click(); // 원본 버튼 클릭 이벤트 트리거
        console.log('💡 사이드바 힌트 버튼 클릭됨');
      });
    }
    
    console.log('🔗 사이드바 버튼 이벤트 핸들러 설정 완료');
  }

  /**
   * 사이드바 초기 상태 동기화
   */
  initializeSidebarState() {
    try {
      // 게임 상태가 있다면 초기 동기화 수행
      if (typeof gameState !== 'undefined' && gameState) {
        this.syncToSidebar('score', gameState.score || 0);
        this.syncToSidebar('found', `${(gameState.foundPoints || []).length}/${(gameState.answerPoints || []).length}`);
        this.syncToSidebar('timer', '00:00');
      }
      
      // 하트 시스템 초기화
      if (window.heartSystem) {
        const heartText = '❤️'.repeat(window.heartSystem.getCurrentHearts() || 5);
        this.syncToSidebar('lives', heartText);
      }
      
      // 버튼 상태 초기화
      const startBtn = document.getElementById('startBtn');
      const hintBtn = document.getElementById('hintBtn');
      const sidebarStartBtn = document.getElementById('sidebarStartBtn');
      const sidebarHintBtn = document.getElementById('sidebarHintBtn');
      
      if (startBtn && sidebarStartBtn) {
        sidebarStartBtn.disabled = startBtn.disabled;
        sidebarStartBtn.textContent = startBtn.textContent || '게임 시작';
      }
      
      if (hintBtn && sidebarHintBtn) {
        sidebarHintBtn.disabled = hintBtn.disabled || true;
        sidebarHintBtn.textContent = hintBtn.textContent || '💡 힌트';
      }
      
      console.log('🔄 사이드바 초기 상태 동기화 완료');
    } catch (error) {
      console.error('❌ 사이드바 초기화 중 오류:', error);
    }
  }

  /**
   * 현재 모드 확인
   */
  getCurrentMode() {
    return this.currentMode;
  }

  /**
   * 시스템 상태 확인
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      deviceType: this.deviceType,
      currentMode: this.currentMode,
      sidebarWidth: this.sidebarWidth[this.deviceType],
      bottomBarHeight: this.bottomBarHeight[this.deviceType],
      elements: {
        bottomBar: !!this.bottomBar,
        rightSidebar: !!this.rightSidebar,
        mainContent: !!this.mainContent
      }
    };
  }

  /**
   * 반응형 사이드바 너비 시스템 검증 테스트
   */
  testResponsiveWidthSystem() {
    console.group('🧪 반응형 사이드바 너비 시스템 테스트');
    
    try {
      const root = document.documentElement;
      const currentViewport = { width: window.innerWidth, height: window.innerHeight };
      const currentDevice = this.deviceType;
      const expectedWidth = this.sidebarWidth[currentDevice];
      const actualCSSVariable = getComputedStyle(root).getPropertyValue('--game-right-sidebar-width').trim();
      const sidebarElement = document.querySelector('.right-sidebar');
      const actualSidebarWidth = sidebarElement ? getComputedStyle(sidebarElement).width : 'N/A';
      
      // 테스트 결과 수집
      const testResults = {
        viewport: currentViewport,
        detectedDevice: currentDevice,
        expectedWidth: `${expectedWidth}px`,
        cssVariable: actualCSSVariable,
        actualSidebarWidth: actualSidebarWidth,
        cssVariableMatch: actualCSSVariable === `${expectedWidth}px`,
        allDeviceSizes: this.sidebarWidth,
        breakpoints: {
          desktop: `>= 1024px (현재: ${currentViewport.width >= 1024 ? '✅' : '❌'})`,
          tablet: `768-1023px (현재: ${currentViewport.width >= 768 && currentViewport.width < 1024 ? '✅' : '❌'})`,
          mobile: `480-767px (현재: ${currentViewport.width >= 480 && currentViewport.width < 768 ? '✅' : '❌'})`,
          mini: `< 480px (현재: ${currentViewport.width < 480 ? '✅' : '❌'})`
        }
      };
      
      console.log('📊 반응형 시스템 현재 상태:', testResults);
      
      // 통과/실패 판정
      const testPassed = testResults.cssVariableMatch;
      console.log(`🎯 테스트 결과: ${testPassed ? '✅ 통과' : '❌ 실패'}`);
      
      if (!testPassed) {
        console.warn('⚠️ CSS 변수와 예상 너비가 일치하지 않습니다!');
      }
      
      return testResults;
      
    } catch (error) {
      console.error('❌ 반응형 시스템 테스트 중 오류:', error);
      return { error: error.message };
    } finally {
      console.groupEnd();
    }
  }

  /**
   * 시스템 해제
   */
  destroy() {
    try {
      // 이벤트 리스너 제거
      window.removeEventListener('resize', this.handleResize);
      window.removeEventListener('orientationchange', this.handleResize);
      
      this.isInitialized = false;
      console.log('🗑️ LayoutManager 해제 완료');
    } catch (error) {
      console.error('❌ LayoutManager 해제 실패:', error);
    }
  }
}

// 전역 LayoutManager 인스턴스 생성
if (typeof window !== 'undefined') {
  window.layoutManager = new LayoutManager();
  
  // 하위 호환성: bottomBarManager 별칭 유지
  window.bottomBarManager = window.layoutManager;
  
  // ✅ 개발자용 전역 테스트 함수들
  window.testResponsiveWidth = () => {
    if (window.layoutManager) {
      return window.layoutManager.testResponsiveWidthSystem();
    } else {
      console.error('❌ LayoutManager가 초기화되지 않았습니다.');
    }
  };
  
  window.checkLayoutStatus = () => {
    if (window.layoutManager) {
      console.log('📋 현재 레이아웃 상태:', window.layoutManager.getStatus());
    } else {
      console.error('❌ LayoutManager가 초기화되지 않았습니다.');
    }
  };
  
  window.triggerLayoutResize = () => {
    if (window.layoutManager && window.layoutManager.isInitialized) {
      window.layoutManager.handleResize();
      console.log('🔄 레이아웃 강제 재계산 완료');
    } else {
      console.error('❌ LayoutManager가 초기화되지 않았습니다.');
    }
  };
  
  console.log('🌐 전역 반응형 테스트 함수 등록 완료:');
  console.log('   - window.testResponsiveWidth() : 반응형 시스템 테스트');
  console.log('   - window.checkLayoutStatus() : 현재 상태 확인');  
  console.log('   - window.triggerLayoutResize() : 강제 재계산');
}

// 페이지 로드 시 자동 초기화
document.addEventListener('DOMContentLoaded', () => {
  window.layoutManager.init();
});

// 모듈 시스템 지원
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LayoutManager;
}

console.log('✅ 통합 LayoutManager 모듈 로드 완료 - bottom-bar-manager 기능 통합됨'); 