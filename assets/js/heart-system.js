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
    const heartText = '❤️'.repeat(this.currentHearts) + '🤍'.repeat(this.maxHearts - this.currentHearts);
    
    if (heartDisplay) {
      heartDisplay.innerHTML = heartText;
    }
    
    // ✅ 사이드바 생명 동기화 (새로 추가된 로직)
    if (window.layoutManager && typeof window.layoutManager.syncToSidebar === 'function') {
      window.layoutManager.syncToSidebar('lives', heartText);
      console.log('💖 사이드바 하트 동기화 완료');
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

  // 하트 시스템 리셋
  reset() {
    this.currentHearts = this.maxHearts;
    this.updateUI();
    console.log('🔄 하트 시스템 리셋됨');
  }

  // 하트 수 설정
  setHearts(count) {
    this.currentHearts = Math.max(0, Math.min(count, this.maxHearts));
    this.updateUI();
    console.log(`💝 하트 수 설정됨: ${this.currentHearts}`);
  }

  // 시스템 상태 확인
  getStatus() {
    return {
      current: this.currentHearts,
      max: this.maxHearts,
      percentage: (this.currentHearts / this.maxHearts) * 100,
      isEmpty: this.currentHearts === 0,
      isFull: this.currentHearts === this.maxHearts
    };
  }
}

// 전역 하트 시스템 인스턴스 생성
window.heartSystem = new HeartSystem(); 