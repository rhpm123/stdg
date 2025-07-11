/**
 * JavaScript 강제 실행 및 상태 점검 스크립트
 * BottomBarManager 실행 보장 및 CSS 변수 강제 설정
 */

class ForceJSExecution {
  constructor() {
    console.log('🔧 JavaScript 강제 실행 도구 로드됨');
    this.executionAttempts = 0;
    this.maxAttempts = 3;
  }

  /**
   * JavaScript 실행 상태 완전 점검
   */
  checkExecutionStatus() {
    console.log('🔍 JavaScript 실행 상태 완전 점검 시작...');
    console.log('='.repeat(60));
    
    // 1. BottomBarManager 존재 확인
    this.checkBottomBarManager();
    
    // 2. CSS 변수 설정 상태 확인
    this.checkCSSVariables();
    
    // 3. DOM 요소 상태 확인
    this.checkDOMStatus();
    
    // 4. 이벤트 리스너 상태 확인
    this.checkEventListeners();
    
    console.log('='.repeat(60));
    console.log('🎯 점검 완료!');
  }

  /**
   * BottomBarManager 상태 상세 확인
   */
  checkBottomBarManager() {
    console.log('\n🤖 1. BottomBarManager 상태 확인');
    
    if (window.bottomBarManager) {
      const manager = window.bottomBarManager;
      console.log('  ✅ BottomBarManager 존재');
      console.log(`     enabled: ${manager.enabled}`);
      console.log(`     minHeight: ${manager.minHeight}px`);
      console.log(`     maxHeight: ${manager.maxHeight}px`);
      console.log(`     defaultHeight: ${manager.defaultHeight}px`);
      
      // DOM 요소 연결 상태 확인
      if (manager.bottomBar) {
        console.log('  ✅ bottomBar DOM 요소 연결됨');
        console.log(`     현재 크기: ${manager.bottomBar.offsetWidth}×${manager.bottomBar.offsetHeight}px`);
      } else {
        console.log('  ❌ bottomBar DOM 요소 연결 실패');
      }
      
      return true;
    } else {
      console.log('  ❌ BottomBarManager 존재하지 않음');
      return false;
    }
  }

  /**
   * CSS 변수 설정 상태 확인
   */
  checkCSSVariables() {
    console.log('\n📋 2. CSS 변수 설정 상태 확인');
    
    const rootStyle = getComputedStyle(document.documentElement);
    const variables = [
      '--dynamic-bottom-bar-height',
      '--game-bottom-bar-height',
      '--dynamic-viewport-height'
    ];

    let allSet = true;
    variables.forEach(varName => {
      const value = rootStyle.getPropertyValue(varName).trim();
      const status = value ? '✅' : '❌';
      console.log(`  ${status} ${varName}: ${value || '정의되지 않음'}`);
      if (!value) allSet = false;
    });

    return allSet;
  }

  /**
   * DOM 상태 확인
   */
  checkDOMStatus() {
    console.log('\n🏗️ 3. DOM 요소 상태 확인');
    
    const elements = [
      '.bottom-bar',
      '.bottom-bar-stats',
      '.game-stats',
      '.stat-value'
    ];

    elements.forEach(selector => {
      const element = document.querySelector(selector);
      if (element) {
        console.log(`  ✅ ${selector}: ${element.offsetWidth}×${element.offsetHeight}px`);
      } else {
        console.log(`  ❌ ${selector}: 요소를 찾을 수 없음`);
      }
    });
  }

  /**
   * 이벤트 리스너 상태 확인
   */
  checkEventListeners() {
    console.log('\n🎧 4. 이벤트 리스너 상태 확인');
    
    // resize 이벤트 리스너 확인
    const hasResizeListener = window.bottomBarManager && 
                              window.bottomBarManager.setupResizeListener;
    console.log(`  ${hasResizeListener ? '✅' : '❌'} resize 이벤트 리스너: ${hasResizeListener ? '설정됨' : '미설정'}`);
  }

  /**
   * BottomBarManager 강제 초기화
   */
  forceInitializeBottomBarManager() {
    console.log('💪 BottomBarManager 강제 초기화 시작...');
    
    try {
      // 기존 인스턴스가 있다면 정리
      if (window.bottomBarManager) {
        console.log('🧹 기존 BottomBarManager 정리 중...');
        window.bottomBarManager.destroy();
      }

      // 새 인스턴스 생성
      console.log('🆕 새 BottomBarManager 인스턴스 생성 중...');
      window.bottomBarManager = new BottomBarManager();
      
      // 초기화 강제 실행
      window.bottomBarManager.initialize();
      
      console.log('✅ BottomBarManager 강제 초기화 완료');
      return true;
    } catch (error) {
      console.error('❌ BottomBarManager 강제 초기화 실패:', error);
      return false;
    }
  }

  /**
   * CSS 변수 강제 설정
   */
  forceCSSVariables() {
    console.log('💪 CSS 변수 강제 설정 시작...');
    
    try {
      // 핵심 변수들 강제 설정
      const variables = {
        '--dynamic-bottom-bar-height': '38px',
        '--game-bottom-bar-height': '38px',
        '--dynamic-viewport-height': '100vh'
      };

      Object.entries(variables).forEach(([varName, value]) => {
        document.documentElement.style.setProperty(varName, value);
        console.log(`  ✅ ${varName}: ${value} 강제 설정`);
      });

      // 설정 확인
      setTimeout(() => {
        console.log('🔍 설정 확인 중...');
        const rootStyle = getComputedStyle(document.documentElement);
        Object.keys(variables).forEach(varName => {
          const actualValue = rootStyle.getPropertyValue(varName).trim();
          console.log(`  📏 ${varName}: ${actualValue}`);
        });
      }, 100);

      console.log('✅ CSS 변수 강제 설정 완료');
      return true;
    } catch (error) {
      console.error('❌ CSS 변수 강제 설정 실패:', error);
      return false;
    }
  }

  /**
   * DOM 강제 리플로우 트리거
   */
  forceDOMReflow() {
    console.log('💪 DOM 강제 리플로우 실행...');
    
    try {
      const elements = ['.bottom-bar', '.bottom-bar-stats'];
      
      elements.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
          // 강제 리플로우 트리거
          element.style.transform = 'translateZ(0)';
          element.offsetHeight; // 읽기 접근으로 강제 계산
          element.style.transform = '';
          
          console.log(`  🔄 ${selector} 리플로우 완료`);
        }
      });

      console.log('✅ DOM 강제 리플로우 완료');
      return true;
    } catch (error) {
      console.error('❌ DOM 강제 리플로우 실패:', error);
      return false;
    }
  }

  /**
   * 종합 강제 실행 (모든 단계 실행)
   */
  executeForceAll() {
    console.log('🚀 종합 강제 실행 시작...');
    console.log('='.repeat(60));
    
    this.executionAttempts++;
    
    if (this.executionAttempts > this.maxAttempts) {
      console.error('❌ 최대 시도 횟수 초과');
      return false;
    }

    // Step 1: 상태 점검
    this.checkExecutionStatus();
    
    // Step 2: BottomBarManager 강제 초기화
    const initSuccess = this.forceInitializeBottomBarManager();
    
    // Step 3: CSS 변수 강제 설정
    const cssSuccess = this.forceCSSVariables();
    
    // Step 4: DOM 강제 리플로우
    const reflowSuccess = this.forceDOMReflow();
    
    // Step 5: 결과 확인
    setTimeout(() => {
      this.verifyExecution();
    }, 200);

    console.log('='.repeat(60));
    console.log(`🎯 강제 실행 완료 (시도 ${this.executionAttempts}/${this.maxAttempts})`);
    
    return initSuccess && cssSuccess && reflowSuccess;
  }

  /**
   * 실행 결과 검증
   */
  verifyExecution() {
    console.log('🔍 실행 결과 검증 시작...');
    
    const bottomBar = document.querySelector('.bottom-bar');
    const bottomBarStats = document.querySelector('.bottom-bar-stats');
    
    if (bottomBar && bottomBarStats) {
      const heightDiff = Math.abs(bottomBar.offsetHeight - bottomBarStats.offsetHeight);
      
      console.log('📊 검증 결과:');
      console.log(`  bottom-bar: ${bottomBar.offsetHeight}px`);
      console.log(`  bottom-bar-stats: ${bottomBarStats.offsetHeight}px`);
      console.log(`  차이: ${heightDiff}px`);
      
      if (heightDiff === 0) {
        console.log('🎉 성공! 높이 동기화 완료');
        return true;
      } else {
        console.log('⚠️ 아직 동기화되지 않음');
        if (this.executionAttempts < this.maxAttempts) {
          console.log('🔄 재시도 예약 중...');
          setTimeout(() => this.executeForceAll(), 500);
        }
        return false;
      }
    } else {
      console.log('❌ DOM 요소를 찾을 수 없음');
      return false;
    }
  }
}

// 전역 인스턴스 생성
window.forceJSExecution = new ForceJSExecution();

// 개발자 도구용 바로가기 함수들
window.forceUtils = {
  checkStatus: () => window.forceJSExecution.checkExecutionStatus(),
  forceAll: () => window.forceJSExecution.executeForceAll(),
  forceInit: () => window.forceJSExecution.forceInitializeBottomBarManager(),
  forceCss: () => window.forceJSExecution.forceCSSVariables(),
  forceReflow: () => window.forceJSExecution.forceDOMReflow(),
  verify: () => window.forceJSExecution.verifyExecution()
};

console.log('🛠️ JavaScript 강제 실행 도구 로드 완료');
console.log('사용법:');
console.log('  - forceUtils.checkStatus(): 상태 점검');
console.log('  - forceUtils.forceAll(): 모든 단계 강제 실행 (추천!)');
console.log('  - forceUtils.forceInit(): BottomBarManager 강제 초기화');
console.log('  - forceUtils.forceCss(): CSS 변수 강제 설정');
console.log('  - forceUtils.verify(): 결과 검증'); 