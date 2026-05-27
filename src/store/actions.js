// ─────────────────────────────────────────────────────────────────
// actions.js  —  상태를 바꾸는 액션 이름 상수 모음
//
// 왜 상수로 관리하나?
//   'UPDTAE_INTAKE' 처럼 오타가 나면 디버깅이 힘들기 때문.
//   상수를 import해서 쓰면 오타 시 즉시 에러가 나서 바로 알 수 있음.
// ─────────────────────────────────────────────────────────────────

export const ACTIONS = {
  /** AsyncStorage에서 데이터 불러오기 완료 */
  LOAD_ALL_DATA: 'LOAD_ALL_DATA',

  /** 사용자 프로필(성별, 키, 체중, 활동량) 업데이트 */
  SET_PROFILE: 'SET_PROFILE',

  /** 식품교환단위 목표치 업데이트 */
  SET_GOALS: 'SET_GOALS',

  /** 특정 식품군의 오늘 섭취량을 delta만큼 증감 (+0.5 또는 -0.5) */
  UPDATE_INTAKE: 'UPDATE_INTAKE',

  /** 자정 리셋 — 오늘 섭취량을 모두 0으로 초기화 */
  RESET_TODAY_INTAKE: 'RESET_TODAY_INTAKE',

  /** 특정 날짜의 달성 기록을 히스토리에 저장 */
  SAVE_HISTORY_ENTRY: 'SAVE_HISTORY_ENTRY',

  /** 혈당 기록 1건 추가 */
  ADD_GLUCOSE: 'ADD_GLUCOSE',

  /** 혈당 기록 1건 삭제 (id 기준) */
  DELETE_GLUCOSE: 'DELETE_GLUCOSE',

  /** 식사 알림 설정 업데이트 (enabled / times) */
  SET_MEAL_REMINDERS: 'SET_MEAL_REMINDERS',
};
