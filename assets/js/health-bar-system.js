/**
 * 시간 제한 시각화 시스템 - 90초 타임리밋을 체력바 형태로 표시
 * 시간이 지날수록 체력바가 부드럽게 감소하여 남은 시간을 시각적으로 표현
 */

// 시간 제한 시각화 시스템 객체
// 시간 제한 시각화 시스템 객체
const healthBarSystem = {
  // 설정값
  maxHealth: 100,
  currentHealth: 100,
  updateInterval: 1000, // 1초마다 업데이트로 변경 (성능 최적화)
  
  // 이전 값 저장용 (중복 업데이트 방지)
  lastDisplayedHealth: -1,
  
  healthTimer: null,
  
  // DOM 요소
  healthBarSection: null,
  healthBarFill: null,
  healthBarText: null,
  
  /**
   * 체력바 시스템 초기화
   */
  init() {
    console.log('🔧 체력바 시스템 초기화 시작...');
    
    // DOM 요소 찾기
    console.log('🔍 DOM 요소 검색 중...');
    this.healthBarSection = document.getElementById('healthBarSection');
    console.log('📍 healthBarSection 검색 결과:', this.healthBarSection);
    
    this.healthBarFill = document.getElementById('healthBarFill');
    console.log('📍 healthBarFill 검색 결과:', this.healthBarFill);
    
    this.healthBarText = document.getElementById('healthBarText');
    console.log('📍 healthBarText 검색 결과:', this.healthBarText);
    
    // DOM 요소 존재 여부 확인
    if (!this.healthBarSection || !this.healthBarFill || !this.healthBarText) {
      console.log('⚠️ 체력바 DOM 요소가 제거되었거나 찾을 수 없습니다.');
      console.log('📊 DOM 요소 상태:', {
        healthBarSection: !!this.healthBarSection,
        healthBarFill: !!this.healthBarFill,
        healthBarText: !!this.healthBarText
      });
      
      // 체력바가 하단 바 간소화로 인해 제거되었음을 알림
      console.log('💡 체력바가 하단 바 간소화 과정에서 제거되었습니다. 게임은 목숨 시스템으로 계속 진행됩니다.');
      
      // 전체 DOM에서 관련 요소들 검색해보기 (디버그용)
      const allHealthSections = document.querySelectorAll('[id*="health"], [class*="health"]');
      console.log('🔍 health 관련 모든 요소들:', allHealthSections);
      
      return false;
    }
    
    console.log('✅ 모든 DOM 요소 검색 성공!');
    
    // 초기 DOM 상태 상세 확인
    console.log('📊 healthBarSection 상세 상태:');
    console.log('  - ID:', this.healthBarSection.id);
    console.log('  - 클래스:', this.healthBarSection.className);
    console.log('  - display 스타일:', window.getComputedStyle(this.healthBarSection).display);
    console.log('  - visibility 스타일:', window.getComputedStyle(this.healthBarSection).visibility);
    console.log('  - opacity 스타일:', window.getComputedStyle(this.healthBarSection).opacity);
    console.log('  - 위치 정보:', this.healthBarSection.getBoundingClientRect());
    
    // 초기 상태 설정
    this.reset();
    
    console.log('⏱️ 시간 제한 시각화 시스템 초기화 완료');
    return true;
  },
  
  /**
   * 체력바 시스템 시작
   */
  start() {
    console.log('🚀 체력바 시스템 시작 요청...');
    
    if (!this.healthBarSection) {
      console.log('⚠️ 체력바 시스템이 초기화되지 않아 스킵됩니다. (하단 바 간소화로 인해 체력바 제거됨)');
      return;
    }
    
    console.log('📊 시작 전 체력바 상태:');
    console.log('  - display:', window.getComputedStyle(this.healthBarSection).display);
    console.log('  - visibility:', window.getComputedStyle(this.healthBarSection).visibility);
    console.log('  - opacity:', window.getComputedStyle(this.healthBarSection).opacity);
    console.log('  - 클래스:', this.healthBarSection.className);
    console.log('  - 위치:', this.healthBarSection.getBoundingClientRect());
    
    // 체력바 활성화
    console.log('🔄 체력바 활성화 시도 중...');
    
    // active 클래스 추가
    this.healthBarSection.classList.add('active');
    console.log('✅ active 클래스 추가 완료');
    
    // 직접 display 스타일 설정 (!important 사용)
    this.healthBarSection.style.setProperty('display', 'flex', 'important');
    console.log('✅ display: flex !important 설정 완료');
    
    // 다른 스타일도 !important로 설정
    this.healthBarSection.style.setProperty('visibility', 'visible', 'important');
    this.healthBarSection.style.setProperty('opacity', '1', 'important');
    console.log('✅ visibility 및 opacity !important 설정 완료');
    
    console.log('📊 시작 후 체력바 상태:');
    console.log('  - display:', window.getComputedStyle(this.healthBarSection).display);
    console.log('  - visibility:', window.getComputedStyle(this.healthBarSection).visibility);
    console.log('  - 위치:', this.healthBarSection.getBoundingClientRect());
    
    // 추가 강제 표시 시도
    console.log('🔧 추가 강제 표시 시도...');
    
    // 부모 요소들도 확인
    let parent = this.healthBarSection.parentElement;
    while (parent && parent !== document.body) {
      console.log('📍 부모 요소:', parent.tagName, parent.className, window.getComputedStyle(parent).display);
      if (window.getComputedStyle(parent).display === 'none') {
        console.log('⚠️ 부모 요소가 숨겨져 있습니다:', parent);
        parent.style.setProperty('display', 'block', 'important');
      }
      parent = parent.parentElement;
    }
    
    // 강제로 위치 설정
    this.healthBarSection.style.setProperty('position', 'relative', 'important');
    console.log('✅ 강제 위치 설정 완료');
    
    // 이미 실행 중인 타이머 정지
    if (this.healthTimer) {
      console.log('📍 기존 타이머 정지 중...');
      clearInterval(this.healthTimer);
      this.healthTimer = null;
    }
    
    // 체력 감소 타이머 시작
    console.log('⏰ 체력 감소 타이머 시작...');
    this.healthTimer = setInterval(() => {
      this.updateHealth();
    }, this.updateInterval);
    console.log('📊 체력바 최종 표시 상태:', {
      클래스활성화: this.healthBarSection.classList.contains('active'),
      표시상태: window.getComputedStyle(this.healthBarSection).display,
      가시성: window.getComputedStyle(this.healthBarSection).visibility,
      투명도: window.getComputedStyle(this.healthBarSection).opacity,
      위치정보: this.healthBarSection.getBoundingClientRect()
      });
      
      console.log('✅ 체력바 시스템 시작 완료!');
  },
  
  /**
   * 체력바 시스템 정지
   */
  stop() {
    if (this.healthTimer) {
      clearInterval(this.healthTimer);
      this.healthTimer = null;
    }
    console.log('⏱️ 시간 제한 시각화 시스템 정지');
  },
  
  /**
   * 체력바 시스템 리셋
   */
  reset() {
    this.stop();
    this.currentHealth = this.maxHealth;
    
    if (this.healthBarSection) {
      this.healthBarSection.classList.remove('active');
      // 직접 스타일도 제거하여 기본 CSS로 되돌리기
      this.healthBarSection.style.display = '';
    }
    
    this.updateDisplay();
    console.log('⏱️ 시간 제한 시각화 시스템 리셋');
  },
  
  /**
   * 체력 업데이트 (시간에 따른 감소)
   */
  updateHealth() {
    // 성능 최적화: 게임 비활성/일시정지 시 조기 종료
    if (!gameState.isGameActive || gameState.isPaused) {
      return;
    }
  
    // 90초 동안 100%에서 0%로 감소
    const timeElapsed = gameState.elapsedTime;
    const timeLimit = gameState.timeLimit;
    
    // 남은 시간 비율 계산
    const timePercentage = Math.max(0, ((timeLimit - timeElapsed) / timeLimit) * 100);
    
    // 체력 값 업데이트
    this.currentHealth = timePercentage;
    
    // 성능 최적화: 값이 변경될 때만 화면 업데이트
    const roundedHealth = Math.round(this.currentHealth);
    if (roundedHealth !== this.lastDisplayedHealth) {
      this.lastDisplayedHealth = roundedHealth;
      this.updateDisplay();
      
      // 디버그용 로그 (값 변경 시에만)
      console.log('💪 체력 업데이트:', roundedHealth + '%');
    }
    
    // 시간이 0이 되면 시스템 정지 (게임 오버는 게임 로직에서 처리)
    if (this.currentHealth <= 0) {
      console.log('⚠️ 체력 0 도달 - 시스템 정지');
      this.stop();
    }
  },
  
  /**
   * 체력바 표시 업데이트
   */
  updateDisplay() {
    if (!this.healthBarFill || !this.healthBarText) {
      // 체력바 DOM 요소가 없어서 화면 업데이트 스킵 (이는 정상적인 동작)
      return;
    }
  
    const percentage = Math.round(this.currentHealth);
    
    // 체력바 너비 업데이트
    this.healthBarFill.style.width = `${percentage}%`;
    
    // 체력바 텍스트 업데이트
    this.healthBarText.textContent = `${percentage}%`;
    
    // 체력바 색상 업데이트 (단계별 색상 변경)
    this.healthBarFill.className = 'health-bar-fill'; // 기본 클래스 리셋
    
    if (percentage <= 10) {
      this.healthBarFill.classList.add('critical'); // 위험 (10% 이하)
    } else if (percentage <= 30) {
      this.healthBarFill.classList.add('warning');  // 경고 (30% 이하)
    } else if (percentage <= 50) {
      this.healthBarFill.classList.add('caution');  // 주의 (50% 이하)
    } else {
      this.healthBarFill.classList.add('safe');     // 안전 (50% 초과)
    }
    
    // ✅ 사이드바 체력바 동기화 (새로 추가된 로직)
    if (window.layoutManager && typeof window.layoutManager.syncToSidebar === 'function') {
      // 사이드바 체력바 너비 업데이트
      const sidebarHealthBarFill = document.getElementById('sidebarHealthBarFill');
      if (sidebarHealthBarFill) {
        sidebarHealthBarFill.style.width = `${percentage}%`;
        
        // 사이드바 체력바 색상도 동일하게 적용
        sidebarHealthBarFill.className = 'health-bar-fill';
        if (percentage <= 10) {
          sidebarHealthBarFill.classList.add('critical');
        } else if (percentage <= 30) {
          sidebarHealthBarFill.classList.add('warning');
        } else if (percentage <= 50) {
          sidebarHealthBarFill.classList.add('caution');
        } else {
          sidebarHealthBarFill.classList.add('safe');
        }
      }
      
      // 사이드바 체력바 텍스트 업데이트
      const sidebarHealthBarText = document.getElementById('sidebarHealthBarText');
      if (sidebarHealthBarText) {
        sidebarHealthBarText.textContent = `${percentage}%`;
      }
      
      console.log('💪 사이드바 체력바 동기화 완료:', percentage + '%');
    }
    
    // 사용자 피드백: 체력 단계별 체력바 깜박임 효과
    if (percentage <= 10 && percentage > 0) {
      // 10% 이하일 때 빠른 깜박임 효과
      this.healthBarFill.style.animation = 'healthBarBlink 0.5s infinite';
    } else if (percentage <= 30) {
      // 30% 이하일 때 느린 깜박임 효과
      this.healthBarFill.style.animation = 'healthBarBlink 1s infinite';
    } else {
      this.healthBarFill.classList.add('critical');
    }
  }
  /**
   * 체력 강제 설정 (디버그용)
   */
  setHealth(percentage) {
    this.currentHealth = Math.max(0, Math.min(100, percentage));
    this.updateDisplay();
  },
  
  /**
   * 현재 체력 반환
   */
  getHealth() {
    return this.currentHealth;
  },
  
  /**
   * 체력바 표시 여부 확인
   */
  isActive() {
    return this.healthBarSection && this.healthBarSection.classList.contains('active');
  }
};

// 전역 접근을 위한 export
if (typeof window !== 'undefined') {
  window.healthBarSystem = healthBarSystem;
  console.log('✅ healthBarSystem이 window 객체에 등록되었습니다!');
}

// 모듈 시스템 지원
if (typeof module !== 'undefined' && module.exports) {
  module.exports = healthBarSystem;
} 