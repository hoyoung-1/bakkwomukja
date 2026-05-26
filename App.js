// ─────────────────────────────────────────────────────────────────
// App.js  —  앱의 정문 (Entry Point)
//
// AppProvider: 전역 상태(Context)를 모든 화면에 공급
// StatusBar:   상단 상태바 스타일 설정
// RootNavigator: 온보딩/메인 화면 분기 + 네비게이션 컨테이너
// ─────────────────────────────────────────────────────────────────

import React from 'react';
import { StatusBar } from 'expo-status-bar';

import { AppProvider }   from './src/store/AppContext';
import RootNavigator     from './src/navigation/RootNavigator';

export default function App() {
  return (
    // AppProvider가 모든 화면을 감싸야 useApp() 훅을 쓸 수 있음
    <AppProvider>
      <StatusBar style="dark" backgroundColor="transparent" translucent />
      <RootNavigator />
    </AppProvider>
  );
}
