// src/data/chapters.ts — チャプター名の唯一のソース（SSOT）
// 公式テキストUC級（2022改訂版）の章構成に対応。
// 第1/4/5/6章がUC級固有、第2/3章は3級・2級と共通基礎（color-g3と整合）。
export const chapterNames: Record<number, string> = {
  1: '色のユニバーサルデザイン',
  2: '色が見えるしくみ',
  3: '色の表し方（PCCS）',
  4: '色覚タイプによる見え方',
  5: '高齢者の見え方',
  6: '色のUDの進め方',
};
