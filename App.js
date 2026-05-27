// ─────────────────────────────────────────────────────────────────
// App.js  —  앱의 정문 (Entry Point)
//
// AppProvider: 전역 상태(Context)를 모든 화면에 공급
// StatusBar:   상단 상태바 스타일 설정
// RootNavigator: 온보딩/메인 화면 분기 + 네비게이션 컨테이너
// ─────────────────────────────────────────────────────────────────

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';

import { AppProvider }       from './src/store/AppContext';
import RootNavigator         from './src/navigation/RootNavigator';
import { setupNotifications } from './src/utils/notifications';

export default function App() {
  // 앱 시작 시 1회: 알림 채널/핸들러 초기화 (권한 요청은 설정에서 켤 때 진행)
  useEffect(() => {
    setupNotifications().catch((e) => console.warn('[App] 알림 초기화 실패:', e));
  }, []);

  return (
    // AppProvider가 모든 화면을 감싸야 useApp() 훅을 쓸 수 있음
    <AppProvider>
      <StatusBar style="dark" backgroundColor="transparent" translucent />
      <RootNavigator />
    </AppProvider>
  );
}
