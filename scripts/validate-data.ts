// scripts/validate-data.ts — データ整合性チェック（tsx で実データを import）
// 実行: tsx scripts/validate-data.ts（npm run validate）
import { modules } from '../src/data/modules';
import { glossary } from '../src/data/glossary';
import { chapterNames } from '../src/data/chapters';
import { scanContentForRawTags } from '../src/lib/inline';
import { DIAGRAM_KEYS } from '../src/components/ConceptDiagram';

const errors: string[] = [];
const warnings: string[] = [];

// 用語の見出し名インデックス（[[term:X]] 解決確認用）
const termLead: Record<string, true> = {};
for (const k of Object.keys(glossary)) {
  const lead = glossary[k].term.split('（')[0].trim();
  termLead[lead] = true; termLead[glossary[k].term.trim()] = true;
  if (lead.includes('・')) for (const p of lead.split('・')) { const x = p.trim(); if (x) termLead[x] = true; }
}

const diagramKeys = new Set<string>(DIAGRAM_KEYS as readonly string[]);
const moduleIds = new Set<string>();
const quizIds = new Set<string>();

for (const m of modules) {
  if (moduleIds.has(m.id)) errors.push(`重複モジュールID: ${m.id}`);
  moduleIds.add(m.id);
  if (!/^[a-z0-9-]+$/.test(m.id)) errors.push(`[${m.id}] IDはURL用に a-z0-9- のみ`);
  if (!chapterNames[m.chapter]) errors.push(`[${m.id}] 未定義のchapter: ${m.chapter}`);
  if (m.quiz.length < 5) errors.push(`[${m.id}] クイズが${m.quiz.length}問（学習モジュールは最低5問）`);

  // 視覚優先：図か表が本文にあること
  const hasTable = /\| --- \|/.test(m.content) || /\n\|[\s-|:]+\|\n/.test(m.content);
  const hasFigure = /\[\[(huecircle|tonemap|diagram:[a-z0-9-]+)\]\]/.test(m.content);
  if (!hasTable && !hasFigure) warnings.push(`[${m.id}] 図も表もない（各モジュールに最低1つ）`);

  for (const q of m.quiz) {
    if (quizIds.has(q.id)) errors.push(`重複クイズID: ${q.id}`);
    quizIds.add(q.id);
    if (q.options.length !== 4) warnings.push(`[${q.id}] 選択肢が${q.options.length}個（標準は4択）`);
    if (q.correctAnswer < 0 || q.correctAnswer >= q.options.length) errors.push(`[${q.id}] correctAnswer範囲外`);
    if (!q.explanation || q.explanation.trim() === '') errors.push(`[${q.id}] 解説が空`);
  }

  // カスタムタグの検査
  for (const mt of m.content.matchAll(/\[\[([^\]]+)\]\]/g)) {
    const tag = mt[1];
    if (tag === 'huecircle' || tag === 'tonemap') continue;
    if (tag.startsWith('diagram:')) {
      const k = tag.slice('diagram:'.length);
      if (!diagramKeys.has(k)) errors.push(`[${m.id}] 未定義の図キー: [[diagram:${k}]]`);
      continue;
    }
    if (tag.startsWith('term:')) {
      const name = tag.slice('term:'.length);
      if (!termLead[name]) warnings.push(`[${m.id}] 用語集に無い用語リンク: [[term:${name}]]`);
      continue;
    }
    errors.push(`[${m.id}] 未知のカスタムタグ: [[${tag}]]`);
  }

  // 生タグ露出スモーク（App.tsx と同じトークナイザ）
  for (const a of scanContentForRawTags(m.content)) errors.push(`[${m.id}] 描画で露出する恐れ: ${a}`);
  if (m.keyPoints) for (const kp of m.keyPoints) for (const a of scanContentForRawTags(kp)) errors.push(`[${m.id}] keyPoints露出: ${a}`);
}

// glossary の relatedTerms 参照先
for (const k of Object.keys(glossary)) for (const r of glossary[k].relatedTerms || []) if (!glossary[r]) warnings.push(`[glossary:${k}] relatedTerms参照先が無い: ${r}`);

console.log(`モジュール数: ${modules.length} / クイズ総数: ${quizIds.size} / 用語数: ${Object.keys(glossary).length}`);
if (warnings.length) { console.log(`\n警告 (${warnings.length}):`); warnings.forEach((w) => console.log('  - ' + w)); }
if (errors.length) { console.error(`\nエラー (${errors.length}):`); errors.forEach((e) => console.error('  - ' + e)); process.exit(1); }
console.log('\n✓ データ検証OK');
