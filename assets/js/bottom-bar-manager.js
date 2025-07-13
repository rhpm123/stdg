/**
 * BottomBarManager - 동적 하단바 관리 시스템
 * 활성화 모드: 모바일 기기별 반응형 바텀바 시스템
 */

class BottomBarManager {
  constructor() {
    console.log('🚀 BottomBarManager: 동적 시스템 활성화됨');
    this.enabled = true; // 시스템 활성화
    this.bottomBar = document.querySelector('.bottom-bar');
    this.minHeight = 35;
    this.maxHeight = 80;
    this.defaultHeight = 55;
    
    if (this.enabled) {
      this.initialize();
      console.log('✅ 동적 레이아웃 시스템이 활성화되었습니다.');
    }
  }

  // 시스템 초기화
  initialize() {
    if (!this.enabled) return;
    
    try {
      this.calculateOptimalHeight();
      this.setupResizeListener();
      console.log('📏 BottomBarManager 초기화 완료');
    } catch (error) {
      console.error('❌ BottomBarManager 초기화 실패:', error);
    }
  }

  // 최적 높이 계산
  calculateOptimalHeight() {
    if (!this.enabled) return null;
    
    try {
      // PC 환경 체크 - OrientationController의 isDesktopEnvironment() 활용
      if (typeof window.orientationController !== 'undefined' && 
          window.orientationController.isDesktopEnvironment && 
          window.orientationController.isDesktopEnvironment()) {
        
        console.log('🖥️ PC 환경 감지 - 고정 높이 적용:', this.defaultHeight + 'px');
        this.updateBottomBarHeight(this.defaultHeight);
        return this.defaultHeight;
      }
      
      // 모바일 환경 - 기존 동적 계산 로직 유지
      console.log('📱 모바일 환경 - 동적 높이 계산 실행');
      const viewportHeight = window.innerHeight;
      const headerHeight = 45; // CSS 변수와 일치
      const minMainHeight = 200; // 게임 영역 최소 높이
      
      // 사용 가능한 높이에서 최적 바텀바 높이 계산
      const availableForBottomBar = viewportHeight - headerHeight - minMainHeight;
      const optimalHeight = Math.max(this.minHeight, Math.min(this.maxHeight, availableForBottomBar * 0.2));
      
      // 정수로 반올림
      const finalHeight = Math.round(optimalHeight);
      
      console.log(`📐 동적 높이 계산: viewport=${viewportHeight}px, optimal=${finalHeight}px`);
      
      this.updateBottomBarHeight(finalHeight);
      return finalHeight;
    } catch (error) {
      console.error('❌ 높이 계산 실패:', error);
      return this.defaultHeight;
    }
  }

  // 바텀바 높이 업데이트
  updateBottomBarHeight(height) {
    if (!this.enabled) return;
    
    try {
      // CSS 변수 업데이트
      document.documentElement.style.setProperty('--dynamic-bottom-bar-height', `${height}px`);
      
      // PC 환경에서는 추가로 인라인 스타일도 동시 설정 (최고 우선순위 보장)
      if (typeof window.orientationController !== 'undefined' && 
          window.orientationController.isDesktopEnvironment && 
          window.orientationController.isDesktopEnvironment()) {
        
        if (this.bottomBar) {
          // PC 환경: 인라인 스타일로 강제 설정
          this.bottomBar.style.setProperty('height', `${height}px`, 'important');
          this.bottomBar.style.setProperty('min-height', `${height}px`, 'important');
          this.bottomBar.style.setProperty('max-height', `${height}px`, 'important');
          
          console.log(`🖥️ PC 환경: 인라인 스타일 강제 적용 - ${height}px`);
        }
        
        // force-js-execution.js의 forceCSSVariables() 연계 호출
        if (window.forceJSExecution && window.forceJSExecution.forceCSSVariables) {
          // PC 환경 전용 CSS 변수 강제 설정
          document.documentElement.style.setProperty('--dynamic-bottom-bar-height', `${height}px`);
          document.documentElement.style.setProperty('--game-bottom-bar-height', `${height}px`);
          
          console.log(`🔗 force-js-execution 연계: CSS 변수 동기화 완료`);
        }
      }
      
      // CSS 재계산 강제 트리거 (즉시 시각적 반영 보장)
      if (this.bottomBar) {
        // GPU 레이어 강제 생성으로 하드웨어 가속 활성화
        this.bottomBar.style.transform = 'translateZ(0)';
        // 강제 리플로우 실행으로 CSS 변경사항 즉시 적용
        this.bottomBar.offsetHeight; // 읽기 접근으로 브라우저 강제 재계산
        // GPU 레이어 정리 (메모리 최적화)
        this.bottomBar.style.transform = '';
      }
      
      console.log(`🔄 바텀바 높이 업데이트 + 재계산 트리거 완료: ${height}px`);
    } catch (error) {
      console.error('❌ 바텀바 높이 업데이트 실패:', error);
    }
  }

  // 브라우저별 변수 설정
  setBrowserSpecificVariables() {
    if (!this.enabled) return;
    
    try {
      // 동적 뷰포트 높이 지원 확인 및 설정
      if (CSS.supports('height', '100dvh')) {
        document.documentElement.style.setProperty('--dynamic-viewport-height', '100dvh');
        console.log('📱 동적 뷰포트 높이(dvh) 지원 확인');
      } else {
        document.documentElement.style.setProperty('--dynamic-viewport-height', '100vh');
        console.log('📱 표준 뷰포트 높이(vh) 사용');
      }
    } catch (error) {
      console.error('❌ 브라우저별 변수 설정 실패:', error);
    }
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
    
    console.log('📱 화면 크기 변경 감지, 바텀바 재계산 중...');
    this.calculateOptimalHeight();
    this.setBrowserSpecificVariables();
  }

  // 시스템 정리
  destroy() {
    if (!this.enabled) return;
    
    try {
      // CSS 변수 초기화
      document.documentElement.style.removeProperty('--dynamic-bottom-bar-height');
      document.documentElement.style.removeProperty('--dynamic-viewport-height');
      console.log('🧹 BottomBarManager 정리 완료');
    } catch (error) {
      console.error('❌ BottomBarManager 정리 실패:', error);
    }
  }

  // 상태 확인용 메서드
  isEnabled() {
    return this.enabled;
  }
}

// 전역 인스턴스 생성 (활성화된 상태)
window.bottomBarManager = new BottomBarManager();

// 활성화 모드 메시지
console.log('🎯 BottomBarManager 활성화 완료: 동적 반응형 바텀바 시스템이 작동합니다.'); 