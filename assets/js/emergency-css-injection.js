/**
 * 응급 CSS 주입 도구
 * 모든 다른 방법이 실패했을 때 강제로 CSS 규칙을 주입하여 즉시 문제 해결
 */

class EmergencyCSSInjection {
  constructor() {
    console.log('🚨 응급 CSS 주입 도구 로드됨');
    this.injectedStyles = [];
    this.targetHeight = '38px';
  }

  /**
   * 강제 CSS 규칙 주입 (메인 함수)
   */
  injectForceCSSRules() {
    console.log('💉 강제 CSS 규칙 주입 시작...');
    console.log('='.repeat(50));
    
    // Step 1: 기존 주입된 스타일 제거
    this.removeInjectedStyles();
    
    // Step 2: 강력한 CSS 규칙 생성
    const cssRules = this.generateForceCSSRules();
    
    // Step 3: 스타일 태그 생성 및 주입
    const success = this.injectStyleTag(cssRules);
    
    // Step 4: 즉시 검증
    setTimeout(() => {
      this.verifyInjection();
    }, 100);
    
    console.log('='.repeat(50));
    console.log(success ? '✅ CSS 주입 완료' : '❌ CSS 주입 실패');
    
    return success;
  }

  /**
   * 강력한 CSS 규칙 생성 (브라우저별 호환성 포함)
   */
  generateForceCSSRules() {
    console.log('🎨 강력한 CSS 규칙 생성 중 (브라우저 호환성 포함)...');
    
    // PC 환경 감지
    const isPC = window.innerWidth >= 1024;
    const pcHeight = isPC ? '55px' : this.targetHeight;
    
    console.log(`🖥️ 환경 감지: ${isPC ? 'PC' : '모바일'}, 타겟 높이: ${pcHeight}`);
    
    const rules = `
      /* =====================================
         응급 CSS 주입: 브라우저별 호환성 확보
         ===================================== */
      
      /* 기본 바텀바 규칙 */
      .bottom-bar {
        height: ${pcHeight} !important;
        min-height: ${pcHeight} !important;
        max-height: ${pcHeight} !important;
        
        /* 브라우저별 호환성 속성 */
        -webkit-box-sizing: border-box !important;
        -moz-box-sizing: border-box !important;
        box-sizing: border-box !important;
        
        /* WebKit 브라우저 (Safari, Chrome) 최적화 */
        -webkit-transform: translateZ(0) !important;
        -webkit-backface-visibility: hidden !important;
        
        /* Firefox 최적화 */
        -moz-backface-visibility: hidden !important;
        
        /* Edge/IE 호환성 */
        -ms-transform: translateZ(0) !important;
      }
      
      /* PC 환경 전용 .pc-bottom-bar 응급 규칙 */
      ${isPC ? `
      .pc-bottom-bar,
      .bottom-bar.pc-bottom-bar {
        position: fixed !important;
        bottom: 0 !important;
        left: 0 !important;
        right: 0 !important;
        z-index: 9999 !important;
        width: 100% !important;
        height: 55px !important;
        min-height: 55px !important;
        max-height: 55px !important;
        display: grid !important;
        visibility: visible !important;
        opacity: 1 !important;
        
        /* 브라우저별 위치 고정 강화 */
        -webkit-position: fixed !important;
        -moz-position: fixed !important;
        -ms-position: fixed !important;
        
        /* 하드웨어 가속 강제 활성화 */
        -webkit-transform: translate3d(0, 0, 0) !important;
        -moz-transform: translate3d(0, 0, 0) !important;
        -ms-transform: translate3d(0, 0, 0) !important;
        transform: translate3d(0, 0, 0) !important;
        
        /* 렌더링 최적화 */
        will-change: transform !important;
        contain: layout style paint !important;
      }` : ''}
      
      .bottom-bar-stats {
        height: ${pcHeight} !important;
        min-height: ${pcHeight} !important;
        max-height: ${pcHeight} !important;
        display: flex !important;
        align-items: center !important;
        overflow: hidden !important;
        
        /* 브라우저별 Flexbox 호환성 */
        -webkit-display: -webkit-flex !important;
        -moz-display: -moz-flex !important;
        -ms-display: -ms-flexbox !important;
        
        -webkit-align-items: center !important;
        -moz-align-items: center !important;
        -ms-flex-align: center !important;
      }
      
      .game-stats {
        height: 100% !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        padding: 0 15px !important;
        
        /* 브라우저별 Flexbox 호환성 */
        -webkit-display: -webkit-flex !important;
        -webkit-align-items: center !important;
        -webkit-justify-content: space-between !important;
        
        -moz-display: -moz-flex !important;
        -moz-align-items: center !important;
        -moz-justify-content: space-between !important;
        
        -ms-display: -ms-flexbox !important;
        -ms-flex-align: center !important;
        -ms-flex-pack: justify !important;
      }
      
      .stat-value {
        height: calc(${pcHeight} * 0.7) !important;
        line-height: calc(${pcHeight} * 0.7) !important;
        font-size: calc(${pcHeight} * 0.35) !important;
        display: flex !important;
        align-items: center !important;
        
        /* 브라우저별 calc() 호환성 */
        height: -webkit-calc(${pcHeight} * 0.7) !important;
        height: -moz-calc(${pcHeight} * 0.7) !important;
        height: calc(${pcHeight} * 0.7) !important;
        
        line-height: -webkit-calc(${pcHeight} * 0.7) !important;
        line-height: -moz-calc(${pcHeight} * 0.7) !important;
        line-height: calc(${pcHeight} * 0.7) !important;
      }
      
      /* 모든 하위 요소 브라우저 호환성 */
      .bottom-bar *,
      .pc-bottom-bar * {
        -webkit-box-sizing: border-box !important;
        -moz-box-sizing: border-box !important;
        box-sizing: border-box !important;
      }
      
      .bottom-bar-progress,
      .bottom-bar-controls {
        -webkit-flex-shrink: 0 !important;
        -moz-flex-shrink: 0 !important;
        -ms-flex-negative: 0 !important;
        flex-shrink: 0 !important;
      }
      
      /* 브라우저별 CSS 변수 폴백 */
      :root {
        --emergency-bottom-bar-height: ${pcHeight} !important;
        --emergency-pc-height: 55px !important;
      }
    `;
    
    console.log(`📏 적용 높이: ${pcHeight}`);
    console.log(`🌐 PC 환경: ${isPC ? '활성화' : '비활성화'}`);
    console.log('📝 브라우저 호환성 CSS 규칙 생성 완료');
    
    return rules;
  }

  /**
   * 스타일 태그 생성 및 DOM 주입
   */
  injectStyleTag(cssRules) {
    try {
      console.log('💉 스타일 태그 DOM 주입 중...');
      
      // 고유 ID로 스타일 태그 생성
      const styleId = 'emergency-css-injection-' + Date.now();
      const styleTag = document.createElement('style');
      
      styleTag.id = styleId;
      styleTag.type = 'text/css';
      styleTag.textContent = cssRules;
      
      // 높은 우선순위를 위해 head 맨 마지막에 추가
      document.head.appendChild(styleTag);
      
      // 주입된 스타일 추적
      this.injectedStyles.push(styleId);
      
      console.log(`✅ 스타일 태그 주입 완료 (ID: ${styleId})`);
      
      // 강제 리플로우 트리거
      this.triggerReflow();
      
      return true;
    } catch (error) {
      console.error('❌ 스타일 태그 주입 실패:', error);
      return false;
    }
  }

  /**
   * 강제 리플로우 트리거
   */
  triggerReflow() {
    console.log('🔄 강제 리플로우 트리거...');
    
    try {
      const elements = ['.bottom-bar', '.bottom-bar-stats', '.game-stats'];
      
      elements.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
          // 다중 리플로우 트리거로 확실한 업데이트 보장
          element.style.display = 'none';
          element.offsetHeight; // 강제 계산
          element.style.display = '';
          element.offsetHeight; // 다시 강제 계산
          
          console.log(`  🔄 ${selector} 리플로우 완료`);
        }
      });
      
      console.log('✅ 전체 리플로우 완료');
    } catch (error) {
      console.error('❌ 리플로우 트리거 실패:', error);
    }
  }

  /**
   * 주입된 스타일 제거
   */
  removeInjectedStyles() {
    console.log('🧹 기존 주입된 스타일 제거 중...');
    
    this.injectedStyles.forEach(styleId => {
      const styleTag = document.getElementById(styleId);
      if (styleTag) {
        styleTag.remove();
        console.log(`  🗑️ 제거됨: ${styleId}`);
      }
    });
    
    this.injectedStyles = [];
    console.log('✅ 기존 스타일 제거 완료');
  }

  /**
   * 주입 결과 검증
   */
  verifyInjection() {
    console.log('🔍 주입 결과 검증 시작...');
    
    const bottomBar = document.querySelector('.bottom-bar');
    const bottomBarStats = document.querySelector('.bottom-bar-stats');
    
    if (bottomBar && bottomBarStats) {
      const bottomBarHeight = bottomBar.offsetHeight;
      const bottomBarStatsHeight = bottomBarStats.offsetHeight;
      const heightDiff = Math.abs(bottomBarHeight - bottomBarStatsHeight);
      
      console.log('📊 검증 결과:');
      console.log(`  bottom-bar: ${bottomBarHeight}px`);
      console.log(`  bottom-bar-stats: ${bottomBarStatsHeight}px`);
      console.log(`  차이: ${heightDiff}px`);
      console.log(`  타겟 높이: ${this.targetHeight}`);
      
      // 성공 조건 확인
      const isTargetHeight = bottomBarHeight === parseInt(this.targetHeight);
      const isSynchronized = heightDiff === 0;
      
      if (isTargetHeight && isSynchronized) {
        console.log('🎉 완벽한 성공! 높이 동기화 및 타겟 달성');
        this.showSuccessMessage();
        return true;
      } else if (isSynchronized) {
        console.log('👍 부분 성공! 높이 동기화 완료 (타겟 높이는 다름)');
        return true;
      } else {
        console.log('⚠️ 아직 동기화되지 않음, 추가 조치 필요');
        this.emergencyBackupPlan();
        return false;
      }
    } else {
      console.log('❌ DOM 요소를 찾을 수 없음');
      return false;
    }
  }

  /**
   * 응급 백업 계획 (마지막 수단)
   */
  emergencyBackupPlan() {
    console.log('🚨 응급 백업 계획 실행...');
    
    try {
      // 직접 인라인 스타일 강제 적용
      const bottomBarStats = document.querySelector('.bottom-bar-stats');
      const bottomBar = document.querySelector('.bottom-bar');
      
      if (bottomBarStats && bottomBar) {
        // 인라인 스타일로 강제 적용 (가장 높은 우선순위)
        bottomBar.style.cssText += `height: ${this.targetHeight} !important; min-height: ${this.targetHeight} !important;`;
        bottomBarStats.style.cssText += `height: ${this.targetHeight} !important; min-height: ${this.targetHeight} !important;`;
        
        console.log('💪 인라인 스타일 강제 적용 완료');
        
        // 재검증
        setTimeout(() => {
          const newDiff = Math.abs(bottomBar.offsetHeight - bottomBarStats.offsetHeight);
          console.log(`🔍 백업 계획 결과: 차이 ${newDiff}px`);
          
          if (newDiff === 0) {
            console.log('🎉 백업 계획 성공!');
            this.showSuccessMessage();
          }
        }, 100);
      }
    } catch (error) {
      console.error('❌ 응급 백업 계획 실패:', error);
    }
  }

  /**
   * 성공 메시지 표시
   */
  showSuccessMessage() {
    console.log('🎊 축하합니다! 높이 동기화 완료');
    console.log('==========================================');
    console.log('✅ bottom-bar와 bottom-bar-stats 높이 동기화 성공');
    console.log('✅ 57.97px 문제 해결됨');
    console.log('✅ 시각적 cutoff 문제 해결됨');
    console.log('==========================================');
    
    // 시각적 알림 (가능한 경우)
    if (typeof alert !== 'undefined') {
      setTimeout(() => {
        alert('🎉 높이 동기화 완료!\n\nbottom-bar-stats 크기 문제가 해결되었습니다.');
      }, 500);
    }
  }

  /**
   * 다른 높이로 재설정
   */
  setTargetHeight(height) {
    console.log(`🎯 타겟 높이 변경: ${this.targetHeight} → ${height}`);
    this.targetHeight = height;
    this.injectForceCSSRules();
  }

  /**
   * 모든 주입된 스타일 완전 제거 (복원)
   */
  restore() {
    console.log('🔄 원상복구 시작...');
    
    // 주입된 스타일 제거
    this.removeInjectedStyles();
    
    // 인라인 스타일 제거
    const elements = document.querySelectorAll('.bottom-bar, .bottom-bar-stats');
    elements.forEach(element => {
      element.style.height = '';
      element.style.minHeight = '';
      element.style.maxHeight = '';
    });
    
    console.log('✅ 원상복구 완료');
  }
}

// 전역 인스턴스 생성
window.emergencyCSSInjection = new EmergencyCSSInjection();

// 개발자 도구용 간편 함수들
window.emergencyUtils = {
  fix: () => window.emergencyCSSInjection.injectForceCSSRules(),
  verify: () => window.emergencyCSSInjection.verifyInjection(),
  restore: () => window.emergencyCSSInjection.restore(),
  setHeight: (height) => window.emergencyCSSInjection.setTargetHeight(height + 'px'),
  backup: () => window.emergencyCSSInjection.emergencyBackupPlan()
};

console.log('🚨 응급 CSS 주입 도구 로드 완료');
console.log('사용법:');
console.log('  - emergencyUtils.fix(): 즉시 높이 38px 강제 동기화 (추천!)');
console.log('  - emergencyUtils.verify(): 결과 검증');
console.log('  - emergencyUtils.restore(): 원상복구');
console.log('  - emergencyUtils.setHeight(35): 다른 높이로 설정');
console.log('  - emergencyUtils.backup(): 응급 백업 계획');

/**
 * 브라우저별 호환성 확인 및 자동 fallback 시스템
 */
class BrowserCompatibilityFallback {
  constructor() {
    this.compatibilityChecks = {
      flexbox: false,
      cssVariables: false,
      calc: false,
      transform3d: false,
      position: false
    };
    
    this.browserInfo = this.detectBrowser();
    this.checkAllCompatibility();
  }

  /**
   * 브라우저 감지
   */
  detectBrowser() {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    
    if (ua.includes('Chrome') && !ua.includes('Edge')) {
      browser = 'Chrome';
    } else if (ua.includes('Firefox')) {
      browser = 'Firefox';
    } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
      browser = 'Safari';
    } else if (ua.includes('Edge')) {
      browser = 'Edge';
    } else if (ua.includes('Trident')) {
      browser = 'Internet Explorer';
    }
    
    console.log(`🌐 브라우저 감지: ${browser}`);
    return browser;
  }

  /**
   * 모든 CSS 호환성 확인
   */
  checkAllCompatibility() {
    console.log('🔍 브라우저 CSS 호환성 확인 중...');
    
    // CSS.supports 사용 가능한지 확인
    if (typeof CSS !== 'undefined' && CSS.supports) {
      this.compatibilityChecks.flexbox = CSS.supports('display', 'flex');
      this.compatibilityChecks.cssVariables = CSS.supports('--custom-property', 'value');
      this.compatibilityChecks.calc = CSS.supports('height', 'calc(100vh - 55px)');
      this.compatibilityChecks.transform3d = CSS.supports('transform', 'translate3d(0,0,0)');
      this.compatibilityChecks.position = CSS.supports('position', 'fixed');
    } else {
      // CSS.supports 미지원 브라우저 대응
      this.fallbackCompatibilityCheck();
    }
    
    console.log('🔍 호환성 확인 결과:', this.compatibilityChecks);
    
    return this.compatibilityChecks;
  }

  /**
   * 폴백 호환성 확인 (CSS.supports 미지원용)
   */
  fallbackCompatibilityCheck() {
    console.log('⚠️ CSS.supports 미지원 - 폴백 확인 실행');
    
    // 대부분의 모던 브라우저는 이 기능들을 지원
    this.compatibilityChecks.flexbox = true;
    this.compatibilityChecks.cssVariables = !this.browserInfo.includes('Internet Explorer');
    this.compatibilityChecks.calc = true;
    this.compatibilityChecks.transform3d = true;
    this.compatibilityChecks.position = true;
  }

  /**
   * 바텀바 상태 자동 검증
   */
  async verifyBottomBarStatus() {
    console.log('🔍 바텀바 상태 자동 검증 시작...');
    
    return new Promise((resolve) => {
      // DOM 로드 완료 대기
      const checkBottomBar = () => {
        const bottomBar = document.querySelector('.bottom-bar');
        const isPC = window.innerWidth >= 1024;
        
        if (!bottomBar) {
          console.log('❌ 바텀바 요소를 찾을 수 없음');
          resolve(false);
          return;
        }
        
        const rect = bottomBar.getBoundingClientRect();
        const isVisible = rect.bottom <= window.innerHeight && rect.top >= 0;
        const hasCorrectHeight = isPC ? (rect.height >= 50 && rect.height <= 60) : rect.height >= 30;
        
        console.log('📊 바텀바 상태 검증:', {
          isPC,
          height: rect.height,
          bottom: rect.bottom,
          windowHeight: window.innerHeight,
          isVisible,
          hasCorrectHeight,
          needsFix: !isVisible || !hasCorrectHeight
        });
        
        const needsFix = !isVisible || !hasCorrectHeight;
        resolve(!needsFix);
      };
      
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkBottomBar);
      } else {
        setTimeout(checkBottomBar, 100);
      }
    });
  }

  /**
   * 자동 fallback 시스템 실행
   */
  async executeAutoFallback() {
    console.log('🚀 자동 fallback 시스템 실행...');
    
    // 1단계: 바텀바 상태 확인
    const isBottomBarOK = await this.verifyBottomBarStatus();
    
    if (isBottomBarOK) {
      console.log('✅ 바텀바 상태 정상 - fallback 불필요');
      return true;
    }
    
    console.log('⚠️ 바텀바 문제 감지 - emergency CSS 주입 실행');
    
    // 2단계: Emergency CSS 주입
    const emergencySuccess = window.emergencyCSSInjection.injectForceCSSRules();
    
    if (emergencySuccess) {
      // 3단계: 재검증
      setTimeout(async () => {
        const recheck = await this.verifyBottomBarStatus();
        if (recheck) {
          console.log('🎉 Emergency CSS 주입으로 문제 해결 완료!');
        } else {
          console.log('⚠️ Emergency CSS 후에도 문제 지속 - 백업 계획 실행');
          window.emergencyCSSInjection.emergencyBackupPlan();
        }
      }, 500);
      
      return true;
    }
    
    return false;
  }
}

// 전역 브라우저 호환성 시스템 인스턴스
window.browserCompatibilityFallback = new BrowserCompatibilityFallback();

// 자동 실행 시스템 (모든 환경에서)
console.log('🔧 브라우저 호환성 자동 fallback 시스템 활성화');

// 페이지 로드 완료 후 자동 검증 실행
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      window.browserCompatibilityFallback.executeAutoFallback();
    }, 1000);
  });
} else {
  setTimeout(() => {
    window.browserCompatibilityFallback.executeAutoFallback();
  }, 1000);
}

// 개발 환경에서는 추가 디버깅 정보 제공
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  console.log('🏠 개발 환경 감지 - 확장된 디버깅 모드 활성화');
  
  // 개발자 도구용 추가 유틸리티
  window.devFallbackUtils = {
    checkCompatibility: () => window.browserCompatibilityFallback.checkAllCompatibility(),
    verifyBottomBar: () => window.browserCompatibilityFallback.verifyBottomBarStatus(),
    runFallback: () => window.browserCompatibilityFallback.executeAutoFallback(),
    getBrowserInfo: () => window.browserCompatibilityFallback.browserInfo
  };
  
  console.log('🛠️ 개발자 도구 추가 명령어:');
  console.log('  - devFallbackUtils.checkCompatibility(): 브라우저 호환성 확인');
  console.log('  - devFallbackUtils.verifyBottomBar(): 바텀바 상태 검증');
  console.log('  - devFallbackUtils.runFallback(): 수동 fallback 실행');
} 