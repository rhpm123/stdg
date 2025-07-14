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
    
    console.log(`🎨 CSS 변수 업데이트:`, {
      sidebarWidth: `${sidebarWidth}px`,
      bottomBarHeight: `${bottomBarHeight}px`,
      mainContentHeight
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
    
    console.log('👂 이벤트 리스너 설정 완료');
  }

  /**
   * 화면 크기 변경 처리
   */
  handleResize() {
    console.log('📱 화면 크기 변경 감지, 레이아웃 재계산 중...');
    
    this.detectDeviceType();
    this.setupCSS();
    
    // 현재 모드에 따라 레이아웃 재조정
    if (this.currentMode === 'sidebar') {
      this.applySidebarMode();
    } else {
      this.applyBottomBarMode();
    }
    
    console.log('🔄 레이아웃 재계산 완료');
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
    const sidebarElements = {
      score: document.getElementById('sidebarScore'),
      timer: document.getElementById('sidebarTimer'),
      found: document.getElementById('sidebarFound'),
      lives: document.getElementById('sidebarLives')
    };
    
    const element = sidebarElements[elementType];
    if (element) {
      element.textContent = value;
      console.log(`🔗 사이드바 동기화: ${elementType} = ${value}`);
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
      currentMode: this.currentMode,
      deviceType: this.deviceType,
      sidebarWidth: this.sidebarWidth[this.deviceType],
      bottomBarHeight: this.bottomBarHeight[this.deviceType],
      elementsFound: {
        bottomBar: !!this.bottomBar,
        rightSidebar: !!this.rightSidebar,
        mainContent: !!this.mainContent
      }
    };
  }

  /**
   * 시스템 정리
   */
  destroy() {
    try {
      // CSS 변수 정리
      const root = document.documentElement;
      root.style.removeProperty('--game-right-sidebar-width');
      root.style.removeProperty('--dynamic-bottom-bar-height');
      root.style.removeProperty('--game-bottom-bar-height');
      root.style.removeProperty('--main-content-height');
      
      console.log('🧹 LayoutManager 정리 완료');
    } catch (error) {
      console.error('❌ LayoutManager 정리 실패:', error);
    }
  }
}

// 전역 인스턴스 생성
window.layoutManager = new LayoutManager();

// 기존 bottomBarManager 호환성 유지
window.bottomBarManager = window.layoutManager;

// 페이지 로드 시 자동 초기화
document.addEventListener('DOMContentLoaded', () => {
  window.layoutManager.init();
});

// 모듈 시스템 지원
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LayoutManager;
}

console.log('✅ 통합 LayoutManager 모듈 로드 완료 - bottom-bar-manager 기능 통합됨'); 