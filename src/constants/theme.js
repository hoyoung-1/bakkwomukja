// ─────────────────────────────────────────────────────────────────
// theme.js  —  앱 전체의 디자인 규격 (색상, 폰트, 여백, 터치 크기)
// 갤럭시 S23 울트라 (6.8인치, 360dp 폭) 기준으로 넉넉하게 설정
// ─────────────────────────────────────────────────────────────────

export const COLORS = {
  // ── 메인 색상 (초록 계열)
  primary:      '#4CAF50',
  primaryDark:  '#388E3C',
  primaryLight: '#C8E6C9',

  // ── 포인트 색상 (오렌지 — 목표 달성, 강조)
  accent:       '#FF9800',
  accentDark:   '#F57C00',
  accentLight:  '#FFE0B2',

  // ── 배경/서피스
  background:   '#F5F5F0',   // 따뜻한 아이보리 배경
  surface:      '#FFFFFF',   // 카드, 입력칸 등 흰 배경

  // ── 텍스트
  text:          '#1A1A2E',  // 주 텍스트 (거의 검정)
  textSecondary: '#666680',  // 보조 텍스트 (회색)
  textLight:     '#AAAACC',  // 힌트, 플레이스홀더

  // ── 구분선/테두리
  border:        '#E0E0EF',

  // ── 6가지 식품군 대표 색상
  grain:      '#F4A261',   // 곡류  — 황금색
  protein:    '#E76F51',   // 어육류 — 살구색
  vegetable:  '#52B788',   // 채소  — 연두색
  fat:        '#FFB703',   // 지방  — 노란색
  milk:       '#48CAE4',   // 우유  — 하늘색
  fruit:      '#C77DFF',   // 과일  — 보라색

  // ── 식품군 배경색 (연한 버전)
  grainBg:     '#FFF3E0',
  proteinBg:   '#FBE9E7',
  vegetableBg: '#E8F5E9',
  fatBg:       '#FFFDE7',
  milkBg:      '#E0F7FA',
  fruitBg:     '#F3E5F5',

  // ── 상태
  success: '#4CAF50',
  danger:  '#F44336',
  warning: '#FFC107',

  // ── 기본
  white: '#FFFFFF',
  black: '#000000',
};

// ── 폰트 크기 & 굵기
export const FONTS = {
  sizes: {
    xs:   11,
    sm:   13,
    md:   15,
    lg:   18,
    xl:   22,
    xxl:  28,
    xxxl: 36,
  },
  weights: {
    regular: '400',
    medium:  '500',
    bold:    '700',
    heavy:   '900',
  },
};

// ── 여백 (spacing scale)
export const SPACING = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

// ── 모서리 둥글기
export const BORDER_RADIUS = {
  sm:   6,
  md:   12,
  lg:   20,
  xl:   30,
  full: 9999,
};

// ── 터치 영역 최소 높이
// S23 울트라처럼 큰 폰일수록 넉넉하게 잡아야 오터치 없음
export const TOUCH_TARGET = {
  min:         44,   // iOS 권장 최소값
  comfortable: 56,   // 일반 버튼
  large:       64,   // 입력칸, 주요 버튼
};
