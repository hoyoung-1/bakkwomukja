// ─────────────────────────────────────────────────────────────────
// CharacterStage.jsx  —  캐릭터 무대 (달성률에 따라 상태 변화)
//
// 픽셀 아트 에셋이 없으므로 우선 이모지 + 색상 박스로 구현.
// 나중에 Image 컴포넌트로 교체하면 됨.
//
// 4단계 상태:
//   dead    (0%)       : 🤒 꼬질꼬질
//   hungry  (1~49%)    : 😔 허기진
//   normal  (50~99%)   : 😊 나름 건강함
//   healthy (100%)     : ✨🐶✨ 뽀득뽀득!
// ─────────────────────────────────────────────────────────────────

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';

// 상태별 디자인 설정
const CHARACTER_CONFIGS = {
  dead: {
    mainEmoji:  '🤒',
    extraLeft:  null,
    extraRight: null,
    label:      '꼬질꼬질...',
    subLabel:   '뭐라도 좀 먹어요 😢',
    bgColor:    '#D7CCC8',
    dotColor:   '#A1887F',
    textColor:  '#6D4C41',
  },
  hungry: {
    mainEmoji:  '🐶',
    extraLeft:  '😔',
    extraRight: null,
    label:      '허기져요',
    subLabel:   '조금 더 먹어볼까요?',
    bgColor:    '#FFE0B2',
    dotColor:   '#FF9800',
    textColor:  '#E65100',
  },
  normal: {
    mainEmoji:  '🐶',
    extraLeft:  '😊',
    extraRight: null,
    label:      '잘 하고 있어요!',
    subLabel:   '거의 다 왔어요 💪',
    bgColor:    '#C8E6C9',
    dotColor:   '#4CAF50',
    textColor:  '#2E7D32',
  },
  healthy: {
    mainEmoji:  '🐶',
    extraLeft:  '✨',
    extraRight: '✨',
    label:      '완벽한 하루!',
    subLabel:   '뽀득뽀득~ 목표 달성! 🎉',
    bgColor:    '#FFF9C4',
    dotColor:   '#FFD700',
    textColor:  '#F57F17',
  },
};

/**
 * 달성률(0.0~1.0)을 상태 이름으로 변환
 */
function getStateName(completion) {
  if (completion === 0)    return 'dead';
  if (completion < 0.5)   return 'hungry';
  if (completion < 1.0)   return 'normal';
  return 'healthy';
}

/**
 * @param {number} completion  - 0.0 ~ 1.0 전체 달성률
 */
export default function CharacterStage({ completion = 0 }) {
  const stateName   = getStateName(completion);
  const config      = CHARACTER_CONFIGS[stateName];
  const percentage  = Math.round(completion * 100);
  const isHealthy   = stateName === 'healthy';

  return (
    <View style={[styles.container, { backgroundColor: config.bgColor }]}>

      {/* 배경 장식 원들 — 픽셀아트 느낌의 포인트 */}
      <View style={[styles.decorCircle, styles.circle1, { backgroundColor: config.dotColor + '30' }]} />
      <View style={[styles.decorCircle, styles.circle2, { backgroundColor: config.dotColor + '20' }]} />
      <View style={[styles.decorCircle, styles.circle3, { backgroundColor: config.dotColor + '15' }]} />

      {/* 달성률 배지 (우측 상단) */}
      <View style={[styles.badge, { backgroundColor: config.dotColor }]}>
        <Text style={styles.badgeText}>{percentage}%</Text>
      </View>

      {/* 캐릭터 이모지 영역 */}
      <View style={styles.characterArea}>
        {config.extraLeft && (
          <Text style={[styles.sideEmoji, isHealthy && styles.sparkle]}>
            {config.extraLeft}
          </Text>
        )}
        <Text style={[styles.mainEmoji, isHealthy && styles.mainEmojiHealthy]}>
          {config.mainEmoji}
        </Text>
        {config.extraRight && (
          <Text style={[styles.sideEmoji, isHealthy && styles.sparkle]}>
            {config.extraRight}
          </Text>
        )}
      </View>

      {/* 상태 텍스트 */}
      <Text style={[styles.label, { color: config.textColor }]}>
        {config.label}
      </Text>
      <Text style={styles.subLabel}>{config.subLabel}</Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius:    BORDER_RADIUS.lg,
    marginHorizontal: SPACING.md,
    marginVertical:  SPACING.sm,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    alignItems:      'center',
    justifyContent:  'center',
    minHeight:       200,
    overflow:        'hidden',    // 장식 원이 밖으로 나가지 않도록
    position:        'relative',
    // 그림자
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.1,
    shadowRadius:    8,
    elevation:       4,
  },

  // 배경 장식 원
  decorCircle: {
    position:     'absolute',
    borderRadius: BORDER_RADIUS.full,
  },
  circle1: { width: 100, height: 100, top: -30,  right: -20 },
  circle2: { width: 70,  height: 70,  bottom: -20, left: 10  },
  circle3: { width: 50,  height: 50,  top: 20,   left: -15  },

  // 달성률 배지
  badge: {
    position:        'absolute',
    top:             SPACING.md,
    right:           SPACING.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical:  3,
    borderRadius:    BORDER_RADIUS.full,
  },
  badgeText: {
    fontSize:   FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color:      COLORS.white,
  },

  // 캐릭터 이모지 행
  characterArea: {
    flexDirection:  'row',
    alignItems:     'center',
    marginBottom:   SPACING.sm,
    gap:            SPACING.sm,
  },
  mainEmoji: {
    fontSize: 80,
    textAlign: 'center',
  },
  mainEmojiHealthy: {
    fontSize: 80,
  },
  sideEmoji: {
    fontSize: 28,
  },
  sparkle: {
    fontSize: 32,
  },

  // 텍스트
  label: {
    fontSize:   FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    marginBottom: 4,
    textAlign:  'center',
  },
  subLabel: {
    fontSize:  FONTS.sizes.sm,
    color:     COLORS.textSecondary,
    textAlign: 'center',
  },
});
