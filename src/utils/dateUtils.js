// ─────────────────────────────────────────────────────────────────
// dateUtils.js  —  날짜 처리 유틸 함수 모음
// AsyncStorage 키로 쓰이는 "YYYY-MM-DD" 형식을 주로 다룸
// ─────────────────────────────────────────────────────────────────

/**
 * 오늘 날짜를 "YYYY-MM-DD" 형식으로 반환
 * AsyncStorage 키, 자정 리셋 감지에 사용
 *
 * @returns {string}  예) "2026-05-27"
 */
export const getTodayKey = () => {
  return formatDateKey(new Date());
};

/**
 * Date 객체 → "YYYY-MM-DD" 문자열
 *
 * @param {Date} date
 * @returns {string}
 */
export const formatDateKey = (date) => {
  const year  = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 1월 → "01"
  const day   = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * "YYYY-MM-DD" 문자열 → Date 객체
 *
 * @param {string} key  예) "2026-05-27"
 * @returns {Date}
 */
export const keyToDate = (key) => {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day); // month는 0-indexed
};

/**
 * 달력 화면용: 특정 년·월의 전체 날짜 배열 생성
 * 앞뒤로 이전/다음 달 날짜(회색 칸)도 포함하여 7×n 그리드를 채움
 *
 * @param {number} year   - 연도
 * @param {number} month  - 월 (0-indexed, 1월 = 0)
 * @returns {Array<{ date: Date, key: string, isCurrentMonth: boolean }>}
 */
export const getCalendarDays = (year, month) => {
  const firstDay = new Date(year, month, 1);    // 해당 월 1일
  const lastDay  = new Date(year, month + 1, 0); // 해당 월 마지막 날
  const days = [];

  // ── 앞 빈 칸: 1일이 무슨 요일인지에 따라 이전 달 날짜 채우기 (일=0 기준)
  const startPad = firstDay.getDay(); // 0(일) ~ 6(토)
  for (let i = startPad - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push({ date: d, key: formatDateKey(d), isCurrentMonth: false });
  }

  // ── 이번 달 날짜들
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d);
    days.push({ date, key: formatDateKey(date), isCurrentMonth: true });
  }

  // ── 뒷 빈 칸: 마지막 날 이후 다음 달 날짜 채우기
  const endPad = 6 - lastDay.getDay(); // 토요일까지 남은 칸 수
  for (let i = 1; i <= endPad; i++) {
    const d = new Date(year, month + 1, i);
    days.push({ date: d, key: formatDateKey(d), isCurrentMonth: false });
  }

  return days;
};

/**
 * 달력 상단 요일 헤더 (일~토)
 */
export const WEEKDAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

/**
 * 오늘 날짜를 한국어 읽기 좋은 형식으로 반환
 * 예) "2026년 5월 27일 (수)"
 *
 * @returns {string}
 */
export const getTodayDisplayString = () => {
  const d = new Date();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${weekdays[d.getDay()]})`;
};
