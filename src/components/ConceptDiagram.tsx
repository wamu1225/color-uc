// ConceptDiagram — UC級の概念を図で示すSVG群。[[diagram:KEY]] で本文に埋め込む。
// 方針：色覚タイプ別の「見え方」を断定的に再現するシミュレーションは行わない（不確実・誤解を招くため）。
// 代わりに、CUDの設計原則（色だけに頼らない・明度差をつける）を示す図と、分光反射率の模式を提供する。
import type { ReactNode } from 'react';

export const DIAGRAM_KEYS = ['cud-before-after', 'meido-contrast', 'spectral', 'confusion-pairs', 'confusion-lines'] as const;

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

// 本文が名前だけで挙げている混同しやすい組み合わせを、実際の色で並べる。
// 右列は同じ色から色みを取り去って明度だけにしたもの（グレースケール変換であって、
// 特定の色覚タイプの見え方の再現ではない＝冒頭の方針どおりシミュレーションはしない）。
// 明度がほぼ同じ組みは、色を手がかりにできないと差が残らないことが見て分かる。
const PAIRS: { label: string; a: string; b: string; an: string; bn: string }[] = [
  { label: '赤と緑', a: '#d7332e', b: '#2e9e4f', an: '赤', bn: '緑' },
  { label: '暗い赤と茶', a: '#9b2d22', b: '#6b4226', an: '暗い赤', bn: '茶' },
  { label: '緑と灰色', a: '#5a8f63', b: '#8a8a8a', an: '緑', bn: '灰色' },
  { label: '水色とピンク', a: '#7fd4e8', b: '#f2a6c0', an: '水色', bn: 'ピンク' },
  { label: '緑とオレンジ', a: '#3f9b4f', b: '#e08a2e', an: '緑', bn: 'オレンジ' },
];

// sRGB の相対輝度（WCAG と同じ定義）。同じ輝度の無彩色に置き換えるために使う。
function luminance(hex: string) {
  const c = [1, 3, 5].map((i) => parseInt(hex.substr(i, 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function grayOf(hex: string) {
  const L = luminance(hex);
  const v = L <= 0.0031308 ? L * 12.92 : 1.055 * Math.pow(L, 1 / 2.4) - 0.055;
  const n = Math.round(v * 255).toString(16).padStart(2, '0');
  return `#${n}${n}${n}`;
}
// 明度の近さ。1に近いほど「色を除くと差が消える」組み合わせ。
function lumRatio(a: string, b: string) {
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

function ConfusionPairs() {
  // 幅の内訳（合計470に収める）：ラベル78 / 左ペア146 / 間22 / 右ペア146 / 明度比66
  const rowH = 46, top = 30, swW = 70, gap = 6;
  const colL = 80, colR = colL + swW * 2 + gap + 22;
  const W = 470, H = top + rowH * PAIRS.length + 16;
  return (
    <Figure
      label="本文で挙げた組み合わせを実際の色で並べたもの。左は色のまま、右は色みを取り去って明度だけにしたもの。明度差の比が1に近い組みほど、色を手がかりにできないときに差が残らない。右列は明度をそろえて比べるための変換で、特定の色覚タイプの見え方を再現したものではない。"
      max={470}
    >
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="混同しやすい色の組み合わせを、色のままと明度だけにした場合とで並べた図">
        <text x={colL + swW + gap / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="700" fill="#444">色のまま</text>
        <text x={colR + swW + gap / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="700" fill="#444">明度だけにする</text>
        {PAIRS.map((p, i) => {
          const y = top + i * rowH;
          const r = lumRatio(p.a, p.b);
          return (
            <g key={p.label}>
              <text x={6} y={y + 22} fontSize="10.5" fill="#333">{p.label}</text>
              <rect x={colL} y={y} width={swW} height={34} rx={3} fill={p.a} />
              <rect x={colL + swW + gap} y={y} width={swW} height={34} rx={3} fill={p.b} />
              <rect x={colR} y={y} width={swW} height={34} rx={3} fill={grayOf(p.a)} />
              <rect x={colR + swW + gap} y={y} width={swW} height={34} rx={3} fill={grayOf(p.b)} />
              <text x={W - 4} y={y + 22} textAnchor="end" fontSize="10.5" fill={r < 1.5 ? '#9a3a2f' : '#555'}>
                明度比 {r.toFixed(1)}
              </text>
            </g>
          );
        })}
      </svg>
    </Figure>
  );
}

// xy色度図（CIE1931 2度視野）の上に、混同色線と混同色中心を描く。
// スペクトル軌跡は Wyman, Sloan & Shirley (2013) の等色関数近似から 420〜645nm を計算したもので、
// 公表値との差は xy で最大 0.008（この図の縮尺で約2px）。手描きの模式ではない。
const LOCUS: [number, number][] = [
  [0.1762, 0.0067], [0.1675, 0.0061], [0.1636, 0.0062], [0.1654, 0.0071], [0.1698, 0.009],
  [0.166, 0.0117], [0.1592, 0.0154], [0.1505, 0.0205], [0.1399, 0.0277], [0.1303, 0.0388],
  [0.1215, 0.0568], [0.1111, 0.086], [0.0958, 0.1323], [0.0731, 0.2022], [0.0447, 0.299],
  [0.0181, 0.4181], [0.0037, 0.5446], [0.007, 0.6578], [0.0246, 0.7429], [0.0509, 0.7954],
  [0.0813, 0.8197], [0.114, 0.8228], [0.1492, 0.8104], [0.1869, 0.7874], [0.2251, 0.7588],
  [0.2636, 0.7264], [0.302, 0.6918], [0.3401, 0.6562], [0.3775, 0.6203], [0.4137, 0.585],
  [0.4482, 0.551], [0.4814, 0.5181], [0.5133, 0.4864], [0.5436, 0.4562], [0.5723, 0.4276],
  [0.5993, 0.4006], [0.6247, 0.3753], [0.6473, 0.3527], [0.6665, 0.3335], [0.6824, 0.3175],
  [0.6955, 0.3045], [0.7057, 0.2943], [0.7134, 0.2866], [0.7187, 0.2813], [0.7217, 0.2783],
  [0.7224, 0.2776],
];
// 混同色中心（copunctal point）の標準値。2型は色度図の外側にあることに注意。
// anchor/dx/dy はラベルの置き場所。馬蹄形の輪郭や図の端に重ならない側へ逃がしている。
const COPUNCTAL: { key: string; name: string; x: number; y: number; color: string; anchor: 'start' | 'end'; dx: number; dy: number }[] = [
  { key: 'p', name: '1型の混同色中心', x: 0.747, y: 0.253, color: '#b23a2e', anchor: 'start', dx: 10, dy: 4 },
  { key: 'd', name: '2型の混同色中心', x: 1.080, y: -0.080, color: '#1f6f43', anchor: 'end', dx: -10, dy: 4 },
  { key: 't', name: '3型の混同色中心', x: 0.171, y: 0.000, color: '#2f5fa8', anchor: 'start', dx: 8, dy: 16 },
];

function ConfusionLines() {
  const W = 470, padL = 40, padR = 12, padT = 16, padB = 40;
  const xMin = -0.03, xMax = 1.14, yMin = -0.13, yMax = 0.88;
  const pw = W - padL - padR;
  const ph = pw * ((yMax - yMin) / (xMax - xMin));
  const H = ph + padT + padB;
  const X = (x: number) => padL + ((x - xMin) / (xMax - xMin)) * pw;
  const Y = (y: number) => padT + (1 - (y - yMin) / (yMax - yMin)) * ph;
  const locusPath = LOCUS.map((p, i) => `${i === 0 ? 'M' : 'L'} ${X(p[0]).toFixed(1)} ${Y(p[1]).toFixed(1)}`).join(' ') + ' Z';

  // 混同色中心から放射する線を、色度図の内側だけに見えるよう clip して描く。
  const ray = (cx: number, cy: number, tx: number, ty: number) => {
    const dx = tx - cx, dy = ty - cy;
    const k = 3 / Math.hypot(dx, dy);
    return { x1: X(cx), y1: Y(cy), x2: X(cx + dx * k), y2: Y(cy + dy * k) };
  };
  const pRays = [[0.20, 0.18], [0.24, 0.34], [0.28, 0.50], [0.33, 0.64]].map((t) => ray(0.747, 0.253, t[0], t[1]));
  const tRays = [[0.30, 0.58], [0.42, 0.48], [0.52, 0.40], [0.62, 0.33]].map((t) => ray(0.171, 0.0, t[0], t[1]));

  return (
    <Figure
      label="xy色度図の上に、1型（赤）と3型（青）の混同色線を引いたもの。1本の線の上に乗る色どうしが、そのタイプには似て見えやすい。線が集まる点が混同色中心で、タイプごとに位置が違う。2型の中心は色度図の外側にあるため、図の右下に位置だけを示した。馬蹄形の輪郭は CIE1931 等色関数から計算した曲線（420〜645nm）。輪郭の内側を着色していないのは、この範囲の色の大半が画面のsRGBでは表示できないため。"
      max={480}
    >
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="xy色度図上の混同色線と混同色中心">
        <defs>
          <clipPath id="locusClip"><path d={locusPath} /></clipPath>
        </defs>
        {/* 軸 */}
        <line x1={X(xMin)} y1={Y(0)} x2={X(xMax)} y2={Y(0)} stroke="#cfc9bf" />
        <line x1={X(0)} y1={Y(yMin)} x2={X(0)} y2={Y(yMax)} stroke="#cfc9bf" />
        <text x={X(0.55)} y={H - 10} textAnchor="middle" fontSize="11" fill="#555">x</text>
        <text x={12} y={Y(0.4)} textAnchor="middle" fontSize="11" fill="#555" transform={`rotate(-90 12 ${Y(0.4)})`}>y</text>

        {/* 色度図の輪郭 */}
        <path d={locusPath} fill="#f2efe9" stroke="#8c8577" strokeWidth="1.4" />

        {/* 混同色線（輪郭の内側だけ） */}
        <g clipPath="url(#locusClip)">
          {pRays.map((r, i) => <line key={`p${i}`} {...r} stroke="#b23a2e" strokeWidth="1.6" opacity="0.85" />)}
          {tRays.map((r, i) => <line key={`t${i}`} {...r} stroke="#2f5fa8" strokeWidth="1.6" opacity="0.85" strokeDasharray="5 3" />)}
        </g>

        {/* 混同色中心 */}
        {COPUNCTAL.map((c) => (
          <g key={c.key}>
            <circle cx={X(c.x)} cy={Y(c.y)} r={5} fill={c.color} stroke="#fff" strokeWidth="1.5" />
            <text x={X(c.x) + c.dx} y={Y(c.y) + c.dy} textAnchor={c.anchor} fontSize="10.5" fontWeight="700" fill={c.color}>{c.name}</text>
          </g>
        ))}

        {/* 凡例：馬蹄形の外側（右上の空き）に置く */}
        <g transform={`translate(${X(0.66)}, ${Y(0.84)})`}>
          <line x1={0} y1={6} x2={22} y2={6} stroke="#b23a2e" strokeWidth="1.6" />
          <text x={27} y={9.5} fontSize="10.5" fill="#444">1型の混同色線</text>
          <line x1={0} y1={22} x2={22} y2={22} stroke="#2f5fa8" strokeWidth="1.6" strokeDasharray="5 3" />
          <text x={27} y={25.5} fontSize="10.5" fill="#444">3型の混同色線</text>
        </g>
      </svg>
    </Figure>
  );
}

export default function ConceptDiagram({ dkey }: { dkey: string }) {
  switch (dkey) {
    case 'cud-before-after': return <CudBeforeAfter />;
    case 'meido-contrast': return <MeidoContrast />;
    case 'spectral': return <Spectral />;
    case 'confusion-pairs': return <ConfusionPairs />;
    case 'confusion-lines': return <ConfusionLines />;
    default: return null;
  }
}
