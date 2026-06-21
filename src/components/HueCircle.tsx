// HueCircle — PCCS 24色相環の模式図（SVG）
// 色は色相環の構造（24色相が環状に並ぶ）を直感的につかむための模式で、PCCSの正確な色の再現ではない。
// 正確な色は公式テキストの色見本で確認する前提（キャプションで明示）。

const HUES: string[] = [
  'hsl(345 85% 50%)', 'hsl(358 85% 50%)', 'hsl(10 85% 50%)', 'hsl(20 85% 50%)',
  'hsl(30 85% 50%)', 'hsl(40 85% 50%)', 'hsl(48 88% 50%)', 'hsl(55 90% 50%)',
  'hsl(68 75% 45%)', 'hsl(85 65% 45%)', 'hsl(105 55% 42%)', 'hsl(135 55% 40%)',
  'hsl(160 55% 40%)', 'hsl(178 60% 40%)', 'hsl(190 65% 45%)', 'hsl(200 70% 48%)',
  'hsl(210 75% 50%)', 'hsl(220 75% 52%)', 'hsl(235 65% 55%)', 'hsl(255 55% 55%)',
  'hsl(270 50% 52%)', 'hsl(290 50% 50%)', 'hsl(312 60% 50%)', 'hsl(330 70% 50%)',
];

function wedge(cx: number, cy: number, rO: number, rI: number, a0: number, a1: number): string {
  const p = (r: number, a: number) => {
    const rad = ((a - 90) * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  };
  const [x0o, y0o] = p(rO, a0), [x1o, y1o] = p(rO, a1), [x1i, y1i] = p(rI, a1), [x0i, y0i] = p(rI, a0);
  return `M ${x0o} ${y0o} A ${rO} ${rO} 0 0 1 ${x1o} ${y1o} L ${x1i} ${y1i} A ${rI} ${rI} 0 0 0 ${x0i} ${y0i} Z`;
}

export default function HueCircle() {
  const size = 300, cx = size / 2, cy = size / 2, rO = 140, rI = 90, step = 360 / 24;
  return (
    <figure className="viz">
      <svg viewBox={`0 0 ${size} ${size}`} width="100%" role="img" aria-label="PCCS 24色相環の模式図">
        {HUES.map((h, i) => {
          const a0 = i * step, a1 = a0 + step;
          const mid = a0 + step / 2, rad = ((mid - 90) * Math.PI) / 180, rl = (rO + rI) / 2;
          return (
            <g key={i}>
              <path d={wedge(cx, cy, rO, rI, a0, a1)} fill={h} stroke="#fff" strokeWidth={1.5} />
              <text x={cx + rl * Math.cos(rad)} y={cy + rl * Math.sin(rad)} textAnchor="middle" dominantBaseline="central" fontSize="10.5" fill="#fff">{i + 1}</text>
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r={rI - 10} fill="#f7f6f3" stroke="#e2dfd7" />
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="13" fontWeight={700} fill="#3a3a3a">PCCS</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="11" fill="#6a6a6a">24色相環</text>
      </svg>
      <figcaption className="viz-caption">
        色相環の模式図。色相が環状に並ぶ構造をつかむための図で、正確な色味は公式テキストの色見本で確認してください。
      </figcaption>
    </figure>
  );
}
