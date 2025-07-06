/**
 * Supabase 스토리지 설정 테스트 스크립트
 * 
 * 이 스크립트는 Supabase 스토리지 설정이 올바르게 작동하는지 테스트합니다.
 * - 스토리지 버킷 생성
 * - 이미지 업로드
 * - 이미지 접근 정책 설정
 * 
 * @author Shrimp Task Manager
 * @version 0.1.0
 */

import supabaseClient, { testConnection } from '../../config/supabase.js';
import storageHelper, { 
  BUCKET_NAMES, 
  createStorageBuckets,
  setBucketPolicy,
  testStorageSetup 
} from '../../config/storage.js';

// 오류 출력 헬퍼 함수
const logError = (message, error) => {
  console.error(`❌ ${message}:`, error);
};

// 성공 출력 헬퍼 함수
const logSuccess = (message, data = null) => {
  console.log(`✅ ${message}`);
  if (data) {
    console.log('   데이터:', data);
  }
};

/**
 * 모든 테스트를 순차적으로 실행
 */
const runAllTests = async () => {
  console.log('========================================');
  console.log('🔍 Supabase 스토리지 설정 테스트 시작');
  console.log('========================================');
  
  try {
    // 1. Supabase 연결 테스트
    console.log('\n📡 Supabase 연결 테스트...');
    const connectionResult = await testConnection();
    
    if (connectionResult.success) {
      logSuccess('Supabase 연결 성공');
    } else {
      logError('Supabase 연결 실패', connectionResult.error);
      console.log('\n⚠️ 연결에 실패했습니다. Supabase URL과 API 키를 확인하세요.');
      return;
    }
    
    // 2. 현재 스토리지 버킷 목록 조회
    console.log('\n📦 현재 스토리지 버킷 목록 조회...');
    const { data: bucketList, error: bucketListError } = await supabaseClient.storage.listBuckets();
    
    if (bucketListError) {
      logError('버킷 목록 조회 실패', bucketListError);
    } else {
      logSuccess('버킷 목록 조회 성공', bucketList);
      
      // 이미 존재하는 버킷 확인
      const existingBuckets = bucketList.map(bucket => bucket.name);
      console.log('   기존 버킷:', existingBuckets.length ? existingBuckets.join(', ') : '없음');
      
      // 생성해야 할 버킷 확인
      const bucketsToCreate = Object.values(BUCKET_NAMES).filter(name => !existingBuckets.includes(name));
      console.log('   생성할 버킷:', bucketsToCreate.length ? bucketsToCreate.join(', ') : '없음');
    }
    
    // 3. 스토리지 버킷 생성
    console.log('\n🏗️ 스토리지 버킷 생성...');
    const createResult = await createStorageBuckets();
    
    if (createResult.success) {
      logSuccess('모든 버킷 생성 완료');
      
      // 각 버킷 결과 출력
      Object.entries(createResult.results).forEach(([bucketKey, result]) => {
        if (result.success) {
          logSuccess(`${bucketKey} 생성 성공`);
        } else {
          // 이미 존재하는 경우는 오류가 아님
          if (result.message.includes('already exists')) {
            console.log(`ℹ️ ${bucketKey}는 이미 존재합니다.`);
          } else {
            logError(`${bucketKey} 생성 실패`, result.message);
          }
        }
      });
    } else {
      logError('버킷 생성 실패', createResult.error);
      console.log('\n⚠️ 버킷 생성에 실패했습니다. Supabase 권한을 확인하세요.');
      return;
    }
    
    // 4. 버킷 정책 설정
    console.log('\n🔒 버킷 정책 설정...');
    
    // 원본 및 수정 이미지는 비공개, 게임용 이미지는 공개
    const policyResults = {};
    
    // 원본 이미지 버킷 - 비공개
    policyResults.original = await setBucketPolicy(BUCKET_NAMES.ORIGINAL_IMAGES, false);
    
    // 수정 이미지 버킷 - 비공개
    policyResults.modified = await setBucketPolicy(BUCKET_NAMES.MODIFIED_IMAGES, false);
    
    // 공개 이미지 버킷 - 공개
    policyResults.public = await setBucketPolicy(BUCKET_NAMES.PUBLIC_IMAGES, true);
    
    const policySuccess = Object.values(policyResults).every(result => result.success);
    
    if (policySuccess) {
      logSuccess('모든 버킷 정책 설정 완료');
    } else {
      logError('일부 버킷 정책 설정 실패', 
        Object.entries(policyResults)
          .filter(([_, result]) => !result.success)
          .map(([key, result]) => `${key}: ${result.message}`)
          .join(', ')
      );
    }
    
    // 5. 테스트 이미지 업로드 테스트
    console.log('\n🖼️ 테스트 이미지 업로드...');
    const testResult = await testStorageSetup();
    
    if (testResult.success) {
      logSuccess('모든 버킷에 테스트 이미지 업로드 성공');
      
      // 각 버킷 업로드 결과 출력
      Object.entries(testResult.results).forEach(([bucket, result]) => {
        if (result.success) {
          logSuccess(`${bucket} 업로드 성공: ${result.path}`);
        } else {
          logError(`${bucket} 업로드 실패`, result.error);
        }
      });
    } else {
      logError('테스트 이미지 업로드 실패', 
        Object.entries(testResult.results)
          .filter(([_, result]) => !result.success)
          .map(([key, result]) => `${key}: ${result.error}`)
          .join(', ')
      );
    }
    
    // 테스트 결과 요약
    console.log('\n========================================');
    console.log('📊 테스트 결과 요약');
    console.log('========================================');
    console.log(`Supabase 연결: ${connectionResult.success ? '✅ 성공' : '❌ 실패'}`);
    console.log(`버킷 생성: ${createResult.success ? '✅ 성공' : '❌ 실패'}`);
    console.log(`정책 설정: ${policySuccess ? '✅ 성공' : '❌ 실패'}`);
    console.log(`테스트 업로드: ${testResult.success ? '✅ 성공' : '❌ 실패'}`);
    console.log('========================================');
    
    if (connectionResult.success && createResult.success && policySuccess && testResult.success) {
      console.log('🎉 모든 테스트 통과! Supabase 스토리지가 올바르게 설정되었습니다.');
    } else {
      console.log('⚠️ 일부 테스트 실패. 오류를 확인하고 다시 시도하세요.');
    }
    
  } catch (error) {
    console.error('❌ 테스트 실행 중 예상치 못한 오류 발생:', error);
  }
};

// 테스트 실행
runAllTests().catch(error => {
  console.error('❌ 테스트 실행 실패:', error);
}); 