// ─────────────────────────────────────────────────────────────────
// CounterButton.jsx  —  [+] / [-] 버튼
//
// S23 울트라 기준 손가락 터치 실수를 줄이기 위해
// 실제 시각적 크기보다 hitSlop으로 터치 영역을 넉넉하게 확장.
// ─────────────────────────────────────────────────────────────────

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, BORDER_RADIUS } from '../../constants/theme';

/**
 * @param {'plus'|'minus'} type  - 버튼 종류
 * @param {function}       onPress
 * @param {boolean}        disabled  - true면 비활성화 (섭취량이 0일 때 [-] 비활성)
 */
export default function CounterButton({ type, onPress, disabled = false }) {
  const isPlus = type === 'plus';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isPlus ? styles.plusButton : styles.minusButton,
        disabled && styles.disabledButton,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      // hitSlop: 시각적 버튼 바깥도 터치 가능한 영역 확장 (오터치 방지)
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Text
        style={[
          styles.symbol,
          isPlus ? styles.plusSymbol : styles.minusSymbol,
          disabled && styles.disabledSymbol,
        ]}
      >
        {isPlus ? '+' : '−'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width:          48,
    height:         48,
    borderRadius:   BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems:     'center',
  },

  // [+] 버튼: 초록 배경
  plusButton: {
    backgroundColor: COLORS.primary,
    shadowColor:     COLORS.primary,
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.3,
    shadowRadius:    4,
    elevation:       3,
  },

  // [-] 버튼: 흰 배경 + 테두리
  minusButton: {
    backgroundColor: COLORS.surface,
    borderWidth:     1.5,
    borderColor:     COLORS.border,
  },

  disabledButton: {
    opacity: 0.3,
    elevation: 0,
    shadowOpacity: 0,
  },

  symbol: {
    fontSize:   FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    lineHeight: FONTS.sizes.xl + 6,
    textAlign:  'center',
  },

  plusSymbol:     { color: COLORS.white },
  minusSymbol:    { color: COLORS.text },
  disabledSymbol: { color: COLORS.textLight },
});
