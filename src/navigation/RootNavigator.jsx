// ─────────────────────────────────────────────────────────────────
// RootNavigator.jsx  —  앱의 최상위 네비게이터
//
// 역할:
//   isOnboarded(온보딩 완료 여부)에 따라
//   ① 처음 실행 → OnboardingScreen 보여줌
//   ② 이미 설정 → MainTabNavigator (하단 탭 화면들) 보여줌
//
// isLoading 중에는 로딩 스피너를 표시.
// ─────────────────────────────────────────────────────────────────

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useApp } from '../store/AppContext';
import MainTabNavigator from './MainTabNavigator';
import OnboardingScreen from '../screens/OnboardingScreen';
import { COLORS } from '../constants/theme';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { state } = useApp();

  // AsyncStorage 데이터 로딩 중 — 스피너 표시
  if (state.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        {!state.profile.isOnboarded ? (
          // 온보딩 미완료 → 온보딩 화면
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          // 온보딩 완료 → 메인 탭 화면
          <Stack.Screen name="Main" component={MainTabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
