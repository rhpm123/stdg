/**
 * 안전한 모듈 로딩 시스템 - GameModuleLoader
 * JavaScript 모듈 간 의존성 관리 및 안전한 전역 객체 등록 제공
 * 모듈 로딩 순서 문제와 전역 스코프 충돌 해결
 */

(function(global) {
  'use strict';
  
  // 이미 로드된 경우 중복 방지
  if (global.GameModuleLoader) {
    console.log('⚙️ GameModuleLoader가 이미 로드되어 있습니다.');
    return;
  }
  
  /**
   * 게임 모듈 로더 클래스
   */
  class GameModuleLoader {
    constructor() {
      // 모듈 저장소 (Map 사용)
      this.modules = new Map();
      // 의존성 관계 저장소
      this.dependencies = new Map();
      // 초기화 완료 모듈들
      this.initialized = new Set();
      // 초기화 중인 모듈들 (순환 의존성 감지용)
      this.initializing = new Set();
      
      console.log('🚀 GameModuleLoader 초기화 완료');
    }
    
    /**
     * 모듈 등록
     * @param {string} name - 모듈 이름
     * @param {object} module - 모듈 객체
     * @param {Array<string>} dependencies - 의존성 배열 (선택사항)
     */
    register(name, module, dependencies = []) {
      if (this.modules.has(name)) {
        console.warn(`⚠️ 모듈 '${name}'이 이미 등록되어 있습니다. 덮어쓰기를 진행합니다.`);
      }
      
      // 모듈과 의존성 저장
      this.modules.set(name, module);
      this.dependencies.set(name, dependencies);
      
      console.log(`📦 모듈 '${name}' 등록 완료 (의존성: [${dependencies.join(', ')}])`);
      
      // 등록 즉시 초기화 시도
      this.tryInitialize(name);
      
      // 다른 모듈들도 초기화 가능한지 확인
      this.checkPendingInitializations();
    }
    
    /**
     * 모듈 초기화 시도
     * @param {string} name - 초기화할 모듈 이름
     */
    tryInitialize(name) {
      // 이미 초기화된 모듈은 스킵
      if (this.initialized.has(name)) {
        return true;
      }
      
      // 순환 의존성 감지
      if (this.initializing.has(name)) {
        console.error(`🔄 순환 의존성 감지: 모듈 '${name}'`);
        return false;
      }
      
      const dependencies = this.dependencies.get(name) || [];
      
      // 의존성 확인
      for (const dep of dependencies) {
        if (!this.initialized.has(dep)) {
          console.log(`⏳ 모듈 '${name}' 초기화 대기 중 (의존성: '${dep}')`);
          return false;
        }
      }
      
      // 모듈 초기화 진행
      this.initializing.add(name);
      
      try {
        const module = this.modules.get(name);
        
        // 모듈에 init 메서드가 있으면 호출
        if (typeof module.init === 'function') {
          console.log(`🔧 모듈 '${name}' 초기화 중...`);
          module.init();
        }
        
        // 전역 스코프에 안전하게 등록
        if (!global[name]) {
          global[name] = module;
          console.log(`🌐 모듈 '${name}'이 전역 스코프에 등록되었습니다.`);
        }
        
        // 초기화 완료 표시
        this.initialized.add(name);
        this.initializing.delete(name);
        
        console.log(`✅ 모듈 '${name}' 초기화 완료`);
        return true;
        
      } catch (error) {
        console.error(`❌ 모듈 '${name}' 초기화 실패:`, error);
        this.initializing.delete(name);
        return false;
      }
    }
    
    /**
     * 대기 중인 모듈들의 초기화 재시도
     */
    checkPendingInitializations() {
      const pending = [];
      
      // 미초기화 모듈들 찾기
      for (const [name] of this.modules) {
        if (!this.initialized.has(name) && !this.initializing.has(name)) {
          pending.push(name);
        }
      }
      
      // 각 대기 모듈 초기화 시도
      for (const name of pending) {
        this.tryInitialize(name);
      }
    }
    
    /**
     * 모듈 로드 상태 확인
     * @param {string} name - 확인할 모듈 이름
     * @returns {boolean} - 초기화 완료 여부
     */
    isReady(name) {
      return this.initialized.has(name);
    }
    
    /**
     * 모든 모듈 로드 상태 출력 (디버그용)
     */
    getStatus() {
      const status = {
        registered: Array.from(this.modules.keys()),
        initialized: Array.from(this.initialized),
        pending: []
      };
      
      for (const [name] of this.modules) {
        if (!this.initialized.has(name)) {
          const deps = this.dependencies.get(name) || [];
          const missingDeps = deps.filter(dep => !this.initialized.has(dep));
          status.pending.push({ name, missingDeps });
        }
      }
      
      return status;
    }
    
    /**
     * 필수 모듈들이 모두 로드될 때까지 대기
     * @param {Array<string>} requiredModules - 필수 모듈 목록
     * @param {number} maxRetries - 최대 재시도 횟수
     * @returns {Promise<boolean>} - 모든 모듈 로드 완료 여부
     */
    waitForModules(requiredModules, maxRetries = 50) {
      return new Promise((resolve) => {
        let retries = 0;
        
        const checkModules = () => {
          const missing = requiredModules.filter(name => !this.isReady(name));
          
          if (missing.length === 0) {
            console.log('✅ 모든 필수 모듈 로드 완료');
            resolve(true);
            return;
          }
          
          retries++;
          if (retries >= maxRetries) {
            console.error(`❌ 모듈 로드 타임아웃 (누락: [${missing.join(', ')}])`);
            resolve(false);
            return;
          }
          
          console.log(`⏳ 모듈 대기 중... (${retries}/${maxRetries}) 누락: [${missing.join(', ')}]`);
          setTimeout(checkModules, 100);
        };
        
        checkModules();
      });
    }
  }
  
  // 전역 인스턴스 생성
  const gameModuleLoader = new GameModuleLoader();
  
  // 전역 접근 제공
  global.GameModuleLoader = GameModuleLoader;
  global.gameModuleLoader = gameModuleLoader;
  
  // 간편 함수들 전역 등록
  global.registerModule = (name, module, deps) => gameModuleLoader.register(name, module, deps);
  global.waitForModules = (modules, retries) => gameModuleLoader.waitForModules(modules, retries);
  
  console.log('🛠️ GameModuleLoader 시스템 로드 완료');
  console.log('사용법:');
  console.log('  - registerModule(name, module, dependencies): 모듈 등록');
  console.log('  - gameModuleLoader.isReady(name): 모듈 로드 상태 확인');
  console.log('  - waitForModules([modules]): 모듈 로드 대기');
  console.log('  - gameModuleLoader.getStatus(): 전체 상태 확인');
  
})(window); 