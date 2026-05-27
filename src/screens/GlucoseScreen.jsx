// ─────────────────────────────────────────────────────────────────
// GlucoseScreen.jsx  —  혈당 기록 화면
//
// 상단: 입력 폼 (수치 + 측정 시점 + 메모)
// 하단: 최근 기록 리스트 (오늘은 강조, 좌측 스와이프 대신 길게 눌러 삭제)
// ─────────────────────────────────────────────────────────────────

import React, { useMemo, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, SafeAreaView, Alert,
  KeyboardAvoidingView, Platform, FlatList,
} from 'react-native';

import { useApp }  from '../store/AppContext';
import { ACTIONS } from '../store/actions';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, TOUCH_TARGET } from '../constants/theme';
import { getTodayKey } from '../utils/dateUtils';

const TYPE_OPTIONS = [
  { value: 'fasting',  label: '공복',   emoji: '🌅' },
  { value: 'preMeal',  label: '식전',   emoji: '🍽️' },
  { value: 'postMeal', label: '식후',   emoji: '🥄' },
  { value: 'bedtime',  label: '취침전', emoji: '🌙' },
];

// 측정 시점별 정상 범위 (mg/dL) — 한국당뇨협회 권장 기준
const NORMAL_RANGES = {
  fasting:  { low: 70,  high: 99,  warn: 125 },
  preMeal:  { low: 70,  high: 130, warn: 180 },
  postMeal: { low: 70,  high: 140, warn: 200 },
  bedtime:  { low: 90,  high: 150, warn: 200 },
};

function getStatusColor(type, value) {
  const range = NORMAL_RANGES[type];
  if (!range) return COLORS.text;
  if (value < range.low)  return COLORS.milk;      // 저혈당 — 하늘색
  if (value > range.warn) return COLORS.danger;    // 위험 — 빨강
  if (value > range.high) return COLORS.accent;    // 주의 — 오렌지
  return COLORS.success;                            // 정상 — 초록
}

function formatTime(timestamp) {
  const d = new Date(timestamp);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function formatDate(timestamp) {
  const d = new Date(timestamp);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}.${dd}`;
}

export default function GlucoseScreen() {
  const { state, dispatch } = useApp();

  const [value, setValue] = useState('');
  const [type,  setType]  = useState('fasting');
  const [memo,  setMemo]  = useState('');
  const [error, setError] = useState('');

  const today = getTodayKey();

  const { todayRecords, pastRecords } = useMemo(() => {
    const todayList = [];
    const pastList  = [];
    state.glucoseRecords.forEach((r) => {
      const dateKey = r.timestamp.slice(0, 10);
      (dateKey === today ? todayList : pastList).push(r);
    });
    return { todayRecords: todayList, pastRecords: pastList.slice(0, 30) };
  }, [state.glucoseRecords, today]);

  // ── 저장 ───────────────────────────────────────────────────────
  const handleSave = () => {
    const v = parseInt(value, 10);
    if (!value || isNaN(v) || v < 20 || v > 600) {
      setError('20 ~ 600 mg/dL 사이로 입력해주세요');
      return;
    }
    setError('');

    const record = {
      id:        `g_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      value:     v,
      type,
      memo:      memo.trim(),
    };

    dispatch({ type: ACTIONS.ADD_GLUCOSE, payload: record });
    setValue('');
    setMemo('');

    const range = NORMAL_RANGES[type];
    const status =
      v < range.low  ? '저혈당 주의' :
      v > range.warn ? '높음 — 의사 상담 권장' :
      v > range.high ? '약간 높음' :
      '정상 범위';

    Alert.alert('🩸 기록 저장', `${v} mg/dL · ${status}`);
  };

  // ── 삭제 ───────────────────────────────────────────────────────
  const handleDelete = (record) => {
    Alert.alert(
      '기록 삭제',
      `${formatDate(record.timestamp)} ${formatTime(record.timestamp)} · ${record.value} mg/dL`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => dispatch({ type: ACTIONS.DELETE_GLUCOSE, payload: record.id }),
        },
      ],
    );
  };

  // ── 기록 행 렌더링 ─────────────────────────────────────────────
  const renderRecord = (r, showDate) => {
    const typeOpt = TYPE_OPTIONS.find((t) => t.value === r.type);
    const color = getStatusColor(r.type, r.value);

    return (
      <TouchableOpacity
        key={r.id}
        style={styles.recordRow}
        onLongPress={() => handleDelete(r)}
        activeOpacity={0.7}
      >
        <View style={styles.recordLeft}>
          <Text style={styles.recordTime}>
            {showDate ? `${formatDate(r.timestamp)} ` : ''}{formatTime(r.timestamp)}
          </Text>
          <Text style={styles.recordType}>{typeOpt?.emoji} {typeOpt?.label}</Text>
        </View>
        <View style={styles.recordRight}>
          <Text style={[styles.recordValue, { color }]}>{r.value}</Text>
          <Text style={styles.recordUnit}>mg/dL</Text>
        </View>
        {r.memo ? <Text style={styles.recordMemo} numberOfLines={1}>{r.memo}</Text> : null}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>혈당 기록 🩸</Text>
            <Text style={styles.subtitle}>측정값을 입력해 추세를 확인하세요</Text>
          </View>

          {/* ── 입력 카드 ─────────────────────────────────────── */}
          <View style={styles.inputCard}>
            <Text style={styles.cardTitle}>새 기록</Text>

            {/* 측정 시점 */}
            <View style={styles.typeRow}>
              {TYPE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.typeChip, type === opt.value && styles.typeChipActive]}
                  onPress={() => setType(opt.value)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.typeEmoji}>{opt.emoji}</Text>
                  <Text style={[styles.typeLabel, type === opt.value && styles.typeLabelActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 수치 입력 */}
            <View style={styles.valueRow}>
              <TextInput
                style={[styles.valueInput, error ? styles.inputError : null]}
                value={value}
                onChangeText={(t) => { setValue(t.replace(/[^0-9]/g, '')); setError(''); }}
                keyboardType="numeric"
                maxLength={3}
                placeholder="0"
                placeholderTextColor={COLORS.textLight}
              />
              <Text style={styles.valueUnit}>mg/dL</Text>
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* 메모 (선택) */}
            <TextInput
              style={styles.memoInput}
              value={memo}
              onChangeText={setMemo}
              placeholder="메모 (선택) — 예: 운동 후, 컨디션 등"
              placeholderTextColor={COLORS.textLight}
              maxLength={40}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
              <Text style={styles.saveBtnText}>기록 저장</Text>
            </TouchableOpacity>
          </View>

          {/* ── 오늘 기록 ─────────────────────────────────────── */}
          <Text style={styles.sectionTitle}>오늘</Text>
          {todayRecords.length === 0 ? (
            <Text style={styles.emptyText}>오늘 기록이 없어요. 첫 측정값을 남겨보세요.</Text>
          ) : (
            <View style={styles.list}>
              {todayRecords.map((r) => renderRecord(r, false))}
            </View>
          )}

          {/* ── 이전 기록 ─────────────────────────────────────── */}
          {pastRecords.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>이전 기록</Text>
              <View style={styles.list}>
                {pastRecords.map((r) => renderRecord(r, true))}
              </View>
              <Text style={styles.hint}>※ 길게 눌러서 기록을 삭제할 수 있어요</Text>
            </>
          )}

          <View style={{ height: SPACING.xxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.lg },

  header: { marginBottom: SPACING.lg, paddingTop: SPACING.sm },
  title: {
    fontSize:   FONTS.sizes.xxl,
    fontWeight: FONTS.weights.heavy,
    color:      COLORS.text,
  },
  subtitle: {
    fontSize:   FONTS.sizes.sm,
    color:      COLORS.textSecondary,
    marginTop:  SPACING.xs,
  },

  // ── 입력 카드
  inputCard: {
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
  typeRow: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           SPACING.sm,
    marginBottom:  SPACING.md,
  },
  typeChip: {
    flexGrow:        1,
    flexBasis:       '22%',
    alignItems:      'center',
    paddingVertical: SPACING.sm,
    borderRadius:    BORDER_RADIUS.md,
    borderWidth:     2,
    borderColor:     COLORS.border,
    backgroundColor: COLORS.surface,
  },
  typeChipActive: {
    borderColor:     COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  typeEmoji: { fontSize: 20, marginBottom: 2 },
  typeLabel: {
    fontSize:   FONTS.sizes.xs,
    fontWeight: FONTS.weights.medium,
    color:      COLORS.textSecondary,
  },
  typeLabelActive: {
    color:      COLORS.primaryDark,
    fontWeight: FONTS.weights.bold,
  },

  valueRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           SPACING.sm,
    marginBottom:  SPACING.sm,
  },
  valueInput: {
    flex:              1,
    height:            TOUCH_TARGET.large,
    backgroundColor:   COLORS.background,
    borderWidth:       2,
    borderColor:       COLORS.border,
    borderRadius:      BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    fontSize:          FONTS.sizes.xxl,
    fontWeight:        FONTS.weights.heavy,
    color:             COLORS.text,
    textAlign:         'center',
  },
  inputError: { borderColor: COLORS.danger },
  valueUnit: {
    fontSize:   FONTS.sizes.lg,
    fontWeight: FONTS.weights.medium,
    color:      COLORS.textSecondary,
    width:      60,
  },
  errorText: {
    fontSize:     FONTS.sizes.sm,
    color:        COLORS.danger,
    marginBottom: SPACING.sm,
  },
  memoInput: {
    backgroundColor:   COLORS.background,
    borderWidth:       1,
    borderColor:       COLORS.border,
    borderRadius:      BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical:   SPACING.sm,
    fontSize:          FONTS.sizes.sm,
    color:             COLORS.text,
    marginBottom:      SPACING.md,
    minHeight:         TOUCH_TARGET.comfortable,
  },
  saveBtn: {
    height:          TOUCH_TARGET.large,
    backgroundColor: COLORS.primary,
    borderRadius:    BORDER_RADIUS.lg,
    justifyContent:  'center',
    alignItems:      'center',
  },
  saveBtnText: {
    fontSize:   FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color:      COLORS.white,
  },

  // ── 섹션
  sectionTitle: {
    fontSize:     FONTS.sizes.lg,
    fontWeight:   FONTS.weights.bold,
    color:        COLORS.text,
    marginBottom: SPACING.md,
    paddingLeft:  SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  emptyText: {
    fontSize:        FONTS.sizes.sm,
    color:           COLORS.textSecondary,
    textAlign:       'center',
    paddingVertical: SPACING.lg,
    marginBottom:    SPACING.lg,
  },

  // ── 기록 리스트
  list: {
    backgroundColor: COLORS.surface,
    borderRadius:    BORDER_RADIUS.lg,
    marginBottom:    SPACING.lg,
    overflow:        'hidden',
  },
  recordRow: {
    flexDirection:    'row',
    alignItems:       'center',
    paddingVertical:  SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexWrap:         'wrap',
  },
  recordLeft:  { flex: 1 },
  recordTime: {
    fontSize:   FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color:      COLORS.text,
  },
  recordType: {
    fontSize:  FONTS.sizes.xs,
    color:     COLORS.textSecondary,
    marginTop: 2,
  },
  recordRight: {
    flexDirection: 'row',
    alignItems:    'baseline',
    gap:           4,
  },
  recordValue: {
    fontSize:   FONTS.sizes.xl,
    fontWeight: FONTS.weights.heavy,
  },
  recordUnit: {
    fontSize: FONTS.sizes.xs,
    color:    COLORS.textSecondary,
  },
  recordMemo: {
    width:     '100%',
    fontSize:  FONTS.sizes.xs,
    color:     COLORS.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  hint: {
    fontSize:    FONTS.sizes.xs,
    color:       COLORS.textLight,
    textAlign:   'center',
    marginTop:   -SPACING.sm,
    marginBottom: SPACING.lg,
  },
});
