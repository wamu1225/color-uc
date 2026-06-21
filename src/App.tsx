import { useState, useEffect, useCallback, useMemo, Fragment } from 'react';
import type { ReactNode } from 'react';
import './App.css';
import { modules } from './data/modules';
import type { Module } from './data/modules';
import { glossary } from './data/glossary';
import type { Term } from './data/glossary';
import { chapterNames } from './data/chapters';
import { EXAM_CONFIG } from './data/examConfig';
import { tokenizeInline } from './lib/inline';
import type { InlineToken } from './lib/inline';
import HueCircle from './components/HueCircle';
import ConceptDiagram from './components/ConceptDiagram';
import Quiz from './components/Quiz';

const BASE = '/color-uc';
const PROGRESS_KEY = 'color-uc-progress';

type Route =
  | { view: 'home' }
  | { view: 'module'; id: string }
  | { view: 'glossary' }
  | { view: 'guide' }
  | { view: 'about' }
  | { view: 'privacy' };

interface ProgressEntry { score: number; total: number; at: string; }
type Progress = Record<string, ProgressEntry>;
function loadProgress(): Progress { try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}'); } catch { return {}; } }
function saveProgress(p: Progress) { try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)); } catch { /* ignore */ } }

function parseRoute(pathname: string): Route {
  let p = pathname;
  if (p.startsWith(BASE)) p = p.slice(BASE.length);
  p = p.replace(/^\/+|\/+$/g, '');
  if (p === '') return { view: 'home' };
  if (p === 'glossary') return { view: 'glossary' };
  if (p === 'guide') return { view: 'guide' };
  if (p === 'about') return { view: 'about' };
  if (p === 'privacy') return { view: 'privacy' };
  const mod = modules.find((m) => m.id === p);
  if (mod) return { view: 'module', id: mod.id };
  return { view: 'home' };
}
function hrefFor(route: Route): string {
  switch (route.view) {
    case 'home': return `${BASE}/`;
    case 'module': return `${BASE}/${route.id}/`;
    default: return `${BASE}/${route.view}/`;
  }
}

// 用語リンク：表示名 → glossary id（複合見出しの・分割も登録）
const termIndex: Record<string, string> = (() => {
  const idx: Record<string, string> = {};
  for (const key of Object.keys(glossary)) {
    const t = glossary[key];
    const lead = t.term.split('（')[0].trim();
    idx[lead] = key; idx[t.term.trim()] = key;
    if (lead.includes('・')) for (const part of lead.split('・')) { const p = part.trim(); if (p && !(p in idx)) idx[p] = key; }
  }
  return idx;
})();

function renderTokens(tokens: InlineToken[], navigate: (r: Route) => void, keyBase: string): ReactNode[] {
  return tokens.map((tk, i) => {
    const key = `${keyBase}-${i}`;
    switch (tk.t) {
      case 'text': return <Fragment key={key}>{tk.v}</Fragment>;
      case 'term': {
        const id = termIndex[tk.name];
        if (id) return (
          <a key={key} className="term-link" href={`${BASE}/glossary/#term-${id}`}
            onClick={(e) => { e.preventDefault(); navigate({ view: 'glossary' }); setTimeout(() => document.getElementById(`term-${id}`)?.scrollIntoView({ behavior: 'smooth' }), 60); }}>
            {tk.name}
          </a>
        );
        return <span key={key} className="term-plain">{tk.name}</span>;
      }
      case 'link':
        if (/^https?:\/\//.test(tk.url)) return <a key={key} href={tk.url} target="_blank" rel="noopener noreferrer">{tk.label}</a>;
        return <a key={key} href={tk.url} onClick={(e) => { e.preventDefault(); navigate(parseRoute(tk.url)); }}>{tk.label}</a>;
      case 'bold': return <strong key={key}>{renderTokens(tk.children, navigate, key)}</strong>;
      case 'code': return <code key={key}>{tk.v}</code>;
    }
  });
}
const inline = (text: string, navigate: (r: Route) => void, k: string) => renderTokens(tokenizeInline(text), navigate, k);

const CALLOUTS: Record<string, { label: string; cls: string }> = {
  '💡': { label: 'コツ', cls: 'callout-tip' },
  '🎯': { label: '試験ポイント', cls: 'callout-exam' },
  '⚠️': { label: '注意', cls: 'callout-warn' },
  '📖': { label: '発展', cls: 'callout-read' },
};

function renderContent(content: string, navigate: (r: Route) => void): ReactNode[] {
  const lines = content.split('\n');
  const out: ReactNode[] = [];
  let i = 0, key = 0;
  while (i < lines.length) {
    const t = lines[i].trim();
    if (t === '') { i++; continue; }
    if (t === '[[huecircle]]') { out.push(<HueCircle key={key++} />); i++; continue; }
    const dg = t.match(/^\[\[diagram:([a-z0-9-]+)\]\]$/);
    if (dg) { out.push(<ConceptDiagram key={key++} dkey={dg[1]} />); i++; continue; }
    if (/^---+$/.test(t)) { out.push(<hr key={key++} />); i++; continue; }
    if (t.startsWith('### ')) { out.push(<h3 key={key++}>{inline(t.slice(4), navigate, `h${key}`)}</h3>); i++; continue; }
    if (t.startsWith('## ')) { out.push(<h2 key={key++}>{inline(t.slice(3), navigate, `h${key}`)}</h2>); i++; continue; }
    const ck = Object.keys(CALLOUTS).find((mk) => t.startsWith(mk));
    if (ck) {
      const { label, cls } = CALLOUTS[ck];
      out.push(<div key={key++} className={`callout ${cls}`}><span className="callout-label">{label}</span><p>{inline(t.slice(ck.length).trim(), navigate, `c${key}`)}</p></div>);
      i++; continue;
    }
    if (t.startsWith('|')) {
      const rows: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) { rows.push(lines[i].trim()); i++; }
      const parsed = rows.map((r) => r.replace(/^\||\|$/g, '').split('|').map((c) => c.trim())).filter((cells) => !cells.every((c) => /^:?-+:?$/.test(c) || c === ''));
      if (parsed.length) {
        const [head, ...body] = parsed;
        out.push(
          <div key={key++} className="table-wrap"><table>
            <thead><tr>{head.map((c, ci) => <th key={ci}>{inline(c, navigate, `th${key}-${ci}`)}</th>)}</tr></thead>
            <tbody>{body.map((cells, ri) => <tr key={ri}>{cells.map((c, ci) => <td key={ci}>{inline(c, navigate, `td${key}-${ri}-${ci}`)}</td>)}</tr>)}</tbody>
          </table></div>
        );
      }
      continue;
    }
    if (/^\d+\.\s/.test(t)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) { items.push(lines[i].trim().replace(/^\d+\.\s/, '')); i++; }
      out.push(<ol key={key++}>{items.map((it, ii) => <li key={ii}>{inline(it, navigate, `ol${key}-${ii}`)}</li>)}</ol>);
      continue;
    }
    if (/^[-*]\s/.test(t)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i].trim())) { items.push(lines[i].trim().replace(/^[-*]\s/, '')); i++; }
      out.push(<ul key={key++}>{items.map((it, ii) => <li key={ii}>{inline(it, navigate, `ul${key}-${ii}`)}</li>)}</ul>);
      continue;
    }
    out.push(<p key={key++}>{inline(t, navigate, `p${key}`)}</p>);
    i++;
  }
  return out;
}

export default function App() {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.pathname));
  const [menuOpen, setMenuOpen] = useState(false);
  const [progress, setProgress] = useState<Progress>(loadProgress);

  const navigate = useCallback((r: Route) => {
    window.history.pushState({}, '', hrefFor(r));
    setRoute(r); setMenuOpen(false); window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const onPop = () => setRoute(parseRoute(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const chapters = useMemo(() => {
    const byCh: Record<number, Module[]> = {};
    for (const m of modules) (byCh[m.chapter] ||= []).push(m);
    return Object.keys(byCh).map(Number).sort((a, b) => a - b).map((n) => ({ n, name: chapterNames[n], items: byCh[n] }));
  }, []);

  const onQuizComplete = useCallback((id: string, score: number, total: number) => {
    setProgress((prev) => { const next = { ...prev, [id]: { score, total, at: new Date().toLocaleDateString('ja-JP') } }; saveProgress(next); return next; });
  }, []);

  return (
    <div className="app">
      <Header route={route} navigate={navigate} menuOpen={menuOpen} setMenuOpen={setMenuOpen} chapters={chapters} />
      <main className="main">
        {route.view === 'home' && <Home chapters={chapters} progress={progress} navigate={navigate} />}
        {route.view === 'module' && <ModulePage id={route.id} navigate={navigate} onQuizComplete={onQuizComplete} />}
        {route.view === 'glossary' && <GlossaryPage navigate={navigate} />}
        {route.view === 'guide' && <GuidePage navigate={navigate} />}
        {route.view === 'about' && <AboutPage />}
        {route.view === 'privacy' && <PrivacyPage />}
      </main>
      <Footer navigate={navigate} />
    </div>
  );
}

function Header({ route, navigate, menuOpen, setMenuOpen, chapters }: {
  route: Route; navigate: (r: Route) => void; menuOpen: boolean; setMenuOpen: (b: boolean) => void; chapters: { n: number; name: string; items: Module[] }[];
}) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="brand" href={`${BASE}/`} onClick={(e) => { e.preventDefault(); navigate({ view: 'home' }); }}>色彩検定UC級 学習ノート</a>
        <button className="menu-toggle" aria-label="メニュー" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><span /><span /><span /></button>
        <nav className={`site-nav ${menuOpen ? 'open' : ''}`}>
          <a href={`${BASE}/`} onClick={(e) => { e.preventDefault(); navigate({ view: 'home' }); }} className={route.view === 'home' ? 'active' : ''}>ホーム</a>
          <a href={`${BASE}/glossary/`} onClick={(e) => { e.preventDefault(); navigate({ view: 'glossary' }); }} className={route.view === 'glossary' ? 'active' : ''}>用語集</a>
          <a href={`${BASE}/guide/`} onClick={(e) => { e.preventDefault(); navigate({ view: 'guide' }); }} className={route.view === 'guide' ? 'active' : ''}>試験ガイド</a>
          <a href={`${BASE}/about/`} onClick={(e) => { e.preventDefault(); navigate({ view: 'about' }); }} className={route.view === 'about' ? 'active' : ''}>このサイトについて</a>
        </nav>
      </div>
      {menuOpen && (
        <nav className="mobile-chapters">
          {chapters.map((ch) => (
            <details key={ch.n}>
              <summary>第{ch.n}章 {ch.name}</summary>
              <ul>{ch.items.map((m) => <li key={m.id}><a href={`${BASE}/${m.id}/`} onClick={(e) => { e.preventDefault(); navigate({ view: 'module', id: m.id }); }}>{m.title}</a></li>)}</ul>
            </details>
          ))}
        </nav>
      )}
    </header>
  );
}

function Home({ chapters, progress, navigate }: { chapters: { n: number; name: string; items: Module[] }[]; progress: Progress; navigate: (r: Route) => void }) {
  return (
    <div className="home">
      <section className="hero">
        <p className="hero-eyebrow">文部科学省後援・色彩検定 UC級</p>
        <h1>色のユニバーサルデザインを、基礎からやさしく</h1>
        <p className="hero-lead">色の見え方は人それぞれ。色覚タイプや加齢による違いを理解し、だれにでも伝わる配色を学ぶ——色彩検定UC級の学習ノートです。図と確認問題でひとつずつ理解していきます。</p>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={() => navigate({ view: 'module', id: modules[0].id })}>最初のモジュールから始める</button>
          <button className="btn" onClick={() => navigate({ view: 'guide' })}>試験ガイドを見る</button>
        </div>
      </section>
      {chapters.map((ch) => (
        <section className="chapter-block" key={ch.n}>
          <div className="chapter-head"><span className="chapter-num">第{ch.n}章</span><h2>{ch.name}</h2></div>
          <ol className="module-list">
            {ch.items.map((m) => {
              const pr = progress[m.id];
              return (
                <li key={m.id}>
                  <a href={`${BASE}/${m.id}/`} onClick={(e) => { e.preventDefault(); navigate({ view: 'module', id: m.id }); }}>
                    <span className="module-title">{m.title}</span>
                    <span className="module-desc">{m.description}</span>
                    {pr && <span className="module-progress">前回 {pr.score}/{pr.total}</span>}
                  </a>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}

function ModulePage({ id, navigate, onQuizComplete }: { id: string; navigate: (r: Route) => void; onQuizComplete: (id: string, s: number, t: number) => void }) {
  const idx = modules.findIndex((m) => m.id === id);
  const mod = modules[idx];
  if (!mod) return <p>モジュールが見つかりませんでした。</p>;
  const prev = idx > 0 ? modules[idx - 1] : null;
  const next = idx < modules.length - 1 ? modules[idx + 1] : null;
  return (
    <article className="module">
      <nav className="breadcrumb">
        <a href={`${BASE}/`} onClick={(e) => { e.preventDefault(); navigate({ view: 'home' }); }}>ホーム</a>
        <span aria-hidden="true">/</span><span>第{mod.chapter}章 {chapterNames[mod.chapter]}</span>
      </nav>
      <header className="module-header">
        <p className="module-chapter">第{mod.chapter}章 {chapterNames[mod.chapter]}</p>
        <h1>{mod.title}</h1>
        <p className="module-lead">{mod.description}</p>
      </header>
      <div className="module-body">{renderContent(mod.content, navigate)}</div>
      {mod.keyPoints && mod.keyPoints.length > 0 && (
        <section className="keypoints"><h2>このモジュールのまとめ</h2><ul>{mod.keyPoints.map((k, i) => <li key={i}>{k}</li>)}</ul></section>
      )}
      <section className="quiz-section"><h2>理解度チェック</h2><Quiz questions={mod.quiz} onComplete={(s, t) => onQuizComplete(mod.id, s, t)} /></section>
      <nav className="module-nav">
        {prev ? <button className="btn" onClick={() => navigate({ view: 'module', id: prev.id })}>← {prev.title}</button> : <span />}
        {next ? <button className="btn btn-primary" onClick={() => navigate({ view: 'module', id: next.id })}>{next.title} →</button> : <button className="btn" onClick={() => navigate({ view: 'home' })}>ホームへ戻る</button>}
      </nav>
    </article>
  );
}

function GlossaryPage({ navigate }: { navigate: (r: Route) => void }) {
  const groups = useMemo(() => {
    const order: Term['level'][] = ['基礎', '頻出', '応用'];
    const byLevel: Record<string, Term[]> = {};
    for (const k of Object.keys(glossary)) { const t = glossary[k]; (byLevel[t.level] ||= []).push(t); }
    return order.filter((l) => byLevel[l]).map((l) => ({ level: l, items: byLevel[l] }));
  }, []);
  return (
    <div className="glossary">
      <h1>用語集</h1>
      <p className="page-lead">色彩検定UC級でよく出る用語を、やさしいことばでまとめました。色覚や眼に関する用語は、CUDO・日本眼科学会・日本遺伝学会などの解説に基づいています。</p>
      {groups.map((g) => (
        <section key={g.level}>
          <h2>{g.level}</h2>
          <dl className="term-list">
            {g.items.map((t) => (
              <Fragment key={t.id}>
                <dt id={`term-${t.id}`}>{t.term}</dt>
                <dd>{t.explanation}
                  {t.relatedTerms && t.relatedTerms.length > 0 && (
                    <span className="related">関連：{t.relatedTerms.filter((r) => glossary[r]).map((r, ri, arr) => (
                      <Fragment key={r}>
                        <a href={`${BASE}/glossary/#term-${r}`} onClick={(e) => { e.preventDefault(); document.getElementById(`term-${r}`)?.scrollIntoView({ behavior: 'smooth' }); }}>{glossary[r].term.split('（')[0]}</a>
                        {ri < arr.length - 1 ? '、' : ''}
                      </Fragment>
                    ))}</span>
                  )}
                </dd>
              </Fragment>
            ))}
          </dl>
        </section>
      ))}
      <p className="back"><button className="btn" onClick={() => navigate({ view: 'home' })}>← ホームへ戻る</button></p>
    </div>
  );
}

function GuidePage({ navigate }: { navigate: (r: Route) => void }) {
  const s = EXAM_CONFIG.schedule2026;
  return (
    <div className="guide">
      <h1>色彩検定UC級 試験ガイド</h1>
      <p className="page-lead">{EXAM_CONFIG.organizer}が実施する、{EXAM_CONFIG.patronage}の検定です（UC級は{EXAM_CONFIG.established}年創設）。下記は公式情報をもとにした概要で、日程・検定料・合格基準は年度・回ごとに変わるため、申込前に必ず公式サイトでご確認ください。</p>
      <div className="table-wrap"><table><tbody>
        <tr><th>実施団体</th><td>{EXAM_CONFIG.organizer}（{EXAM_CONFIG.patronage}）</td></tr>
        <tr><th>出題形式</th><td>{EXAM_CONFIG.format}</td></tr>
        <tr><th>試験時間</th><td>{EXAM_CONFIG.duration}分</td></tr>
        <tr><th>満点・合格基準</th><td>{EXAM_CONFIG.fullScore}点満点。{EXAM_CONFIG.passingScoreLabel}</td></tr>
        <tr><th>検定料</th><td>{EXAM_CONFIG.feeLabel}</td></tr>
        <tr><th>受験資格</th><td>{EXAM_CONFIG.eligibility}</td></tr>
        <tr><th>実施時期</th><td>{EXAM_CONFIG.frequency}。夏期＝{EXAM_CONFIG.summerMonth}月、冬期＝{EXAM_CONFIG.winterMonth}月</td></tr>
      </tbody></table></div>
      <h2>2026年度の日程</h2>
      <div className="table-wrap"><table>
        <thead><tr><th></th><th>試験日</th><th>申込期間</th></tr></thead>
        <tbody>
          <tr><th>夏期</th><td>{s.summerExamDate}</td><td>{s.summerApplication}</td></tr>
          <tr><th>冬期</th><td>{s.winterExamDate}</td><td>{s.winterApplication}</td></tr>
        </tbody>
      </table></div>
      <h2>学習の進め方</h2>
      <p>UC級は「色のユニバーサルデザイン」が主題です。色の見えるしくみや色覚タイプ、加齢による見え方を理解し、明度差・色名併記・模様などで「だれにでも伝わる配色」を学びます。色の三属性やPCCSなどの共通基礎は、<a href="https://study-apps.com/color-g3/" target="_blank" rel="noopener noreferrer">色彩検定3級の学習ノート</a>でも扱っています。</p>
      <p className="notice">※本サイトは個人が運営する学習支援サイトであり、{EXAM_CONFIG.organizer}の公式サイトではありません。最新かつ正確な試験情報は公式サイトでご確認ください。</p>
      <p className="back"><button className="btn" onClick={() => navigate({ view: 'home' })}>← ホームへ戻る</button></p>
    </div>
  );
}

function AboutPage() {
  return (
    <div className="about">
      <h1>このサイトについて</h1>
      <h2>サイトの目的と対象</h2>
      <p>「色彩検定UC級 学習ノート」は、色のユニバーサルデザイン（UC級）の合格を目指す独学者のための学習支援サイトです。色の見えるしくみ、色覚タイプや加齢による見え方の違い、だれにでも伝わる配色の工夫を、図と確認問題でていねいに解説します。</p>
      <h2>コンテンツ構成</h2>
      <p>公式テキストの分野構成に沿って全6章・各モジュールに分け、本文・図・理解度チェックで構成しています。あわせて用語集と試験ガイドを用意しています。色の三属性やPCCSなどの共通基礎は、姉妹サイトの<a href="https://study-apps.com/color-g3/" target="_blank" rel="noopener noreferrer">色彩検定3級の学習ノート</a>とも内容を合わせています。</p>
      <h2>編集・制作方針</h2>
      <p>本サイトの解説は、公式が示す出題範囲や、CUDO（カラーユニバーサルデザイン機構）・日本眼科学会・日本遺伝学会などの公的・学術的な解説で事実を確認したうえで、運営者が内容を理解し<strong>すべて自分のことばで書き起こして</strong>います。出典は事実確認のために用い、文章をそのまま転載することはしていません。色覚に関する記述は「色覚多様性」（日本遺伝学会2017）の枠組みで中立に記し、旧称（色盲・色弱など）は原則として使いません。誤りに気づいた場合は随時修正します。</p>
      <h2>医療・健康に関する注意</h2>
      <p>本サイトの色覚・眼に関する記述は、一般的な学習のための説明であり、個人の診断や医学的な助言を目的とするものではありません。見え方や目の症状で気になることがある場合は、眼科医にご相談ください。</p>
      <h2>運営者について</h2>
      <p>個人が運営しています。広告収入はサーバー・ドメインなどの維持費に充てています。</p>
      <h2>お問い合わせ</h2>
      <p>内容の誤りのご指摘やご意見は、<a href="https://forms.gle/ccMv7oKwz6ysDHBe6" target="_blank" rel="noopener noreferrer">お問い合わせフォーム</a>よりお寄せください。</p>
      <h2>免責事項</h2>
      <p>本サイトは内容の正確性に努めていますが、その完全性・正確性・有用性を保証するものではありません。本サイトは個人による学習支援サイトであり、色彩検定協会の公式サイトではありません。試験の最新情報・正確な情報は必ず公式サイトでご確認ください。本サイトの利用によって生じたいかなる損害についても責任を負いかねます。</p>
    </div>
  );
}

function PrivacyPage() {
  return (
    <div className="privacy">
      <h1>プライバシーポリシー</h1>
      <h2>アクセス解析（Google Analytics）</h2>
      <p>本サイトは、利用状況の把握のためGoogle Analytics（GA4）を利用しています。Cookieを用いて匿名のトラフィックデータを収集するもので、個人を特定する情報は含みません。</p>
      <h2>広告配信（Google AdSense）</h2>
      <p>本サイトは第三者配信の広告サービスGoogleAdSenseを利用しています。第三者配信事業者はCookieを使用して、ユーザーの興味に応じた広告を表示することがあります。</p>
      <h2>Cookieの送信と無効化</h2>
      <p>これらのCookieにより、Googleや広告事業者にデータが送信されます。ユーザーは<a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer">Googleの広告設定</a>でパーソナライズ広告を無効にできます。ブラウザの設定でCookieを無効にすることも可能です。</p>
      <h2>免責事項</h2>
      <p>本サイトの情報の利用により生じた損害について、運営者は責任を負いません。</p>
      <h2>お問い合わせ</h2>
      <p>本ポリシーに関するお問い合わせは<a href="https://forms.gle/ccMv7oKwz6ysDHBe6" target="_blank" rel="noopener noreferrer">お問い合わせフォーム</a>よりお願いします。</p>
      <p className="notice">最終更新日：2026年6月21日</p>
    </div>
  );
}

function Footer({ navigate }: { navigate: (r: Route) => void }) {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <nav className="footer-nav">
          <a href={`${BASE}/`} onClick={(e) => { e.preventDefault(); navigate({ view: 'home' }); }}>ホーム</a>
          <a href={`${BASE}/glossary/`} onClick={(e) => { e.preventDefault(); navigate({ view: 'glossary' }); }}>用語集</a>
          <a href={`${BASE}/guide/`} onClick={(e) => { e.preventDefault(); navigate({ view: 'guide' }); }}>試験ガイド</a>
          <a href={`${BASE}/about/`} onClick={(e) => { e.preventDefault(); navigate({ view: 'about' }); }}>このサイトについて</a>
          <a href={`${BASE}/privacy/`} onClick={(e) => { e.preventDefault(); navigate({ view: 'privacy' }); }}>プライバシーポリシー</a>
          <a href="https://study-apps.com/" target="_blank" rel="noopener noreferrer">study-apps.com</a>
        </nav>
        <p className="footer-note">個人運営の学習支援サイトです。色彩検定協会の公式サイトではありません。色覚・目に関する記述は一般的な説明で、医学的助言ではありません。</p>
      </div>
    </footer>
  );
}
