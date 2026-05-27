// ─────────────────────────────────────────────────────────────────
// MainTabNavigator.jsx  —  하단 탭 바 (대시보드 / 달력 / 설정)
// ─────────────────────────────────────────────────────────────────

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import DashboardScreen from '../screens/DashboardScreen';
import HistoryScreen   from '../screens/HistoryScreen';
import GlucoseScreen   from '../screens/GlucoseScreen';
import SettingsScreen  from '../screens/SettingsScreen';
import { COLORS, FONTS, SPACING } from '../constants/theme';

const Tab = createBottomTabNavigator();

// 탭 아이콘 컴포넌트 (이모지 + 라벨)
function TabIcon({ emoji, label, focused }) {
  return (
    <View style={styles.tabIconWrapper}>
      <Text style={[styles.tabEmoji, focused && styles.tabEmojiFocused]}>
        {emoji}
      </Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>
        {label}
      </Text>
    </View>
  );
}

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,          // 기본 라벨 숨김 (TabIcon에서 직접 렌더)
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor:   COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" label="오늘" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📅" label="달력" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Glucose"
        component={GlucoseScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🩸" label="혈당" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="⚙️" label="설정" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopColor:  COLORS.border,
    borderTopWidth:  1,
    height:          72,    // S23 울트라 하단 여백 고려
    paddingBottom:   8,
    paddingTop:      4,
  },
  tabIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: SPACING.xs,
  },
  tabEmoji: {
    fontSize: 24,
    opacity: 0.5,
  },
  tabEmojiFocused: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  tabLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
    marginTop: 2,
    fontWeight: FONTS.weights.medium,
  },
  tabLabelFocused: {
    color: COLORS.primary,
    fontWeight: FONTS.weights.bold,
  },
});
