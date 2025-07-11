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
   * CSS 변수 상태 진단
   */
  diagnoseCSSVariables() {
    console.log('🔍 CSS 변수 진단 시작...');
    
    const rootStyle = getComputedStyle(document.documentElement);
    const variables = [
      '--dynamic-bottom-bar-height',
      '--game-bottom-bar-height',
      '--dynamic-header-height'
    ];

    variables.forEach(varName => {
      const value = rootStyle.getPropertyValue(varName);
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
  hardRefresh: () => {
    console.log('💪 하드 리프레시 실행 중...');
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => registration.unregister());
      });
    }
    window.location.reload(true);
  }
};

console.log('🛠️ 캐시 무력화 도구 로드 완료');
console.log('사용법:');
console.log('  - devUtils.clearCache(): 캐시 클리어');
console.log('  - devUtils.forceRefresh(): 강제 새로고침');
console.log('  - devUtils.diagnoseCss(): CSS 변수 진단');
console.log('  - devUtils.hardRefresh(): 하드 리프레시'); 