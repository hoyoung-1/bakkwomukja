// ─────────────────────────────────────────────────────────────────
// AppContext.jsx  —  앱 전체 상태 관리 (두뇌)
//
// 구조 설명:
//   1. initialState   : 앱이 처음 켜졌을 때의 기본값
//   2. reducer        : 액션에 따라 상태를 어떻게 바꿀지 정의
//   3. AppProvider    : 모든 화면을 감싸는 Context 공급자
//   4. useApp         : 어떤 컴포넌트에서든 상태에 접근하는 커스텀 훅
// ─────────────────────────────────────────────────────────────────

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ACTIONS } from './actions';
import { DEFAULT_GOALS } from '../constants/exchangeTable';
import { getTodayKey } from '../utils/dateUtils';
import { calculateCompletion, isGoalAchieved } from '../utils/calculations';

// ── AsyncStorage에 저장할 때 쓰는 키 이름들 ─────────────────────
const STORAGE_KEYS = {
  PROFILE: '@bkj_profile',
  GOALS:   '@bkj_goals',
  INTAKE:  '@bkj_intake',   // 오늘 하루치 섭취량
  HISTORY: '@bkj_history',  // 날짜별 달성 기록 전체
};

// ── 앱이 처음 켜졌을 때의 기본 상태값 ───────────────────────────
const initialState = {
  isLoading: true,  // AsyncStorage 로드 완료 전까지 true → 로딩 스피너 표시용

  profile: {
    isOnboarded:   false,       // 온보딩 완료 여부 (false면 온보딩 화면으로)
    gender:        'male',
    height:        165,         // cm
    weight:        60,          // kg
    activityLevel: 'moderate',
  },

  goals: { ...DEFAULT_GOALS }, // 기본값 1800kcal 기준

  todayIntake: {
    date:      getTodayKey(), // "YYYY-MM-DD" — 날짜가 바뀌면 리셋 감지용
    grain:     0,
    protein:   0,
    vegetable: 0,
    fat:       0,
    milk:      0,
    fruit:     0,
  },

  history: {},  // { "2026-05-27": { achieved: true, completion: 1.0, intake: {...} } }
};

// ── 리듀서: 액션 종류에 따라 상태를 어떻게 바꿀지 정의 ──────────
function reducer(state, action) {
  switch (action.type) {

    // AsyncStorage 로드 완료 — 모든 데이터를 한 번에 덮어씀
    case ACTIONS.LOAD_ALL_DATA:
      return {
        ...state,
        ...action.payload,
        isLoading: false,
      };

    // 프로필 업데이트 (기존 값에 덮어씀)
    case ACTIONS.SET_PROFILE:
      return {
        ...state,
        profile: { ...state.profile, ...action.payload },
      };

    // 목표 교환단위 통째로 교체
    case ACTIONS.SET_GOALS:
      return {
        ...state,
        goals: { ...action.payload },
      };

    // [+] 또는 [-] 버튼 → delta(+0.5 or -0.5) 만큼 섭취량 변경
    case ACTIONS.UPDATE_INTAKE: {
      const { key, delta } = action.payload;
      const current = state.todayIntake[key] ?? 0;
      const next = Math.max(0, Math.round((current + delta) * 10) / 10);
      // Math.round * 10 / 10 → 부동소수점 오류 방지 (0.1+0.2=0.3000...4 문제)
      return {
        ...state,
        todayIntake: {
          ...state.todayIntake,
          [key]: next,
        },
      };
    }

    // 자정 리셋 — 날짜를 오늘로 갱신하고 섭취량 전부 0
    case ACTIONS.RESET_TODAY_INTAKE:
      return {
        ...state,
        todayIntake: {
          date:      getTodayKey(),
          grain:     0,
          protein:   0,
          vegetable: 0,
          fat:       0,
          milk:      0,
          fruit:     0,
        },
      };

    // 히스토리에 특정 날짜 기록 추가
    case ACTIONS.SAVE_HISTORY_ENTRY: {
      const { date, entry } = action.payload;
      return {
        ...state,
        history: {
          ...state.history,
          [date]: entry,
        },
      };
    }

    default:
      return state;
  }
}

// ── Context 생성 ─────────────────────────────────────────────────
const AppContext = createContext(null);

// ── AppProvider: App.js에서 모든 화면을 이것으로 감쌈 ───────────
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // ── 앱 시작 시: AsyncStorage에서 저장된 데이터 불러오기 ─────
  useEffect(() => {
    loadAllData();
  }, []);

  // ── 상태 변경 시 자동 저장 (각각 별도 useEffect) ────────────
  useEffect(() => {
    if (!state.isLoading) saveToStorage(STORAGE_KEYS.INTAKE, state.todayIntake);
  }, [state.todayIntake, state.isLoading]);

  useEffect(() => {
    if (!state.isLoading) saveToStorage(STORAGE_KEYS.PROFILE, state.profile);
  }, [state.profile, state.isLoading]);

  useEffect(() => {
    if (!state.isLoading) saveToStorage(STORAGE_KEYS.GOALS, state.goals);
  }, [state.goals, state.isLoading]);

  useEffect(() => {
    if (!state.isLoading) saveToStorage(STORAGE_KEYS.HISTORY, state.history);
  }, [state.history, state.isLoading]);

  // ── AsyncStorage 읽기 ─────────────────────────────────────────
  const loadAllData = async () => {
    try {
      const [profileStr, goalsStr, intakeStr, historyStr] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.PROFILE),
        AsyncStorage.getItem(STORAGE_KEYS.GOALS),
        AsyncStorage.getItem(STORAGE_KEYS.INTAKE),
        AsyncStorage.getItem(STORAGE_KEYS.HISTORY),
      ]);

      const today          = getTodayKey();
      const savedProfile   = profileStr  ? JSON.parse(profileStr)  : null;
      const savedGoals     = goalsStr    ? JSON.parse(goalsStr)    : DEFAULT_GOALS;
      let   savedIntake    = intakeStr   ? JSON.parse(intakeStr)   : null;
      const savedHistory   = historyStr  ? JSON.parse(historyStr)  : {};

      // ── 날짜가 바뀌었으면 (자정을 지났으면): 어제 기록 저장 후 초기화
      if (savedIntake && savedIntake.date !== today) {
        const yesterday = savedIntake.date;
        const { date: _removed, ...intakeData } = savedIntake; // date 키 제거

        savedHistory[yesterday] = {
          achieved:   isGoalAchieved(intakeData, savedGoals),
          completion: calculateCompletion(intakeData, savedGoals),
          intake:     intakeData,
        };

        // 히스토리 즉시 저장
        await AsyncStorage.setItem(
          STORAGE_KEYS.HISTORY,
          JSON.stringify(savedHistory),
        );

        // 오늘 섭취량 초기화
        savedIntake = {
          date: today, grain: 0, protein: 0,
          vegetable: 0, fat: 0, milk: 0, fruit: 0,
        };
      }

      dispatch({
        type: ACTIONS.LOAD_ALL_DATA,
        payload: {
          profile:     savedProfile ?? initialState.profile,
          goals:       savedGoals,
          todayIntake: savedIntake ?? { date: today, grain: 0, protein: 0, vegetable: 0, fat: 0, milk: 0, fruit: 0 },
          history:     savedHistory,
        },
      });

    } catch (error) {
      console.error('[AppContext] 데이터 로드 실패:', error);
      // 에러 시에도 isLoading을 false로 전환해야 앱이 멈추지 않음
      dispatch({ type: ACTIONS.LOAD_ALL_DATA, payload: {} });
    }
  };

  // ── AsyncStorage 쓰기 헬퍼 ───────────────────────────────────
  const saveToStorage = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`[AppContext] 저장 실패 (${key}):`, e);
    }
  };

  // ── 오늘 기록을 히스토리에 수동 저장 (앱 포그라운드 복귀 시 호출) ─
  const saveTodayToHistory = useCallback(async () => {
    const today = state.todayIntake.date;
    const { date: _removed, ...intakeData } = state.todayIntake;

    dispatch({
      type: ACTIONS.SAVE_HISTORY_ENTRY,
      payload: {
        date: today,
        entry: {
          achieved:   isGoalAchieved(intakeData, state.goals),
          completion: calculateCompletion(intakeData, state.goals),
          intake:     intakeData,
        },
      },
    });
  }, [state.todayIntake, state.goals]);

  return (
    <AppContext.Provider value={{ state, dispatch, saveTodayToHistory }}>
      {children}
    </AppContext.Provider>
  );
}

// ── useApp 커스텀 훅 ─────────────────────────────────────────────
// 모든 화면/컴포넌트에서 이렇게 가져다 씀:
//   const { state, dispatch } = useApp();
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp은 반드시 AppProvider 안에서 사용해야 합니다.');
  }
  return context;
};
