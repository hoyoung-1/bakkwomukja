// ─────────────────────────────────────────────────────────────────
// OnboardingScreen.jsx  —  최초 실행 시 신체정보 입력 화면
//
// 입력 항목: 성별 / 키 / 체중 / 활동량
// 완료 버튼 클릭 → 표준체중, 하루 칼로리, 교환단위 목표 계산 후 저장
// ─────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, SafeAreaView,
  KeyboardAvoidingView, Platform,
} from 'react-native';

import { useApp }    from '../store/AppContext';
import { ACTIONS }   from '../store/actions';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, TOUCH_TARGET } from '../constants/theme';
import {
  calculateStandardWeight,
  calculateDailyCalories,
  calculateGoals,
} from '../utils/calculations';

const ACTIVITY_OPTIONS = [
  {
    value: 'light',
    label: '가벼운 활동',
    desc:  '주로 앉아서 생활, 가벼운 산책',
    emoji: '🚶',
  },
  {
    value: 'moderate',
    label: '보통 활동',
    desc:  '하루 30분 이상 꾸준한 운동',
    emoji: '🏃',
  },
  {
    value: 'heavy',
    label: '심한 활동',
    desc:  '매일 격렬한 운동, 육체노동',
    emoji: '🏋️',
  },
];

export default function OnboardingScreen() {
  const { dispatch } = useApp();

  const [gender,        setGender]        = useState('male');
  const [height,        setHeight]        = useState('');
  const [weight,        setWeight]        = useState('');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [errors,        setErrors]        = useState({});

  // ── 유효성 검사 ────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};
    const h = parseFloat(height);
    const w = parseFloat(weight);

    if (!height || isNaN(h) || h < 100 || h > 250) {
      newErrors.height = '키는 100 ~ 250 cm 사이로 입력해주세요';
    }
    if (!weight || isNaN(w) || w < 20 || w > 300) {
      newErrors.weight = '체중은 20 ~ 300 kg 사이로 입력해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── 완료 버튼 핸들러 ───────────────────────────────────────────
  const handleComplete = () => {
    if (!validate()) return;

    const h  = parseFloat(height);
    const w  = parseFloat(weight);
    const sw = calculateStandardWeight(h, gender);
    const dc = calculateDailyCalories(sw, activityLevel);
    const newGoals = calculateGoals(dc);

    // 프로필 저장
    dispatch({
      type: ACTIONS.SET_PROFILE,
      payload: {
        isOnboarded:   true,
        gender,
        height:        h,
        weight:        w,
        activityLevel,
      },
    });

    // 계산된 목표 저장
    dispatch({ type: ACTIONS.SET_GOALS, payload: newGoals });
    // → RootNavigator가 isOnboarded: true를 감지하고 자동으로 메인 화면으로 이동
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* ── 헤더 ─────────────────────────────────────────── */}
          <View style={styles.header}>
            <Text style={styles.appName}>바꿔먹자 🥗</Text>
            <Text style={styles.title}>처음 만나요! 👋</Text>
            <Text style={styles.subtitle}>
              신체 정보를 입력하면{'\n'}
              딱 맞는 하루 식사 목표를 계산해드려요
            </Text>
          </View>

          {/* ── 성별 ─────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>성별</Text>
            <View style={styles.genderRow}>
              {[
                { value: 'male',   label: '남성', emoji: '👨' },
                { value: 'female', label: '여성', emoji: '👩' },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.genderBtn,
                    gender === opt.value && styles.genderBtnActive,
                  ]}
                  onPress={() => setGender(opt.value)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.genderEmoji}>{opt.emoji}</Text>
                  <Text style={[
                    styles.genderLabel,
                    gender === opt.value && styles.genderLabelActive,
                  ]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── 키 ───────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>키</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, errors.height && styles.inputError]}
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
                placeholder="예) 170"
                placeholderTextColor={COLORS.textLight}
                maxLength={5}
                returnKeyType="next"
              />
              <Text style={styles.inputUnit}>cm</Text>
            </View>
            {errors.height ? (
              <Text style={styles.errorText}>{errors.height}</Text>
            ) : null}
          </View>

          {/* ── 체중 ─────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>체중</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, errors.weight && styles.inputError]}
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                placeholder="예) 65"
                placeholderTextColor={COLORS.textLight}
                maxLength={5}
                returnKeyType="done"
              />
              <Text style={styles.inputUnit}>kg</Text>
            </View>
            {errors.weight ? (
              <Text style={styles.errorText}>{errors.weight}</Text>
            ) : null}
          </View>

          {/* ── 활동량 ───────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>활동량</Text>
            {ACTIVITY_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.activityBtn,
                  activityLevel === opt.value && styles.activityBtnActive,
                ]}
                onPress={() => setActivityLevel(opt.value)}
                activeOpacity={0.8}
              >
                <Text style={styles.activityEmoji}>{opt.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[
                    styles.activityLabel,
                    activityLevel === opt.value && styles.activityLabelActive,
                  ]}>
                    {opt.label}
                  </Text>
                  <Text style={styles.activityDesc}>{opt.desc}</Text>
                </View>
                {activityLevel === opt.value && (
                  <Text style={styles.checkIcon}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* ── 완료 버튼 ────────────────────────────────────── */}
          <TouchableOpacity
            style={styles.completeBtn}
            onPress={handleComplete}
            activeOpacity={0.85}
          >
            <Text style={styles.completeBtnText}>목표 계산하고 시작하기 →</Text>
          </TouchableOpacity>

          <View style={{ height: SPACING.xxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    padding: SPACING.lg,
  },

  // ── 헤더
  header: {
    marginBottom: SPACING.xl,
    paddingTop:   SPACING.md,
  },
  appName: {
    fontSize:    FONTS.sizes.sm,
    fontWeight:  FONTS.weights.bold,
    color:       COLORS.primary,
    letterSpacing: 1.5,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize:    FONTS.sizes.xxxl,
    fontWeight:  FONTS.weights.heavy,
    color:       COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize:   FONTS.sizes.md,
    color:      COLORS.textSecondary,
    lineHeight: 26,
  },

  // ── 공통 섹션
  section: {
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    fontSize:     FONTS.sizes.md,
    fontWeight:   FONTS.weights.bold,
    color:        COLORS.text,
    marginBottom: SPACING.sm,
  },

  // ── 성별 버튼
  genderRow: {
    flexDirection: 'row',
    gap:           SPACING.md,
  },
  genderBtn: {
    flex:           1,
    height:         TOUCH_TARGET.large,
    borderRadius:   BORDER_RADIUS.md,
    borderWidth:    2,
    borderColor:    COLORS.border,
    backgroundColor: COLORS.surface,
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            SPACING.sm,
  },
  genderBtnActive: {
    borderColor:     COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  genderEmoji: { fontSize: 22 },
  genderLabel: {
    fontSize:   FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    color:      COLORS.textSecondary,
  },
  genderLabelActive: {
    color:      COLORS.primaryDark,
    fontWeight: FONTS.weights.bold,
  },

  // ── 텍스트 입력
  inputRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           SPACING.sm,
  },
  input: {
    flex:             1,
    height:           TOUCH_TARGET.large,
    backgroundColor:  COLORS.surface,
    borderWidth:      2,
    borderColor:      COLORS.border,
    borderRadius:     BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    fontSize:         FONTS.sizes.xl,
    fontWeight:       FONTS.weights.bold,
    color:            COLORS.text,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  inputUnit: {
    fontSize:   FONTS.sizes.lg,
    fontWeight: FONTS.weights.medium,
    color:      COLORS.textSecondary,
    width:      38,
  },
  errorText: {
    fontSize:  FONTS.sizes.sm,
    color:     COLORS.danger,
    marginTop: SPACING.xs,
  },

  // ── 활동량 버튼
  activityBtn: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           SPACING.md,
    padding:       SPACING.md,
    marginBottom:  SPACING.sm,
    borderRadius:  BORDER_RADIUS.md,
    borderWidth:   2,
    borderColor:   COLORS.border,
    backgroundColor: COLORS.surface,
    minHeight:     TOUCH_TARGET.large,
  },
  activityBtnActive: {
    borderColor:     COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  activityEmoji: { fontSize: 28 },
  activityLabel: {
    fontSize:   FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color:      COLORS.textSecondary,
  },
  activityLabelActive: {
    color: COLORS.primaryDark,
  },
  activityDesc: {
    fontSize:  FONTS.sizes.xs,
    color:     COLORS.textLight,
    marginTop: 2,
  },
  checkIcon: {
    fontSize:   FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color:      COLORS.primary,
  },

  // ── 완료 버튼
  completeBtn: {
    height:          62,
    backgroundColor: COLORS.primary,
    borderRadius:    BORDER_RADIUS.lg,
    justifyContent:  'center',
    alignItems:      'center',
    marginTop:       SPACING.sm,
    shadowColor:     COLORS.primary,
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.35,
    shadowRadius:    10,
    elevation:       6,
  },
  completeBtnText: {
    fontSize:   FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color:      COLORS.white,
    letterSpacing: 0.5,
  },
});
