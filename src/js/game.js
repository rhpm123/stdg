/**
 * 게임 기능을 처리하는 모듈
 * 
 * 이미지 세트 관리 및 게임 플레이 로직을 제공합니다.
 * 
 * @author Shrimp Task Manager
 * @version 0.1.0
 */

import supabaseClient from '../../config/supabase.js';

/**
 * 이미지 세트 목록을 가져옵니다.
 * 
 * @param {number|null} difficulty - 필터링할 난이도 (null이면 모든 난이도)
 * @param {number} limit - 가져올 최대 항목 수
 * @param {number} offset - 시작 오프셋
 * @returns {Promise<Object>} 이미지 세트 목록
 */
export const getImageSets = async (difficulty = null, limit = 10, offset = 0) => {
  try {
    let query = supabaseClient
      .from('image_sets')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (difficulty !== null) {
      query = query.eq('difficulty', difficulty);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return {
      success: true,
      imageSets: data
    };
  } catch (error) {
    console.error('이미지 세트 목록 조회 중 오류 발생:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 특정 이미지 세트의 상세 정보를 가져옵니다.
 * 
 * @param {string} imageSetId - 이미지 세트 ID
 * @returns {Promise<Object>} 이미지 세트 상세 정보
 */
export const getImageSetDetails = async (imageSetId) => {
  try {
    // 이미지 세트 정보 가져오기
    const { data: imageSet, error: imageSetError } = await supabaseClient
      .from('image_sets')
      .select('*')
      .eq('id', imageSetId)
      .single();
    
    if (imageSetError) throw imageSetError;
    
    // 틀린 부분 좌표 정보 가져오기
    const { data: differences, error: differencesError } = await supabaseClient
      .from('differences')
      .select('*')
      .eq('image_set_id', imageSetId);
    
    if (differencesError) throw differencesError;
    
    return {
      success: true,
      imageSet,
      differences
    };
  } catch (error) {
    console.error('이미지 세트 상세 조회 중 오류 발생:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 게임 진행 상황을 생성하거나 업데이트합니다.
 * 
 * @param {string} userId - 사용자 ID
 * @param {string} imageSetId - 이미지 세트 ID
 * @param {Object} progress - 진행 상황 데이터
 * @returns {Promise<Object>} 저장 결과
 */
export const saveGameProgress = async (userId, imageSetId, progress) => {
  try {
    // 기존 진행 상황 확인
    const { data: existingProgress, error: fetchError } = await supabaseClient
      .from('user_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('image_set_id', imageSetId)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
    
    if (existingProgress) {
      // 기존 진행 상황 업데이트
      const { data, error } = await supabaseClient
        .from('user_progress')
        .update(progress)
        .eq('id', existingProgress.id);
      
      if (error) throw error;
      
      return {
        success: true,
        action: 'update',
        data
      };
    } else {
      // 새로운 진행 상황 생성
      const { data, error } = await supabaseClient
        .from('user_progress')
        .insert({
          user_id: userId,
          image_set_id: imageSetId,
          ...progress
        });
      
      if (error) throw error;
      
      return {
        success: true,
        action: 'insert',
        data
      };
    }
  } catch (error) {
    console.error('게임 진행 상황 저장 중 오류 발생:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 틀린 부분을 발견했을 때 기록을 저장합니다.
 * 
 * @param {string} userProgressId - 사용자 진행 상황 ID
 * @param {string} differenceId - 발견한 틀린 부분 ID
 * @returns {Promise<Object>} 저장 결과
 */
export const saveDifferenceFound = async (userProgressId, differenceId) => {
  try {
    // 틀린 부분 발견 기록 저장
    const { data, error } = await supabaseClient
      .from('found_differences')
      .insert({
        user_progress_id: userProgressId,
        difference_id: differenceId
      });
    
    if (error) throw error;
    
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('틀린 부분 발견 기록 저장 중 오류 발생:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 게임 완료 처리를 합니다.
 * 
 * @param {string} userProgressId - 사용자 진행 상황 ID
 * @param {number} score - 획득한 점수
 * @param {number} timeSpent - 소요 시간(초)
 * @returns {Promise<Object>} 저장 결과
 */
export const completeGame = async (userProgressId, score, timeSpent) => {
  try {
    const { data, error } = await supabaseClient
      .from('user_progress')
      .update({
        completed: true,
        score,
        time_spent: timeSpent,
        completed_at: new Date().toISOString()
      })
      .eq('id', userProgressId);
    
    if (error) throw error;
    
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('게임 완료 처리 중 오류 발생:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  getImageSets,
  getImageSetDetails,
  saveGameProgress,
  saveDifferenceFound,
  completeGame
}; 