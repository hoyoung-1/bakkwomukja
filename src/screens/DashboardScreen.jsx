// ─────────────────────────────────────────────────────────────────
// DashboardScreen.jsx  —  메인 대시보드 화면
//
// 상단: 앱 제목 + 날짜 헤더
// 중단: CharacterStage (달성률에 따라 캐릭터 변화)
// 하단: FoodGroupRow × 6 (스크롤 가능)
// ─────────────────────────────────────────────────────────────────

import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
} from 'react-native';

import { useApp }          from '../store/AppContext';
import { FOOD_GROUPS }     from '../constants/foodGroups';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { calculateCompletion } from '../utils/calculations';
import { getTodayDisplayString } from '../utils/dateUtils';
import CharacterStage      from '../components/dashboard/CharacterStage';
import FoodGroupRow        from '../components/dashboard/FoodGroupRow';
import { useDailyReset }   from '../hooks/useDailyReset';

export default function DashboardScreen() {
  const { state } = useApp();

  // 자정 리셋 감지 자동 훅 (포그라운드 복귀 시 날짜 체크)
  useDailyReset();

  // 전체 달성률 (0.0 ~ 1.0)
  const completion = calculateCompletion(state.todayIntake, state.goals);

  // 오늘 달성한 식품군 수
  const achievedCount = FOOD_GROUPS.filter(
    (g) => (state.todayIntake[g.key] ?? 0) >= state.goals[g.key]
  ).length;

  const todayStr = getTodayDisplayString();

  return (
    <SafeAreaView style={styles.safe}>

      {/* ── 헤더 바 ─────────────────────────────────────────── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>바꿔먹자 🥗</Text>
          <Text style={styles.dateText}>{todayStr}</Text>
        </View>
        <View style={styles.kcalBadge}>
          <Text style={styles.kcalValue}>{state.goals.totalCalories}</Text>
          <Text style={styles.kcalUnit}>kcal/일</Text>
        </View>
      </View>

      {/* ── 스크롤 가능한 본문 ────────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* 캐릭터 무대 */}
        <CharacterStage completion={completion} />

        {/* 식품군 리스트 헤더 */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>오늘의 식품교환단위</Text>
          <View style={styles.progressChip}>
            <Text style={styles.progressChipText}>
              {achievedCount} / {FOOD_GROUPS.length} 달성
            </Text>
          </View>
        </View>

        {/* 안내 문구 (처음 쓰는 사람을 위해) */}
        {achievedCount === 0 && (
          <View style={styles.guideBox}>
            <Text style={styles.guideText}>
              💡 [+] 버튼으로 0.5 단위씩 추가할 수 있어요
            </Text>
          </View>
        )}

        {/* 6개 식품군 행 */}
        {FOOD_GROUPS.map((group) => (
          <FoodGroupRow key={group.key} group={group} />
        ))}

        {/* 전체 달성 시 축하 메시지 */}
        {achievedCount === FOOD_GROUPS.length && (
          <View style={styles.celebrateBox}>
            <Text style={styles.celebrateText}>
              🎉 오늘 목표를 모두 달성했어요! 내일도 화이팅!
            </Text>
          </View>
        )}

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // ── 상단 헤더 바
  header: {
    flexDirection:    'row',
    justifyContent:   'space-between',
    alignItems:       'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical:  SPACING.md,
    backgroundColor:  COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  appTitle: {
    fontSize:   FONTS.sizes.xl,
    fontWeight: FONTS.weights.heavy,
    color:      COLORS.primary,
  },
  dateText: {
    fontSize:  FONTS.sizes.sm,
    color:     COLORS.textSecondary,
    marginTop: 2,
  },
  kcalBadge: {
    backgroundColor: COLORS.primaryLight,
    borderRadius:    BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical:  SPACING.xs,
    alignItems:      'center',
  },
  kcalValue: {
    fontSize:   FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color:      COLORS.primaryDark,
  },
  kcalUnit: {
    fontSize: FONTS.sizes.xs,
    color:    COLORS.primaryDark,
  },

  // ── 스크롤 영역
  scroll: { flex: 1 },
  scrollContent: { paddingTop: SPACING.sm },

  // ── 식품군 리스트 헤더
  listHeader: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  listTitle: {
    fontSize:   FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color:      COLORS.text,
  },
  progressChip: {
    backgroundColor: COLORS.primaryLight,
    borderRadius:    BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical:  3,
  },
  progressChipText: {
    fontSize:   FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color:      COLORS.primaryDark,
  },

  // ── 안내 문구
  guideBox: {
    marginHorizontal: SPACING.md,
    marginBottom:     SPACING.sm,
    padding:          SPACING.sm,
    backgroundColor:  COLORS.accentLight,
    borderRadius:     BORDER_RADIUS.md,
  },
  guideText: {
    fontSize:  FONTS.sizes.sm,
    color:     COLORS.accentDark,
    textAlign: 'center',
  },

  // ── 전체 달성 축하 메시지
  celebrateBox: {
    marginHorizontal: SPACING.md,
    marginTop:        SPACING.sm,
    padding:          SPACING.md,
    backgroundColor:  '#FFF9C4',
    borderRadius:     BORDER_RADIUS.md,
    borderWidth:      1,
    borderColor:      '#FFD700',
  },
  celebrateText: {
    fontSize:   FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color:      '#F57F17',
    textAlign:  'center',
    lineHeight: 24,
  },
});
