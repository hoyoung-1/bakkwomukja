// ─────────────────────────────────────────────────────────────────
// useDailyReset.js  —  자정 감지 & 자동 초기화 훅
//
// 동작 방식:
//   앱이 백그라운드(잠금 화면 등)에서 포그라운드로 돌아올 때
//   오늘 날짜와 저장된 날짜를 비교.
//   날짜가 다르면 → 어제 기록을 히스토리에 저장 → 카운터 0 초기화
//
// 왜 "포그라운드 복귀 시" 체크하나?
//   자정에 정확히 타이머를 맞추면 배터리 최적화로 인해
//   안드로이드에서 타이머가 꺼질 수 있음.
//   사용자가 다음날 앱을 열 때 체크하는 게 더 안정적.
// ─────────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useApp } from '../store/AppContext';
import { getTodayKey } from '../utils/dateUtils';
import { ACTIONS } from '../store/actions';

export const useDailyReset = () => {
  const { state, dispatch, saveTodayToHistory } = useApp();
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      // 'inactive' 또는 'background' → 'active' 로 전환될 때만 체크
      const comingToForeground =
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active';

      if (comingToForeground) {
        const today = getTodayKey();

        if (state.todayIntake.date !== today) {
          // 1. 어제 기록을 히스토리에 저장
          await saveTodayToHistory();
          // 2. 오늘 카운터 초기화
          dispatch({ type: ACTIONS.RESET_TODAY_INTAKE });
        }
      }

      appStateRef.current = nextAppState;
    });

    // 컴포넌트 언마운트 시 이벤트 리스너 제거 (메모리 누수 방지)
    return () => subscription?.remove();
  }, [state.todayIntake.date, dispatch, saveTodayToHistory]);
};
