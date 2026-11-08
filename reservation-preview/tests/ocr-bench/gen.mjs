// 架空の懐石料理店 予約台帳（合成・手書き風）画像と正解データの生成
// 使い方: PLAYWRIGHT_DIR=... FONT_DIR=<@fontsourceのnode_modules/@fontsource> [JITTER=1] node gen.mjs <出力先(一時フォルダ)> [乱数シード]
// フォント: @fontsource/zen-kurenaido, yomogi, yusei-magic（OFL）と macOS の Klee。生成画像はGitに入れない。
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(process.env.PLAYWRIGHT_DIR ? pathToFileURL(path.join(process.env.PLAYWRIGHT_DIR, 'index.mjs')).href : 'playwright');
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const OUT = path.resolve(process.argv[2] || 'synth');
mkdirSync(OUT, { recursive: true });
const FONT_DIR = path.resolve(process.env.FONT_DIR || 'node_modules/@fontsource');
const KLEE = '/System/Library/AssetsV2/com_apple_MobileAsset_Font8/81e879dcb4d596ab140f7cffcd5ccaaf8108519b.asset/AssetData/Klee.ttc';

let seed = Number(process.argv[3] || 20261109);
const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
const pick = a => a[Math.floor(rnd() * a.length)];
const rint = (a, b) => a + Math.floor(rnd() * (b - a + 1));

const SURNAMES = ['山田','佐藤','鈴木','高橋','田中','伊藤','渡辺','中村','小林','加藤','吉田','山本','松本','井上','木村','清水','山崎','森','池田','橋本','阿部','石川','前田','藤田','小川','岡田','後藤','村上','近藤','坂本','遠藤','青木','西村','福田','太田','三浦','藤井','岡本','松田','中川','原田','小野','竹内','金子','和田','中山','石井','上田','森田','大野'];
const GIVEN = ['花子','一郎','恵子','誠','裕子','健太','美穂','隆'];
const CONTENTS = ['会席コース','懐石コース','昼懐石','お祝い会席','法事','顔合わせ','結納','接待','誕生日祝い','還暦祝い','お食い初め','季節のコース','個室','記念日'];
const NOTES = ['えびアレルギー','車椅子','子供椅子1','掘りごたつ希望','花束持込','個室希望','禁煙席',''];
const KANJI_NUM = ['','一','二','三','四','五','六','七','八','九','十'];
const WD = '日月火水木金土';
const fonts = [
  { family: 'ZenKurenaido', css: `${FONT_DIR}/zen-kurenaido/index.css` },
  { family: 'Yomogi', css: `${FONT_DIR}/yomogi/index.css` },
  { family: 'YuseiMagic', css: `${FONT_DIR}/yusei-magic/index.css` },
  { family: 'KleeLocal', local: KLEE },
];

function fontFaceCss() {
  let css = '';
  for (const f of fonts) {
    if (f.local) { css += `@font-face{font-family:${f.family};src:url("file://${f.local}");}\n`; continue; }
    const raw = readFileSync(f.css, 'utf8');
    const famName = raw.match(/font-family:\s*'([^']+)'/)[1];
    css += raw.replaceAll(`'${famName}'`, f.family).replaceAll('url(./files/', `url(file://${path.dirname(f.css)}/files/`);
  }
  return css;
}

function dateObj(m, d) { return new Date(2026, m - 1, d); }
const iso = (m, d) => `2026-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

function makeReservation(m, d, used) {
  let name;
  do { name = pick(SURNAMES); } while (used.has(name));
  used.add(name);
  const full = rnd() < 0.2 ? `${name} ${pick(GIVEN)}` : name;
  const lunch = rnd() < 0.4;
  const h = lunch ? pick([11, 12, 12, 13]) : pick([17, 18, 18, 19]);
  const min = pick([0, 0, 30]);
  return {
    date: iso(m, d), start: `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`,
    name: full, guests: pick([2, 2, 3, 4, 4, 5, 6, 8, 10, 12]), content: pick(CONTENTS), note: rnd() < 0.35 ? pick(NOTES.filter(Boolean)) : '',
    h, min,
  };
}

// 時刻の書き方
function timeText(r, style) {
  const { h, min } = r;
  if (style === 'colon') return `${h}:${String(min).padStart(2, '0')}`;
  if (style === 'ji') return min ? (rnd() < 0.5 ? `${h}時半` : `${h}時30分`) : `${h}時`;
  if (style === 'gogo') {
    if (h >= 13) return `午後${h - 12}時${min ? '半' : ''}`;
    return `${h}時${min ? '半' : ''}`;
  }
  return `${h}:${String(min).padStart(2, '0')}`;
}

function lineFor(r, pattern, opts = {}) {
  const [, m, d] = r.date.split('-').map(Number);
  const dateTxt = opts.noDate ? '' : (opts.dateStyle === 'kanji' ? `${m}月${d}日` : `${m}/${d}`);
  const t = timeText(r, opts.timeStyle || 'colon');
  const g = opts.kanjiGuests && r.guests <= 10 ? `${KANJI_NUM[r.guests]}名` : `${r.guests}名`;
  const nm = `${r.name}様`;
  const parts = [dateTxt, t, nm, g, r.content, r.note ? `(${r.note})` : ''].filter(Boolean);
  return parts.join('  ');
}

const patterns = [];
// 8種類 × 2バリエーション = 16枚
const KINDS = ['line', 'header', 'table', 'kanji', 'faint', 'tilt', 'photo', 'dense'];
for (let i = 0; i < KINDS.length * 2; i++) patterns.push({ kind: KINDS[i % KINDS.length], variant: Math.floor(i / KINDS.length) });

function jitterHtml(text, cfg) {
  return [...text].map(ch => {
    if (ch === ' ') return '<span style="display:inline-block;width:.35em"></span>';
    const rot = (rnd() - 0.5) * cfg.rot, dy = (rnd() - 0.5) * cfg.dy, sc = 1 + (rnd() - 0.5) * cfg.sc;
    const op = cfg.opacity ? (cfg.opacity[0] + rnd() * (cfg.opacity[1] - cfg.opacity[0])) : 1;
    return `<span style="display:inline-block;transform:translateY(${dy.toFixed(1)}px) rotate(${rot.toFixed(1)}deg) scale(${sc.toFixed(2)});opacity:${op.toFixed(2)}">${ch.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</span>`;
  }).join('');
}

function buildPage(p) {
  const font = fonts[(KINDS.indexOf(p.kind) + p.variant) % fonts.length];
  const ink = p.kind === 'faint' ? pick(['#9aa0a8', '#a3a3a3', '#8d97a6']) : pick(['#1d2233', '#1f3070', '#2b2b2b', '#24356e']);
  const paper = p.kind === 'faint' ? '#f3efe4' : pick(['#fffdf7', '#fbf7ec', '#ffffff']);
  const J = Number(process.env.JITTER || 1);
  const cfg = { rot: 7 * J, dy: 4 * J, sc: 0.12 * J, opacity: p.kind === 'faint' ? [0.55, 0.9] : [0.85, 1] };
  const used = new Set();
  const month = 11, baseDay = rint(10, 24);
  const truth = [];
  let rows = '';
  const fs = p.kind === 'dense' ? 30 : 38;
  const lineH = p.kind === 'dense' ? 62 : 84;
  const title = jitterHtml(pick(['ご予約台帳', '予約帳', '十一月 ご予約', '御予約控']), cfg);
  if (p.kind === 'table') {
    const cols = ['日付', '時間', 'お名前', '人数', 'ご予約内容', '備考'];
    const widths = [140, 130, 250, 100, 260, 260];
    let trs = `<tr>${cols.map((c, i) => `<th style="width:${widths[i]}px">${jitterHtml(c, cfg)}</th>`).join('')}</tr>`;
    const n = rint(7, 9);
    let day = baseDay;
    for (let i = 0; i < n; i++) {
      if (i && rnd() < 0.4) day++;
      const r = makeReservation(month, day, used); truth.push(r);
      const nameCell = p.variant ? r.name : `${r.name}様`;
      if (p.variant) r.nameNoSama = true;
      trs += `<tr><td>${jitterHtml(`${month}/${day}`, cfg)}</td><td>${jitterHtml(timeText(r, 'colon'), cfg)}</td><td>${jitterHtml(nameCell, cfg)}</td><td>${jitterHtml(p.variant ? String(r.guests) : `${r.guests}名`, cfg)}</td><td>${jitterHtml(r.content, cfg)}</td><td>${jitterHtml(r.note, cfg)}</td></tr>`;
    }
    rows = `<table>${trs}</table>`;
  } else if (p.kind === 'header' || p.kind === 'tilt' || (p.kind === 'photo' && p.variant)) {
    let day = baseDay;
    for (let g = 0; g < 2; g++) {
      const wd = WD[dateObj(month, day).getDay()];
      rows += `<div class="row head">${jitterHtml(`${month}月${day}日(${wd})`, cfg)}</div>`;
      const n = rint(3, 5);
      for (let i = 0; i < n; i++) {
        const r = makeReservation(month, day, used); truth.push(r);
        rows += `<div class="row">${jitterHtml(lineFor(r, p, { noDate: true, timeStyle: rnd() < 0.3 ? 'ji' : 'colon' }), cfg)}</div>`;
      }
      day += rint(1, 3);
    }
  } else {
    const n = p.kind === 'dense' ? rint(14, 16) : rint(8, 10);
    let day = baseDay;
    for (let i = 0; i < n; i++) {
      if (i && rnd() < 0.35) day++;
      const r = makeReservation(month, day, used); truth.push(r);
      const opts = p.kind === 'kanji'
        ? { dateStyle: 'kanji', timeStyle: rnd() < 0.5 ? 'gogo' : 'ji', kanjiGuests: rnd() < 0.5 }
        : { dateStyle: rnd() < 0.3 ? 'kanji' : 'slash', timeStyle: 'colon' };
      if (opts.timeStyle === 'gogo' && r.h < 12) r.ambiguousHour = false;
      rows += `<div class="row">${jitterHtml(lineFor(r, p, opts), cfg)}</div>`;
    }
  }
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>${fontFaceCss()}
  body{margin:0;background:#777}
  #page{width:1240px;min-height:1500px;box-sizing:border-box;padding:70px 70px;background:${paper};color:${ink};font-family:${font.family};font-size:${fs}px;position:relative;
    background-image:repeating-linear-gradient(to bottom, transparent 0, transparent ${lineH - 2}px, #b9c7dd66 ${lineH - 2}px, #b9c7dd66 ${lineH}px);background-position:0 150px}
  h1{font-size:46px;margin:0 0 30px;font-weight:normal;height:${150 - 70 - 30}px}
  .row{height:${lineH}px;line-height:${lineH}px;white-space:nowrap}
  .row.head{font-size:${fs + 4}px}
  table{border-collapse:collapse;font-size:${fs - 4}px;background:${paper}}
  th,td{border:2px solid ${ink}99;height:78px;padding:0 8px;text-align:left;font-weight:normal;white-space:nowrap}
  </style></head><body><div id="page"><h1>${title}</h1>${rows}</div></body></html>`;
  return { html, truth, font: font.family };
}

const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
const page = await browser.newPage({ viewport: { width: 1400, height: 1800 }, deviceScaleFactor: 1 });
const manifest = [];
for (let i = 0; i < patterns.length; i++) {
  const p = patterns[i];
  const { html, truth, font } = buildPage(p);
  const htmlPath = path.join(OUT, `page-${i}.html`);
  writeFileSync(htmlPath, html);
  await page.goto('file://' + htmlPath);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
  const png = path.join(OUT, `raw-${i}.png`);
  await page.locator('#page').screenshot({ path: png });
  const name = `ledger-${String(i + 1).padStart(2, '0')}-${p.kind}${p.variant ? 'B' : 'A'}.jpg`;
  const out = path.join(OUT, name);
  // 撮影条件の再現（ImageMagick）
  const args = [png];
  if (p.kind === 'tilt') args.push('-background', '#8a8a8a', '-rotate', String((p.variant ? -1 : 1) * (4 + rnd() * 3)));
  if (p.kind === 'photo') {
    args.push('-background', '#6d6d6d', '-rotate', String((rnd() - 0.5) * 4));
    args.push('(', '+clone', '-sparse-color', 'Barycentric', '0,0 #ffffff %w,%h #9a9a9a', ')', '-compose', 'Multiply', '-composite');
    args.push('-blur', '0x0.8', '-attenuate', '0.4', '+noise', 'Gaussian');
  }
  if (p.kind === 'faint') args.push('-blur', '0x0.5', '-modulate', '108,80');
  args.push('-quality', p.kind === 'photo' ? '72' : '88', out);
  execFileSync('magick', args);
  manifest.push({ file: name, kind: p.kind, variant: p.variant, font, truth: truth.map(({ h, min, ...r }) => r) });
}
await browser.close();
writeFileSync(path.join(OUT, 'truth.json'), JSON.stringify(manifest, null, 2));
console.log(`generated ${manifest.length} images, ${manifest.reduce((a, m) => a + m.truth.length, 0)} reservations -> ${OUT}`);
