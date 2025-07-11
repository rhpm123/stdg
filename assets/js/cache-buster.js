/**
 * 브라우저 캐시 강제 클리어 및 파일 리로드 스크립트
 * 개발 환경에서 CSS/JS 수정사항이 즉시 반영되도록 함
 */

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
}

// 전역 캐시 무력화 인스턴스
window.cacheBuster = new CacheBuster();

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
  }
};

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
console.log('  모니터링 도구:');
console.log('    - devUtils.startSizeMonitor(): 실시간 크기 모니터링');
console.log('    - devUtils.stopSizeMonitor(): 모니터링 중지');
console.log('  개별 확인:');
console.log('    - devUtils.checkCssVar("--dynamic-bottom-bar-height"): 특정 CSS 변수');
console.log('    - devUtils.measureElement(".bottom-bar"): 특정 요소 크기'); 