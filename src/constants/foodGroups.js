// ─────────────────────────────────────────────────────────────────
// foodGroups.js  —  6가지 식품군 메타데이터
// 이 파일 하나만 바꾸면 앱 전체의 식품군 정보가 바뀜
// ─────────────────────────────────────────────────────────────────

export const FOOD_GROUPS = [
  {
    key:         'grain',        // 상태에서 사용하는 고유 키
    name:        '곡류',
    description: '밥, 빵, 면류',
    emoji:       '🍚',
    color:       '#F4A261',
    bgColor:     '#FFF3E0',
    kcalPerUnit: 100,            // 1교환단위당 칼로리 (참고용)
  },
  {
    key:         'protein',
    name:        '어육류',
    description: '고기, 생선, 두부, 달걀',
    emoji:       '🥩',
    color:       '#E76F51',
    bgColor:     '#FBE9E7',
    kcalPerUnit: 75,
  },
  {
    key:         'vegetable',
    name:        '채소',
    description: '모든 채소류',
    emoji:       '🥦',
    color:       '#52B788',
    bgColor:     '#E8F5E9',
    kcalPerUnit: 20,
  },
  {
    key:         'fat',
    name:        '지방',
    description: '기름, 견과류, 드레싱',
    emoji:       '🥑',
    color:       '#FFB703',
    bgColor:     '#FFFDE7',
    kcalPerUnit: 45,
  },
  {
    key:         'milk',
    name:        '우유',
    description: '우유, 두유, 요거트',
    emoji:       '🥛',
    color:       '#48CAE4',
    bgColor:     '#E0F7FA',
    kcalPerUnit: 125,
  },
  {
    key:         'fruit',
    name:        '과일',
    description: '모든 과일류',
    emoji:       '🍎',
    color:       '#C77DFF',
    bgColor:     '#F3E5F5',
    kcalPerUnit: 60,
  },
];

// 키 배열만 따로 필요할 때 편하게 쓰기 위한 상수
export const FOOD_GROUP_KEYS = FOOD_GROUPS.map((g) => g.key);
