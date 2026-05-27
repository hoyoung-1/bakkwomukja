// ─────────────────────────────────────────────────────────────────
// notifications.js  —  로컬 알림(식사 알림) 관리 유틸
//
// 사용 방법:
//   1) App.js에서 setupNotifications() 한 번 호출
//   2) 설정 화면에서 enabled / times 바꿀 때마다 rescheduleMealReminders() 호출
//
// Expo Go 환경 주의:
//   - SDK 53+ Expo Go는 원격 푸시 제한이 있으나, **로컬 알림은 정상 동작**.
//   - Android 8+ 는 Notification Channel 필수.
// ─────────────────────────────────────────────────────────────────

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const CHANNEL_ID = 'meal-reminder';

const MEAL_LABELS = {
  breakfast: { title: '🌅 아침 식사 시간', body: '오늘 첫 끼니를 챙겨보세요. 식품군 카운터를 잊지 마세요!' },
  lunch:     { title: '🍱 점심 식사 시간', body: '점심 드시고 식품교환표 기록도 함께 남겨주세요.' },
  dinner:    { title: '🍽️ 저녁 식사 시간', body: '오늘의 마무리 식사! 목표 달성까지 얼마 남았나요?' },
};

// 알림이 앱이 켜져있을 때도 표시되도록 — 앱 시작 시 1회 호출
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList:   true,
    shouldPlaySound:  true,
    shouldSetBadge:   false,
  }),
});

/**
 * 앱 시작 시 호출: Android 채널 등록.
 * 권한 요청은 사용자가 알림을 켤 때만 진행하므로 여기선 안 함.
 */
export async function setupNotifications() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name:             '식사 알림',
      importance:       Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor:       '#4CAF50',
    });
  }
}

/**
 * 알림 권한 요청. 이미 허가된 경우 그대로 반환.
 * @returns {Promise<boolean>} 권한 허가 여부
 */
export async function ensureNotificationPermission() {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }
  const req = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: false, allowSound: true },
  });
  return req.granted || req.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

/**
 * 우리가 예약한 식사 알림만 골라 취소
 */
export async function cancelMealReminders() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.content?.data?.kind === 'meal-reminder')
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}

/**
 * "HH:MM" → {hour, minute} 파싱. 잘못된 값이면 null.
 */
function parseTime(str) {
  const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(str ?? '');
  if (!m) return null;
  return { hour: parseInt(m[1], 10), minute: parseInt(m[2], 10) };
}

/**
 * 식사 알림 재등록. 기존 식사 알림을 모두 취소한 뒤,
 * enabled=true 인 경우에만 아침/점심/저녁 각각 매일 반복 알림을 새로 예약.
 *
 * @param {object} mealReminders - { enabled, times: { breakfast, lunch, dinner } }
 */
export async function rescheduleMealReminders(mealReminders) {
  await cancelMealReminders();

  if (!mealReminders?.enabled) return;

  const entries = Object.entries(mealReminders.times ?? {});
  for (const [meal, timeStr] of entries) {
    const parsed = parseTime(timeStr);
    const label  = MEAL_LABELS[meal];
    if (!parsed || !label) continue;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: label.title,
        body:  label.body,
        data:  { kind: 'meal-reminder', meal },
      },
      trigger: {
        type:    Notifications.SchedulableTriggerInputTypes.DAILY,
        hour:    parsed.hour,
        minute:  parsed.minute,
        channelId: Platform.OS === 'android' ? CHANNEL_ID : undefined,
      },
    });
  }
}
