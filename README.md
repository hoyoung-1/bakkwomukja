# 바꿔먹자 🥗

당뇨·체중 관리를 위한 **식품교환표 기반** 하루 식사 트래킹 앱

---

## 🚀 설치 및 실행 방법

### 1단계: Node.js 및 Expo CLI 설치
```bash
# Node.js (https://nodejs.org) 설치 후
npm install -g expo-cli
```

### 2단계: 패키지 설치
```bash
cd bakkwomukja
npm install --legacy-peer-deps
```

> ⚠️ `--legacy-peer-deps` 옵션 필수 (React 19 peer dependency 충돌 우회)
>
> 버전 충돌이 나면 아래 명령어로 Expo 호환 버전으로 자동 맞춰줌:
> ```bash
> npx expo install --fix
> ```

### 3단계: 앱 실행
```bash
npx expo start --lan
```

> 💡 옵션별 차이:
> - `--lan` : 같은 와이파이에서 QR코드로 실기기 연결 (**Expo Go 사용 시 권장**)
> - `--tunnel` : 회사/공용 와이파이로 LAN이 막힐 때 우회 (느림)
> - `--android` : Android Studio + adb 설치된 환경에서 에뮬레이터/USB 기기 직접 실행

### 4단계: 기기에서 실행
- **안드로이드 실기기 (권장)**: Play Store에서 "Expo Go" 앱 설치 → 터미널의 QR코드 스캔
  - PC와 폰이 **같은 와이파이**에 연결되어 있어야 함
  - Expo Go는 **SDK 54 호환 버전** 필요
- **에뮬레이터**: Android Studio 설치 후 에뮬레이터 실행 → 터미널에서 `a` 키 누르기

---

## 📁 프로젝트 구조

```
src/
├── constants/
│   ├── theme.js          # 색상, 폰트, 여백 등 디자인 규격
│   ├── foodGroups.js     # 6가지 식품군 메타데이터
│   └── exchangeTable.js  # 칼로리별 교환단위 목표 테이블
│
├── store/
│   ├── actions.js        # 상태 변경 액션 이름 상수
│   └── AppContext.jsx    # 전역 상태 (Context API + useReducer)
│
├── hooks/
│   └── useDailyReset.js  # 자정 날짜 변경 감지 & 자동 초기화
│
├── utils/
│   ├── calculations.js   # 표준체중, 칼로리, 교환단위 계산
│   └── dateUtils.js      # 날짜 포맷, 달력 생성
│
├── navigation/
│   ├── RootNavigator.jsx       # 온보딩 ↔ 메인 분기
│   └── MainTabNavigator.jsx    # 하단 탭 (대시보드/달력/설정)
│
├── components/
│   ├── common/
│   │   ├── CounterButton.jsx   # [+] [-] 버튼
│   │   └── ProgressBar.jsx     # 진행 바
│   └── dashboard/
│       ├── CharacterStage.jsx  # 캐릭터 무대 (달성률 반영)
│       └── FoodGroupRow.jsx    # 식품군 1행
│
└── screens/
    ├── OnboardingScreen.jsx    # 최초 신체정보 입력
    ├── DashboardScreen.jsx     # 메인 대시보드
    ├── HistoryScreen.jsx       # 성공 달력
    └── SettingsScreen.jsx      # 설정 (목표 재계산)
```

---

## 🔧 주요 기능

| 기능 | 설명 |
|------|------|
| 온보딩 | 성별/키/체중/활동량 입력 → 교환단위 목표 자동 계산 |
| 대시보드 | 6개 식품군 [+][-] 0.5 단위 카운터 |
| 캐릭터 | 달성률에 따라 🤒 → 😔 → 😊 → ✨🐶✨ 변화 |
| 자동 리셋 | 앱 재실행 시 날짜 확인 → 자정 지나면 카운터 초기화 |
| 성공 달력 | 목표 달성일 🐾 도장, 부분 달성일 % 표시 |
| 로컬 저장 | AsyncStorage — 앱 꺼도 데이터 유지 |
