// Heart System for Game
// 하트 시스템 관리

class HeartSystem {
  constructor() {
    this.maxHearts = 5;
    this.currentHearts = this.maxHearts;
    this.initialized = false;
  }

  // 하트 시스템 초기화
  init() {
    console.log('❤️ 하트 시스템 초기화 중...');
    this.initialized = true;
    this.updateUI();
    return this;
  }

  // 하트 사용
  useHeart() {
    if (this.currentHearts > 0) {
      this.currentHearts--;
      this.updateUI();
      console.log(`💔 하트 사용됨. 남은 하트: ${this.currentHearts}`);
      return true;
    }
    console.log('💔 하트가 부족합니다!');
    return false;
  }

  // 하트 회복
  restoreHeart() {
    if (this.currentHearts < this.maxHearts) {
      this.currentHearts++;
      this.updateUI();
      console.log(`💚 하트 회복됨. 현재 하트: ${this.currentHearts}`);
      return true;
    }
    return false;
  }

  // UI 업데이트
  updateUI() {
    const heartDisplay = document.getElementById('heartDisplay') || document.getElementById('lives');
    if (heartDisplay) {
      heartDisplay.innerHTML = '❤️'.repeat(this.currentHearts) + '🤍'.repeat(this.maxHearts - this.currentHearts);
    }
  }

  // 현재 하트 수 반환
  getCurrentHearts() {
    return this.currentHearts;
  }

  // 하트가 있는지 확인
  hasHearts() {
    return this.currentHearts > 0;
  }
}

// 전역 하트 시스템 인스턴스
const heartSystem = new HeartSystem();

// 로그인된 사용자용 하트 시스템을 전역으로 노출
window.heartSystem = {
  init: (userId = null) => {
    if (userId) {
      console.log('💖 인증된 사용자: 하트 시스템 활성화');
      return heartSystem.init();
    } else {
    console.log('🎮 게스트 모드: 하트 시스템 비활성화');
    return window.heartSystem;
    }
  },
  useHeart: () => {
    return heartSystem.useHeart();
  },
  restoreHeart: () => {
    return heartSystem.restoreHeart();
  },
  getCurrentHearts: () => {
    return heartSystem.getCurrentHearts();
  },
  hasHearts: () => {
    return heartSystem.hasHearts();
  },
  updateUI: () => {
    return heartSystem.updateUI();
  }
}; 