/**
 * 좌표 시각화 및 편집 도구 모듈
 * 
 * 차이점 좌표를 시각화하고 편집하는 기능을 제공합니다.
 * 
 * @author Shrimp Task Manager
 * @version 0.1.0
 */

import { calculateDistance } from './utils.js';

/**
 * 좌표 시각화 및 편집 도구 클래스
 */
export class CoordinatesEditor {
  /**
   * 생성자
   * 
   * @param {HTMLCanvasElement} canvas - 편집 도구에 사용할 캔버스
   * @param {HTMLImageElement} originalImage - 원본 이미지
   * @param {HTMLImageElement} modifiedImage - 수정된 이미지
   * @param {Array} coordinates - 초기 좌표 데이터 배열
   */
  constructor(canvas, originalImage, modifiedImage, coordinates = []) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.originalImage = originalImage;
    this.modifiedImage = modifiedImage;
    this.coordinates = [...coordinates];
    this.selectedCoordIndex = -1;
    this.isDragging = false;
    this.isCreating = false;
    this.isDeleting = false;
    this.mode = 'view'; // 'view', 'add', 'edit', 'delete'
    this.currentMousePos = { x: 0, y: 0 };
    this.tempCoordinate = null;
    
    // 스타일 설정
    this.styles = {
      coordinateColor: 'rgba(255, 0, 0, 0.5)',
      selectedColor: 'rgba(255, 255, 0, 0.7)',
      tempColor: 'rgba(0, 255, 0, 0.5)',
      lineWidth: 2,
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      textColor: 'white',
      textBackground: 'rgba(0, 0, 0, 0.7)'
    };
    
    // 이벤트 리스너 초기화
    this._initEventListeners();
    
    // 캔버스 크기 초기화
    this._updateCanvasSize();
    
    // 초기 렌더링
    this.render();
  }
  
  /**
   * 이벤트 리스너 초기화
   */
  _initEventListeners() {
    // 마우스 이벤트
    this.canvas.addEventListener('mousedown', this._handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this._handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this._handleMouseUp.bind(this));
    this.canvas.addEventListener('mouseleave', this._handleMouseLeave.bind(this));
    
    // 터치 이벤트
    this.canvas.addEventListener('touchstart', this._handleTouchStart.bind(this));
    this.canvas.addEventListener('touchmove', this._handleTouchMove.bind(this));
    this.canvas.addEventListener('touchend', this._handleTouchEnd.bind(this));
    
    // 윈도우 리사이즈 이벤트
    window.addEventListener('resize', this._updateCanvasSize.bind(this));
  }
  
  /**
   * 캔버스 크기 업데이트
   */
  _updateCanvasSize() {
    // 원본 이미지의 비율에 맞게 캔버스 크기 조정
    const containerWidth = this.canvas.parentElement.clientWidth;
    const containerHeight = this.canvas.parentElement.clientHeight;
    
    const imageRatio = this.originalImage.width / this.originalImage.height;
    const containerRatio = containerWidth / containerHeight;
    
    let width, height;
    
    if (imageRatio > containerRatio) {
      // 이미지가 더 넓은 경우
      width = containerWidth;
      height = containerWidth / imageRatio;
    } else {
      // 이미지가 더 높은 경우
      height = containerHeight;
      width = containerHeight * imageRatio;
    }
    
    this.canvas.width = width;
    this.canvas.height = height;
    
    // 스케일 계산
    this.scaleX = width / this.originalImage.width;
    this.scaleY = height / this.originalImage.height;
    
    // 렌더링 업데이트
    this.render();
  }
  
  /**
   * 마우스 위치를 캔버스 좌표로 변환
   * 
   * @param {MouseEvent|Touch} event - 마우스 또는 터치 이벤트
   * @returns {Object} 캔버스 좌표
   */
  _getMousePos(event) {
    const rect = this.canvas.getBoundingClientRect();
    let x, y;
    
    if (event.touches) {
      // 터치 이벤트
      x = event.touches[0].clientX - rect.left;
      y = event.touches[0].clientY - rect.top;
    } else {
      // 마우스 이벤트
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
    }
    
    // 스케일에 맞게 원본 이미지 좌표로 변환
    const originalX = Math.round(x / this.scaleX);
    const originalY = Math.round(y / this.scaleY);
    
    return { x: originalX, y: originalY };
  }
  
  /**
   * 좌표가 올바른 범위 내에 있는지 확인
   * 
   * @param {Object} coord - 확인할 좌표
   * @returns {boolean} 유효 여부
   */
  _isValidCoordinate(coord) {
    return (
      coord.x >= 0 && 
      coord.x < this.originalImage.width && 
      coord.y >= 0 && 
      coord.y < this.originalImage.height
    );
  }
  
  /**
   * 마우스 위치에 있는 좌표 인덱스 찾기
   * 
   * @param {Object} mousePos - 마우스 위치
   * @returns {number} 좌표 인덱스 (없으면 -1)
   */
  _findCoordinateAtPosition(mousePos) {
    for (let i = 0; i < this.coordinates.length; i++) {
      const coord = this.coordinates[i];
      const distance = calculateDistance(
        mousePos.x, mousePos.y,
        coord.x_coord, coord.y_coord
      );
      
      // 좌표 반경 내에 있으면 해당 인덱스 반환
      if (distance <= coord.radius) {
        return i;
      }
    }
    
    return -1;
  }
  
  /**
   * 마우스 다운 이벤트 처리
   * 
   * @param {MouseEvent} event - 마우스 이벤트
   */
  _handleMouseDown(event) {
    const mousePos = this._getMousePos(event);
    this.currentMousePos = mousePos;
    
    switch (this.mode) {
      case 'view':
        // 조회 모드에서는 좌표 선택만 가능
        const index = this._findCoordinateAtPosition(mousePos);
        this.selectedCoordIndex = index;
        break;
        
      case 'add':
        // 추가 모드에서는 새 좌표 생성 시작
        this.isCreating = true;
        this.tempCoordinate = {
          x_coord: mousePos.x,
          y_coord: mousePos.y,
          radius: 20
        };
        break;
        
      case 'edit':
        // 편집 모드에서는 좌표 드래그 시작
        const editIndex = this._findCoordinateAtPosition(mousePos);
        if (editIndex !== -1) {
          this.selectedCoordIndex = editIndex;
          this.isDragging = true;
        }
        break;
        
      case 'delete':
        // 삭제 모드에서는 좌표 선택하여 삭제 표시
        const deleteIndex = this._findCoordinateAtPosition(mousePos);
        if (deleteIndex !== -1) {
          this.selectedCoordIndex = deleteIndex;
          this.isDeleting = true;
        }
        break;
    }
    
    this.render();
  }
  
  /**
   * 마우스 이동 이벤트 처리
   * 
   * @param {MouseEvent} event - 마우스 이벤트
   */
  _handleMouseMove(event) {
    const mousePos = this._getMousePos(event);
    this.currentMousePos = mousePos;
    
    if (this.isDragging && this.selectedCoordIndex !== -1) {
      // 드래그 중인 경우 좌표 위치 업데이트
      if (this._isValidCoordinate(mousePos)) {
        this.coordinates[this.selectedCoordIndex].x_coord = mousePos.x;
        this.coordinates[this.selectedCoordIndex].y_coord = mousePos.y;
      }
    } else if (this.isCreating && this.tempCoordinate) {
      // 새 좌표 생성 중인 경우 임시 좌표 업데이트
      const dx = mousePos.x - this.tempCoordinate.x_coord;
      const dy = mousePos.y - this.tempCoordinate.y_coord;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // 거리를 반경으로 설정 (최소 반경 20px)
      this.tempCoordinate.radius = Math.max(Math.round(distance), 20);
    }
    
    this.render();
  }
  
  /**
   * 마우스 업 이벤트 처리
   * 
   * @param {MouseEvent} event - 마우스 이벤트
   */
  _handleMouseUp(event) {
    if (this.isCreating && this.tempCoordinate) {
      // 좌표 생성 완료
      this.coordinates.push({
        id: `temp-${Date.now()}`,
        x_coord: this.tempCoordinate.x_coord,
        y_coord: this.tempCoordinate.y_coord,
        radius: this.tempCoordinate.radius
      });
      
      // 좌표 추가 이벤트 발생
      this._emitEvent('coordinateadded', this.coordinates[this.coordinates.length - 1]);
    } else if (this.isDragging && this.selectedCoordIndex !== -1) {
      // 좌표 이동 완료
      const updatedCoord = this.coordinates[this.selectedCoordIndex];
      
      // 좌표 업데이트 이벤트 발생
      this._emitEvent('coordinateupdated', updatedCoord);
    } else if (this.isDeleting && this.selectedCoordIndex !== -1) {
      // 좌표 삭제
      const deletedCoord = this.coordinates[this.selectedCoordIndex];
      this.coordinates.splice(this.selectedCoordIndex, 1);
      this.selectedCoordIndex = -1;
      
      // 좌표 삭제 이벤트 발생
      this._emitEvent('coordinatedeleted', deletedCoord);
    }
    
    // 상태 초기화
    this.isDragging = false;
    this.isCreating = false;
    this.isDeleting = false;
    this.tempCoordinate = null;
    
    this.render();
  }
  
  /**
   * 마우스 나가기 이벤트 처리
   * 
   * @param {MouseEvent} event - 마우스 이벤트
   */
  _handleMouseLeave(event) {
    this.isDragging = false;
    this.isCreating = false;
    this.isDeleting = false;
    this.tempCoordinate = null;
    
    this.render();
  }
  
  /**
   * 터치 시작 이벤트 처리
   * 
   * @param {TouchEvent} event - 터치 이벤트
   */
  _handleTouchStart(event) {
    event.preventDefault();
    this._handleMouseDown(event);
  }
  
  /**
   * 터치 이동 이벤트 처리
   * 
   * @param {TouchEvent} event - 터치 이벤트
   */
  _handleTouchMove(event) {
    event.preventDefault();
    this._handleMouseMove(event);
  }
  
  /**
   * 터치 종료 이벤트 처리
   * 
   * @param {TouchEvent} event - 터치 이벤트
   */
  _handleTouchEnd(event) {
    event.preventDefault();
    this._handleMouseUp(event);
  }
  
  /**
   * 캔버스 렌더링
   */
  render() {
    // 캔버스 초기화
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 현재 선택된 이미지 그리기
    const displayImage = this.mode === 'view' ? this.modifiedImage : this.originalImage;
    
    this.ctx.drawImage(
      displayImage,
      0, 0, displayImage.width, displayImage.height,
      0, 0, this.canvas.width, this.canvas.height
    );
    
    // 좌표 그리기
    this._drawCoordinates();
    
    // 임시 좌표 그리기
    if (this.isCreating && this.tempCoordinate) {
      this._drawTempCoordinate();
    }
    
    // 현재 모드 정보 표시
    this._drawModeInfo();
  }
  
  /**
   * 좌표 그리기
   */
  _drawCoordinates() {
    this.coordinates.forEach((coord, index) => {
      const isSelected = index === this.selectedCoordIndex;
      const color = isSelected ? this.styles.selectedColor : this.styles.coordinateColor;
      
      // 좌표를 캔버스 스케일에 맞게 변환
      const x = coord.x_coord * this.scaleX;
      const y = coord.y_coord * this.scaleY;
      const radius = coord.radius * this.scaleX;
      
      // 원 그리기
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fillStyle = color;
      this.ctx.fill();
      
      this.ctx.lineWidth = this.styles.lineWidth;
      this.ctx.strokeStyle = isSelected ? 'yellow' : 'red';
      this.ctx.stroke();
      
      // 인덱스 표시
      this.ctx.fillStyle = this.styles.textColor;
      this.ctx.font = `${this.styles.fontSize}px ${this.styles.fontFamily}`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText((index + 1).toString(), x, y);
    });
  }
  
  /**
   * 임시 좌표 그리기
   */
  _drawTempCoordinate() {
    // 좌표를 캔버스 스케일에 맞게 변환
    const x = this.tempCoordinate.x_coord * this.scaleX;
    const y = this.tempCoordinate.y_coord * this.scaleY;
    const radius = this.tempCoordinate.radius * this.scaleX;
    
    // 원 그리기
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = this.styles.tempColor;
    this.ctx.fill();
    
    this.ctx.lineWidth = this.styles.lineWidth;
    this.ctx.strokeStyle = 'green';
    this.ctx.stroke();
    
    // 크기 정보 표시
    this.ctx.fillStyle = this.styles.textColor;
    this.ctx.font = `${this.styles.fontSize}px ${this.styles.fontFamily}`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(`R: ${this.tempCoordinate.radius}`, x, y);
  }
  
  /**
   * 현재 모드 정보 표시
   */
  _drawModeInfo() {
    const modeText = {
      view: '조회 모드',
      add: '추가 모드',
      edit: '편집 모드',
      delete: '삭제 모드'
    }[this.mode];
    
    const padding = 10;
    this.ctx.fillStyle = this.styles.textBackground;
    this.ctx.fillRect(0, 0, this.canvas.width, 30);
    
    this.ctx.fillStyle = this.styles.textColor;
    this.ctx.font = `${this.styles.fontSize}px ${this.styles.fontFamily}`;
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      `${modeText} | 좌표: ${this.coordinates.length}개 | ${this.currentMousePos.x},${this.currentMousePos.y}`,
      padding, 15
    );
  }
  
  /**
   * 이벤트 발생
   * 
   * @param {string} eventName - 이벤트 이름
   * @param {Object} data - 이벤트 데이터
   */
  _emitEvent(eventName, data) {
    const event = new CustomEvent(eventName, { detail: data });
    this.canvas.dispatchEvent(event);
    
    // 변경 이벤트도 발생시킴
    const changeEvent = new CustomEvent('coordinateschange', { 
      detail: { type: eventName, data, coordinates: this.coordinates } 
    });
    this.canvas.dispatchEvent(changeEvent);
  }
  
  /**
   * 모드 설정
   * 
   * @param {string} mode - 설정할 모드 ('view', 'add', 'edit', 'delete')
   */
  setMode(mode) {
    if (['view', 'add', 'edit', 'delete'].includes(mode)) {
      this.mode = mode;
      this.selectedCoordIndex = -1;
      this.render();
    }
  }
  
  /**
   * 좌표 설정
   * 
   * @param {Array} coordinates - 설정할 좌표 배열
   */
  setCoordinates(coordinates) {
    this.coordinates = [...coordinates];
    this.selectedCoordIndex = -1;
    this.render();
  }
  
  /**
   * 좌표 추가
   * 
   * @param {Object} coordinate - 추가할 좌표
   */
  addCoordinate(coordinate) {
    this.coordinates.push(coordinate);
    this.render();
    
    // 좌표 추가 이벤트 발생
    this._emitEvent('coordinateadded', coordinate);
  }
  
  /**
   * 좌표 가져오기
   * 
   * @returns {Array} 좌표 배열
   */
  getCoordinates() {
    return [...this.coordinates];
  }
  
  /**
   * 좌표 삭제
   * 
   * @param {number} index - 삭제할 좌표 인덱스
   */
  deleteCoordinate(index) {
    if (index >= 0 && index < this.coordinates.length) {
      const deletedCoord = this.coordinates[index];
      this.coordinates.splice(index, 1);
      this.selectedCoordIndex = -1;
      this.render();
      
      // 좌표 삭제 이벤트 발생
      this._emitEvent('coordinatedeleted', deletedCoord);
    }
  }
  
  /**
   * 모든 좌표 삭제
   */
  clearCoordinates() {
    this.coordinates = [];
    this.selectedCoordIndex = -1;
    this.render();
    
    // 좌표 변경 이벤트 발생
    this._emitEvent('coordinateschange', { 
      type: 'clear', 
      data: null, 
      coordinates: this.coordinates 
    });
  }
  
  /**
   * 이벤트 리스너 추가
   * 
   * @param {string} eventName - 이벤트 이름
   * @param {Function} callback - 콜백 함수
   */
  addEventListener(eventName, callback) {
    this.canvas.addEventListener(eventName, callback);
  }
  
  /**
   * 이벤트 리스너 제거
   * 
   * @param {string} eventName - 이벤트 이름
   * @param {Function} callback - 콜백 함수
   */
  removeEventListener(eventName, callback) {
    this.canvas.removeEventListener(eventName, callback);
  }
}

export default {
  CoordinatesEditor
}; 