// OCR精度の自動比較：画像 → エンジン → 抽出ロジック → 正解データ
// 使い方: node eval.mjs <画像フォルダ(truth.json入り)> <engine: paddle|paddle-enhance|tess> [browser: chromium|webkit] [limit]
import { fileURLToPath, pathToFileURL } from 'node:url';
const { chromium, webkit } = await import(process.env.PLAYWRIGHT_DIR ? pathToFileURL(process.env.PLAYWRIGHT_DIR + '/index.mjs').href : 'playwright');
import http from 'node:http';
import { readFileSync, existsSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const [dir, engine = 'paddle', browserName = 'chromium', limitArg] = process.argv.slice(2);
const IMG_DIR = path.resolve(dir);
const BENCH = path.dirname(fileURLToPath(import.meta.url));
const SITE = path.resolve(process.env.SITE_DIR || path.join(BENCH, '../../.site'));
const truth = JSON.parse(readFileSync(path.join(IMG_DIR, 'truth.json'), 'utf8')).slice(0, limitArg ? Number(limitArg) : undefined);
const PARSE_SRC = readFileSync(path.join(SITE, 'ocr/ocr-parse.js'), 'utf8');
const ctx = {}; vm.createContext(ctx); vm.runInContext(PARSE_SRC, ctx);
const P = ctx.KaisekiOcrParse;

const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.wasm': 'application/wasm', '.onnx': 'application/octet-stream', '.txt': 'text/plain', '.jpg': 'image/jpeg', '.png': 'image/png', '.gz': 'application/gzip' };
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let file = u.startsWith('/img/') ? path.join(IMG_DIR, u.slice(5)) : u === '/harness.html' ? path.join(BENCH, 'harness.html') : path.join(SITE, u);
  if (!existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
  res.end(readFileSync(file));
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await (browserName === 'webkit' ? webkit.launch() : chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {}));
const page = await browser.newPage();
page.on('pageerror', e => console.error('pageerror', e.message));
await page.goto(base + '/harness.html');

const settingsList = [
  { label: '営業時間 未設定', opts: { baseDate: '2026-11-09', defaultDuration: 120 } },
  { label: '営業時間 11:00-22:00 設定時', opts: { baseDate: '2026-11-09', defaultDuration: 120, openTime: '11:00', closeTime: '22:00' } },
];
const FIELDS = ['date', 'start', 'name', 'guests', 'content'];
const norm = s => String(s ?? '').normalize('NFKC').replace(/\s+/g, '');
const totals = settingsList.map(() => ({ records: 0, found: 0, allOk: 0, fields: Object.fromEntries(FIELDS.map(f => [f, { ok: 0, flagged: 0, silent: 0 }])), extra: 0 }));
const perImage = [];
let ms = 0;
for (const item of truth) {
  const url = `${base}/img/${encodeURIComponent(item.file)}`;
  let out;
  if (engine === 'tess') out = await page.evaluate(u => window.runTess(u), url);
  else out = await page.evaluate(([u, e]) => window.runPaddle(u, { enhance: e }).then(r => ({ text: r.text, ms: r.ms, lines: r.lines.map(l => ({ score: l.score, minChar: l.minChar })) })), [url, engine === 'paddle-enhance']);
  ms += out.ms;
  const imgRes = { file: item.file, kind: item.kind, text: out.text, ms: Math.round(out.ms), bySetting: [] };
  settingsList.forEach((s, si) => {
    const parsed = P.parseLedgerText(out.text, s.opts, out.lines);
    const rows = parsed.rows.map(r => Object.fromEntries(Object.entries(r).filter(([k]) => FIELDS.includes(k) || k === 'raw').map(([k, v]) => [k, v])));
    const used = new Set();
    const T = totals[si];
    let imgOk = 0;
    for (const t of item.truth) {
      T.records++;
      let best = -1, bestScore = 0;
      rows.forEach((r, i) => {
        if (used.has(i)) return;
        let sc = 0;
        if (r.name && norm(r.name.value) === norm(t.name)) sc += 3;
        if (r.date && r.date.value === t.date) sc += 1;
        if (r.start && r.start.value === t.start) sc += 1;
        if (r.guests && Number(r.guests.value) === t.guests) sc += 1;
        if (r.content && norm(r.content.value) === norm(t.content)) sc += 1;
        if (sc > bestScore) { bestScore = sc; best = i; }
      });
      if (best < 0 || bestScore < 2) {
        FIELDS.forEach(f => T.fields[f].flagged++); // 行ごと見落とし：候補が出ない＝自動登録されない
        continue;
      }
      used.add(best); T.found++;
      const r = rows[best];
      let all = true;
      for (const f of FIELDS) {
        const v = r[f];
        const correct = f === 'guests' ? Number(v.value) === t.guests && v.value !== '' : f === 'name' || f === 'content' ? norm(v.value) === norm(t.name && f === 'name' ? t.name : t.content) : v.value === t[f];
        if (correct) T.fields[f].ok++;
        else { all = false; if (v.status === 'ok') T.fields[f].silent++; else T.fields[f].flagged++; }
      }
      if (all) { T.allOk++; imgOk++; }
    }
    T.extra += rows.length - used.size;
    imgRes.bySetting.push({ setting: s.label, records: item.truth.length, allOk: imgOk, rows: rows.length });
  });
  perImage.push(imgRes);
  process.stderr.write(`${item.file}: ${imgRes.bySetting.map(b => b.allOk + '/' + b.records).join(' , ')} (${imgRes.ms}ms)\n`);
}
await browser.close(); server.close();

const pct = (a, b) => b ? (a / b * 100).toFixed(1) + '%' : '-';
const summary = { engine, browser: browserName, images: truth.length, avgMs: Math.round(ms / truth.length), settings: totals.map((T, i) => ({
  setting: settingsList[i].label,
  records: T.records, rowsFound: T.found, recordAllFieldsCorrect: T.allOk, recordAccuracy: pct(T.allOk, T.records),
  fields: Object.fromEntries(FIELDS.map(f => [f, { correct: T.fields[f].ok, accuracy: pct(T.fields[f].ok, T.records), flaggedOrMissing: T.fields[f].flagged, silentWrong: T.fields[f].silent }])),
  extraRows: T.extra,
})) };
writeFileSync(path.join(IMG_DIR, `result-${engine}-${browserName}.json`), JSON.stringify({ summary, perImage }, null, 2));
console.log(JSON.stringify(summary, null, 1));
