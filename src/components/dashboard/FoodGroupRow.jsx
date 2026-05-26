// ─────────────────────────────────────────────────────────────────
// FoodGroupRow.jsx  —  식품군 한 행 컴포넌트
//
// 구성: [이모지 + 이름] | [진행바 + 수치] | [[−] [+]]
//
// S23 울트라 기준 minHeight: 72 으로 터치 실수 방지
// ─────────────────────────────────────────────────────────────────

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import CounterButton from '../common/CounterButton';
import ProgressBar   from '../common/ProgressBar';
import { useApp }    from '../../store/AppContext';
import { ACTIONS }   from '../../store/actions';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';

/**
 * @param {object} group  - foodGroups.js의 항목 1개
 *   { key, name, description, emoji, color, bgColor }
 */
export default function FoodGroupRow({ group }) {
  const { state, dispatch } = useApp();

  const intake = state.todayIntake[group.key] ?? 0;
  const goal   = state.goals[group.key] ?? 1;
  const ratio  = Math.min(intake / goal, 1);
  const isDone = intake >= goal;

  // 섭취량을 읽기 좋은 문자열로 변환
  // 정수면 "3", 소수면 "3.5"
  const intakeStr = intake % 1 === 0 ? String(intake) : intake.toFixed(1);

  const handlePlus = () => {
    dispatch({ type: ACTIONS.UPDATE_INTAKE, payload: { key: group.key, delta: +0.5 } });
  };

  const handleMinus = () => {
    dispatch({ type: ACTIONS.UPDATE_INTAKE, payload: { key: group.key, delta: -0.5 } });
  };

  return (
    <View
      style={[
        styles.container,
        { borderLeftColor: group.color },
        isDone && styles.containerDone,
      ]}
    >
      {/* ── 왼쪽: 이모지 박스 + 식품군 이름 ─────────────────── */}
      <View style={styles.labelSection}>
        <View style={[styles.emojiBox, { backgroundColor: group.bgColor }]}>
          <Text style={styles.emoji}>{group.emoji}</Text>
        </View>
        <View style={styles.nameBox}>
          <Text style={styles.name}>{group.name}</Text>
          <Text style={styles.description} numberOfLines={1}>
            {group.description}
          </Text>
        </View>
      </View>

      {/* ── 중간: 진행 바 + "섭취 / 목표" 수치 ─────────────── */}
      <View style={styles.progressSection}>
        <ProgressBar ratio={ratio} color={group.color} height={8} />

        <View style={styles.countRow}>
          {/* 섭취량 — 달성 시 초록색 강조 */}
          <Text style={[styles.intakeNum, isDone && styles.intakeNumDone]}>
            {intakeStr}
          </Text>
          <Text style={styles.separator}> / </Text>
          <Text style={styles.goalNum}>{goal}</Text>
          <Text style={styles.unit}> 단위</Text>

          {/* 달성 체크 */}
          {isDone && <Text style={styles.checkMark}>  ✓</Text>}
        </View>
      </View>

      {/* ── 오른쪽: [-] [+] 버튼 ─────────────────────────────── */}
      <View style={styles.buttonSection}>
        <CounterButton type="minus" onPress={handleMinus} disabled={intake <= 0} />
        <View style={styles.buttonGap} />
        <CounterButton type="plus" onPress={handlePlus} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection:  'row',
    alignItems:     'center',
    backgroundColor: COLORS.surface,
    borderRadius:   BORDER_RADIUS.md,
    borderLeftWidth: 4,
    marginHorizontal: SPACING.md,
    marginBottom:   SPACING.sm,
    padding:        SPACING.md,
    minHeight:      72,    // S23 울트라 터치 안전 높이
    // 그림자
    shadowColor:    '#000',
    shadowOffset:   { width: 0, height: 1 },
    shadowOpacity:  0.06,
    shadowRadius:   4,
    elevation:      2,
  },

  // 달성 완료 시 배경 살짝 강조
  containerDone: {
    backgroundColor: '#F9FBF9',
  },

  // ── 왼쪽 영역
  labelSection: {
    flexDirection: 'row',
    alignItems:    'center',
    width:         96,      // 고정 너비로 중간 영역이 밀리지 않도록
    gap:           SPACING.sm,
  },
  emojiBox: {
    width:         38,
    height:        38,
    borderRadius:  BORDER_RADIUS.sm,
    justifyContent: 'center',
    alignItems:    'center',
  },
  emoji: {
    fontSize: 20,
  },
  nameBox: {
    flex: 1,
  },
  name: {
    fontSize:   FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color:      COLORS.text,
  },
  description: {
    fontSize: FONTS.sizes.xs,
    color:    COLORS.textSecondary,
    marginTop: 1,
  },

  // ── 중간 영역 (진행 바)
  progressSection: {
    flex:             1,
    marginHorizontal: SPACING.sm,
  },
  countRow: {
    flexDirection: 'row',
    alignItems:    'baseline',
    marginTop:     SPACING.xs,
  },
  intakeNum: {
    fontSize:   FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color:      COLORS.text,
  },
  intakeNumDone: {
    color: COLORS.success,
  },
  separator: {
    fontSize: FONTS.sizes.sm,
    color:    COLORS.textLight,
  },
  goalNum: {
    fontSize:   FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color:      COLORS.textSecondary,
  },
  unit: {
    fontSize: FONTS.sizes.xs,
    color:    COLORS.textLight,
  },
  checkMark: {
    fontSize:   FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color:      COLORS.success,
  },

  // ── 오른쪽 버튼 영역
  buttonSection: {
    flexDirection: 'row',
    alignItems:    'center',
  },
  buttonGap: {
    width: SPACING.xs,
  },
});
