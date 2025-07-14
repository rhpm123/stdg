/**
 * 브라우저 캐시 강제 클리어 및 파일 리로드 스크립트
 * 개발 환경에서 CSS/JS 수정사항이 즉시 반영되도록 함
 */

(function(global) {
  'use strict';
  
  // 이미 로드된 경우 중복 방지
  if (global.CacheBuster) {
    console.log('⚙️ CacheBuster가 이미 로드되어 있습니다.');
    return;
  }

class CacheBuster {
  constructor() {
    this.timestamp = Date.now();
    this.isEnabled = true; // 개발 환경에서만 true
  }

  /**
   * 모든 CSS/JS 파일에 타임스탬프 추가로 캐시 무력화
   */
  burstAllCaches() {
    console.log('🧹 캐시 무력화 시작...');
    
    if (!this.isEnabled) {
      console.log('ℹ️ 캐시 무력화가 비활성화되어 있습니다.');
      return;
    }

    this.bustCSSFiles();
    this.bustJSFiles();
    this.enableDevModeSettings();
  }

  /**
   * CSS 파일 캐시 무력화
   */
  bustCSSFiles() {
    const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
    console.log(`🎨 CSS 파일 ${cssLinks.length}개 캐시 무력화 중...`);
    
    cssLinks.forEach((link, index) => {
      const href = link.href;
      const separator = href.includes('?') ? '&' : '?';
      const newHref = `${href}${separator}v=${this.timestamp}&bust=${index}`;
      
      console.log(`  ${index + 1}. ${href.split('/').pop()} -> v=${this.timestamp}`);
      link.href = newHref;
    });
  }

  /**
   * JavaScript 파일 캐시 무력화
   */
  bustJSFiles() {
    const jsScripts = document.querySelectorAll('script[src]');
    console.log(`📝 JavaScript 파일 ${jsScripts.length}개 캐시 무력화 중...`);
    
    jsScripts.forEach((script, index) => {
      // 외부 CDN 스크립트는 제외
      if (script.src.includes('http') && !script.src.includes(window.location.hostname)) {
        return;
      }
      
      const src = script.src;
      const separator = src.includes('?') ? '&' : '?';
      const newSrc = `${src}${separator}v=${this.timestamp}&bust=${index}`;
      
      console.log(`  ${index + 1}. ${src.split('/').pop()} -> v=${this.timestamp}`);
      
      // 새 스크립트 태그 생성하여 기존 것 교체
      const newScript = document.createElement('script');
      newScript.src = newSrc;
      newScript.async = script.async;
      newScript.defer = script.defer;
      
      script.parentNode.insertBefore(newScript, script);
      script.remove();
    });
  }

  /**
   * 개발 모드 설정 활성화
   */
  enableDevModeSettings() {
    console.log('🔧 개발 모드 설정 활성화...');
    
    // 메타 태그로 캐시 방지 설정
    this.addNoCacheMetaTags();
    
    // 성능 모니터링 활성화
    this.enablePerformanceMonitoring();
  }

  /**
   * 캐시 방지 메타 태그 추가
   */
  addNoCacheMetaTags() {
    const metaTags = [
      { httpEquiv: 'Cache-Control', content: 'no-cache, no-store, must-revalidate' },
      { httpEquiv: 'Pragma', content: 'no-cache' },
      { httpEquiv: 'Expires', content: '0' }
    ];

    metaTags.forEach(({ httpEquiv, content }) => {
      const existing = document.querySelector(`meta[http-equiv="${httpEquiv}"]`);
      if (!existing) {
        const meta = document.createElement('meta');
        meta.httpEquiv = httpEquiv;
        meta.content = content;
        document.head.appendChild(meta);
        console.log(`  ✅ 메타 태그 추가: ${httpEquiv}`);
      }
    });
  }

  /**
   * 성능 모니터링 활성화
   */
  enablePerformanceMonitoring() {
    // 파일 로딩 상태 모니터링
    window.addEventListener('load', () => {
      console.log('📊 페이지 로딩 완료:', {
        총_로딩시간: `${performance.now().toFixed(2)}ms`,
        CSS_파일수: document.querySelectorAll('link[rel="stylesheet"]').length,
        JS_파일수: document.querySelectorAll('script[src]').length,
        타임스탬프: this.timestamp
      });
    });

    // 리소스 로딩 오류 감지
    window.addEventListener('error', (e) => {
      if (e.target && (e.target.tagName === 'LINK' || e.target.tagName === 'SCRIPT')) {
        console.error('❌ 리소스 로딩 실패:', e.target.src || e.target.href);
      }
    });
  }

  /**
   * 강제 리프레시 (Ctrl+F5 효과)
   */
  forceRefresh() {
    console.log('🔄 강제 리프레시 실행...');
    window.location.reload(true);
  }

  /**
   * CSS 변수 상태 진단 (확장된 버전)
   */
  diagnoseCSSVariables() {
    console.log('🔍 CSS 변수 진단 시작...');
    
    const rootStyle = getComputedStyle(document.documentElement);
    const variables = [
      '--dynamic-bottom-bar-height',
      '--game-bottom-bar-height',
      '--dynamic-header-height'
    ];

    console.log('📊 CSS 변수 현재 값:');
    variables.forEach(varName => {
      const value = rootStyle.getPropertyValue(varName).trim();
      console.log(`  ${varName}: ${value || '❌ 정의되지 않음'}`);
    });

    // DOM 요소 크기 확인
    const bottomBar = document.querySelector('.bottom-bar');
    const bottomBarStats = document.querySelector('.bottom-bar-stats');
    
    if (bottomBar && bottomBarStats) {
      console.log('📐 실제 DOM 크기:');
      console.log(`  bottom-bar: ${bottomBar.offsetHeight}px`);
      console.log(`  bottom-bar-stats: ${bottomBarStats.offsetHeight}px`);
      console.log(`  크기 차이: ${Math.abs(bottomBar.offsetHeight - bottomBarStats.offsetHeight)}px`);
    }
  }

  /**
   * 상세 CSS 변수 및 DOM 상태 진단
   */
  detailedDiagnosis() {
    console.log('🔬 상세 진단 시작...');
    console.log('='.repeat(50));
    
    // 1. CSS 변수 상태 확인
    this.checkCSSVariables();
    
    // 2. DOM 요소 상태 확인
    this.checkDOMElements();
    
    // 3. BottomBarManager 상태 확인
    this.checkBottomBarManager();
    
    // 4. CSS 규칙 적용 상태 확인
    this.checkCSSRules();
    
    console.log('='.repeat(50));
    console.log('🎯 진단 완료!');
  }

  /**
   * CSS 변수 상세 확인
   */
  checkCSSVariables() {
    console.log('\n📋 1. CSS 변수 상태 확인');
    
    const rootStyle = getComputedStyle(document.documentElement);
    const variables = [
      '--dynamic-bottom-bar-height',
      '--game-bottom-bar-height', 
      '--dynamic-header-height',
      '--dynamic-viewport-height'
    ];

    variables.forEach(varName => {
      const value = rootStyle.getPropertyValue(varName).trim();
      const status = value ? '✅' : '❌';
      console.log(`  ${status} ${varName}: ${value || '정의되지 않음'}`);
    });
  }

  /**
   * DOM 요소 상세 확인
   */
  checkDOMElements() {
    console.log('\n🏗️ 2. DOM 요소 상태 확인');
    
    const elements = [
      { selector: '.bottom-bar', name: 'bottom-bar' },
      { selector: '.bottom-bar-stats', name: 'bottom-bar-stats' },
      { selector: '.game-stats', name: 'game-stats' },
      { selector: '.stat-value', name: 'stat-value (첫 번째)' }
    ];

    elements.forEach(({ selector, name }) => {
      const element = document.querySelector(selector);
      if (element) {
        const styles = getComputedStyle(element);
        console.log(`  ✅ ${name}:`);
        console.log(`     크기: ${element.offsetWidth}×${element.offsetHeight}px`);
        console.log(`     display: ${styles.display}`);
        console.log(`     height: ${styles.height}`);
        console.log(`     min-height: ${styles.minHeight}`);
        console.log(`     max-height: ${styles.maxHeight}`);
      } else {
        console.log(`  ❌ ${name}: 요소를 찾을 수 없음`);
      }
    });
  }

  /**
   * BottomBarManager 상태 확인
   */
  checkBottomBarManager() {
    console.log('\n🔧 3. BottomBarManager 상태 확인');
    
    if (window.bottomBarManager) {
      const manager = window.bottomBarManager;
      console.log('  ✅ BottomBarManager 존재');
      console.log(`     enabled: ${manager.enabled}`);
      console.log(`     minHeight: ${manager.minHeight}px`);
      console.log(`     maxHeight: ${manager.maxHeight}px`);
      console.log(`     defaultHeight: ${manager.defaultHeight}px`);
      
      // 현재 높이 계산 실행
      try {
        const optimalHeight = manager.calculateOptimalHeight();
        console.log(`     계산된 최적 높이: ${optimalHeight}px`);
      } catch (error) {
        console.log(`     ❌ 높이 계산 오류: ${error.message}`);
      }
    } else {
      console.log('  ❌ BottomBarManager를 찾을 수 없음');
    }
  }

  /**
   * CSS 규칙 적용 상태 확인
   */
  checkCSSRules() {
    console.log('\n📜 4. CSS 규칙 적용 상태 확인');
    
    const bottomBarStats = document.querySelector('.bottom-bar-stats');
    if (bottomBarStats) {
      const styles = getComputedStyle(bottomBarStats);
      
      console.log('  .bottom-bar-stats 적용된 스타일:');
      console.log(`     height: ${styles.height}`);
      console.log(`     min-height: ${styles.minHeight}`);
      console.log(`     max-height: ${styles.maxHeight}`);
      console.log(`     display: ${styles.display}`);
      console.log(`     flex-direction: ${styles.flexDirection}`);
      console.log(`     justify-content: ${styles.justifyContent}`);
      
      // calc() 함수 적용 여부 확인
      const minHeightCalc = styles.minHeight.includes('calc');
      console.log(`     calc() 함수 적용: ${minHeightCalc ? '✅' : '❌'}`);
      
      // CSS 변수 참조 여부 확인
      const hasVariableRef = styles.minHeight.includes('var(--');
      console.log(`     CSS 변수 참조: ${hasVariableRef ? '✅' : '❌'}`);
    }
  }

  /**
   * 실시간 크기 모니터링 시작
   */
  startSizeMonitoring() {
    console.log('👁️ 실시간 크기 모니터링 시작...');
    
    const observer = new ResizeObserver((entries) => {
      entries.forEach(entry => {
        const element = entry.target;
        const { width, height } = entry.contentRect;
        console.log(`📏 ${element.className} 크기 변경: ${width.toFixed(1)}×${height.toFixed(1)}px`);
      });
    });

    const bottomBar = document.querySelector('.bottom-bar');
    const bottomBarStats = document.querySelector('.bottom-bar-stats');
    
    if (bottomBar) observer.observe(bottomBar);
    if (bottomBarStats) observer.observe(bottomBarStats);
    
    // 전역에 저장하여 중지 가능하게 함
    window.sizeObserver = observer;
    
    console.log('✅ 크기 모니터링 시작됨 (중지: devUtils.stopSizeMonitoring())');
  }

  /**
   * 실시간 크기 모니터링 중지
   */
  stopSizeMonitoring() {
    if (window.sizeObserver) {
      window.sizeObserver.disconnect();
      window.sizeObserver = null;
      console.log('⏹️ 크기 모니터링 중지됨');
    }
  }

  /**
   * PC 환경 바텀바 통합 검증 시스템
   */
  runPCBottomBarIntegratedTest() {
    console.log('🧪 PC 환경 바텀바 통합 검증 시스템 시작...');
    console.log('='.repeat(80));
    
    const testResults = {
      environmentCheck: false,
      classApplication: false,
      cssVariables: false,
      domDimensions: false,
      positionVerification: false,
      purpleSpaceRemoval: false,
      overall: false
    };

    // 1단계: PC 환경 확인
    testResults.environmentCheck = this.verifyPCEnvironment();
    
    // 2단계: .pc-bottom-bar 클래스 적용 확인
    testResults.classApplication = this.verifyPCBottomBarClass();
    
    // 3단계: CSS 변수 설정 상태 확인
    testResults.cssVariables = this.verifyBottomBarCSSVariables();
    
    // 4단계: DOM 크기 및 상태 확인
    testResults.domDimensions = this.verifyBottomBarDimensions();
    
    // 5단계: 화면 위치 검증
    testResults.positionVerification = this.verifyBottomBarPosition();
    
    // 6단계: 보라색 빗금 영역 제거 확인
    testResults.purpleSpaceRemoval = this.verifyPurpleSpaceRemoval();
    
    // 종합 결과 계산
    const passedTests = Object.values(testResults).filter(result => result === true).length - 1; // overall 제외
    const totalTests = Object.keys(testResults).length - 1; // overall 제외
    testResults.overall = passedTests >= 5; // 6개 중 5개 이상 통과 시 성공
    
    // 결과 출력
    this.displayIntegratedTestResults(testResults, passedTests, totalTests);
    
    console.log('='.repeat(80));
    console.log(`🎯 통합 검증 결과: ${testResults.overall ? '✅ 성공' : '❌ 실패'} (${passedTests}/${totalTests})`);
    
    return testResults;
  }

  /**
   * PC 환경 확인
   */
  verifyPCEnvironment() {
    console.log('\n🖥️ 1단계: PC 환경 확인');
    
    const isPC = window.innerWidth >= 1024;
    const hasOrientationController = typeof window.orientationController !== 'undefined';
    const isDesktopMethod = hasOrientationController && 
                           window.orientationController.isDesktopEnvironment &&
                           window.orientationController.isDesktopEnvironment();

    console.log(`  화면 너비: ${window.innerWidth}px (PC 기준: ≥1024px)`);
    console.log(`  기본 PC 감지: ${isPC ? '✅' : '❌'}`);
    console.log(`  OrientationController: ${hasOrientationController ? '✅' : '❌'}`);
    console.log(`  isDesktopEnvironment(): ${isDesktopMethod ? '✅' : '❌'}`);
    
    const result = isPC && isDesktopMethod;
    console.log(`  🎯 PC 환경 확인: ${result ? '✅ 통과' : '❌ 실패'}`);
    
    return result;
  }

  /**
   * .pc-bottom-bar 클래스 적용 확인
   */
  verifyPCBottomBarClass() {
    console.log('\n📝 2단계: .pc-bottom-bar 클래스 적용 확인');
    
    const bottomBar = document.querySelector('.bottom-bar');
    if (!bottomBar) {
      console.log('  ❌ .bottom-bar 요소를 찾을 수 없음');
      return false;
    }

    const hasPCClass = bottomBar.classList.contains('pc-bottom-bar');
    const computedStyle = getComputedStyle(bottomBar);
    const hasFixedPosition = computedStyle.position === 'fixed';
    const hasHighZIndex = parseInt(computedStyle.zIndex) >= 9999;

    console.log(`  .pc-bottom-bar 클래스 존재: ${hasPCClass ? '✅' : '❌'}`);
    console.log(`  position: ${computedStyle.position} ${hasFixedPosition ? '✅' : '❌'}`);
    console.log(`  z-index: ${computedStyle.zIndex} ${hasHighZIndex ? '✅' : '❌'}`);
    
    const result = hasPCClass && hasFixedPosition && hasHighZIndex;
    console.log(`  🎯 클래스 적용 확인: ${result ? '✅ 통과' : '❌ 실패'}`);
    
    return result;
  }

  /**
   * CSS 변수 설정 상태 확인
   */
  verifyBottomBarCSSVariables() {
    console.log('\n📋 3단계: CSS 변수 설정 상태 확인');
    
    const rootStyle = getComputedStyle(document.documentElement);
    const variables = [
      '--dynamic-bottom-bar-height',
      '--game-bottom-bar-height',
      '--main-content-height'
    ];

    let validVariables = 0;
    variables.forEach(varName => {
      const value = rootStyle.getPropertyValue(varName).trim();
      const isValid = value && value !== 'initial' && value !== 'unset';
      console.log(`  ${varName}: ${value || '정의되지 않음'} ${isValid ? '✅' : '❌'}`);
      if (isValid) validVariables++;
    });

    const result = validVariables >= 2; // 3개 중 2개 이상 설정되어야 함
    console.log(`  🎯 CSS 변수 확인: ${result ? '✅ 통과' : '❌ 실패'} (${validVariables}/3)`);
    
    return result;
  }

  /**
   * DOM 크기 및 상태 확인
   */
  verifyBottomBarDimensions() {
    console.log('\n📐 4단계: DOM 크기 및 상태 확인');
    
    const bottomBar = document.querySelector('.bottom-bar');
    if (!bottomBar) {
      console.log('  ❌ .bottom-bar 요소를 찾을 수 없음');
      return false;
    }

    const height = bottomBar.offsetHeight;
    const width = bottomBar.offsetWidth;
    const isVisible = bottomBar.offsetParent !== null;
    const computedStyle = getComputedStyle(bottomBar);
    const opacity = parseFloat(computedStyle.opacity);

    console.log(`  높이: ${height}px (목표: 50-60px) ${height >= 50 && height <= 60 ? '✅' : '❌'}`);
    console.log(`  너비: ${width}px (화면 너비와 비교: ${window.innerWidth}px) ${width >= window.innerWidth * 0.9 ? '✅' : '❌'}`);
    console.log(`  가시성: ${isVisible ? '표시됨' : '숨겨짐'} ${isVisible ? '✅' : '❌'}`);
    console.log(`  투명도: ${opacity} ${opacity >= 0.9 ? '✅' : '❌'}`);
    
    const result = height >= 50 && height <= 60 && width >= window.innerWidth * 0.9 && isVisible && opacity >= 0.9;
    console.log(`  🎯 크기 및 상태 확인: ${result ? '✅ 통과' : '❌ 실패'}`);
    
    return result;
  }

  /**
   * 화면 위치 검증 (getBoundingClientRect 사용)
   */
  verifyBottomBarPosition() {
    console.log('\n📍 5단계: 화면 위치 검증');
    
    const bottomBar = document.querySelector('.bottom-bar');
    if (!bottomBar) {
      console.log('  ❌ .bottom-bar 요소를 찾을 수 없음');
      return false;
    }

    const rect = bottomBar.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    const isAtBottom = Math.abs(rect.bottom - windowHeight) <= 5; // 5px 오차 허용
    const isFullyVisible = rect.top >= 0 && rect.bottom <= windowHeight + 5;
    const hasCorrectLeft = rect.left <= 5; // 좌측 여백 5px 이하
    const hasCorrectRight = rect.right >= window.innerWidth - 5; // 우측 여백 5px 이하

    console.log(`  바텀바 위치: top=${Math.round(rect.top)}, bottom=${Math.round(rect.bottom)}, left=${Math.round(rect.left)}, right=${Math.round(rect.right)}`);
    console.log(`  화면 크기: ${window.innerWidth}×${windowHeight}px`);
    console.log(`  하단 정렬: ${isAtBottom ? '✅' : '❌'} (차이: ${Math.abs(rect.bottom - windowHeight)}px)`);
    console.log(`  완전 표시: ${isFullyVisible ? '✅' : '❌'}`);
    console.log(`  좌우 정렬: 좌측=${hasCorrectLeft ? '✅' : '❌'}, 우측=${hasCorrectRight ? '✅' : '❌'}`);
    
    const result = isAtBottom && isFullyVisible && hasCorrectLeft && hasCorrectRight;
    console.log(`  🎯 위치 검증: ${result ? '✅ 통과' : '❌ 실패'}`);
    
    return result;
  }

  /**
   * 보라색 빗금 영역 제거 확인
   */
  verifyPurpleSpaceRemoval() {
    console.log('\n🎨 6단계: 보라색 빗금 영역 제거 확인');
    
    const mainContent = document.querySelector('main, .main-content, .game-container');
    const bottomBar = document.querySelector('.bottom-bar');
    
    if (!mainContent || !bottomBar) {
      console.log('  ❌ 필요한 요소를 찾을 수 없음');
      return false;
    }

    const mainRect = mainContent.getBoundingClientRect();
    const bottomRect = bottomBar.getBoundingClientRect();
    const gap = bottomRect.top - mainRect.bottom;
    
    // 메인 콘텐츠가 viewport를 적절히 사용하는지 확인
    const mainUsesViewport = mainRect.height >= window.innerHeight * 0.6; // 최소 60% 사용
    const gapIsMinimal = Math.abs(gap) <= 10; // 10px 이하의 간격

    console.log(`  메인 콘텐츠 크기: ${Math.round(mainRect.width)}×${Math.round(mainRect.height)}px`);
    console.log(`  메인-바텀바 간격: ${Math.round(gap)}px`);
    console.log(`  viewport 사용률: ${Math.round((mainRect.height / window.innerHeight) * 100)}% (목표: ≥60%)`);
    console.log(`  viewport 활용: ${mainUsesViewport ? '✅' : '❌'}`);
    console.log(`  간격 최소화: ${gapIsMinimal ? '✅' : '❌'}`);
    
    const result = mainUsesViewport && gapIsMinimal;
    console.log(`  🎯 보라색 빗금 영역 제거: ${result ? '✅ 통과' : '❌ 실패'}`);
    
    return result;
  }

  /**
   * 통합 테스트 결과 출력
   */
  displayIntegratedTestResults(results, passedTests, totalTests) {
    console.log('\n📊 통합 테스트 결과 요약');
    console.log('-'.repeat(50));
    
    const tests = [
      { name: 'PC 환경 확인', key: 'environmentCheck' },
      { name: '.pc-bottom-bar 클래스 적용', key: 'classApplication' },
      { name: 'CSS 변수 설정', key: 'cssVariables' },
      { name: 'DOM 크기 및 상태', key: 'domDimensions' },
      { name: '화면 위치 검증', key: 'positionVerification' },
      { name: '보라색 빗금 영역 제거', key: 'purpleSpaceRemoval' }
    ];

    tests.forEach((test, index) => {
      const status = results[test.key] ? '✅ 통과' : '❌ 실패';
      console.log(`  ${index + 1}. ${test.name}: ${status}`);
    });
    
    console.log('-'.repeat(50));
    console.log(`전체 성공률: ${Math.round((passedTests / totalTests) * 100)}%`);
    
    if (results.overall) {
      console.log('🎉 축하합니다! PC 환경 바텀바 문제가 완전히 해결되었습니다!');
    } else {
      console.log('⚠️ 일부 테스트가 실패했습니다. 추가 조치가 필요합니다.');
      console.log('💡 해결 방법:');
      console.log('  - emergencyUtils.fix(): 응급 CSS 주입');
      console.log('  - devFallbackUtils.runFallback(): 자동 fallback 실행');
      console.log('  - devUtils.detailedDiagnosis(): 상세 진단');
    }
  }

  /**
   * 자동 통합 테스트 (페이지 로드 시 실행)
   */
  autoRunPCBottomBarTest() {
    // PC 환경에서만 자동 실행
    if (window.innerWidth >= 1024) {
      setTimeout(() => {
        console.log('🚀 PC 환경 감지 - 자동 통합 테스트 실행');
        this.runPCBottomBarIntegratedTest();
      }, 2000); // 2초 후 실행하여 모든 시스템 로드 대기
    }
  }
}

  // 전역 CacheBuster 클래스 등록
  global.CacheBuster = CacheBuster;
  
  // 안전한 인스턴스 생성 및 등록
  if (!global.cacheBuster) {
    global.cacheBuster = new CacheBuster();
    console.log('🛠️ CacheBuster 인스턴스 생성 완료');
  } else {
    console.log('⚙️ CacheBuster 인스턴스가 이미 존재합니다.');
  }
  
  // GameModuleLoader 시스템과 통합 (있는 경우에만)
  if (typeof global.registerModule === 'function') {
    global.registerModule('cacheBuster', global.cacheBuster);
    console.log('📎 CacheBuster가 모듈 로더에 등록되었습니다.');
  }

// 자동 실행 (개발 환경에서만)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  console.log('🏠 개발 환경 감지 - 캐시 무력화 자동 실행');
  window.cacheBuster.burstAllCaches();
}

// 개발자 도구용 유틸리티 함수들
window.devUtils = {
  clearCache: () => window.cacheBuster.burstAllCaches(),
  forceRefresh: () => window.cacheBuster.forceRefresh(),
  diagnoseCss: () => window.cacheBuster.diagnoseCSSVariables(),
  detailedDiagnosis: () => window.cacheBuster.detailedDiagnosis(),
  startSizeMonitor: () => window.cacheBuster.startSizeMonitoring(),
  stopSizeMonitor: () => window.cacheBuster.stopSizeMonitoring(),
  hardRefresh: () => {
    console.log('💪 하드 리프레시 실행 중...');
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => registration.unregister());
      });
    }
    window.location.reload(true);
  },
  
  // 즉시 실행용 진단 함수들
  checkCssVar: (varName) => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    console.log(`CSS 변수 ${varName}: ${value || '정의되지 않음'}`);
    return value;
  },
  
  measureElement: (selector) => {
    const element = document.querySelector(selector);
    if (element) {
      console.log(`${selector} 크기: ${element.offsetWidth}×${element.offsetHeight}px`);
      return { width: element.offsetWidth, height: element.offsetHeight };
    } else {
      console.log(`${selector} 요소를 찾을 수 없음`);
      return null;
    }
  },
  
  compareHeights: () => {
    const bottomBar = document.querySelector('.bottom-bar');
    const bottomBarStats = document.querySelector('.bottom-bar-stats');
    
    if (bottomBar && bottomBarStats) {
      const heightDiff = Math.abs(bottomBar.offsetHeight - bottomBarStats.offsetHeight);
      console.log('높이 비교:');
      console.log(`  bottom-bar: ${bottomBar.offsetHeight}px`);
      console.log(`  bottom-bar-stats: ${bottomBarStats.offsetHeight}px`);
      console.log(`  차이: ${heightDiff}px ${heightDiff === 0 ? '✅ 동일' : '❌ 불일치'}`);
      return { 
        bottomBar: bottomBar.offsetHeight, 
        bottomBarStats: bottomBarStats.offsetHeight, 
        difference: heightDiff,
        isEqual: heightDiff === 0
      };
    } else {
      console.log('요소를 찾을 수 없음');
      return null;
    }
  },
  
  inspectCSSRules: () => {
    const element = document.querySelector('.bottom-bar-stats');
    if (element) {
      const styles = getComputedStyle(element);
      console.log('.bottom-bar-stats 현재 CSS 규칙:');
      console.log(`  height: ${styles.height}`);
      console.log(`  min-height: ${styles.minHeight}`);
      console.log(`  max-height: ${styles.maxHeight}`);
      console.log(`  display: ${styles.display}`);
      console.log(`  flex: ${styles.flex}`);
      return {
        height: styles.height,
        minHeight: styles.minHeight,
        maxHeight: styles.maxHeight,
        display: styles.display
      };
    }
    return null;
  },

  // === PC 환경 바텀바 통합 테스트 도구 ===
  runPCTest: () => window.cacheBuster.runPCBottomBarIntegratedTest(),
  autoTest: () => window.cacheBuster.autoRunPCBottomBarTest(),
  
  // 개별 검증 도구들
  verifyPCEnv: () => window.cacheBuster.verifyPCEnvironment(),
  verifyPCClass: () => window.cacheBuster.verifyPCBottomBarClass(),
  verifyCSSVars: () => window.cacheBuster.verifyBottomBarCSSVariables(),
  verifyDimensions: () => window.cacheBuster.verifyBottomBarDimensions(),
  verifyPosition: () => window.cacheBuster.verifyBottomBarPosition(),
  verifyPurpleSpace: () => window.cacheBuster.verifyPurpleSpaceRemoval(),
  
  // 빠른 문제 해결 도구
  quickFix: () => {
    console.log('🚀 빠른 문제 해결 시도...');
    console.log('1. 통합 테스트 실행...');
    const result = window.cacheBuster.runPCBottomBarIntegratedTest();
    
    if (!result.overall) {
      console.log('2. Emergency CSS 주입 시도...');
      if (window.emergencyUtils && window.emergencyUtils.fix) {
        window.emergencyUtils.fix();
      }
      
      console.log('3. 자동 fallback 실행...');
      if (window.devFallbackUtils && window.devFallbackUtils.runFallback) {
        window.devFallbackUtils.runFallback();
      }
      
      console.log('4. 재검증...');
      setTimeout(() => {
        window.cacheBuster.runPCBottomBarIntegratedTest();
      }, 1000);
    }
    
    return result;
  }
};

// 자동 통합 테스트 실행 (PC 환경에서만)
window.cacheBuster.autoRunPCBottomBarTest();

console.log('🛠️ 캐시 무력화 도구 로드 완료');
console.log('사용법:');
console.log('  기본 도구:');
console.log('    - devUtils.clearCache(): 캐시 클리어');
console.log('    - devUtils.forceRefresh(): 강제 새로고침');
console.log('    - devUtils.hardRefresh(): 하드 리프레시');
console.log('  진단 도구:');
console.log('    - devUtils.diagnoseCss(): 기본 CSS 변수 진단');
console.log('    - devUtils.detailedDiagnosis(): 상세 진단 (추천!)');
console.log('    - devUtils.compareHeights(): 높이 비교');
console.log('    - devUtils.inspectCSSRules(): CSS 규칙 검사');
console.log('  🧪 PC 바텀바 통합 테스트 도구:');
console.log('    - devUtils.runPCTest(): 완전한 통합 테스트 실행 (추천!)');
console.log('    - devUtils.quickFix(): 빠른 문제 해결 시도');
console.log('    - devUtils.verifyPCEnv(): PC 환경 확인');
console.log('    - devUtils.verifyPCClass(): .pc-bottom-bar 클래스 확인');
console.log('    - devUtils.verifyPosition(): 화면 위치 검증');
console.log('    - devUtils.verifyPurpleSpace(): 보라색 빗금 영역 확인');
console.log('  모니터링 도구:');
console.log('    - devUtils.startSizeMonitor(): 실시간 크기 모니터링');
console.log('    - devUtils.stopSizeMonitor(): 모니터링 중지');
console.log('  개별 확인:');
console.log('    - devUtils.checkCssVar("--dynamic-bottom-bar-height"): 특정 CSS 변수');
console.log('    - devUtils.measureElement(".bottom-bar"): 특정 요소 크기'); 

})(window);