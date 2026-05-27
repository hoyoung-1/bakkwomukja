// ─────────────────────────────────────────────────────────────────
// SettingsScreen.jsx  —  신체정보 재설정 화면
//
// 현재 목표 요약 카드 + 수정 폼 + 저장 버튼
// 저장 시 Alert으로 새 계산 결과를 보여주고 확인받음
// ─────────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Switch,
  ScrollView, StyleSheet, SafeAreaView, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';

import { useApp }    from '../store/AppContext';
import { ACTIONS }   from '../store/actions';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, TOUCH_TARGET } from '../constants/theme';
import { FOOD_GROUPS } from '../constants/foodGroups';
import {
  calculateStandardWeight,
  calculateDailyCalories,
  calculateGoals,
} from '../utils/calculations';
import {
  ensureNotificationPermission,
  rescheduleMealReminders,
} from '../utils/notifications';

const TIME_REGEX = /^([01]?\d|2[0-3]):([0-5]\d)$/;
const MEAL_DEFS = [
  { key: 'breakfast', emoji: '🌅', label: '아침' },
  { key: 'lunch',     emoji: '🍱', label: '점심' },
  { key: 'dinner',    emoji: '🍽️', label: '저녁' },
];

const ACTIVITY_OPTIONS = [
  { value: 'light',    label: '가벼운\n활동', emoji: '🚶' },
  { value: 'moderate', label: '보통\n활동',   emoji: '🏃' },
  { value: 'heavy',    label: '심한\n활동',   emoji: '🏋️' },
];

export default function SettingsScreen() {
  const { state, dispatch } = useApp();

  // 현재 프로필 값을 초기값으로
  const [gender,        setGender]        = useState(state.profile.gender);
  const [height,        setHeight]        = useState(String(state.profile.height));
  const [weight,        setWeight]        = useState(String(state.profile.weight));
  const [activityLevel, setActivityLevel] = useState(state.profile.activityLevel);
  const [errors,        setErrors]        = useState({});

  // ── 식사 알림 로컬 상태 (저장하면 시스템 알림 재예약) ────────
  const [mealTimes, setMealTimes] = useState(state.mealReminders.times);
  const reminderEnabled           = state.mealReminders.enabled;

  // 외부에서 mealReminders가 바뀌면(다른 화면에서 dispatch 등) 입력 칸도 동기화
  useEffect(() => {
    setMealTimes(state.mealReminders.times);
  }, [state.mealReminders.times]);

  // 현재 저장된 표준체중 (표시용)
  const currentStdWeight = calculateStandardWeight(
    state.profile.height,
    state.profile.gender,
  );

  // ── 유효성 검사 ────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!height || isNaN(h) || h < 100 || h > 250) {
      newErrors.height = '100 ~ 250 cm';
    }
    if (!weight || isNaN(w) || w < 20 || w > 300) {
      newErrors.weight = '20 ~ 300 kg';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── 식사 알림: 토글 ───────────────────────────────────────────
  const handleToggleReminder = async (next) => {
    if (next) {
      const ok = await ensureNotificationPermission();
      if (!ok) {
        Alert.alert(
          '알림 권한 필요',
          '식사 알림을 받으려면 시스템 설정에서 이 앱의 알림을 허용해주세요.',
        );
        return;
      }
      // 입력된 시간 유효성 검사
      const invalid = MEAL_DEFS.find((m) => !TIME_REGEX.test(mealTimes[m.key]));
      if (invalid) {
        Alert.alert('시간 형식 오류', `${invalid.label} 시간을 HH:MM 형식으로 입력해주세요.`);
        return;
      }
      const payload = { enabled: true, times: mealTimes };
      dispatch({ type: ACTIONS.SET_MEAL_REMINDERS, payload });
      await rescheduleMealReminders({ ...state.mealReminders, ...payload });
      Alert.alert('🔔 알림 켜짐', `아침 ${mealTimes.breakfast} · 점심 ${mealTimes.lunch} · 저녁 ${mealTimes.dinner} 에 알려드릴게요.`);
    } else {
      dispatch({ type: ACTIONS.SET_MEAL_REMINDERS, payload: { enabled: false } });
      await rescheduleMealReminders({ ...state.mealReminders, enabled: false });
    }
  };

  // ── 식사 알림: 시간 변경 후 즉시 재예약 ──────────────────────
  const handleTimeChange = (key, raw) => {
    // 숫자만 받아서 자동으로 콜론 삽입 (HHMM → HH:MM)
    const digits = raw.replace(/[^0-9]/g, '').slice(0, 4);
    const formatted = digits.length >= 3
      ? `${digits.slice(0, 2)}:${digits.slice(2)}`
      : digits;
    setMealTimes((prev) => ({ ...prev, [key]: formatted }));
  };

  const handleSaveReminderTimes = async () => {
    const invalid = MEAL_DEFS.find((m) => !TIME_REGEX.test(mealTimes[m.key]));
    if (invalid) {
      Alert.alert('시간 형식 오류', `${invalid.label} 시간을 HH:MM 형식으로 입력해주세요.`);
      return;
    }
    const payload = { times: mealTimes };
    dispatch({ type: ACTIONS.SET_MEAL_REMINDERS, payload });

    if (reminderEnabled) {
      await rescheduleMealReminders({ ...state.mealReminders, ...payload });
      Alert.alert('✅ 알림 시간 업데이트', `아침 ${mealTimes.breakfast} · 점심 ${mealTimes.lunch} · 저녁 ${mealTimes.dinner}`);
    } else {
      Alert.alert('저장됨', '알림이 꺼져 있어요. 토글을 켜면 적용됩니다.');
    }
  };

  // ── 저장 ───────────────────────────────────────────────────────
  const handleSave = () => {
    if (!validate()) return;

    const h  = parseFloat(height);
    const w  = parseFloat(weight);
    const sw = calculateStandardWeight(h, gender);
    const dc = calculateDailyCalories(sw, activityLevel);
    const newGoals = calculateGoals(dc);

    // 새 계산 결과를 Alert으로 보여주고 확인 받기
    Alert.alert(
      '목표 재계산 결과',
      [
        `표준체중: ${sw} kg`,
        `하루 필요 칼로리: ${dc} kcal`,
        '',
        `곡류 ${newGoals.grain}단위 · 어육류 ${newGoals.protein}단위`,
        `채소 ${newGoals.vegetable}단위 · 지방 ${newGoals.fat}단위`,
        `우유 ${newGoals.milk}단위 · 과일 ${newGoals.fruit}단위`,
        '',
        '이 목표로 업데이트할까요?',
      ].join('\n'),
      [
        { text: '취소', style: 'cancel' },
        {
          text: '저장',
          onPress: () => {
            dispatch({
              type: ACTIONS.SET_PROFILE,
              payload: { gender, height: h, weight: w, activityLevel },
            });
            dispatch({ type: ACTIONS.SET_GOALS, payload: newGoals });
            Alert.alert('✅ 저장 완료', '신체 정보와 목표가 업데이트됐어요!');
          },
        },
      ],
    );
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
            <Text style={styles.title}>설정 ⚙️</Text>
          </View>

          {/* ── 현재 목표 요약 카드 ───────────────────────────── */}
          <View style={styles.summaryCard}>
            <Text style={styles.cardTitle}>현재 목표 요약</Text>

            {/* 표준체중 + 칼로리 */}
            <View style={styles.summaryStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{currentStdWeight} kg</Text>
                <Text style={styles.statLabel}>표준체중</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{state.goals.totalCalories}</Text>
                <Text style={styles.statLabel}>kcal / 일</Text>
              </View>
            </View>

            {/* 식품군별 목표 칩 */}
            <View style={styles.goalChips}>
              {FOOD_GROUPS.map((g) => (
                <View
                  key={g.key}
                  style={[styles.goalChip, { backgroundColor: g.bgColor }]}
                >
                  <Text style={styles.chipEmoji}>{g.emoji}</Text>
                  <Text style={[styles.chipName, { color: g.color }]}>{g.name}</Text>
                  <Text style={styles.chipValue}>{state.goals[g.key]}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ── 섹션 제목 ─────────────────────────────────────── */}
          <Text style={styles.sectionTitle}>신체 정보 수정</Text>

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
                maxLength={5}
              />
              <Text style={styles.inputUnit}>cm</Text>
            </View>
            {errors.height ? (
              <Text style={styles.errorText}>{errors.height} 사이로 입력해주세요</Text>
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
                maxLength={5}
              />
              <Text style={styles.inputUnit}>kg</Text>
            </View>
            {errors.weight ? (
              <Text style={styles.errorText}>{errors.weight} 사이로 입력해주세요</Text>
            ) : null}
          </View>

          {/* ── 활동량 ───────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>활동량</Text>
            <View style={styles.activityRow}>
              {ACTIVITY_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.activityChip,
                    activityLevel === opt.value && styles.activityChipActive,
                  ]}
                  onPress={() => setActivityLevel(opt.value)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.activityEmoji}>{opt.emoji}</Text>
                  <Text style={[
                    styles.activityLabel,
                    activityLevel === opt.value && styles.activityLabelActive,
                  ]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── 저장 버튼 ────────────────────────────────────── */}
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>목표 재계산 및 저장 💾</Text>
          </TouchableOpacity>

          {/* ── 식사 알림 섹션 ──────────────────────────────── */}
          <Text style={[styles.sectionTitle, { marginTop: SPACING.xl }]}>식사 알림 🔔</Text>

          <View style={styles.reminderCard}>
            <View style={styles.reminderToggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.reminderToggleLabel}>매일 식사 시간 알림</Text>
                <Text style={styles.reminderToggleHint}>
                  앱이 꺼져 있어도 알려드려요
                </Text>
              </View>
              <Switch
                value={reminderEnabled}
                onValueChange={handleToggleReminder}
                trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
                thumbColor={reminderEnabled ? COLORS.primary : COLORS.textLight}
              />
            </View>

            <View style={styles.reminderDivider} />

            {MEAL_DEFS.map((m) => (
              <View key={m.key} style={styles.timeRow}>
                <Text style={styles.timeLabel}>
                  {m.emoji}  {m.label}
                </Text>
                <TextInput
                  style={styles.timeInput}
                  value={mealTimes[m.key]}
                  onChangeText={(t) => handleTimeChange(m.key, t)}
                  keyboardType="numeric"
                  maxLength={5}
                  placeholder="HH:MM"
                  placeholderTextColor={COLORS.textLight}
                />
              </View>
            ))}

            <TouchableOpacity
              style={styles.reminderSaveBtn}
              onPress={handleSaveReminderTimes}
              activeOpacity={0.85}
            >
              <Text style={styles.reminderSaveBtnText}>알림 시간 저장</Text>
            </TouchableOpacity>
          </View>

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
  scroll: { padding: SPACING.lg },

  // ── 헤더
  header:  { marginBottom: SPACING.lg, paddingTop: SPACING.sm },
  title: {
    fontSize:   FONTS.sizes.xxl,
    fontWeight: FONTS.weights.heavy,
    color:      COLORS.text,
  },

  // ── 요약 카드
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius:    BORDER_RADIUS.lg,
    padding:         SPACING.lg,
    marginBottom:    SPACING.xl,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.08,
    shadowRadius:    6,
    elevation:       3,
  },
  cardTitle: {
    fontSize:     FONTS.sizes.md,
    fontWeight:   FONTS.weights.bold,
    color:        COLORS.text,
    marginBottom: SPACING.md,
  },
  summaryStats: {
    flexDirection:  'row',
    justifyContent: 'space-around',
    marginBottom:   SPACING.md,
    paddingBottom:  SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statItem:  { alignItems: 'center' },
  statValue: {
    fontSize:   FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color:      COLORS.primary,
  },
  statLabel: {
    fontSize:  FONTS.sizes.xs,
    color:     COLORS.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width:      1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  goalChips: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           SPACING.sm,
  },
  goalChip: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             4,
    paddingHorizontal: SPACING.sm,
    paddingVertical:  5,
    borderRadius:    BORDER_RADIUS.full,
  },
  chipEmoji: { fontSize: 13 },
  chipName: {
    fontSize:   FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
  },
  chipValue: {
    fontSize:   FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color:      COLORS.text,
  },

  // ── 섹션 타이틀 구분선
  sectionTitle: {
    fontSize:     FONTS.sizes.lg,
    fontWeight:   FONTS.weights.bold,
    color:        COLORS.text,
    marginBottom: SPACING.md,
    paddingLeft:  SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },

  // ── 공통 섹션
  section: { marginBottom: SPACING.lg },
  sectionLabel: {
    fontSize:     FONTS.sizes.md,
    fontWeight:   FONTS.weights.bold,
    color:        COLORS.text,
    marginBottom: SPACING.sm,
  },

  // ── 성별
  genderRow: { flexDirection: 'row', gap: SPACING.md },
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
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  input: {
    flex:              1,
    height:            TOUCH_TARGET.large,
    backgroundColor:   COLORS.surface,
    borderWidth:       2,
    borderColor:       COLORS.border,
    borderRadius:      BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    fontSize:          FONTS.sizes.xl,
    fontWeight:        FONTS.weights.bold,
    color:             COLORS.text,
  },
  inputError: { borderColor: COLORS.danger },
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

  // ── 활동량 칩
  activityRow: { flexDirection: 'row', gap: SPACING.sm },
  activityChip: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius:   BORDER_RADIUS.md,
    borderWidth:    2,
    borderColor:    COLORS.border,
    backgroundColor: COLORS.surface,
    minHeight:      TOUCH_TARGET.large,
  },
  activityChipActive: {
    borderColor:     COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  activityEmoji: { fontSize: 26, marginBottom: 4 },
  activityLabel: {
    fontSize:   FONTS.sizes.xs,
    fontWeight: FONTS.weights.medium,
    color:      COLORS.textSecondary,
    textAlign:  'center',
    lineHeight: 16,
  },
  activityLabelActive: {
    color:      COLORS.primaryDark,
    fontWeight: FONTS.weights.bold,
  },

  // ── 저장 버튼
  saveBtn: {
    height:          62,
    backgroundColor: COLORS.primary,
    borderRadius:    BORDER_RADIUS.lg,
    justifyContent:  'center',
    alignItems:      'center',
    shadowColor:     COLORS.primary,
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.35,
    shadowRadius:    10,
    elevation:       6,
  },
  saveBtnText: {
    fontSize:   FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color:      COLORS.white,
  },

  // ── 식사 알림 카드
  reminderCard: {
    backgroundColor: COLORS.surface,
    borderRadius:    BORDER_RADIUS.lg,
    padding:         SPACING.lg,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.08,
    shadowRadius:    6,
    elevation:       3,
  },
  reminderToggleRow: {
    flexDirection: 'row',
    alignItems:    'center',
  },
  reminderToggleLabel: {
    fontSize:   FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color:      COLORS.text,
  },
  reminderToggleHint: {
    fontSize:  FONTS.sizes.xs,
    color:     COLORS.textSecondary,
    marginTop: 2,
  },
  reminderDivider: {
    height:          1,
    backgroundColor: COLORS.border,
    marginVertical:  SPACING.md,
  },
  timeRow: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    marginBottom:    SPACING.sm,
  },
  timeLabel: {
    fontSize:   FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    color:      COLORS.text,
  },
  timeInput: {
    width:             100,
    height:            TOUCH_TARGET.comfortable,
    backgroundColor:   COLORS.background,
    borderWidth:       2,
    borderColor:       COLORS.border,
    borderRadius:      BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    fontSize:          FONTS.sizes.lg,
    fontWeight:        FONTS.weights.bold,
    color:             COLORS.text,
    textAlign:         'center',
  },
  reminderSaveBtn: {
    height:          TOUCH_TARGET.comfortable,
    backgroundColor: COLORS.accent,
    borderRadius:    BORDER_RADIUS.md,
    justifyContent:  'center',
    alignItems:      'center',
    marginTop:       SPACING.md,
  },
  reminderSaveBtnText: {
    fontSize:   FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color:      COLORS.white,
  },
});
