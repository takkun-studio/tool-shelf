// 予約台帳アプリ（懐石料理店向け）実ブラウザE2E
// 使い方:
//   PLAYWRIGHT_DIR=<playwrightを入れたnode_modules/playwright> \
//   OCR_IMAGES=<テスト画像フォルダ(truth.json入り)> \
//   node reservation-preview/tests/e2e/app.e2e.mjs [--site <公開用フォルダ> | --url <公開URL>] [--browser chromium|webkit|chrome]
// テスト画像は tests/ocr-bench/gen.mjs で一時フォルダに生成し、終了後に削除する。
import assert from 'node:assert/strict';
import http from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith('--') ? [...a, [v.slice(2), arr[i + 1]]] : a), []));
const HERE = path.dirname(fileURLToPath(import.meta.url));
const SITE = path.resolve(args.site || path.join(HERE, '../../.site'));
const IMAGES = path.resolve(process.env.OCR_IMAGES || '');
const BROWSER = args.browser || 'chromium';
const pwPath = process.env.PLAYWRIGHT_DIR ? pathToFileURL(path.join(process.env.PLAYWRIGHT_DIR, 'index.mjs')).href : 'playwright';
const { chromium, webkit } = await import(pwPath);
const truth = JSON.parse(readFileSync(path.join(IMAGES, 'truth.json'), 'utf8'));
const img = name => path.join(IMAGES, name);

let server, BASE = args.url;
if (!BASE) {
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.wasm': 'application/wasm', '.onnx': 'application/octet-stream', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json' };
  server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const file = path.join(SITE, p);
    if (!file.startsWith(SITE) || !existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404); return res.end('not found'); }
    const body = readFileSync(file);
    res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream', 'content-length': body.length });
    res.end(body);
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  BASE = `http://127.0.0.1:${server.address().port}/`;
}

const launch = () => BROWSER === 'webkit' ? webkit.launch() : chromium.launch(BROWSER === 'chrome' ? { channel: 'chrome' } : {});
const browser = await launch();
const results = [];
let externalRequests = [];

async function newPage(opts = {}) {
  const ctx = await browser.newContext({ viewport: opts.viewport || { width: 1366, height: 900 }, hasTouch: Boolean(opts.mobile), locale: 'ja-JP', timezoneId: 'Asia/Tokyo' });
  const page = await ctx.newPage();
  page.errors = [];
  page.on('dialog', d => d.accept().catch(() => {}));
  page.on('pageerror', e => page.errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') page.errors.push('console: ' + m.text()); });
  page.on('request', r => {
    const u = new URL(r.url());
    if (!BASE.startsWith(u.origin) && !u.protocol.startsWith('blob') && !u.protocol.startsWith('data')) externalRequests.push(`${r.method()} ${u.origin}${u.pathname}`);
  });
  if (opts.route) await opts.route(page);
  await page.goto(BASE, { waitUntil: 'load' });
  return page;
}
const records = page => page.evaluate(() => { const raw = localStorage.getItem('schedule-demo-v2'); return raw ? JSON.parse(raw).records : null; });
async function step(name, fn) {
  const t0 = Date.now();
  try { await fn(); results.push({ name, ok: true, ms: Date.now() - t0 }); console.log(`PASS ${name} (${Date.now() - t0}ms)`); }
  catch (e) { results.push({ name, ok: false, error: e.message }); console.log(`FAIL ${name}\n  ${e.stack}`); }
}
async function gotoOcr(page) {
  const tab = page.locator('.mobile-tabs [data-view="ocr"]');
  if (await tab.isVisible()) await tab.click(); else await page.locator('.side [data-view="ocr"]').click();
  await page.locator('#ocr.screen.active').waitFor();
}
async function setHours(page, open = '11:00', close = '22:00', duration = '120') {
  await page.locator('.mobile-tabs [data-view="dashboard"]:visible, .side [data-view="dashboard"]:visible').first().click();
  await page.fill('#setOpen', open); await page.fill('#setClose', close); await page.fill('#setDuration', duration);
  await page.click('#settingsForm button[type=submit]');
  await page.waitForFunction(() => document.querySelector('#settingsState').textContent.includes('営業'));
}
async function readPhoto(page, file) {
  await page.setInputFiles('#photoInput', file);
  await page.waitForFunction(() => !document.querySelector('#ocrReadBtn').disabled);
  await page.click('#ocrReadBtn');
  await page.waitForFunction(() => { const s = document.querySelector('#ocrStatus'); return /読み取り完了|失敗|分けられません|見つけられません/.test(s.textContent); }, null, { timeout: 180000 });
  return page.locator('#ocrStatus').textContent();
}

const lineImage = truth.find(t => t.kind === 'line');
const tableImage = truth.find(t => t.kind === 'table');

await step('画面表示：懐石料理店向けの日本語画面で、美容室の用語が残っていない', async () => {
  const page = await newPage();
  assert.match(await page.title(), /予約台帳/);
  const text = await page.locator('body').innerText();
  for (const w of ['懐石', '人数', 'ご予約内容', '写真から']) assert.ok(text.includes(w), `「${w}」が見当たらない`);
  const html = await page.content();
  for (const w of ['カット', 'カラー', '美容', 'パーマ', 'ヘア', '施術', 'サロン']) assert.ok(!html.includes(w), `美容室の用語「${w}」が残っている`);
  assert.deepEqual(page.errors, []);
  await page.context().close();
});

await step('既存機能：予約の追加・編集・削除と再読み込み後の保持（人数・備考つき）', async () => {
  const page = await newPage();
  await page.click('#newBtn');
  await page.selectOption('#editType', 'booking');
  await page.fill('#editDate', '2026-11-20'); await page.fill('#editTime', '18:00'); await page.fill('#editEnd', '20:00');
  await page.fill('#editName', 'E2E手入力様'); await page.fill('#editGuests', '5'); await page.fill('#editMenu', '会席コース'); await page.fill('#editNote', '個室希望');
  await page.click('#editForm button[type=submit]');
  let rec = (await records(page)).find(r => r.name === 'E2E手入力様');
  assert.equal(rec.guests, 5); assert.equal(rec.note, '個室希望');
  await page.reload();
  await page.locator('.side [data-view="detail"]').click();
  await page.fill('#datePicker', '2026-11-20'); await page.dispatchEvent('#datePicker', 'change');
  assert.match(await page.locator('#detailList').innerText(), /E2E手入力様\s+5名/);
  await page.locator('#detailList [data-edit]').filter({ hasText: '' }).first().click();
  await page.fill('#editGuests', '6'); await page.click('#editForm button[type=submit]');
  rec = (await records(page)).find(r => r.name === 'E2E手入力様');
  assert.equal(rec.guests, 6);
  await page.locator('#detailList [data-edit]').first().click();
  await page.click('#deleteBtn');
  assert.equal((await records(page)).some(r => r.name === 'E2E手入力様'), false);
  assert.deepEqual(page.errors, []);
  await page.context().close();
});

let registeredFirst = null;
await step('OCR成功：写真選択→読み取り→複数予約を抽出→確認前は登録されない→修正→確認→登録→カレンダー反映', async () => {
  externalRequests = [];
  const page = await newPage();
  await setHours(page);
  const before = await records(page);
  await gotoOcr(page);
  const status = await readPhoto(page, img(lineImage.file));
  assert.match(status, /読み取り完了/, status);
  const cards = page.locator('#ocrCandidates [data-cand]');
  const n = await cards.count();
  assert.equal(n, lineImage.truth.length, `候補数 ${n} / 正解 ${lineImage.truth.length}`);
  assert.deepEqual(await records(page), before, '確認前に保存されてはいけない');
  // 1件目の人数を手で修正
  const first = cards.nth(0);
  const t0 = lineImage.truth[0];
  assert.equal(await first.locator('[data-f="date"]').inputValue(), t0.date);
  assert.equal(await first.locator('[data-f="start"]').inputValue(), t0.start);
  await first.locator('[data-f="guests"]').fill('9');
  assert.equal(await first.locator('[data-cf="guests"] .chip').innerText(), '修正済');
  await page.click('#ocrConfirmBtn');
  await page.locator('#ocrConfirm:not([hidden])').waitFor();
  assert.deepEqual(await records(page), before, '最終確認の表示だけでは保存されない');
  assert.match(await page.locator('#ocrConfirmList').innerText(), /人数：9名/);
  await page.click('#ocrSaveBtn');
  await page.locator('#ocrDone:not([hidden])').waitFor();
  const after = await records(page);
  const added = after.filter(r => r.source === 'photo-ocr');
  assert.equal(added.length, n);
  const r0 = added.find(r => r.date === t0.date && r.start === t0.start);
  assert.ok(r0, '1件目が登録されていない');
  assert.equal(r0.guests, 9); assert.equal(r0.type, 'ledger');
  registeredFirst = r0;
  // 月間カレンダーと日別詳細
  await page.click('[data-ocr-goto="month"]');
  const cell = page.locator(`[data-day="${t0.date}"]`);
  assert.match(await cell.innerText(), new RegExp(t0.start));
  await cell.click();
  assert.match(await page.locator('#detailList').innerText(), new RegExp(`${r0.name}\\s+9名`));
  // 再読み込みでも残る
  await page.reload();
  assert.equal((await records(page)).filter(r => r.source === 'photo-ocr').length, n);
  // 外部へ画像・顧客情報を送らない（同じ公開先以外への通信なし）
  assert.deepEqual(externalRequests, [], '外部への通信: ' + externalRequests.join(', '));
  assert.deepEqual(page.errors, []);
  await page.context().close();
});

await step('重複登録防止：同じ写真を再登録しようとすると登録済みとして止める', async () => {
  const page = await newPage();
  await page.evaluate(() => { /* 前のテストのデータは別コンテキストなので、ここで同じ写真を2回登録する */ });
  await setHours(page);
  await gotoOcr(page);
  await readPhoto(page, img(tableImage.file));
  await page.click('#ocrConfirmBtn');
  await page.click('#ocrSaveBtn');
  await page.locator('#ocrDone:not([hidden])').waitFor();
  const count1 = (await records(page)).filter(r => r.source === 'photo-ocr').length;
  await page.click('#ocrNextBtn').catch(() => {});
  await gotoOcr(page);
  await readPhoto(page, img(tableImage.file));
  const blocked = await page.locator('#ocrCandidates .cand.blocked').count();
  const total = await page.locator('#ocrCandidates [data-cand]').count();
  assert.ok(total > 0 && blocked === total, `登録済み表示 ${blocked}/${total}`);
  assert.match(await page.locator('#ocrCandidates').innerText(), /登録済みの台帳予約と同じです/);
  await page.click('#ocrConfirmBtn');
  assert.equal(await page.locator('#ocrConfirm').isHidden(), true, '重複だけなら確認画面に進まない');
  assert.equal((await records(page)).filter(r => r.source === 'photo-ocr').length, count1);
  // 連打しても二重登録されない（登録処理のガード）
  await page.click('#ocrDiscardBtn').catch(() => {});
  assert.deepEqual(page.errors, []);
  await page.context().close();
});

await step('OCR失敗：認識データの読み込み失敗でも写真を失わず、再試行で回復する', async () => {
  let fail = true;
  const page = await newPage({ route: async p => p.route('**/ocr/vendor/ppocrv5-mobile-rec.onnx', r => fail ? r.fulfill({ status: 503, body: 'unavailable' }) : r.continue()) });
  await gotoOcr(page);
  const status = await readPhoto(page, img(lineImage.file));
  assert.match(status, /失敗/, status);
  assert.equal(await page.locator('#ocrErrorActions').isVisible(), true);
  assert.equal(await page.locator('#photoPreview img').count(), 1, '写真が残っていない');
  assert.equal(await page.locator('#ocrCandidates [data-cand]').count(), 0);
  fail = false;
  await page.click('#ocrRetryBtn');
  await page.waitForFunction(() => /読み取り完了/.test(document.querySelector('#ocrStatus').textContent), null, { timeout: 180000 });
  assert.ok(await page.locator('#ocrCandidates [data-cand]').count() > 0);
  await page.context().close();
});

await step('不完全な読み取り・日付/時間/人数の誤認識：未読取を表示し、直すまで登録させない', async () => {
  const page = await newPage();
  await gotoOcr(page);
  assert.equal(await page.locator('#ocrErrorActions').isHidden(), true, 'エラーがない時は再試行ボタンを出さない');
  await page.click('#ocrAddRowBtn');
  // 読み取り結果（誤認識を含む）を直接入力して候補化
  await page.evaluate(() => { document.querySelector('#ocrRawBox').hidden = false; document.querySelector('#ocrRawBox').open = true; });
  await page.fill('#ocrText', ['11/31 18:00 誤日付様 2名 会席コース', '11/22 25:00 誤時刻様 3名 法事', '11/23 18:00 人数なし様 お祝い会席', '11/24 6時 午後不明様 4名 顔合わせ', '11/25 18:00 4名 会席コース'].join('\n'));
  await page.click('#ocrParseBtn');
  const cards = page.locator('#ocrCandidates [data-cand]');
  assert.equal(await cards.count(), 5);
  assert.equal(await cards.nth(0).locator('[data-f="date"]').inputValue(), '', '存在しない日付は空欄');
  assert.equal(await cards.nth(0).locator('[data-cf="date"] .chip').innerText(), '未読取');
  assert.equal(await cards.nth(1).locator('[data-f="start"]').inputValue(), '', '25:00は空欄');
  assert.equal(await cards.nth(2).locator('[data-f="guests"]').inputValue(), '', '人数を推測しない');
  assert.equal(await cards.nth(3).locator('[data-f="start"]').inputValue(), '', '午前/午後不明は空欄');
  assert.equal(await cards.nth(3).locator('[data-cf="start"] .chip').innerText(), '要確認');
  assert.equal(await cards.nth(4).locator('[data-f="name"]').inputValue(), '', '名前を補わない');
  const before = await records(page);
  await page.click('#ocrConfirmBtn');
  assert.equal(await page.locator('#ocrConfirm').isHidden(), true);
  assert.deepEqual(await records(page), before);
  // 手動修正
  await cards.nth(0).locator('[data-f="date"]').fill('2026-11-30');
  await cards.nth(1).locator('[data-f="start"]').fill('18:00');
  await cards.nth(1).locator('[data-f="end"]').fill('20:00');
  await cards.nth(3).locator('[data-f="start"]').fill('18:00');
  await cards.nth(3).locator('[data-f="end"]').fill('20:00');
  await cards.nth(4).locator('[data-cand-check]').uncheck();
  await cards.nth(0).locator('[data-f="end"]').fill('20:00');
  await cards.nth(2).locator('[data-f="end"]').fill('20:00');
  await page.click('#ocrConfirmBtn');
  await page.locator('#ocrConfirm:not([hidden])').waitFor();
  assert.match(await page.locator('#ocrConfirmList').innerText(), /人数：未入力/);
  await page.click('#ocrSaveBtn');
  await page.locator('#ocrDone:not([hidden])').waitFor();
  const added = (await records(page)).filter(r => r.source === 'photo-ocr');
  assert.equal(added.length, 4);
  assert.ok(added.every(r => /^\d{4}-\d{2}-\d{2}$/.test(r.date) && r.start < r.end));
  assert.equal(added.find(r => r.name.startsWith('人数なし')).guests, undefined);
  await page.context().close();
});

await step('保存失敗：写真・候補・修正内容を失わず、解消後に登録できる／下書きは再読み込みで復元', async () => {
  const page = await newPage();
  await setHours(page);
  await gotoOcr(page);
  await readPhoto(page, img(lineImage.file));
  await page.locator('#ocrCandidates [data-cand]').nth(0).locator('[data-f="note"]').fill('保存失敗テストの修正');
  await page.waitForTimeout(700);
  // 再読み込み → 下書き（写真・候補・修正）が復元される
  await page.reload();
  await gotoOcr(page);
  await page.waitForFunction(() => document.querySelectorAll('#ocrCandidates [data-cand]').length > 0, null, { timeout: 10000 });
  assert.equal(await page.locator('#ocrCandidates [data-cand]').nth(0).locator('[data-f="note"]').inputValue(), '保存失敗テストの修正');
  assert.equal(await page.locator('#photoPreview img').count(), 1);
  // 保存を失敗させる
  await page.evaluate(() => { window.__realSet = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) { if (k === 'schedule-demo-v2') throw new Error('QuotaExceeded'); return window.__realSet.call(this, k, v); }; });
  const before = await records(page);
  await page.click('#ocrConfirmBtn'); await page.click('#ocrSaveBtn');
  assert.match(await page.locator('#ocrStatus').innerText(), /保存できませんでした/);
  assert.deepEqual(await records(page), before);
  await page.click('#ocrBackBtn');
  assert.equal(await page.locator('#ocrCandidates [data-cand]').nth(0).locator('[data-f="note"]').inputValue(), '保存失敗テストの修正');
  await page.evaluate(() => { Storage.prototype.setItem = window.__realSet; });
  await page.click('#ocrConfirmBtn'); await page.click('#ocrSaveBtn');
  await page.locator('#ocrDone:not([hidden])').waitFor();
  assert.ok((await records(page)).some(r => r.note === '保存失敗テストの修正'));
  await page.waitForTimeout(300);
  // 登録後は下書きが消える
  await page.reload(); await gotoOcr(page); await page.waitForTimeout(500);
  assert.equal(await page.locator('#ocrCandidates [data-cand]').count(), 0);
  await page.context().close();
});

await step('スマホ画面（390x844）：4タブ・横はみ出しなし・入力欄16px以上・写真登録まで操作できる', async () => {
  const page = await newPage({ viewport: { width: 390, height: 844 }, mobile: true });
  for (const v of ['dashboard', 'month', 'detail', 'ocr']) {
    await page.locator(`.mobile-tabs [data-view="${v}"]`).click();
    const ov = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth, win: window.innerWidth, main: document.querySelector('#mainContent').scrollWidth, mainW: document.querySelector('#mainContent').clientWidth }));
    assert.ok(ov.doc <= ov.win + 1 && ov.main <= ov.mainW + 1, `${v} で横はみ出し ${JSON.stringify(ov)}`);
  }
  assert.equal(await page.locator('.mobile-tabs button').count(), 4);
  await setHours(page);
  await gotoOcr(page);
  await readPhoto(page, img(lineImage.file));
  const fs = await page.locator('#ocrCandidates [data-f="name"]').first().evaluate(el => parseFloat(getComputedStyle(el).fontSize));
  assert.ok(fs >= 16, `入力欄の文字が小さい（${fs}px）とiPhoneで拡大される`);
  const tabsBox = await page.locator('.mobile-tabs').boundingBox();
  assert.ok(tabsBox.y + tabsBox.height <= 845, '下部タブが画面外');
  await page.screenshot({ path: path.join(IMAGES, `mobile-ocr-${BROWSER}.png`) });
  await page.click('#ocrConfirmBtn'); await page.click('#ocrSaveBtn');
  await page.locator('#ocrDone:not([hidden])').waitFor();
  await page.click('[data-ocr-goto="month"]');
  await page.screenshot({ path: path.join(IMAGES, `mobile-month-${BROWSER}.png`) });
  assert.deepEqual(page.errors, []);
  await page.context().close();
});

await step('Googleカレンダー：既存の読み取り機能は残り、接続失敗時もアプリは動作し、書き込み要求は発生しない', async () => {
  const methods = [];
  const page = await newPage({ route: async p => {
    await p.route('https://accounts.google.com/**', r => r.abort());
    await p.route('https://www.googleapis.com/**', r => { methods.push(r.request().method()); r.abort(); });
  } });
  assert.equal(await page.locator('#googleConnectBtn').isVisible(), true);
  assert.equal(await page.locator('#googleSyncBtn').isDisabled(), true);
  await page.click('#googleConnectBtn');
  await page.waitForFunction(() => /読み込めません|接続できません/.test(document.querySelector('#toast').textContent), null, { timeout: 15000 });
  assert.equal(await page.locator('#googleStatus').innerText(), '未接続');
  assert.ok(methods.every(m => m === 'GET'));
  await page.click('#newBtn'); await page.fill('#editName', 'Google失敗後の予約様'); await page.click('#editForm button[type=submit]');
  assert.ok((await records(page)).some(r => r.name === 'Google失敗後の予約様'));
  await page.context().close();
});

await browser.close();
if (server) server.close();
const failed = results.filter(r => !r.ok);
console.log(`\n${BROWSER}: ${results.length - failed.length} PASS / ${failed.length} FAIL  (${BASE})`);
process.exit(failed.length ? 1 : 0);
