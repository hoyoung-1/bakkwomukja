# 바꿔먹자 — 프로젝트 맥락 (Claude Code용)

## 프로젝트 개요
당뇨·체중 관리를 위한 **식품교환표 기반** 하루 식사 트래킹 앱.
React Native (Expo) 기반, 안드로이드(갤럭시 S23 울트라) 최적화.

## 개발자 정보
- 모바일 앱 개발 입문자
- GitHub: https://github.com/hoyoung-1/bakkwomukja

## 기술 스택
- **프레임워크**: React Native (Expo ~54) + React 19 + RN 0.81.5
- **네비게이션**: React Navigation v6 (Stack + BottomTabs)
- **상태 관리**: Context API + useReducer
- **로컬 저장소**: AsyncStorage
- **언어**: JavaScript (JSX)

## 주요 패키지 버전 (SDK 54 기준)
```json
"expo": "~54.0.0",
"react": "19.1.0",
"react-native": "0.81.5",
"expo-status-bar": "~2.2.3",
"react-native-screens": "~4.16.0",
"react-native-safe-area-context": "~5.6.0",
"@react-native-async-storage/async-storage": "^2.1.0"
```
> ⚠️ Expo Go 앱은 **SDK 54** 버전 필요 (Play Store에서 최신 버전 설치)

## 완성된 화면 및 기능

### ✅ 구현 완료
| 기능 | 파일 위치 |
|------|-----------|
| 온보딩 (신체정보 입력 + 교환단위 자동 계산) | `src/screens/OnboardingScreen.jsx` |
| 메인 대시보드 (캐릭터 + 6개 카운터) | `src/screens/DashboardScreen.jsx` |
| 성공 달력 (🐾 도장, % 부분달성 표시) | `src/screens/HistoryScreen.jsx` |
| 설정 화면 (목표 재계산) | `src/screens/SettingsScreen.jsx` |
| [+][-] 0.5단위 카운터 버튼 | `src/components/common/CounterButton.jsx` |
| 진행 바 (달성시 오렌지 전환) | `src/components/common/ProgressBar.jsx` |
| 캐릭터 무대 (4단계: 🤒→😔→😊→✨🐶✨) | `src/components/dashboard/CharacterStage.jsx` |
| 식품군 행 (이모지+이름+진행바+버튼) | `src/components/dashboard/FoodGroupRow.jsx` |
| 자정 자동 리셋 훅 | `src/hooks/useDailyReset.js` |
| 전역 상태 관리 | `src/store/AppContext.jsx` |

## 핵심 데이터 구조 (AppContext state)
```javascript
{
  profile: {
    isOnboarded: boolean,
    gender: 'male' | 'female',
    height: number,       // cm
    weight: number,       // kg
    activityLevel: 'light' | 'moderate' | 'heavy'
  },
  goals: {
    totalCalories: number,
    grain: number,        // 곡류 교환단위 목표
    protein: number,      // 어육류
    vegetable: number,    // 채소
    fat: number,          // 지방
    milk: number,         // 우유
    fruit: number,        // 과일
  },
  todayIntake: {
    date: string,         // "YYYY-MM-DD" — 자정 리셋 감지 기준
    grain: number,
    protein: number,
    vegetable: number,
    fat: number,
    milk: number,
    fruit: number,
  },
  history: {
    "YYYY-MM-DD": {
      achieved: boolean,
      completion: number, // 0.0 ~ 1.0
      intake: { grain, protein, vegetable, fat, milk, fruit }
    }
  }
}
```

## 계산 로직 (src/utils/calculations.js)
- 표준체중 = 키(m)² × 22(남) / 21(여)
- 하루 칼로리 = 표준체중 × 30(가벼운) / 35(보통) / 40(심한)
- 교환단위 목표 = src/constants/exchangeTable.js 룩업 테이블 (1200~2300kcal 구간별)

## 캐릭터 상태 (CharacterStage.jsx)
- 0%: 🤒 꼬질꼬질 (갈색 배경)
- 1~49%: 😔 허기진 (주황 배경)
- 50~99%: 😊 보통 (초록 배경)
- 100%: ✨🐶✨ 뽀득뽀득! (노란 배경)

## 앱 실행 방법
```bash
npm install --legacy-peer-deps   # 패키지 설치 (최초 1회)
npx expo start --lan             # 같은 와이파이 환경에서 실행
```
- 폰에 **Expo Go** 앱 설치 후 QR 스캔으로 실기기 테스트 가능
- PC와 폰이 **같은 와이파이**에 연결되어야 함
- 터미널을 끄면 앱 연결이 끊김 (개발 서버 방식)
- `--legacy-peer-deps` 옵션 필수 (React 19 peer dep 충돌 우회)

## 폴더 구조
```
src/
├── constants/     # theme.js, foodGroups.js, exchangeTable.js
├── store/         # AppContext.jsx (전역상태), actions.js
├── hooks/         # useDailyReset.js (자정 리셋)
├── utils/         # calculations.js, dateUtils.js
├── navigation/    # RootNavigator.jsx, MainTabNavigator.jsx
├── components/
│   ├── common/    # CounterButton.jsx, ProgressBar.jsx
│   └── dashboard/ # CharacterStage.jsx, FoodGroupRow.jsx
└── screens/       # Onboarding, Dashboard, History, Settings
```

## 향후 개발 예정 (미구현)
- [ ] 픽셀 아트 캐릭터 이미지 교체 (현재 이모지로 대체)
- [ ] 혈당 기록 탭
- [ ] 음식 검색 → 자동 교환단위 환산
- [ ] 식사 알림 푸시 알림 (expo-notifications)
- [ ] 앱 아이콘 / 스플래시 스크린 디자인

## 코딩 스타일 & 주의사항
- StyleSheet는 각 파일 하단에 `const styles = StyleSheet.create({...})`
- 터치 영역: `minHeight: 72` (S23 울트라 기준)
- 0.5단위 증감: `Math.round((value + delta) * 10) / 10` (부동소수점 오류 방지)
- 상태 변경: 반드시 dispatch + ACTIONS 상수 사용
- AsyncStorage 키: `@bkj_profile`, `@bkj_goals`, `@bkj_intake`, `@bkj_history`
