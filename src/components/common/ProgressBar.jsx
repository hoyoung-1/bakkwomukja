// ─────────────────────────────────────────────────────────────────
// ProgressBar.jsx  —  식품군 달성 진행 바
//
// ratio 0.0 ~ 1.0 → 바 채우기 비율
// 100% 달성 시 색상이 accent(오렌지)로 바뀌어 "완료" 강조
// ─────────────────────────────────────────────────────────────────

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, BORDER_RADIUS } from '../../constants/theme';

/**
 * @param {number}  ratio   - 달성률 (0.0 ~ 1.0)
 * @param {string}  color   - 식품군 대표 색상
 * @param {number}  height  - 바 높이 (px)
 */
export default function ProgressBar({ ratio = 0, color = COLORS.primary, height = 7 }) {
  const clamped   = Math.min(Math.max(ratio, 0), 1); // 0~1 사이로 제한
  const isComplete = clamped >= 1.0;
  const fillColor  = isComplete ? COLORS.accent : color; // 완료 시 오렌지

  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <View
        style={[
          styles.fill,
          {
            width:        `${clamped * 100}%`,
            height,
            borderRadius: height / 2,
            backgroundColor: fillColor,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width:           '100%',
    backgroundColor: COLORS.border,
    overflow:        'hidden',
  },
  fill: {
    // 너비와 색상은 인라인으로 적용
  },
});
