// scripts/generate-ogp.ts — OGP画像（1200×630）を public/ogp.png に生成する。
// 実行: npx tsx scripts/generate-ogp.ts
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

const PUBLIC_DIR = path.resolve(process.cwd(), 'public');
const FONT = "'Yu Gothic','Hiragino Kaku Gothic ProN','Hiragino Sans',Meiryo,'Noto Sans JP',sans-serif";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f6f7f5"/>
  <rect x="0" y="0" width="14" height="630" fill="#1f6f5c"/>
  <text x="90" y="205" font-family="${FONT}" font-size="74" font-weight="700" fill="#1f2422">色彩検定 UC級</text>
  <text x="90" y="288" font-family="${FONT}" font-size="44" font-weight="600" fill="#1f6f5c">学習ノート</text>
  <text x="90" y="384" font-family="${FONT}" font-size="26" fill="#4f5953">色のユニバーサルデザインを基礎から。色覚タイプ・高齢者の</text>
  <text x="90" y="422" font-family="${FONT}" font-size="26" fill="#4f5953">見え方・だれにでも伝わる配色を図と確認問題で学べる無料サイト</text>
  <line x1="90" y1="496" x2="720" y2="496" stroke="#c8cdc2" stroke-width="2"/>
  <text x="90" y="546" font-family="${FONT}" font-size="24" fill="#1f6f5c" font-weight="600">study-apps.com/color-uc/</text>
  <!-- 明度差を象徴するコントラストディスク -->
  <g transform="translate(1000 315)">
    <circle r="120" fill="#ffffff"/>
    <path d="M0 0 L0 -120 A120 120 0 0 1 120 0 Z" fill="#10362d"/>
    <path d="M0 0 L0 120 A120 120 0 0 1 -120 0 Z" fill="#10362d"/>
    <circle r="42" fill="#1f6f5c"/>
  </g>
</svg>`;

async function main() {
  if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  const outPath = path.join(PUBLIC_DIR, 'ogp.png');
  await sharp(Buffer.from(svg)).png().toFile(outPath);
  console.log(`✓ ogp.png (1200x630) を生成: ${outPath}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
