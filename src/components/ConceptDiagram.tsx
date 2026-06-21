// ConceptDiagram — UC級の概念を図で示すSVG群。[[diagram:KEY]] で本文に埋め込む。
// 方針：色覚タイプ別の「見え方」を断定的に再現するシミュレーションは行わない（不確実・誤解を招くため）。
// 代わりに、CUDの設計原則（色だけに頼らない・明度差をつける）を示す図と、分光反射率の模式を提供する。
import type { ReactNode } from 'react';

export const DIAGRAM_KEYS = ['cud-before-after', 'meido-contrast', 'spectral'] as const;

function Figure({ label, children, max = 420 }: { label: string; children: ReactNode; max?: number }) {
  return (
    <figure className="viz diagram-viz" style={{ maxWidth: max }}>
      {children}
      <figcaption className="viz-caption">{label}</figcaption>
    </figure>
  );
}

// CUD改善前後：色だけ（左）→ 明度差＋模様＋ラベル（右）
function CudBeforeAfter() {
  return (
    <Figure label="色だけに頼った配色（左）と、明度差・模様・ラベルを足した配色（右）。色以外の手がかりがあると、色の見え方によらず区別しやすくなる。" max={460}>
      <svg viewBox="0 0 460 180" width="100%" role="img" aria-label="CUD改善前後の模式図">
        <defs>
          <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="6" height="6" fill="#1f6f43" />
            <line x1="0" y1="0" x2="0" y2="6" stroke="#ffffff" strokeWidth="2" />
          </pattern>
        </defs>
        {/* 左：色だけ */}
        <text x="110" y="20" textAnchor="middle" fontSize="13" fontWeight="700" fill="#9a3a2f">改善前（色だけ）</text>
        <rect x="40" y="36" width="140" height="40" rx="4" fill="#c0392b" />
        <rect x="40" y="86" width="140" height="40" rx="4" fill="#2f9e44" />
        <text x="110" y="152" textAnchor="middle" fontSize="11" fill="#555">色だけでは区別しにくい</text>
        {/* 右：明度差＋模様＋ラベル */}
        <text x="350" y="20" textAnchor="middle" fontSize="13" fontWeight="700" fill="#2f6d5b">改善後</text>
        <rect x="280" y="36" width="140" height="40" rx="4" fill="#e57373" />
        <text x="350" y="61" textAnchor="middle" fontSize="13" fontWeight="700" fill="#5a1a14">未達成</text>
        <rect x="280" y="86" width="140" height="40" rx="4" fill="url(#hatch)" />
        <text x="350" y="111" textAnchor="middle" fontSize="13" fontWeight="700" fill="#ffffff">達成</text>
        <text x="350" y="152" textAnchor="middle" fontSize="11" fill="#555">明度差＋模様＋文字で区別</text>
      </svg>
    </Figure>
  );
}

// 明度差デモ：明度差が小さい（左）と大きい（右）
function MeidoContrast() {
  return (
    <Figure label="図と背景の明度差が小さいと（左）読みにくく、明度差を大きくすると（右）読みやすい。色のUDでは明度差をはっきりつけるのが要。" max={460}>
      <svg viewBox="0 0 460 150" width="100%" role="img" aria-label="明度差の模式図">
        <text x="110" y="20" textAnchor="middle" fontSize="13" fontWeight="700" fill="#9a3a2f">明度差が小さい</text>
        <rect x="30" y="34" width="160" height="90" rx="6" fill="#5fae6e" />
        <text x="110" y="86" textAnchor="middle" fontSize="22" fontWeight="700" fill="#b14b3f">あ</text>
        <text x="350" y="20" textAnchor="middle" fontSize="13" fontWeight="700" fill="#2f6d5b">明度差が大きい</text>
        <rect x="270" y="34" width="160" height="90" rx="6" fill="#0d4d2b" />
        <text x="350" y="86" textAnchor="middle" fontSize="22" fontWeight="700" fill="#ffffff">あ</text>
      </svg>
    </Figure>
  );
}

// 分光反射率曲線（赤い物体の模式）
function Spectral() {
  // 短波長で低く、長波長で高い（赤）模式カーブ
  const pts = [
    [0, 0.18], [0.15, 0.16], [0.3, 0.15], [0.45, 0.18], [0.6, 0.3], [0.72, 0.55], [0.85, 0.8], [1, 0.9],
  ];
  const W = 360, H = 200, padL = 44, padB = 36, padT = 16, padR = 14;
  const pw = W - padL - padR, ph = H - padT - padB;
  const X = (x: number) => padL + x * pw;
  const Y = (y: number) => padT + (1 - y) * ph;
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${X(p[0]).toFixed(1)} ${Y(p[1]).toFixed(1)}`).join(' ');
  return (
    <Figure label="分光反射率曲線の模式（赤い物体の例）。横軸が波長（左＝短い/青、右＝長い/赤）、縦軸が反射率。長波長側の反射率が高いほど赤く見える。" max={400}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="分光反射率曲線の模式図">
        <rect x={padL} y={padT} width={pw} height={ph} fill="#fff" stroke="#e2dfd7" />
        <path d={d} fill="none" stroke="#c0392b" strokeWidth="3" />
        <text x={14} y={padT + ph / 2} textAnchor="middle" fontSize="11" fill="#555" transform={`rotate(-90 14 ${padT + ph / 2})`}>反射率</text>
        <text x={padL + pw / 2} y={H - 8} textAnchor="middle" fontSize="11" fill="#555">波長（左＝青／短い・右＝赤／長い）</text>
      </svg>
    </Figure>
  );
}

export default function ConceptDiagram({ dkey }: { dkey: string }) {
  switch (dkey) {
    case 'cud-before-after': return <CudBeforeAfter />;
    case 'meido-contrast': return <MeidoContrast />;
    case 'spectral': return <Spectral />;
    default: return null;
  }
}
