// ─────────────────────────────────────────────────────────────────
// HistoryScreen.jsx  —  성공 달력 화면
//
// 월간 달력 그리드를 표시.
// 목표 달성한 날 → 🐾 도장 표시
// 부분 달성한 날 → 달성률(%) 숫자가 든 원 표시
// 오늘 날짜     → 초록 테두리 강조
// ─────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, ScrollView,
} from 'react-native';

import { useApp }           from '../store/AppContext';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import {
  getCalendarDays,
  WEEKDAY_NAMES,
  getTodayKey,
} from '../utils/dateUtils';

export default function HistoryScreen() {
  const { state } = useApp();

  // 현재 보고 있는 년/월
  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed

  const todayKey  = getTodayKey();
  const days      = getCalendarDays(year, month);

  // 이번 달 달성일 수
  const achievedCount = days.filter(
    (d) => d.isCurrentMonth && state.history[d.key]?.achieved
  ).length;

  // ── 이전/다음 달 이동 ─────────────────────────────────────────
  const handlePrev = () => {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
  };
  const handleNext = () => {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
  };
  // 미래 달로는 넘어가지 않게
  const isCurrentOrFuture =
    year > today.getFullYear() ||
    (year === today.getFullYear() && month >= today.getMonth());

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── 헤더 ─────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.title}>성공 달력 📅</Text>
          <Text style={styles.subtitle}>
            목표를 모두 채운 날에 도장이 찍혀요
          </Text>
        </View>

        {/* ── 월 네비게이션 ────────────────────────────────── */}
        <View style={styles.monthNav}>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={handlePrev}
            activeOpacity={0.7}
          >
            <Text style={styles.navBtnText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.monthInfo}>
            <Text style={styles.monthTitle}>
              {year}년 {month + 1}월
            </Text>
            <Text style={styles.achievedBadge}>
              🏆 {achievedCount}일 달성
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.navBtn, isCurrentOrFuture && styles.navBtnDisabled]}
            onPress={handleNext}
            disabled={isCurrentOrFuture}
            activeOpacity={0.7}
          >
            <Text style={[styles.navBtnText, isCurrentOrFuture && styles.navBtnTextDisabled]}>
              ›
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── 요일 헤더 ────────────────────────────────────── */}
        <View style={styles.weekdayRow}>
          {WEEKDAY_NAMES.map((name, i) => (
            <Text
              key={i}
              style={[
                styles.weekdayText,
                i === 0 && styles.sunday,
                i === 6 && styles.saturday,
              ]}
            >
              {name}
            </Text>
          ))}
        </View>

        {/* ── 달력 그리드 ──────────────────────────────────── */}
        <View style={styles.calendarCard}>
          <View style={styles.calendarGrid}>
            {days.map((day, idx) => {
              const histEntry  = state.history[day.key];
              const isToday    = day.key === todayKey;
              const isAchieved = histEntry?.achieved === true;
              const completion = histEntry?.completion ?? 0;
              const isFuture   = day.key > todayKey;
              const colIndex   = idx % 7; // 0=일, 6=토

              return (
                <View key={idx} style={styles.dayCell}>
                  {day.isCurrentMonth ? (
                    <View style={[styles.dayInner, isToday && styles.todayInner]}>

                      {/* 날짜 숫자 */}
                      <Text style={[
                        styles.dayNum,
                        isToday    && styles.todayNum,
                        colIndex === 0 && styles.sunday,
                        colIndex === 6 && styles.saturday,
                      ]}>
                        {day.date.getDate()}
                      </Text>

                      {/* 달성 도장 or 부분달성 */}
                      {isAchieved ? (
                        <Text style={styles.stamp}>🐾</Text>
                      ) : !isFuture && completion > 0 ? (
                        <View style={styles.partialCircle}>
                          <Text style={styles.partialText}>
                            {Math.round(completion * 100)}
                          </Text>
                        </View>
                      ) : null}

                    </View>
                  ) : (
                    // 이전/다음 달 날짜 — 빈 회색 숫자
                    <Text style={styles.otherMonthNum}>
                      {day.date.getDate()}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* ── 범례 ─────────────────────────────────────────── */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>범례</Text>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <Text style={styles.legendStamp}>🐾</Text>
              <Text style={styles.legendText}>목표 완전 달성</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={styles.legendPartial}>
                <Text style={styles.legendPartialText}>70</Text>
              </View>
              <Text style={styles.legendText}>부분 달성 (70%)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={styles.legendToday} />
              <Text style={styles.legendText}>오늘</Text>
            </View>
          </View>
        </View>

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

  // ── 헤더
  header: {
    padding:       SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  title: {
    fontSize:   FONTS.sizes.xxl,
    fontWeight: FONTS.weights.heavy,
    color:      COLORS.text,
  },
  subtitle: {
    fontSize:  FONTS.sizes.sm,
    color:     COLORS.textSecondary,
    marginTop: SPACING.xs,
  },

  // ── 월 네비게이션
  monthNav: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginHorizontal: SPACING.md,
    marginBottom:   SPACING.md,
    padding:        SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius:   BORDER_RADIUS.lg,
    shadowColor:    '#000',
    shadowOffset:   { width: 0, height: 1 },
    shadowOpacity:  0.06,
    shadowRadius:   4,
    elevation:      2,
  },
  navBtn: {
    width:          44,
    height:         44,
    borderRadius:   BORDER_RADIUS.full,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems:     'center',
  },
  navBtnDisabled: { opacity: 0.3 },
  navBtnText: {
    fontSize:   30,
    fontWeight: FONTS.weights.bold,
    color:      COLORS.text,
    lineHeight: 34,
  },
  navBtnTextDisabled: { color: COLORS.textLight },
  monthInfo: { alignItems: 'center' },
  monthTitle: {
    fontSize:   FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color:      COLORS.text,
  },
  achievedBadge: {
    fontSize:   FONTS.sizes.sm,
    color:      COLORS.primary,
    fontWeight: FONTS.weights.medium,
    marginTop:  2,
  },

  // ── 요일 헤더
  weekdayRow: {
    flexDirection:    'row',
    paddingHorizontal: SPACING.md,
    marginBottom:     SPACING.xs,
  },
  weekdayText: {
    flex:       1,
    textAlign:  'center',
    fontSize:   FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color:      COLORS.textSecondary,
    paddingVertical: SPACING.xs,
  },

  // ── 달력 그리드
  calendarCard: {
    marginHorizontal: SPACING.md,
    backgroundColor:  COLORS.surface,
    borderRadius:     BORDER_RADIUS.lg,
    paddingVertical:  SPACING.sm,
    shadowColor:      '#000',
    shadowOffset:     { width: 0, height: 1 },
    shadowOpacity:    0.06,
    shadowRadius:     4,
    elevation:        2,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    paddingHorizontal: SPACING.xs,
  },

  // ── 날짜 셀
  dayCell: {
    width:          `${100 / 7}%`,
    aspectRatio:    0.9,
    alignItems:     'center',
    justifyContent: 'center',
    padding:        2,
  },
  dayInner: {
    flex:           1,
    width:          '100%',
    alignItems:     'center',
    justifyContent: 'center',
    borderRadius:   BORDER_RADIUS.sm,
    paddingVertical: 4,
  },
  todayInner: {
    backgroundColor: COLORS.primaryLight,
    borderWidth:     2,
    borderColor:     COLORS.primary,
  },
  dayNum: {
    fontSize:   FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color:      COLORS.text,
  },
  todayNum: {
    color:      COLORS.primaryDark,
    fontWeight: FONTS.weights.bold,
  },
  otherMonthNum: {
    fontSize: FONTS.sizes.sm,
    color:    COLORS.textLight,
  },
  sunday:   { color: '#E53935' },
  saturday: { color: '#1565C0' },

  // ── 달성 도장
  stamp: {
    fontSize:  16,
    marginTop: 1,
  },

  // ── 부분 달성 원
  partialCircle: {
    width:          22,
    height:         22,
    borderRadius:   BORDER_RADIUS.full,
    backgroundColor: COLORS.accent + 'BB',
    justifyContent: 'center',
    alignItems:     'center',
    marginTop:      1,
  },
  partialText: {
    fontSize:   8,
    fontWeight: FONTS.weights.bold,
    color:      COLORS.white,
  },

  // ── 범례
  legend: {
    margin:          SPACING.md,
    padding:         SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius:    BORDER_RADIUS.lg,
  },
  legendTitle: {
    fontSize:     FONTS.sizes.sm,
    fontWeight:   FONTS.weights.bold,
    color:        COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           SPACING.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           SPACING.xs,
  },
  legendStamp: { fontSize: 18 },
  legendText: {
    fontSize: FONTS.sizes.sm,
    color:    COLORS.textSecondary,
  },
  legendPartial: {
    width:          22,
    height:         22,
    borderRadius:   BORDER_RADIUS.full,
    backgroundColor: COLORS.accent + 'BB',
    justifyContent: 'center',
    alignItems:     'center',
  },
  legendPartialText: {
    fontSize:   8,
    fontWeight: FONTS.weights.bold,
    color:      COLORS.white,
  },
  legendToday: {
    width:       22,
    height:      22,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.primaryLight,
    borderWidth:  2,
    borderColor:  COLORS.primary,
  },
});
