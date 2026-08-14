// ConceptDiagram — UC級の概念を図で示すSVG群。[[diagram:KEY]] で本文に埋め込む。
// 方針：色覚タイプ別の「見え方」を断定的に再現するシミュレーションは行わない（不確実・誤解を招くため）。
// 代わりに、CUDの設計原則（色だけに頼らない・明度差をつける）を示す図と、分光反射率の模式を提供する。
import type { ReactNode } from 'react';

export const DIAGRAM_KEYS = [
  'cud-before-after', 'meido-contrast', 'spectral', 'confusion-pairs', 'confusion-lines',
  'cone-sensitivity', 'opponent-stages', 'type-cones', 'vision-conditions',
  'name-modifiers', 'x-linked', 'lens-transmittance', 'cud-cycle',
] as const;

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
    <Figure label="色だけに頼った配色（左）と、明度差・模様・ラベルを足した配色（右）です。色以外の手がかりがあると、色の見え方によらず区別しやすくなります。" max={460}>
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
    <Figure label="図と背景の明度差が小さいと（左）読みにくく、明度差を大きくすると（右）読みやすくなります。色のUDでは、明度差をはっきりつけることが要になります。" max={460}>
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
    <Figure label="分光反射率曲線の模式です（赤い物体の例）。横軸が波長（左＝短い/青、右＝長い/赤）、縦軸が反射率で、長波長側の反射率が高いほど赤く見えます。" max={400}>
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
      label="本文で挙げた組み合わせを実際の色で並べたものです。左は色のまま、右は色みを取り去って明度だけにしたものです。明度差の比が1に近い組みほど、色を手がかりにできないときに差が残りません。右列は明度をそろえて比べるための変換で、特定の色覚タイプの見え方を再現したものではありません。"
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
      label="xy色度図の上に、1型（赤）と3型（青）の混同色線を引いたものです。1本の線の上に乗る色どうしが、そのタイプには似て見えやすくなります。線が集まる点が混同色中心で、タイプごとに位置が違います。2型の中心は色度図の外側にあるため、図の右下に位置だけを示しました。馬蹄形の輪郭は CIE1931 等色関数から計算した曲線（420〜645nm）です。輪郭の内側を着色していないのは、この範囲の色の大半が画面のsRGBでは表示できないためです。"
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

// ── 錐体（L/M/S）の感度カーブ ────────────────────────────────────
// CIE1931 等色関数（Wyman, Sloan & Shirley 2013 の多ローブ近似＝上の色度図の馬蹄形と同じ出所）を
// Hunt–Pointer–Estévez 変換で錐体の感度に直したもの。手描きの模式ではない。
// この導出でのピークは L≈576nm / M≈547nm / S≈448nm（1nm刻みで探索した実測値）。
// 錐体感度の推定値は資料により幅があるため、キャプションで本文の数値との違いに触れている。
function gauss(x: number, mu: number, s1: number, s2: number) {
  const t = (x - mu) * (x < mu ? 1 / s1 : 1 / s2);
  return Math.exp(-0.5 * t * t);
}
function xyzBar(l: number): [number, number, number] {
  return [
    1.056 * gauss(l, 599.8, 37.9, 31.0) + 0.362 * gauss(l, 442.0, 16.0, 26.7) - 0.065 * gauss(l, 501.1, 20.4, 26.2),
    0.821 * gauss(l, 568.8, 46.9, 40.5) + 0.286 * gauss(l, 530.9, 16.3, 31.1),
    1.217 * gauss(l, 437.0, 11.8, 36.0) + 0.681 * gauss(l, 459.0, 26.0, 13.8),
  ];
}
const CONE_MAX = { L: 0.9630, M: 1.0798, S: 1.7842 }; // 上の式の最大値（380〜720nmを1nm刻みで探索）
type ConeKey = 'L' | 'M' | 'S';
function coneSensitivity(l: number): Record<ConeKey, number> {
  const [X, Y, Z] = xyzBar(l);
  return {
    L: Math.max(0, (0.38971 * X + 0.68898 * Y - 0.07868 * Z) / CONE_MAX.L),
    M: Math.max(0, (-0.22981 * X + 1.18340 * Y + 0.04641 * Z) / CONE_MAX.M),
    S: Math.max(0, Z / CONE_MAX.S),
  };
}
const CONE: Record<ConeKey, { color: string; name: string; peak: number }> = {
  S: { color: '#2f5fa8', name: 'S錐体', peak: 448 },
  M: { color: '#1f6f43', name: 'M錐体', peak: 547 },
  L: { color: '#b23a2e', name: 'L錐体', peak: 576 },
};
// 感度カーブの経路。X/Y は呼び出し側の座標変換。
function conePath(key: ConeKey, X: (l: number) => number, Y: (v: number) => number, from = 400, to = 700) {
  const pts: string[] = [];
  for (let l = from; l <= to; l += 2) {
    pts.push(`${pts.length === 0 ? 'M' : 'L'} ${X(l).toFixed(1)} ${Y(coneSensitivity(l)[key]).toFixed(1)}`);
  }
  return pts.join(' ');
}
// 波長のおおよその色。画面のsRGBで表せる範囲での近似（純粋な単色光の色ではない）。
const SPECTRUM_STOPS: [number, string][] = [
  [400, '#5b00a0'], [430, '#2200d4'], [460, '#0064ff'], [480, '#00a8e0'], [500, '#00c07a'],
  [520, '#43d400'], [545, '#a9e000'], [570, '#f2d200'], [590, '#ff9d00'], [610, '#ff5a00'],
  [640, '#e01000'], [670, '#a80000'], [700, '#7a0000'],
];

function ConeSensitivity() {
  const W = 470, padL = 42, padR = 16, padT = 18, ph = 168;
  const lMin = 400, lMax = 700;
  const plotB = padT + ph;
  const stripY = plotB + 34, stripH = 11;
  const H = stripY + stripH + 24;
  const X = (l: number) => padL + ((l - lMin) / (lMax - lMin)) * (W - padL - padR);
  const Y = (v: number) => padT + (1 - v) * ph;
  const ticks = [400, 450, 500, 550, 600, 650, 700];
  // ピークの真下は3本とも空いているので、そこにラベルを置いて点線でカーブとつなぐ。
  const labelAt: Record<ConeKey, number> = { S: 0.5, M: 0.42, L: 0.28 };
  return (
    <Figure
      label="3種類の錐体が、どの波長の光をどれくらい感じ取るかを表した曲線です。S（青寄り）は他の2つと離れているのに対し、L（赤寄り）とM（緑寄り）は感じる範囲が大きく重なっています。第4章で学ぶ「赤と緑が混同されやすい」のは、この重なりが背景にあります。曲線はCIE1931等色関数（Wyman ほか 2013 の近似）をHunt–Pointer–Estévez変換で錐体感度に直したもので、この導出でのピークはL約576nm・M約547nm・S約448nmです。本文に挙げた数値とずれるのは、錐体感度の推定に資料ごとの幅があるためで、UC級では「L＝長・M＝中・S＝短」の対応を押さえれば十分です。"
      max={470}
    >
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="L・M・S錐体の分光感度曲線。SとM・Lが離れ、LとMは大きく重なっている">
        <defs>
          <linearGradient id="ucSpectrum" x1="0" y1="0" x2="1" y2="0">
            {SPECTRUM_STOPS.map(([l, c]) => (
              <stop key={l} offset={`${((l - lMin) / (lMax - lMin)) * 100}%`} stopColor={c} />
            ))}
          </linearGradient>
        </defs>

        {/* LとMが重なる範囲を薄く塗る */}
        <rect x={X(520)} y={padT} width={X(620) - X(520)} height={ph} fill="#000000" opacity="0.045" />

        {/* 目盛り */}
        {[0, 0.5, 1].map((v) => (
          <g key={v}>
            <line x1={padL} y1={Y(v)} x2={W - padR} y2={Y(v)} stroke="#e2dfd7" />
            <text x={padL - 6} y={Y(v) + 4} textAnchor="end" fontSize="10" fill="#777">{v.toFixed(1)}</text>
          </g>
        ))}
        <text x={13} y={Y(0.5)} textAnchor="middle" fontSize="11" fill="#555" transform={`rotate(-90 13 ${Y(0.5)})`}>相対感度</text>

        {/* 感度カーブ */}
        {(['S', 'M', 'L'] as ConeKey[]).map((k) => (
          <path key={k} d={conePath(k, X, Y)} fill="none" stroke={CONE[k].color} strokeWidth="2.4" />
        ))}

        {/* ピークの真下にラベル（点線で対応づけ） */}
        {(['S', 'M', 'L'] as ConeKey[]).map((k) => {
          const px = X(CONE[k].peak), ly = Y(labelAt[k]);
          return (
            <g key={`lb-${k}`}>
              <line x1={px} y1={Y(0.97)} x2={px} y2={ly - 12} stroke={CONE[k].color} strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
              <text x={px} y={ly} textAnchor="middle" fontSize="12.5" fontWeight="700" fill={CONE[k].color}>{CONE[k].name}</text>
            </g>
          );
        })}

        {/* 重なりの注記 */}
        <line x1={X(520)} y1={plotB + 6} x2={X(620)} y2={plotB + 6} stroke="#8c8577" strokeWidth="1" />
        <text x={(X(520) + X(620)) / 2} y={plotB + 19} textAnchor="middle" fontSize="11" fill="#555">LとMが重なる範囲</text>

        {/* 波長軸と、波長のおおよその色 */}
        {ticks.map((t) => (
          <text key={t} x={X(t)} y={stripY - 4} textAnchor="middle" fontSize="10" fill="#777">{t}</text>
        ))}
        <rect x={padL} y={stripY} width={W - padL - padR} height={stripH} fill="url(#ucSpectrum)" stroke="#cfc9bf" strokeWidth="0.6" />
        <text x={padL + (W - padL - padR) / 2} y={stripY + stripH + 17} textAnchor="middle" fontSize="11" fill="#555">
          波長（nm）　左＝短い（青紫）／右＝長い（赤）
        </text>
      </svg>
    </Figure>
  );
}

// 段階説：入口は三色説（L/M/S で受け取る）、その後の処理は反対色説（赤⇔緑・黄⇔青・白⇔黒）。
function OpponentStages() {
  const W = 470, H = 236;
  const boxW = 104, boxH = 40;
  const leftX = 16, rightX = W - 16 - boxW;
  const rows = [56, 110, 164];
  const cones: { k: ConeKey; y: number; note: string }[] = [
    { k: 'L', y: rows[0], note: '長波長' },
    { k: 'M', y: rows[1], note: '中波長' },
    { k: 'S', y: rows[2], note: '短波長' },
  ];
  const channels = [
    { y: rows[0], label: '赤　⇔　緑', calc: 'L と M の差', a: '#b23a2e', b: '#1f6f43' },
    { y: rows[1], label: '黄　⇔　青', calc: 'L＋M と S の差', a: '#d9a400', b: '#2f5fa8' },
    { y: rows[2], label: '白　⇔　黒', calc: 'L＋M の合計', a: '#555555', b: '#111111' },
  ];
  const midX = W / 2;
  return (
    <Figure
      label="段階説の考え方です。入口では三色説のとおりL・M・Sの3種類の錐体が光を受け取り、その後の処理で反対色説のとおり赤⇔緑・黄⇔青・白⇔黒の組み合わせに変換されます。3つのチャンネルはどれか1つの錐体に対応するのではなく、3種類の信号を組み合わせて作られます。三色説と反対色説は対立する説ではなく、段階説では受け取る段階と処理する段階として組み合わされています。"
      max={470}
    >
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="段階説の模式図。左のL・M・S錐体が右の赤緑・黄青・白黒の反対色の組に変換される">
        <text x={leftX + boxW / 2} y={22} textAnchor="middle" fontSize="12.5" fontWeight="700" fill="#444">入口＝三色説</text>
        <text x={leftX + boxW / 2} y={38} textAnchor="middle" fontSize="10.5" fill="#777">3種類の錐体で受け取る</text>
        <text x={rightX + boxW / 2} y={22} textAnchor="middle" fontSize="12.5" fontWeight="700" fill="#444">処理＝反対色説</text>
        <text x={rightX + boxW / 2} y={38} textAnchor="middle" fontSize="10.5" fill="#777">反対の組で処理する</text>

        {/* 受容の段階 */}
        {cones.map(({ k, y, note }) => (
          <g key={k}>
            <rect x={leftX} y={y} width={boxW} height={boxH} rx={5} fill="#ffffff" stroke={CONE[k].color} strokeWidth="2" />
            <text x={leftX + boxW / 2} y={y + 18} textAnchor="middle" fontSize="13" fontWeight="700" fill={CONE[k].color}>{CONE[k].name}</text>
            <text x={leftX + boxW / 2} y={y + 32} textAnchor="middle" fontSize="10.5" fill="#666">{note}</text>
          </g>
        ))}

        {/* 変換の帯 */}
        <rect x={midX - 46} y={rows[0] - 6} width={92} height={rows[2] + boxH + 6 - rows[0]} rx={8} fill="#f2efe9" stroke="#cfc9bf" />
        <text x={midX} y={rows[1] + 14} textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#555">信号を</text>
        <text x={midX} y={rows[1] + 30} textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#555">組み合わせる</text>

        {/* 反対色チャンネル */}
        {channels.map((c) => (
          <g key={c.label}>
            <rect x={rightX} y={c.y} width={boxW} height={boxH} rx={5} fill="#ffffff" stroke="#8c8577" strokeWidth="1.4" />
            <rect x={rightX} y={c.y} width={6} height={boxH} rx={3} fill={c.a} />
            <rect x={rightX + boxW - 6} y={c.y} width={6} height={boxH} rx={3} fill={c.b} />
            <text x={rightX + boxW / 2} y={c.y + 18} textAnchor="middle" fontSize="13" fontWeight="700" fill="#333">{c.label}</text>
            <text x={rightX + boxW / 2} y={c.y + 32} textAnchor="middle" fontSize="10" fill="#666">{c.calc}</text>
          </g>
        ))}

        {/* 矢印 */}
        <defs>
          <marker id="ucArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#8c8577" />
          </marker>
        </defs>
        {/* 右側は箱の中央1点から3チャンネルへ扇状に出す＝行どうしが1対1で対応するという誤読を避ける */}
        {rows.map((y) => (
          <g key={`ar-${y}`}>
            <line x1={leftX + boxW + 4} y1={y + boxH / 2} x2={midX - 50} y2={rows[1] + boxH / 2} stroke="#8c8577" strokeWidth="1.6" markerEnd="url(#ucArrow)" />
            <line x1={midX + 46} y1={rows[1] + boxH / 2} x2={rightX - 4} y2={y + boxH / 2} stroke="#8c8577" strokeWidth="1.6" markerEnd="url(#ucArrow)" />
          </g>
        ))}
      </svg>
    </Figure>
  );
}

// 色覚タイプと錐体の対応。C型の3本に対し、P型はL、D型はMがはたらかない状態を同じ縮尺で並べる。
// 見え方の再現ではなく、どの錐体が関わるかを示す図。
function TypeCones() {
  const W = 470, headH = 26, rowH = 84;
  const H = headH + rowH * 3 + 12;
  const cx = 116, cw = W - cx - 14, chH = 54;
  const rowsDef: { name: string; sub: string; missing: ConeKey | null; note: [string, string] }[] = [
    { name: 'C型', sub: '正常3色覚', missing: null, note: ['L・M・Sの', '3種類がはたらく'] },
    { name: 'P型', sub: '眼科学会：1型', missing: 'L', note: ['L錐体（赤寄り）が', 'はたらかない'] },
    { name: 'D型', sub: '眼科学会：2型', missing: 'M', note: ['M錐体（緑寄り）が', 'はたらかない'] },
  ];
  return (
    <Figure
      label="C型・P型・D型で、どの錐体が関わるかを同じ縮尺で並べたものです。P型はL、D型はMがはたらかないため、残る錐体だけでは長波長側の違いを取り出しにくくなります。これが赤と緑の混同につながります。実線がはたらいている錐体、点線が「ない・はたらきにくい」錐体を表します。図は強度（その錐体がない状態）の模式です。弱度は曲線の位置が多数派からずれた状態にあたります。色がどう見えるかを再現した図ではありません。"
      max={470}
    >
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="C型・P型・D型で、はたらく錐体の違いを並べた図">
        <text x={4} y={16} fontSize="10.5" fill="#777">実線＝はたらいている錐体　／　点線＝ない・はたらきにくい錐体</text>
        {rowsDef.map((r, i) => {
          const top = headH + i * rowH;
          const cTop = top + 8;
          const X = (l: number) => cx + ((l - 400) / 300) * cw;
          const Y = (v: number) => cTop + (1 - v) * chH;
          return (
            <g key={r.name}>
              {i > 0 && <line x1={4} y1={top - 6} x2={W - 4} y2={top - 6} stroke="#e2dfd7" />}
              <text x={6} y={top + 22} fontSize="14" fontWeight="700" fill="#333">{r.name}</text>
              <text x={6} y={top + 38} fontSize="10.5" fill="#777">{r.sub}</text>
              <text x={6} y={top + 56} fontSize="10" fill="#666">{r.note[0]}</text>
              <text x={6} y={top + 68} fontSize="10" fill="#666">{r.note[1]}</text>
              <line x1={cx} y1={Y(0)} x2={cx + cw} y2={Y(0)} stroke="#cfc9bf" />
              {(['S', 'M', 'L'] as ConeKey[]).map((k) => (
                <path
                  key={k}
                  d={conePath(k, X, Y)}
                  fill="none"
                  stroke={r.missing === k ? '#b8b2a7' : CONE[k].color}
                  strokeWidth={r.missing === k ? 1.4 : 2.2}
                  strokeDasharray={r.missing === k ? '4 4' : undefined}
                />
              ))}
              {(['S', 'M', 'L'] as ConeKey[]).map((k) => (
                <text
                  key={`t-${k}`}
                  x={X(CONE[k].peak)}
                  y={Y(1) - 4}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="700"
                  fill={r.missing === k ? '#b8b2a7' : CONE[k].color}
                >
                  {k}
                </text>
              ))}
              {i === rowsDef.length - 1 && (
                <text x={cx + cw} y={Y(0) + 13} textAnchor="end" fontSize="9.5" fill="#999">波長 400→700nm（3段とも同じ縮尺）</text>
              )}
            </g>
          );
        })}
      </svg>
    </Figure>
  );
}

// 高齢期に多い3つの目の病気で、見えにくくなる場所がどう違うかを並べる。
function VisionConditions() {
  const W = 470, pw = 224, phh = 122, labH = 18;
  const cols = [6, W - 6 - pw];
  const rows = [labH, labH * 2 + phh + 14];
  const H = rows[1] + phh + 10;
  const panels = [
    { title: '通常の見え方（比べるための基準）', kind: 'normal' },
    { title: '白内障：全体がかすむ・まぶしい', kind: 'cataract' },
    { title: '緑内障：まわりの視野が欠ける', kind: 'glaucoma' },
    { title: '加齢黄斑変性：中心が見えにくい', kind: 'amd' },
  ];
  const glyphs = [
    ['あ', 'い', 'う', 'え', 'お'],
    ['か', 'き', 'く', 'け', 'こ'],
    ['さ', 'し', 'す', 'せ', 'そ'],
  ];
  return (
    <Figure
      label="同じ文字の並びが、それぞれの病気でどのあたりが見えにくくなるかを比べた模式図です。白内障は全体がかすみ、緑内障はまわりから欠け、加齢黄斑変性は見ようとしている中心が欠けます。見えにくくなる場所が違うので、3つは場所で区別して押さえましょう。実際の見え方や進み方には大きな個人差があり、この図は日本眼科学会などの一般向け解説に基づく模式であって、診断や症状の再現ではありません。緑内障の視野の欠けは、初期には自覚しにくいことが知られています。"
      max={470}
    >
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="白内障・緑内障・加齢黄斑変性で見えにくくなる場所の違いを並べた模式図">
        <defs>
          <filter id="ucHaze"><feGaussianBlur stdDeviation="1.6" /></filter>
          <filter id="ucSoft"><feGaussianBlur stdDeviation="6" /></filter>
          <radialGradient id="ucPeriph" cx="50%" cy="50%" r="52%">
            <stop offset="48%" stopColor="#7a7a7a" stopOpacity="0" />
            <stop offset="68%" stopColor="#7a7a7a" stopOpacity="0.98" />
            <stop offset="100%" stopColor="#7a7a7a" stopOpacity="1" />
          </radialGradient>
        </defs>
        {panels.map((p, i) => {
          const x = cols[i % 2], y = rows[Math.floor(i / 2)];
          return (
            <g key={p.kind}>
              <text x={x} y={y - 5} fontSize="11" fontWeight="700" fill="#444">{p.title}</text>
              <rect x={x} y={y} width={pw} height={phh} rx={5} fill="#fbf9f5" stroke="#cfc9bf" />
              <g filter={p.kind === 'cataract' ? 'url(#ucHaze)' : undefined}>
                {glyphs.map((row, ri) =>
                  row.map((ch, ci) => (
                    <text
                      key={`${ri}-${ci}`}
                      x={x + 28 + ci * 42}
                      y={y + 40 + ri * 32}
                      textAnchor="middle"
                      fontSize="19"
                      fill="#333"
                    >
                      {ch}
                    </text>
                  )),
                )}
              </g>
              {p.kind === 'cataract' && (
                <>
                  <rect x={x} y={y} width={pw} height={phh} rx={5} fill="#ffffff" opacity="0.34" />
                  <ellipse cx={x + pw * 0.72} cy={y + phh * 0.3} rx={44} ry={30} fill="#ffffff" opacity="0.6" filter="url(#ucSoft)" />
                </>
              )}
              {p.kind === 'glaucoma' && <rect x={x} y={y} width={pw} height={phh} rx={5} fill="url(#ucPeriph)" />}
              {p.kind === 'amd' && (
                <ellipse cx={x + pw / 2} cy={y + phh / 2} rx={46} ry={34} fill="#6f6f6f" opacity="0.94" filter="url(#ucSoft)" />
              )}
            </g>
          );
        })}
      </svg>
    </Figure>
  );
}

// ── 系統色名：修飾語が明度・彩度をどう動かすか ──────────────────────
// 「明るい」「うすい」「こい」は基本色名に対して明度・彩度を変える一般原理を示す模式。
// JIS慣用色名などの規定値を再現したものではなく、修飾語の効きめの方向を示す図。
function hsl(h: number, s: number, l: number) {
  return `hsl(${h} ${s}% ${l}%)`;
}
const NAME_ROWS: { base: string; hue: number; variants: { label: string; s: number; l: number }[] }[] = [
  { base: '赤', hue: 5, variants: [{ label: '明るい赤', s: 78, l: 62 }, { label: '赤', s: 72, l: 45 }, { label: 'こい赤', s: 75, l: 28 }] },
  { base: '緑', hue: 145, variants: [{ label: 'うすい緑', s: 45, l: 72 }, { label: '緑', s: 55, l: 40 }, { label: 'こい緑みの青', s: 55, l: 25 }] },
];
function NameModifiers() {
  const W = 460, rowH = 128, top = 26;
  const H = top + rowH * NAME_ROWS.length + 4;
  const swW = 92, gap = 16, startX = 20, swH = 56;
  return (
    <Figure
      label="基本色名に「明るい」「うすい」「こい」などの修飾語を付けると、明度・彩度がどちらへ動くかを示した模式です。実際の系統色名は基準となる修飾語の使い方が細かく定められていますが、ここでは効きめの方向（明るい＝明度が上がる、こい＝明度が下がり彩度が保たれる、うすい＝彩度が下がる）を示しています。JIS慣用色名などの正確な規定値を再現したものではありません。"
      max={460}
    >
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="系統色名の修飾語が明度・彩度を動かす方向を示した模式図">
        <defs>
          <marker id="ucNmArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#8c8577" />
          </marker>
        </defs>
        {NAME_ROWS.map((row, ri) => {
          const y = top + ri * rowH;
          const swY = y + 20;
          return (
            <g key={row.base}>
              <text x={startX} y={y} fontSize="12" fontWeight="700" fill="#555">基本色名「{row.base}」</text>
              {row.variants.map((v, vi) => {
                const x = startX + vi * (swW + gap);
                return (
                  <g key={v.label}>
                    <rect x={x} y={swY} width={swW} height={swH} rx={6} fill={hsl(row.hue, v.s, v.l)} stroke="#00000022" />
                    <text x={x + swW / 2} y={swY + swH + 18} textAnchor="middle" fontSize="11.5" fill="#333">{v.label}</text>
                  </g>
                );
              })}
              {[0, 1].map((i) => (
                <line
                  key={i}
                  x1={startX + swW * (i + 1) + gap * i + 4}
                  y1={swY + swH / 2}
                  x2={startX + swW * (i + 1) + gap * (i + 1) - 4}
                  y2={swY + swH / 2}
                  stroke="#8c8577"
                  strokeWidth="1.3"
                  markerEnd="url(#ucNmArrow)"
                />
              ))}
            </g>
          );
        })}
      </svg>
    </Figure>
  );
}

// ── X連鎖劣性遺伝：なぜ男性に多く現れるか ──────────────────────
// 標準的なX連鎖劣性遺伝のモデル（教科書的な一般知識）。特定の家系や検査結果を示すものではない。
function XLinked() {
  const W = 460, H = 220;
  const chromo = (x: number, y: number, variant: boolean, label: string) => (
    <g key={label}>
      <rect x={x} y={y} width={14} height={54} rx={7} fill={variant ? '#c96a5a' : '#e7e2d8'} stroke="#8c8577" strokeWidth="1" />
      <text x={x + 7} y={y + 68} textAnchor="middle" fontSize="10" fill="#555">{label}</text>
    </g>
  );
  return (
    <Figure
      label="X連鎖劣性遺伝の一般的なモデルです。女性はX染色体を2本持つため、1本が該当する型でも、もう1本が補って現れにくくなります（保因者）。男性はX染色体が1本（Y染色体と対）しかないため、その1本が該当する型だと、補う相手がなくそのまま特徴が現れます。これが男性に多く見られる理由です。特定の家系や検査結果を再現したものではありません。"
      max={460}
    >
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="X連鎖劣性遺伝で男性に多く現れる理由を示す模式図。女性はX染色体2本で補われるが、男性はX染色体1本のため該当型がそのまま現れる">
        <text x={20} y={20} fontSize="12.5" fontWeight="700" fill="#444">女性（XX）：2本のうち1本が該当型 → 現れにくい（保因者）</text>
        <g transform="translate(20,32)">
          {chromo(0, 0, false, 'X')}
          {chromo(30, 0, true, 'X')}
        </g>
        <rect x={140} y={32} width="180" height="60" rx={8} fill="#f2efe9" stroke="#cfc9bf" />
        <text x={230} y={58} textAnchor="middle" fontSize="11" fill="#555">もう1本のXが</text>
        <text x={230} y={74} textAnchor="middle" fontSize="11" fill="#555">はたらきを補う</text>

        <text x={20} y={140} fontSize="12.5" fontWeight="700" fill="#444">男性（XY）：X染色体は1本だけ → そのまま現れる</text>
        <g transform="translate(20,152)">
          {chromo(0, 0, true, 'X')}
          <g>
            <rect x={30} y={0} width="14" height="54" rx={7} fill="#e7e2d8" stroke="#8c8577" strokeWidth="1" strokeDasharray="3 3" />
            <text x={37} y={68} textAnchor="middle" fontSize="10" fill="#555">Y</text>
          </g>
        </g>
        <rect x={140} y={152} width="180" height="60" rx={8} fill="#fbeee9" stroke="#c96a5a" />
        <text x={230} y={178} textAnchor="middle" fontSize="11" fill="#9a3a2f">補う相手がなく</text>
        <text x={230} y={194} textAnchor="middle" fontSize="11" fill="#9a3a2f">特徴が現れる</text>
      </svg>
    </Figure>
  );
}

// ── 水晶体の黄変化と透過率 ──────────────────────
// 加齢で水晶体が黄変化すると短波長側の透過率が下がる、という定性的な傾向を示す模式カーブ
// （実測データの再現ではなく、本文の説明を視覚化したもの）。
function LensTransmittance() {
  const W = 400, padL = 44, padB = 36, padT = 16, padR = 14;
  const pw = W - padL - padR, ph = 170;
  const H = padT + ph + padB;
  const X = (x: number) => padL + x * pw;
  const Y = (y: number) => padT + (1 - y) * ph;
  const young = [[0, 0.86], [0.15, 0.88], [0.3, 0.9], [0.5, 0.91], [0.7, 0.92], [1, 0.92]];
  const aged = [[0, 0.18], [0.15, 0.32], [0.3, 0.5], [0.5, 0.68], [0.7, 0.8], [1, 0.87]];
  const path = (pts: number[][]) => pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${X(p[0]).toFixed(1)} ${Y(p[1]).toFixed(1)}`).join(' ');
  return (
    <Figure
      label="加齢による水晶体の黄変化を、光の透過率のイメージで表した模式カーブです。若い水晶体（青線）は短波長（青紫）側もよく通しますが、黄変化した水晶体（オレンジ線）は短波長側の透過率が下がります。これが青系の色が見分けにくくなる理由です。実測データの再現ではなく、本文の説明を図にしたものです。"
      max={400}
    >
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="若い水晶体と黄変化した水晶体で、短波長側の透過率がどう違うかを示す模式カーブ">
        <rect x={padL} y={padT} width={pw} height={ph} fill="#fff" stroke="#e2dfd7" />
        <path d={path(young)} fill="none" stroke="#2f5fa8" strokeWidth="2.4" />
        <path d={path(aged)} fill="none" stroke="#d9822b" strokeWidth="2.4" />
        <text x={X(0.06)} y={Y(0.92) - 6} fontSize="11" fontWeight="700" fill="#2f5fa8">若い水晶体</text>
        <text x={X(0.32)} y={Y(0.5) - 6} fontSize="11" fontWeight="700" fill="#d9822b">黄変化した水晶体</text>
        <text x={14} y={padT + ph / 2} textAnchor="middle" fontSize="11" fill="#555" transform={`rotate(-90 14 ${padT + ph / 2})`}>透過率</text>
        <text x={padL + pw / 2} y={H - 8} textAnchor="middle" fontSize="11" fill="#555">波長（左＝短い／青紫・右＝長い／赤）</text>
      </svg>
    </Figure>
  );
}

// ── CUDの進め方：設計→確認→修正のサイクル ──────────────────────
function CudCycle() {
  const W = 400, H = 300, cx = W / 2, cy = 150, r = 92;
  const steps: { label: string; sub: [string, string]; angle: number }[] = [
    { label: '設計', sub: ['明度差・模様・', '色名併記'], angle: -90 },
    { label: '確認', sub: ['シミュレーション', '・当事者検証'], angle: 30 },
    { label: '修正', sub: ['見つかった', '問題を直す'], angle: 150 },
  ];
  const pt = (angle: number, radius: number) => {
    const rad = (angle * Math.PI) / 180;
    return [cx + radius * Math.cos(rad), cy + radius * Math.sin(rad)];
  };
  return (
    <Figure
      label="CUDは設計・確認・修正の3段階を1回で終えず、くり返す循環的なプロセスです。とくに確認（シミュレーションや当事者検証）を経て問題が見つかったら、設計に戻って修正します。矢印が円を描いているのは、色だけで作って終わりにしないことを示しています。"
      max={400}
    >
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="設計・確認・修正を円環状にくり返すCUDの進め方">
        <defs>
          <marker id="ucCycleArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#8c8577" />
          </marker>
        </defs>
        {steps.map((s, i) => {
          const next = steps[(i + 1) % steps.length];
          const a1 = s.angle + 34, a2 = next.angle - 34;
          const [x1, y1] = pt(a1, r);
          const [x2, y2] = pt(a2, r);
          const largeArc = 0;
          return (
            <path
              key={`arc-${i}`}
              d={`M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`}
              fill="none"
              stroke="#8c8577"
              strokeWidth="1.8"
              markerEnd="url(#ucCycleArrow)"
            />
          );
        })}
        {steps.map((s) => {
          const [x, y] = pt(s.angle, r);
          return (
            <g key={s.label}>
              <circle cx={x} cy={y} r={40} fill="#fff" stroke="#2f6d5b" strokeWidth="2" />
              <text x={x} y={y - 2} textAnchor="middle" fontSize="15" fontWeight="700" fill="#2f6d5b">{s.label}</text>
              <text x={x} y={y + 16} textAnchor="middle" fontSize="9" fill="#666">{s.sub[0]}</text>
              <text x={x} y={y + 27} textAnchor="middle" fontSize="9" fill="#666">{s.sub[1]}</text>
            </g>
          );
        })}
        <text x={cx} y={cy} textAnchor="middle" fontSize="11" fill="#999">くり返す</text>
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
    case 'cone-sensitivity': return <ConeSensitivity />;
    case 'opponent-stages': return <OpponentStages />;
    case 'type-cones': return <TypeCones />;
    case 'vision-conditions': return <VisionConditions />;
    case 'name-modifiers': return <NameModifiers />;
    case 'x-linked': return <XLinked />;
    case 'lens-transmittance': return <LensTransmittance />;
    case 'cud-cycle': return <CudCycle />;
    default: return null;
  }
}
