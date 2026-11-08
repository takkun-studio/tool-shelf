// 予約台帳アプリの公開用フォルダを作る。
//   node reservation-preview/scripts/build-site.mjs [出力先]   （既定: reservation-preview/.site）
// - 公開するのはアプリ本体と端末内OCRに必要なファイルだけ（引継ぎ文書・テストは含めない）。
// - OCRランタイムとモデルは vendor-manifest.json の固定URLから取得し、SHA-256が一致しなければ中止する。
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.resolve(process.argv[2] || path.join(ROOT, '.site'));
const CACHE = path.join(ROOT, '.vendor-cache');
const manifest = JSON.parse(readFileSync(path.join(ROOT, 'ocr/vendor-manifest.json'), 'utf8'));
const sha256 = buf => createHash('sha256').update(buf).digest('hex');

mkdirSync(CACHE, { recursive: true });
for (const f of manifest.files) {
  const cached = path.join(CACHE, f.file);
  let buf = existsSync(cached) ? readFileSync(cached) : null;
  if (!buf || sha256(buf) !== f.sha256) {
    process.stdout.write(`取得: ${f.file} … `);
    const res = await fetch(f.url);
    if (!res.ok) throw new Error(`${f.file} を取得できません: HTTP ${res.status}`);
    buf = Buffer.from(await res.arrayBuffer());
    if (sha256(buf) !== f.sha256) throw new Error(`${f.file} のSHA-256が一致しません（改変または版違いの可能性）`);
    writeFileSync(cached, buf);
    console.log('OK');
  }
}

if (OUT === ROOT || OUT === path.dirname(ROOT)) throw new Error('出力先が不正です');
rmSync(OUT, { recursive: true, force: true });
mkdirSync(path.join(OUT, 'ocr/vendor'), { recursive: true });
cpSync(path.join(ROOT, 'index.html'), path.join(OUT, 'index.html'));
for (const js of ['ocr-engine.js', 'ocr-parse.js']) cpSync(path.join(ROOT, 'ocr', js), path.join(OUT, 'ocr', js));
for (const f of manifest.files) cpSync(path.join(CACHE, f.file), path.join(OUT, 'ocr/vendor', f.file));
writeFileSync(path.join(OUT, '_headers'), [
  '/*',
  '  X-Content-Type-Options: nosniff',
  '  Referrer-Policy: no-referrer',
  '  Permissions-Policy: camera=(self), geolocation=(), microphone=()',
  '/ocr/vendor/*',
  '  Cache-Control: public, max-age=604800',
  '',
].join('\n'));
writeFileSync(path.join(OUT, 'THIRD_PARTY_NOTICES.txt'), [
  '予約台帳（懐石料理店向け 試験版）で使用している第三者ソフトウェア・モデル',
  '',
  ...manifest.files.map(f => `- ${f.file}: ${f.license}\n  取得元: ${f.url}\n  SHA-256: ${f.sha256}`),
  '',
  'ONNX Runtime Web: MIT License, Copyright (c) Microsoft Corporation.',
  'PaddleOCR PP-OCRv5: Apache License 2.0, Copyright (c) PaddlePaddle Authors.',
  '',
].join('\n'));

const files = ['index.html', 'ocr/ocr-engine.js', 'ocr/ocr-parse.js', ...manifest.files.map(f => 'ocr/vendor/' + f.file), '_headers', 'THIRD_PARTY_NOTICES.txt'];
const list = files.map(f => ({ file: f, sha256: sha256(readFileSync(path.join(OUT, f))) }));
writeFileSync(path.join(OUT, 'build-manifest.json'), JSON.stringify({ builtAt: new Date().toISOString(), files: list }, null, 2));
console.log(`公開用フォルダを作成しました: ${OUT}`);
for (const x of list) console.log(`  ${x.sha256.slice(0, 12)}  ${x.file}`);
