/**
 * BottomBarManager - 동적 하단바 관리 시스템
 * 안전 모드: 기존 레이아웃 보호를 위해 비활성화됨
 */

class BottomBarManager {
  constructor() {
    console.log('⚠️ BottomBarManager: 안전 모드로 실행됨 (기존 레이아웃 보호)');
    this.enabled = false; // 시스템 비활성화
    this.bottomBar = document.querySelector('.bottom-bar');
    
    // 안전 모드에서는 초기화만 수행하고 실제 기능은 비활성화
    if (!this.enabled) {
      console.log('ℹ️ 동적 레이아웃 시스템이 비활성화되었습니다.');
      return;
    }
  }

  // 모든 메서드들을 안전하게 비활성화
  initialize() {
    if (!this.enabled) return;
  }

  calculateOptimalHeight() {
    if (!this.enabled) return null;
  }

  updateBottomBarHeight(height) {
    if (!this.enabled) return;
  }

  setBrowserSpecificVariables() {
    if (!this.enabled) return;
  }

  handleResize() {
    if (!this.enabled) return;
  }

  destroy() {
    if (!this.enabled) return;
  }

  // 상태 확인용 메서드
  isEnabled() {
    return this.enabled;
  }
}

// 전역 인스턴스 생성 (비활성화된 상태)
window.bottomBarManager = new BottomBarManager();

// 안전 모드 메시지
console.log('🛡️ BottomBarManager 안전 모드 활성화: 기존 CSS 레이아웃을 보호합니다.'); 