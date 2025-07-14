/**
 * LayoutManager - 동적 레이아웃 관리 시스템 (사이드바 전용)
 * 전 환경 사이드바 적용: 모바일/PC 모두 사이드바로 통일
 */

class LayoutManager {
  constructor() {
    console.log('🚀 LayoutManager: 전 환경 사이드바 시스템 활성화됨');
    this.enabled = true; // 시스템 활성화
    this.rightSidebar = document.querySelector('.right-sidebar');
    this.bottomBar = document.querySelector('.bottom-bar'); // 호환성 유지용 (사용 안함)
    
    // 사이드바 크기 설정
    this.minWidth = 160;
    this.maxWidth = 320;
    this.defaultWidth = 280;
    
    if (this.enabled) {
      this.initialize();
      console.log('✅ 전 환경 사이드바 시스템이 활성화되었습니다.');
    }
  }

  // 시스템 초기화
  initialize() {
    if (!this.enabled) return;
    
    try {
      // 사이드바 요소 동기화 시스템 설정
      this.setupSidebarSync();
      
      // 사이드바 최적 너비 계산
      this.calculateOptimalWidth();
      
      // 리사이즈 리스너 설정
      this.setupResizeListener();
      
      console.log('📏 LayoutManager 사이드바 초기화 완료');
    } catch (error) {
      console.error('❌ LayoutManager 초기화 실패:', error);
    }
  }
  
  // 사이드바 요소 동기화 시스템 설정
  setupSidebarSync() {
    if (!this.enabled || !this.rightSidebar) return;
    
    // 바텀바와 사이드바 요소 동기화를 위한 매핑
    this.syncMapping = {
      // 바텀바 ID -> 사이드바 ID 매핑
      'score': 'sidebarScore',
      'timer': 'sidebarTimer', 
      'found': 'sidebarFound',
      'lives': 'sidebarLives',
      'startBtn': 'sidebarStartBtn',
      'hintBtn': 'sidebarHintBtn',
      'healthBarFill': 'sidebarHealthBarFill',
      'healthBarText': 'sidebarHealthBarText'
    };
    
    console.log('🔗 사이드바 요소 동기화 매핑 설정 완료');
  }

  // 사이드바 최적 너비 계산
  calculateOptimalWidth() {
    if (!this.enabled) return null;
    
    try {
      const viewportWidth = window.innerWidth;
      
      // 화면 크기에 따른 사이드바 너비 설정
      let optimalWidth;
      
      if (viewportWidth >= 1024) {
        // 데스크톱: 기본 너비 사용 (280px)
        optimalWidth = this.defaultWidth;
        console.log('🖥️ 데스크톱 환경 - 표준 사이드바:', optimalWidth + 'px');
      } else if (viewportWidth >= 768) {
        // 태블릿: 240px
        optimalWidth = 240;
        console.log('📱 태블릿 환경 - 최적화 사이드바:', optimalWidth + 'px');
      } else if (viewportWidth >= 480) {
        // 소형 모바일: 200px
        optimalWidth = 200;
        console.log('📱 소형 모바일 환경 - 컴팩트 사이드바:', optimalWidth + 'px');
      } else {
        // 초소형 모바일: 160px
        optimalWidth = 160;
        console.log('📱 초소형 모바일 환경 - 최소 사이드바:', optimalWidth + 'px');
      }
      
      this.updateSidebarWidth(optimalWidth);
      return optimalWidth;
    } catch (error) {
      console.error('❌ 사이드바 너비 계산 실패:', error);
      return this.defaultWidth;
    }
  }

  // 사이드바 너비 업데이트
  updateSidebarWidth(width) {
    if (!this.enabled) return;
    
    try {
      // CSS 변수 업데이트
      document.documentElement.style.setProperty('--game-right-sidebar-width', `${width}px`);
      
      // 사이드바 요소에 직접 스타일 적용 (최고 우선순위 보장)
      if (this.rightSidebar) {
        this.rightSidebar.style.setProperty('width', `${width}px`, 'important');
        this.rightSidebar.style.setProperty('min-width', `${Math.max(width - 20, this.minWidth)}px`, 'important');
        this.rightSidebar.style.setProperty('max-width', `${width + 20}px`, 'important');
        
        console.log(`🔧 사이드바 너비 직접 적용: ${width}px`);
      }
      
      // CSS 재계산 강제 트리거
      if (this.rightSidebar) {
        this.rightSidebar.style.transform = 'translateZ(0)';
        this.rightSidebar.offsetWidth; // 강제 리플로우
        this.rightSidebar.style.transform = '';
      }
      
      console.log(`🔄 사이드바 너비 업데이트 완료: ${width}px`);
    } catch (error) {
      console.error('❌ 사이드바 너비 업데이트 실패:', error);
    }
  }

  // 요소 동기화 함수 (바텀바 값을 사이드바에 반영)
  syncToSidebar(bottomBarId, value) {
    if (!this.enabled || !this.syncMapping) return;
    
    const sidebarId = this.syncMapping[bottomBarId];
    if (!sidebarId) return;
    
    const sidebarElement = document.getElementById(sidebarId);
    const bottomElement = document.getElementById(bottomBarId);
    
    if (sidebarElement) {
      if (typeof value !== 'undefined') {
        // 값이 직접 제공된 경우
        sidebarElement.textContent = value;
      } else if (bottomElement) {
        // 바텀바 요소에서 값 복사
        sidebarElement.textContent = bottomElement.textContent;
        
        // 버튼의 경우 이벤트도 복사
        if (bottomElement.tagName === 'BUTTON' && sidebarElement.tagName === 'BUTTON') {
          sidebarElement.disabled = bottomElement.disabled;
          sidebarElement.className = bottomElement.className.replace(/bottom-/g, 'sidebar-');
        }
      }
      
      console.log(`🔗 동기화: ${bottomBarId} → ${sidebarId}`);
    }
  }

  // 모든 요소 일괄 동기화
  syncAllElements() {
    if (!this.enabled) return;
    
    Object.keys(this.syncMapping).forEach(bottomBarId => {
      this.syncToSidebar(bottomBarId);
    });
    
    console.log('🔄 사이드바 요소 일괄 동기화 완료');
  }

  // 리사이즈 이벤트 리스너 설정
  setupResizeListener() {
    if (!this.enabled) return;
    
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.handleResize();
      }, 100); // 100ms 디바운스
    });
  }

  // 리사이즈 처리
  handleResize() {
    if (!this.enabled) return;
    
    console.log('📱 화면 크기 변경 감지, 사이드바 재계산 중...');
    this.calculateOptimalWidth();
  }

  // 시스템 정리
  destroy() {
    if (!this.enabled) return;
    
    try {
      // CSS 변수 초기화
      document.documentElement.style.removeProperty('--game-right-sidebar-width');
      console.log('🧹 LayoutManager 정리 완료');
    } catch (error) {
      console.error('❌ LayoutManager 정리 실패:', error);
    }
  }

  // 상태 확인용 메서드
  isEnabled() {
    return this.enabled;
  }
  
  // 현재 사이드바 너비 반환
  getCurrentWidth() {
    if (!this.rightSidebar) return this.defaultWidth;
    
    const computedWidth = window.getComputedStyle(this.rightSidebar).width;
    return parseInt(computedWidth) || this.defaultWidth;
  }
}

// 전역 인스턴스 생성 (기존 bottomBarManager 대체)
window.layoutManager = new LayoutManager();

// 호환성을 위해 기존 bottomBarManager도 layoutManager를 가리키도록 설정
window.bottomBarManager = window.layoutManager;

console.log('🎯 LayoutManager 활성화 완료: 전 환경 사이드바 시스템이 작동합니다.'); 