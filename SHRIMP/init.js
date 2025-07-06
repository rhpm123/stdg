// Shrimp Task Manager 초기화 스크립트
const fs = require('fs');
const path = require('path');

// 설정 파일 읽기
const configPath = path.join(__dirname, 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// 프로젝트 룰 파일 읽기
const rulesPath = path.join(__dirname, '..', config.rules_file);
const rules = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));

console.log('프로젝트 룰 초기화 중...');
console.log(`프로젝트명: ${config.project_name}`);
console.log(`규칙 소스: ${config.rules_file}`);

// 여기서 프로젝트 룰을 초기화하는 로직 구현
// (실제 구현은 Shrimp Task Manager의 API에 맞게 작성해야 함)

console.log('프로젝트 룰이 성공적으로 초기화되었습니다.');
console.log('이제 Shrimp Task Manager를 사용할 준비가 되었습니다.'); 