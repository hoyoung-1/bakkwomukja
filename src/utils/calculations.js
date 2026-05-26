// ─────────────────────────────────────────────────────────────────
// calculations.js  —  표준체중, 칼로리, 교환단위 계산 순수 함수들
//
// "순수 함수"란? 같은 입력을 넣으면 항상 같은 결과가 나오는 함수.
// 앱 상태나 화면에 영향을 주지 않아 테스트하기 쉬움.
// ─────────────────────────────────────────────────────────────────

import { EXCHANGE_TABLE, DEFAULT_GOALS } from '../constants/exchangeTable';

/**
 * 표준체중 계산
 * 공식: 키(m)² × 22 (남성) / 21 (여성)
 *
 * @param {number} height       - 키 (cm)
 * @param {'male'|'female'} gender
 * @returns {number} 표준체중 (kg, 소수 1자리)
 */
export const calculateStandardWeight = (height, gender) => {
  const heightInMeter = height / 100;
  const factor = gender === 'male' ? 22 : 21;
  const result = heightInMeter * heightInMeter * factor;
  return Math.round(result * 10) / 10; // 소수 1자리 반올림
};

/**
 * 하루 필요 칼로리 계산
 * 공식: 표준체중 × 활동량 계수
 *
 * @param {number} standardWeight  - 표준체중 (kg)
 * @param {'light'|'moderate'|'heavy'} activityLevel
 * @returns {number} 하루 필요 칼로리 (kcal, 정수)
 */
export const calculateDailyCalories = (standardWeight, activityLevel) => {
  const multipliers = {
    light:    30,  // 가벼운 활동 (주로 앉아서 생활)
    moderate: 35,  // 보통 활동  (하루 30분 운동)
    heavy:    40,  // 심한 활동  (격렬한 운동, 육체노동)
  };
  const multiplier = multipliers[activityLevel] ?? 30;
  return Math.round(standardWeight * multiplier);
};

/**
 * 하루 칼로리 → 식품교환단위 목표 계산
 * EXCHANGE_TABLE에서 해당 칼로리 구간을 찾아서 반환
 *
 * @param {number} dailyCalories - 하루 필요 칼로리
 * @returns {object} goals 객체 { totalCalories, grain, protein, ... }
 */
export const calculateGoals = (dailyCalories) => {
  const entry = EXCHANGE_TABLE.find((row) => dailyCalories <= row.maxCalories);
  if (!entry) return { ...DEFAULT_GOALS }; // 예외처리: 기본값 반환

  const { maxCalories, ...units } = entry; // maxCalories 제거하고 나머지만
  return {
    totalCalories: dailyCalories,
    ...units,
  };
};

/**
 * 전체 달성률 계산 (0.0 ~ 1.0)
 * 6개 식품군의 달성률 평균
 * 초과 섭취는 1.0으로 클램프 (무한히 올라가지 않도록)
 *
 * @param {object} intake  - 오늘 섭취량 { grain, protein, ... }
 * @param {object} goals   - 목표 교환단위 { grain, protein, ... }
 * @returns {number}  0.0 ~ 1.0
 */
export const calculateCompletion = (intake, goals) => {
  const keys = ['grain', 'protein', 'vegetable', 'fat', 'milk', 'fruit'];
  let total = 0;

  keys.forEach((key) => {
    const eaten = intake[key] ?? 0;
    const target = goals[key] > 0 ? goals[key] : 1;
    const ratio = eaten / target;
    total += Math.min(ratio, 1.0); // 초과는 1로 제한
  });

  return total / keys.length;
};

/**
 * 각 식품군별 달성률 계산
 *
 * @param {object} intake
 * @param {object} goals
 * @returns {object} { grain: 0.75, protein: 1.0, ... }
 */
export const calculateGroupRatios = (intake, goals) => {
  const keys = ['grain', 'protein', 'vegetable', 'fat', 'milk', 'fruit'];
  const result = {};

  keys.forEach((key) => {
    const eaten = intake[key] ?? 0;
    const target = goals[key] > 0 ? goals[key] : 1;
    result[key] = Math.min(eaten / target, 1.0);
  });

  return result;
};

/**
 * 오늘 목표 완전 달성 여부
 * 6개 식품군 모두 목표치 이상 섭취했는지 확인
 *
 * @param {object} intake
 * @param {object} goals
 * @returns {boolean}
 */
export const isGoalAchieved = (intake, goals) => {
  const keys = ['grain', 'protein', 'vegetable', 'fat', 'milk', 'fruit'];
  return keys.every((key) => (intake[key] ?? 0) >= goals[key]);
};
