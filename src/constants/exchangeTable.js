// ─────────────────────────────────────────────────────────────────
// exchangeTable.js  —  칼로리 구간별 식품교환단위 목표치
// 한국 식품교환표 기준 (대한당뇨병학회)
//
// 사용 방법:
//   calculateGoals(1800) → { grain: 8, protein: 5, ... }
// ─────────────────────────────────────────────────────────────────

// maxCalories 이하의 칼로리일 때 아래 교환단위를 목표로 사용
export const EXCHANGE_TABLE = [
  {
    maxCalories: 1300,
    grain: 5, protein: 4, vegetable: 6, fat: 3, milk: 1, fruit: 1,
  },
  {
    maxCalories: 1500,
    grain: 6, protein: 5, vegetable: 6, fat: 3, milk: 1, fruit: 1,
  },
  {
    maxCalories: 1700,
    grain: 7, protein: 5, vegetable: 7, fat: 4, milk: 1, fruit: 1,
  },
  {
    maxCalories: 1900,
    grain: 8, protein: 5, vegetable: 7, fat: 4, milk: 1, fruit: 1,
  },
  {
    maxCalories: 2100,
    grain: 9, protein: 6, vegetable: 8, fat: 4, milk: 1, fruit: 2,
  },
  {
    maxCalories: 2300,
    grain: 10, protein: 7, vegetable: 8, fat: 5, milk: 1, fruit: 2,
  },
  {
    maxCalories: Infinity,  // 2300 초과
    grain: 11, protein: 7, vegetable: 9, fat: 5, milk: 2, fruit: 2,
  },
];

// 앱 최초 실행 / 계산 실패 시 쓰이는 기본값 (1800kcal 기준)
export const DEFAULT_GOALS = {
  totalCalories: 1800,
  grain:      8,
  protein:    5,
  vegetable:  7,
  fat:        4,
  milk:       1,
  fruit:      1,
};
