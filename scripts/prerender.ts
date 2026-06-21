// scripts/prerender.ts — SSG。各ページの dist/<page>/index.html にクローラー向け静的フォールバックHTML・
// per-page meta・JSON-LD を焼き込み、sitemap.xml を生成。比較表は HTML <table> に変換して残す。
// 視覚タグ（[[huecircle]] / [[diagram:KEY]]）は React専用なので静的HTMLでは除去する。
// 実行: npx tsx scripts/prerender.ts（npm run predeploy 内）
import * as fs from 'fs';
import * as path from 'path';
import { modules } from '../src/data/modules';
import { glossary } from '../src/data/glossary';
import { chapterNames } from '../src/data/chapters';
import { EXAM_CONFIG } from '../src/data/examConfig';

const DIST_DIR = path.resolve(process.cwd(), 'dist');
const INDEX_HTML_PATH = path.join(DIST_DIR, 'index.html');
const BASE = '/color-uc';
const BASE_URL = 'https://study-apps.com/color-uc';
const SITE_NAME = '色彩検定UC級 学習ノート';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const inlineHtml = (s: string) => esc(s.replace(/\[\[term:([^\]]+)\]\]/g, '$1')).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>');
const CALL: Record<string, string> = { '💡': 'コツ', '🎯': '試験ポイント', '⚠️': '注意', '📖': '発展' };

function mdToHtml(content: string): string {
  // 視覚タグを除去（React専用）
  const cleaned = content.replace(/^\[\[(?:huecircle|tonemap|diagram:[a-z0-9-]+)\]\]$/gm, '');
  const lines = cleaned.split('\n');
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const t = lines[i].trim();
    if (t === '') { i++; continue; }
    if (/^---+$/.test(t)) { out.push('<hr style="border:0;border-top:1px solid #dfe3dc;margin:18px 0">'); i++; continue; }
    if (t.startsWith('### ')) { out.push(`<h3 style="font-size:1.05rem;margin:18px 0 6px">${inlineHtml(t.slice(4))}</h3>`); i++; continue; }
    if (t.startsWith('## ')) { out.push(`<h2 style="font-size:1.2rem;margin:22px 0 8px;border-left:4px solid #1f6f5c;padding-left:10px">${inlineHtml(t.slice(3))}</h2>`); i++; continue; }
    const ck = Object.keys(CALL).find((mk) => t.startsWith(mk));
    if (ck) { out.push(`<div style="border-left:4px solid #999;background:#eee;padding:8px 12px;margin:12px 0;border-radius:6px"><strong style="font-size:0.8rem">${CALL[ck]}</strong><br>${inlineHtml(t.slice(ck.length).trim())}</div>`); i++; continue; }
    if (t.startsWith('|')) {
      const rows: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) { rows.push(lines[i].trim()); i++; }
      const parsed = rows.map((r) => r.replace(/^\||\|$/g, '').split('|').map((c) => c.trim())).filter((cells) => !cells.every((c) => /^:?-+:?$/.test(c) || c === ''));
      if (parsed.length) {
        const [head, ...body] = parsed;
        const th = head.map((c) => `<th style="text-align:left;padding:6px 10px;background:#e3efe9;border-bottom:2px solid #c8cdc2">${inlineHtml(c)}</th>`).join('');
        const trs = body.map((cells) => '<tr>' + cells.map((c) => `<td style="padding:6px 10px;border-bottom:1px solid #dfe3dc;vertical-align:top">${inlineHtml(c)}</td>`).join('') + '</tr>').join('');
        out.push(`<div style="overflow-x:auto;margin:14px 0"><table style="border-collapse:collapse;width:100%;font-size:0.92rem"><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table></div>`);
      }
      continue;
    }
    if (/^\d+\.\s/.test(t)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) { items.push(lines[i].trim().replace(/^\d+\.\s/, '')); i++; }
      out.push('<ol style="padding-left:20px">' + items.map((it) => `<li>${inlineHtml(it)}</li>`).join('') + '</ol>');
      continue;
    }
    if (/^[-*]\s/.test(t)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i].trim())) { items.push(lines[i].trim().replace(/^[-*]\s/, '')); i++; }
      out.push('<ul style="padding-left:20px">' + items.map((it) => `<li>${inlineHtml(it)}</li>`).join('') + '</ul>');
      continue;
    }
    out.push(`<p>${inlineHtml(t)}</p>`); i++;
  }
  return out.join('\n');
}

const banner = `<div style="background:#e3efe9;border-bottom:1px solid #cdded5;padding:10px 16px;font-size:0.88rem;text-align:center;margin-bottom:16px;border-radius:6px;max-width:820px;margin-left:auto;margin-right:auto"><a href="https://study-apps.com/" style="color:#185647;text-decoration:none;font-weight:600">← study-apps.com 学習サイト集トップへ</a></div>`;
const disclaimer = `<p style="font-size:0.8rem;color:#7d877f;margin-top:20px;border-top:1px solid #eee;padding-top:12px">※本サイトは個人による学習支援サイトであり、色彩検定協会の公式サイトではありません。色覚・目に関する記述は一般的な説明で、医学的助言ではありません。気になる症状は眼科医にご相談ください。</p>`;
const articleOpen = `<article id="static-fallback" style="font-family:sans-serif;line-height:1.8;max-width:820px;margin:0 auto;padding:24px 16px;color:#1f2422">`;

console.log('--- color-uc SSG prerender ---');
if (!fs.existsSync(INDEX_HTML_PATH)) { console.error('dist/index.html が見つかりません。先に npm run build を。'); process.exit(1); }
const templateHtml = fs.readFileSync(INDEX_HTML_PATH, 'utf-8');

// ── ホーム ──
const chapterListHtml = (() => {
  const byCh: Record<number, typeof modules> = {};
  for (const m of modules) (byCh[m.chapter] ||= [] as unknown as typeof modules).push(m);
  return Object.keys(byCh).map(Number).sort((a, b) => a - b).map((n) => {
    const items = byCh[n].map((m) => `<li style="margin:8px 0"><a href="${BASE}/${m.id}/" style="color:#1f6f5c;font-weight:600;text-decoration:none">${esc(m.title)}</a><br><span style="color:#4f5953;font-size:0.9rem">${esc(m.description)}</span></li>`).join('\n');
    return `<h2 style="font-size:1.2rem;margin:22px 0 8px;border-bottom:1px solid #dfe3dc;padding-bottom:4px">第${n}章 ${esc(chapterNames[n])}</h2><ul style="list-style:none;padding:0;margin:0">${items}</ul>`;
  }).join('\n');
})();

const homeDesc = '色彩検定UC級（色のユニバーサルデザイン）の独学者向け学習ノート。色覚タイプや加齢による見え方の違い、だれにでも伝わる配色の工夫を、図と確認問題でやさしく解説します。';
const homeFallback = `${banner}${articleOpen}
  <h1 style="font-size:1.8rem;font-weight:700;border-bottom:2px solid #1f6f5c;padding-bottom:8px;margin-bottom:14px">${SITE_NAME}</h1>
  <p style="color:#4f5953;margin-bottom:20px">${homeDesc}色覚や眼に関する記述は、CUDO・日本眼科学会・日本遺伝学会などの解説に基づき、色覚多様性の枠組みで中立に書いています。</p>
  ${chapterListHtml}
  <nav style="margin-top:28px;border-top:1px solid #dfe3dc;padding-top:16px;display:flex;gap:16px;flex-wrap:wrap">
    <a href="${BASE}/glossary/" style="color:#1f6f5c">用語集</a>
    <a href="${BASE}/guide/" style="color:#1f6f5c">試験ガイド</a>
    <a href="${BASE}/about/" style="color:#1f6f5c">このサイトについて</a>
    <a href="${BASE}/privacy/" style="color:#1f6f5c;font-size:0.85rem">プライバシーポリシー</a>
  </nav>
  ${disclaimer}
</article>`;

let rootHtml = templateHtml.replace('<div id="root"></div>', `<div id="root">${homeFallback}</div>`);
const homeJsonLd = JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_NAME, url: `${BASE_URL}/`, description: homeDesc, inLanguage: 'ja' });
rootHtml = rootHtml.replace('</head>', `<script type="application/ld+json">${homeJsonLd}</script>\n  </head>`);
fs.writeFileSync(INDEX_HTML_PATH, rootHtml);

const subTemplate = templateHtml
  .replace(/href="\.\/assets\//g, 'href="../assets/')
  .replace(/src="\.\/assets\//g, 'src="../assets/')
  .replace(/href="\.\/favicon\.svg"/g, 'href="../favicon.svg"');

function writePage(subpath: string, fullTitle: string, description: string, bodyHtml: string, jsonLd: object) {
  const dir = path.join(DIST_DIR, subpath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const url = `${BASE_URL}/${subpath}/`;
  let html = subTemplate
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(fullTitle)}</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${esc(description)}" />`)
    .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${esc(fullTitle)}" />`)
    .replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${esc(description)}" />`)
    .replace('<meta property="og:type" content="website" />', `<meta property="og:type" content="article" />`)
    .replace('<meta property="og:url" content="https://study-apps.com/color-uc/" />', `<meta property="og:url" content="${url}" />`)
    .replace('<link rel="canonical" href="https://study-apps.com/color-uc/" />', `<link rel="canonical" href="${url}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${esc(fullTitle)}" />`)
    .replace(/<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${esc(description)}" />`);
  html = html.replace('<div id="root"></div>', `<div id="root">${bodyHtml}</div>`);
  html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n  </head>`);
  fs.writeFileSync(path.join(dir, 'index.html'), html);
}

// ── モジュールページ ──
let count = 0;
for (const mod of modules) {
  const title = `${mod.title} | ${SITE_NAME}`;
  const body = `${banner}${articleOpen}
  <nav style="margin-bottom:14px;font-size:0.85rem"><a href="${BASE}/" style="color:#1f6f5c;text-decoration:none">ホーム</a> / 第${mod.chapter}章 ${esc(chapterNames[mod.chapter])}</nav>
  <h1 style="font-size:1.55rem;font-weight:700;border-bottom:2px solid #1f6f5c;padding-bottom:8px;margin-bottom:10px">${esc(mod.title)}</h1>
  <p style="color:#4f5953;margin-bottom:16px;font-size:1.02rem">${esc(mod.description)}</p>
  ${mdToHtml(mod.content)}
  ${mod.keyPoints ? `<h2 style="font-size:1.05rem;margin:22px 0 8px">このモジュールのまとめ</h2><ul style="padding-left:20px">${mod.keyPoints.map((k) => `<li>${esc(k)}</li>`).join('')}</ul>` : ''}
  <nav style="margin-top:26px;border-top:1px solid #dfe3dc;padding-top:14px"><a href="${BASE}/" style="color:#1f6f5c;text-decoration:none">← ホームへ戻る</a></nav>
  ${disclaimer}
</article>`;
  writePage(mod.id, title, mod.description, body, {
    '@context': 'https://schema.org', '@type': 'LearningResource',
    name: mod.title, description: mod.description, url: `${BASE_URL}/${mod.id}/`,
    inLanguage: 'ja', learningResourceType: '学習モジュール',
    provider: { '@type': 'Organization', name: 'study-apps.com', url: 'https://study-apps.com' },
  });
  count++;
}

// ── 用語集 ──
const glossaryItemsHtml = Object.values(glossary).map((t) => `<div style="margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid #eee"><strong style="font-size:1rem;color:#185647">${esc(t.term)}</strong><p style="margin:6px 0 0;color:#444">${esc(t.explanation)}</p></div>`).join('\n');
writePage('glossary', `用語集 | ${SITE_NAME}`, '色彩検定UC級の頻出用語をやさしく解説。色覚タイプ・混同色・PCCS・ハッチング・明度差などUDの用語を、CUDO・日本眼科学会などの解説に基づいて整理。',
  `${banner}${articleOpen}
  <nav style="margin-bottom:14px"><a href="${BASE}/" style="color:#1f6f5c;text-decoration:none">← ホームへ戻る</a></nav>
  <h1 style="font-size:1.6rem;font-weight:700;border-bottom:2px solid #1f6f5c;padding-bottom:8px;margin-bottom:18px">用語集</h1>
  <p style="color:#4f5953;margin-bottom:20px">色彩検定UC級でよく出る用語を、初学者向けにやさしく解説します。色覚や眼に関する用語はCUDO・日本眼科学会・日本遺伝学会などの解説に基づいています。</p>
  ${glossaryItemsHtml}
  ${disclaimer}
</article>`,
  { '@context': 'https://schema.org', '@type': 'DefinedTermSet', name: '色彩検定UC級 用語集', url: `${BASE_URL}/glossary/`, inLanguage: 'ja' });

// ── 試験ガイド ──
const s = EXAM_CONFIG.schedule2026;
writePage('guide', `試験ガイド | ${SITE_NAME}`, '色彩検定UC級の試験概要・出題形式・試験時間・合格基準・受験資格・年間スケジュールと学習の進め方を、公式情報をもとに整理。',
  `${banner}${articleOpen}
  <nav style="margin-bottom:14px"><a href="${BASE}/" style="color:#1f6f5c;text-decoration:none">← ホームへ戻る</a></nav>
  <h1 style="font-size:1.6rem;font-weight:700;border-bottom:2px solid #1f6f5c;padding-bottom:8px;margin-bottom:18px">色彩検定UC級 試験ガイド</h1>
  <p style="color:#4f5953;margin-bottom:18px">${EXAM_CONFIG.organizer}が実施する、${EXAM_CONFIG.patronage}の検定です（UC級は${EXAM_CONFIG.established}年創設）。日程・検定料・合格基準は年度・回ごとに変わるため、申込前に必ず公式サイトでご確認ください。</p>
  <ul style="color:#1f2422;line-height:2">
    <li>実施団体：${EXAM_CONFIG.organizer}（${EXAM_CONFIG.patronage}）</li>
    <li>出題形式：${EXAM_CONFIG.format}</li>
    <li>試験時間：${EXAM_CONFIG.duration}分</li>
    <li>満点・合格基準：${EXAM_CONFIG.fullScore}点満点。${EXAM_CONFIG.passingScoreLabel}</li>
    <li>検定料：${EXAM_CONFIG.feeLabel}</li>
    <li>受験資格：${EXAM_CONFIG.eligibility}</li>
    <li>実施時期：${EXAM_CONFIG.frequency}（夏期＝${EXAM_CONFIG.summerMonth}月・冬期＝${EXAM_CONFIG.winterMonth}月）</li>
  </ul>
  <h2 style="font-size:1.15rem;margin:22px 0 8px">2026年度の日程</h2>
  <ul style="color:#1f2422;line-height:2"><li>夏期：${s.summerExamDate}（申込 ${s.summerApplication}）</li><li>冬期：${s.winterExamDate}（申込 ${s.winterApplication}）</li></ul>
  <h2 style="font-size:1.15rem;margin:22px 0 8px">学習の進め方</h2>
  <p style="color:#1f2422">UC級は「色のユニバーサルデザイン」が主題です。色の見えるしくみや色覚タイプ、加齢による見え方を理解し、明度差・色名併記・模様などで「だれにでも伝わる配色」を学びます。色の三属性やPCCSなどの共通基礎は <a href="https://study-apps.com/color-g3/" style="color:#1f6f5c">色彩検定3級の学習ノート</a> でも扱っています。</p>
  ${disclaimer}
</article>`,
  { '@context': 'https://schema.org', '@type': 'Article', headline: '色彩検定UC級 試験ガイド', url: `${BASE_URL}/guide/`, inLanguage: 'ja' });

// ── About ──
writePage('about', `このサイトについて | ${SITE_NAME}`, '色彩検定UC級 学習ノートの目的・コンテンツ構成・編集制作方針・色覚多様性への姿勢・医療注意・運営者・お問い合わせ・免責事項について。',
  `${banner}${articleOpen}
  <nav style="margin-bottom:14px"><a href="${BASE}/" style="color:#1f6f5c;text-decoration:none">← ホームへ戻る</a></nav>
  <h1 style="font-size:1.6rem;font-weight:700;border-bottom:2px solid #1f6f5c;padding-bottom:8px;margin-bottom:18px">このサイトについて</h1>
  <h2 style="font-size:1.15rem;margin:18px 0 6px">サイトの目的と対象</h2>
  <p style="color:#444">「${SITE_NAME}」は、色のユニバーサルデザイン（UC級）の合格を目指す独学者のための学習支援サイトです。色の見えるしくみ、色覚タイプや加齢による見え方の違い、だれにでも伝わる配色の工夫を、図と確認問題でていねいに解説します。</p>
  <h2 style="font-size:1.15rem;margin:18px 0 6px">コンテンツ構成</h2>
  <p style="color:#444">公式テキストの分野構成に沿って全6章・各モジュールに分け、本文・図・理解度チェックで構成しています。色の三属性やPCCSなどの共通基礎は、姉妹サイトの <a href="https://study-apps.com/color-g3/" style="color:#1f6f5c">色彩検定3級の学習ノート</a> とも内容を合わせています。</p>
  <h2 style="font-size:1.15rem;margin:18px 0 6px">編集・制作方針</h2>
  <p style="color:#444">本サイトの解説は、公式が示す出題範囲や、CUDO（カラーユニバーサルデザイン機構）・日本眼科学会・日本遺伝学会などの公的・学術的な解説で事実を確認したうえで、運営者が内容を理解しすべて自分のことばで書き起こしています。出典は事実確認のために用い、文章をそのまま転載することはしていません。色覚に関する記述は「色覚多様性」（日本遺伝学会2017）の枠組みで中立に記し、旧称（色盲・色弱など）は原則として使いません。誤りに気づいた場合は随時修正します。</p>
  <h2 style="font-size:1.15rem;margin:18px 0 6px">医療・健康に関する注意</h2>
  <p style="color:#444">本サイトの色覚・眼に関する記述は、一般的な学習のための説明であり、個人の診断や医学的な助言を目的とするものではありません。見え方や目の症状で気になることがある場合は、眼科医にご相談ください。</p>
  <h2 style="font-size:1.15rem;margin:18px 0 6px">運営者について</h2>
  <p style="color:#444">個人が運営しています。広告収入はサーバー・ドメインなどの維持費に充てています。</p>
  <h2 style="font-size:1.15rem;margin:18px 0 6px">お問い合わせ</h2>
  <p style="color:#444">内容の誤りのご指摘やご意見は、<a href="https://forms.gle/ccMv7oKwz6ysDHBe6" target="_blank" rel="noopener noreferrer" style="color:#1f6f5c">お問い合わせフォーム</a>よりお寄せください。</p>
  <h2 style="font-size:1.15rem;margin:18px 0 6px">免責事項</h2>
  <p style="color:#444">本サイトは内容の正確性に努めていますが、その完全性・正確性・有用性を保証するものではありません。本サイトは個人による学習支援サイトであり、色彩検定協会の公式サイトではありません。試験の最新情報・正確な情報は必ず公式サイトでご確認ください。本サイトの利用によって生じたいかなる損害についても責任を負いかねます。</p>
</article>`,
  { '@context': 'https://schema.org', '@type': 'AboutPage', name: 'このサイトについて', url: `${BASE_URL}/about/`, inLanguage: 'ja' });

// ── Privacy ──
writePage('privacy', `プライバシーポリシー | ${SITE_NAME}`, '色彩検定UC級 学習ノートのプライバシーポリシー。Google Analytics・AdSense・Cookie の利用と無効化方法、免責、お問い合わせについて。',
  `${banner}${articleOpen}
  <nav style="margin-bottom:14px"><a href="${BASE}/" style="color:#1f6f5c;text-decoration:none">← ホームへ戻る</a></nav>
  <h1 style="font-size:1.6rem;font-weight:700;border-bottom:2px solid #1f6f5c;padding-bottom:8px;margin-bottom:18px">プライバシーポリシー</h1>
  <h2 style="font-size:1.15rem;margin:18px 0 6px">アクセス解析（Google Analytics）</h2>
  <p style="color:#444">本サイトは利用状況の把握のためGoogle Analytics（GA4）を利用しています。Cookieを用いて匿名のトラフィックデータを収集するもので、個人を特定する情報は含みません。</p>
  <h2 style="font-size:1.15rem;margin:18px 0 6px">広告配信（Google AdSense）</h2>
  <p style="color:#444">本サイトは第三者配信の広告サービスGoogle AdSenseを利用しています。第三者配信事業者はCookieを使用して、ユーザーの興味に応じた広告を表示することがあります。</p>
  <h2 style="font-size:1.15rem;margin:18px 0 6px">Cookieの送信と無効化</h2>
  <p style="color:#444">これらのCookieによりGoogleや広告事業者にデータが送信されます。ユーザーは<a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer" style="color:#1f6f5c">Googleの広告設定</a>でパーソナライズ広告を無効にでき、ブラウザの設定でCookieを無効にすることもできます。</p>
  <h2 style="font-size:1.15rem;margin:18px 0 6px">免責事項</h2>
  <p style="color:#444">本サイトの情報の利用により生じた損害について、運営者は責任を負いません。</p>
  <h2 style="font-size:1.15rem;margin:18px 0 6px">お問い合わせ</h2>
  <p style="color:#444">本ポリシーに関するお問い合わせは<a href="https://forms.gle/ccMv7oKwz6ysDHBe6" target="_blank" rel="noopener noreferrer" style="color:#1f6f5c">お問い合わせフォーム</a>よりお願いします。</p>
  <p style="font-size:0.84rem;color:#7d877f;margin-top:20px;border-top:1px solid #eee;padding-top:12px">最終更新日：2026年6月22日</p>
</article>`,
  { '@context': 'https://schema.org', '@type': 'WebPage', name: 'プライバシーポリシー', url: `${BASE_URL}/privacy/`, inLanguage: 'ja' });

// ── sitemap.xml ──
const today = '2026-06-22';
const urls = [
  { loc: `${BASE_URL}/`, priority: '1.0', changefreq: 'weekly' },
  ...modules.map((m) => ({ loc: `${BASE_URL}/${m.id}/`, priority: '0.8', changefreq: 'monthly' })),
  { loc: `${BASE_URL}/glossary/`, priority: '0.7', changefreq: 'monthly' },
  { loc: `${BASE_URL}/guide/`, priority: '0.7', changefreq: 'monthly' },
  { loc: `${BASE_URL}/about/`, priority: '0.4', changefreq: 'yearly' },
  { loc: `${BASE_URL}/privacy/`, priority: '0.3', changefreq: 'yearly' },
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`).join('\n')}
</urlset>`;
fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemap);

console.log(`✓ モジュール ${count} ページ + 静的4ページ + sitemap.xml（全${urls.length}URL）を生成`);
