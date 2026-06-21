// src/data/glossary.ts — 色彩検定UC級 用語集
//
// 各定義は、標準的な色彩理論・公的解説（CUDO／日本眼科学会／日本遺伝学会）を事実確認のうえ
// 「自分の言葉」で書き起こしたもの。出典の文を逐語転載していない。
// 色覚・眼疾患に関わる語は、色覚多様性の枠組みで中立に記し、診断・治療の助言はしない。

export interface Term {
  id: string;
  term: string;
  explanation: string;
  level: '基礎' | '頻出' | '応用';
  relatedTerms?: string[];
}

export const glossary: Record<string, Term> = {
  'pccs': {
    id: 'pccs',
    term: 'PCCS（日本色研配色体系）',
    explanation: '配色を考えやすくすることを目的に日本色彩研究所が開発した色の体系。色を色相とトーンの2つの手がかりで整理できる。色彩検定の共通フレームで、UC級でも土台になる。',
    level: '基礎',
    relatedTerms: ['tone', 'meido-sa'],
  },
  'tone': {
    id: 'tone',
    term: 'トーン（色調）',
    explanation: '明度と彩度をまとめてとらえた「色の調子」。PCCSでは有彩色を12トーンに分け、ペール（淡い）・ビビッド（あざやか）などそれぞれ固有のイメージを持つ。',
    level: '頻出',
    relatedTerms: ['pccs'],
  },
  'bunko-hansha': {
    id: 'bunko-hansha',
    term: '分光反射率曲線',
    explanation: '物体が各波長の光をどれくらい反射するかを、横軸に波長・縦軸に反射率をとって表したグラフ。その物体の色の傾向を「色の指紋」のように読み取れる。',
    level: '応用',
    relatedTerms: [],
  },
  'kantai': {
    id: 'kantai',
    term: '桿体（かんたい）',
    explanation: '網膜にある視細胞のうち、暗い所ではたらき、おもに明暗を感じるもの。色の判別は苦手。明るい所で色を感じる錐体と対になる。',
    level: '基礎',
    relatedTerms: ['suitai'],
  },
  'suitai': {
    id: 'suitai',
    term: '錐体（すいたい）',
    explanation: '網膜にある視細胞のうち、明るい所ではたらき、色を感じるもの。感じやすい波長の違いでL（長波長・赤寄り）・M（中波長・緑寄り）・S（短波長・青寄り）の3種類がある。',
    level: '基礎',
    relatedTerms: ['kantai'],
  },
  'kondoshoku': {
    id: 'kondoshoku',
    term: '混同色',
    explanation: 'ある色覚タイプの人にとって、本来は別の色なのに似て見えて区別しにくい色の組み合わせ。CUDOの解説によれば、P型・D型では赤系と緑系が見分けにくいことがある。',
    level: '頻出',
    relatedTerms: ['kondoshoku-sen', 'kondoshoku-center'],
  },
  'kondoshoku-sen': {
    id: 'kondoshoku-sen',
    term: '混同色線',
    explanation: '色を平面に並べた図（xy色度図）の上で、あるタイプが区別しにくい色どうしを結んだ直線。同じ線上の色は、そのタイプには似て見えやすい。',
    level: '応用',
    relatedTerms: ['kondoshoku', 'kondoshoku-center'],
  },
  'kondoshoku-center': {
    id: 'kondoshoku-center',
    term: '混同色中心',
    explanation: '混同色線が一点に集まる交点。1型・2型・3型でそれぞれ位置が異なる。',
    level: '応用',
    relatedTerms: ['kondoshoku-sen'],
  },
  'ishihara': {
    id: 'ishihara',
    term: '石原表（仮性同色表）',
    explanation: '色の見え方の違いがあるかを大まかに検出するスクリーニング用の検査表。日本眼科学会の解説によれば、これだけでは型を確定できず、型の判定にはアノマロスコープが必要とされる。',
    level: '頻出',
    relatedTerms: ['anomaloscope'],
  },
  'anomaloscope': {
    id: 'anomaloscope',
    term: 'アノマロスコープ',
    explanation: '色覚タイプの「型」を判定する精密検査機器。日本眼科学会の解説によれば、熟練を要し、一般の眼科には備えていないことが多いとされる。',
    level: '応用',
    relatedTerms: ['ishihara'],
  },
  'hatching': {
    id: 'hatching',
    term: 'ハッチング',
    explanation: '斜線・格子・ドットなどの模様で塗り分けることで、色だけに頼らず情報を区別できるようにする工夫。カラーユニバーサルデザインの基本テクニックの一つ。',
    level: '頻出',
    relatedTerms: ['meido-sa'],
  },
  'meido-sa': {
    id: 'meido-sa',
    term: '明度差（明度コントラスト）',
    explanation: '図と背景や隣り合う色の、明るさの差。色相が分かりにくくても明るさの差は手がかりとして残りやすいため、色のUDで最も効果的とされる工夫。',
    level: '頻出',
    relatedTerms: ['hatching'],
  },
  'pictogram': {
    id: 'pictogram',
    term: 'ピクトグラム',
    explanation: 'トイレ・非常口などを絵で表した記号。言葉が分からない人にも伝わる、視覚情報のユニバーサルデザインの代表例。色と形の両方で意味を伝える。',
    level: '基礎',
    relatedTerms: [],
  },
  'keito-shikimei': {
    id: 'keito-shikimei',
    term: '系統色名',
    explanation: '基本色名（赤・黄・緑・青・白・黒など）に「明るい」「うすい」「こい」などの修飾語を付けて、色をある程度正確に表す色名（例：明るい赤）。だれが見てもおおよその色がわかる。',
    level: '頻出',
    relatedTerms: ['kanyo-shikimei'],
  },
  'kanyo-shikimei': {
    id: 'kanyo-shikimei',
    term: '慣用色名',
    explanation: '桜色・珊瑚色のように、慣用的に使われ、多くの人が色を思い浮かべられる色名。風情を伝えるのは得意だが、正確な色の指定には向かない。',
    level: '頻出',
    relatedTerms: ['keito-shikimei'],
  },
};
