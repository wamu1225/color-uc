// src/data/examConfig.ts — 色彩検定UC級 試験情報の唯一のソース（SSOT）
// すべて公式サイト aft.or.jp（公益社団法人 色彩検定協会）の受検案内で確認した事実のみ。
// 検定料・日程・合格点・合格率は年度／回で変動するため、掲載値は aft.or.jp で再確認のうえ更新する。
// 最終確認日: 2026-06-15（出典: https://www.aft.or.jp/exam-orders ほか）

export const EXAM_CONFIG = {
  organizer: '公益社団法人 色彩検定協会',
  patronage: '文部科学省後援',
  established: 2018, // UC級は2018年創設

  duration: 60, // 試験時間（分）
  format: 'マークシート方式（一部記述式）',
  fullScore: 200,
  passingScoreLabel: '200点満点の160点前後（問題の難易度により多少変動）',
  fee: 6000, // 検定料（税込・円）2025年度時点
  feeLabel: '6,000円（税込）',

  eligibility: '制限なし。年齢・学歴を問わず、どなたでも何級からでも受検できる（他級との併願も可能）。',

  frequency: '年2回（夏期・冬期）',
  summerMonth: 6,
  winterMonth: 11,

  // 2026年度日程（aft.or.jp スケジュールで確認）
  schedule2026: {
    summerExamDate: '2026年6月28日（日）14:30〜15:30',
    summerApplication: '2026年4月1日（水）〜5月21日（木）',
    winterExamDate: '2026年11月8日（日）13:50〜14:50',
    winterApplication: '2026年8月10日（月）〜10月1日（木）',
  },
} as const;
