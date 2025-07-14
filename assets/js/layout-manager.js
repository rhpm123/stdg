/**
 * 틀린그림찾기 게임 - 레이아웃 관리 시스템
 * 바텀바와 사이드바 전환을 관리합니다.
 */

class LayoutManager {
  constructor() {
    this.sidebarWidth = {
      desktop: 280,
      tablet: 240, 
      mobile: 200,
      mini: 160
    };
    
    this.currentMode = 'bottom-bar'; // 'bottom-bar' | 'sidebar'
    this.isInitialized = false;
    
    console.log('🔧 LayoutManager 초기화됨');
  }

  /**
   * 레이아웃 시스템 초기화
   */
  init() {
    try {
      this.detectDeviceType();
      this.setupCSS();
      this.setupEventListeners();
      this.isInitialized = true;
      
      console.log('✅ LayoutManager 초기화 완료');
      return true;
    } catch (error) {
      console.error('❌ LayoutManager 초기화 실패:', error);
      return false;
    }
  }

  /**
   * 디바이스 타입 감지
   */
  detectDeviceType() {
    const width = window.innerWidth;
    
    if (width >= 1024) {
      this.deviceType = 'desktop';
    } else if (width >= 768) {
      this.deviceType = 'tablet';
    } else if (width >= 480) {
      this.deviceType = 'mobile';
    } else {
      this.deviceType = 'mini';
    }
    
    console.log(`📱 디바이스 타입: ${this.deviceType} (${width}px)`);
  }

  /**
   * CSS 변수 설정
   */
  setupCSS() {
    const root = document.documentElement;
    const width = this.sidebarWidth[this.deviceType];
    
    root.style.setProperty('--game-right-sidebar-width', `${width}px`);
    
    console.log(`🎨 CSS 변수 설정: --game-right-sidebar-width = ${width}px`);
  }

  /**
   * 이벤트 리스너 설정
   */
  setupEventListeners() {
    // 화면 크기 변경 감지
    window.addEventListener('resize', () => {
      this.detectDeviceType();
      this.setupCSS();
    });
    
    // 화면 회전 감지
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.detectDeviceType();
        this.setupCSS();
      }, 100);
    });
  }

  /**
   * 사이드바와 동기화
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
   * 바텀바에서 사이드바로 전환
   */
  switchToSidebar() {
    const bottomBar = document.querySelector('.bottom-bar');
    const sidebar = document.querySelector('.right-sidebar');
    
    if (bottomBar) {
      bottomBar.style.display = 'none';
    }
    
    if (sidebar) {
      sidebar.style.display = 'block';
    }
    
    this.currentMode = 'sidebar';
    console.log('🔄 사이드바 모드로 전환됨');
  }

  /**
   * 사이드바에서 바텀바로 전환
   */
  switchToBottomBar() {
    const bottomBar = document.querySelector('.bottom-bar');
    const sidebar = document.querySelector('.right-sidebar');
    
    if (sidebar) {
      sidebar.style.display = 'none';
    }
    
    if (bottomBar) {
      bottomBar.style.display = 'block';
    }
    
    this.currentMode = 'bottom-bar';
    console.log('🔄 바텀바 모드로 전환됨');
  }

  /**
   * 현재 모드 확인
   */
  getCurrentMode() {
    return this.currentMode;
  }

  /**
   * 레이아웃 시스템 상태 확인
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      currentMode: this.currentMode,
      deviceType: this.deviceType,
      sidebarWidth: this.sidebarWidth[this.deviceType]
    };
  }
}

// 전역 인스턴스 생성
window.layoutManager = new LayoutManager();

// 페이지 로드 시 자동 초기화
document.addEventListener('DOMContentLoaded', () => {
  window.layoutManager.init();
});

// 모듈 시스템 지원
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LayoutManager;
}

console.log('✅ LayoutManager 모듈 로드 완료'); 