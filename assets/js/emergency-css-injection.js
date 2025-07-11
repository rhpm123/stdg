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
   * 강력한 CSS 규칙 생성
   */
  generateForceCSSRules() {
    console.log('🎨 강력한 CSS 규칙 생성 중...');
    
    const rules = `
      /* 응급 CSS 주입: bottom-bar 높이 강제 동기화 */
      .bottom-bar {
        height: ${this.targetHeight} !important;
        min-height: ${this.targetHeight} !important;
        max-height: ${this.targetHeight} !important;
      }
      
      .bottom-bar-stats {
        height: ${this.targetHeight} !important;
        min-height: ${this.targetHeight} !important;
        max-height: ${this.targetHeight} !important;
        display: flex !important;
        align-items: center !important;
        overflow: hidden !important;
      }
      
      .game-stats {
        height: 100% !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        padding: 0 15px !important;
      }
      
      .stat-value {
        height: calc(${this.targetHeight} * 0.7) !important;
        line-height: calc(${this.targetHeight} * 0.7) !important;
        font-size: calc(${this.targetHeight} * 0.35) !important;
        display: flex !important;
        align-items: center !important;
      }
      
      /* 추가 보험: 모든 하위 요소들도 강제 조정 */
      .bottom-bar * {
        box-sizing: border-box !important;
      }
      
      .bottom-bar-progress,
      .bottom-bar-controls {
        flex-shrink: 0 !important;
      }
    `;
    
    console.log(`📏 타겟 높이: ${this.targetHeight}`);
    console.log('📝 생성된 CSS 규칙:');
    console.log(rules);
    
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

// 자동 실행 (개발 환경에서만)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  console.log('🏠 개발 환경 감지 - 3초 후 자동 수정 실행');
  setTimeout(() => {
    console.log('🚀 자동 수정 실행...');
    window.emergencyCSSInjection.injectForceCSSRules();
  }, 3000);
} 