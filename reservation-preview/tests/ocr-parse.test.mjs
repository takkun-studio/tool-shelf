// OCR結果 → 予約候補 の抽出ロジックと、OCRエンジンの純粋関数の単体テスト
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const ctx = {};
vm.createContext(ctx);
vm.runInContext(readFileSync(path.resolve(DIR, '../ocr/ocr-parse.js'), 'utf8'), ctx);
const P = ctx.KaisekiOcrParse;
const BASE = { baseDate: '2026-11-09', defaultDuration: 120 };
const HOURS = { ...BASE, openTime: '11:00', closeTime: '22:00' };
const plain = x => JSON.parse(JSON.stringify(x));
const rows = (text, opts = BASE) => plain(P.parseLedgerText(text, opts).rows);
const v = r => ({ date: r.date.value, start: r.start.value, end: r.end.value, name: r.name.value, guests: r.guests.value, content: r.content.value, note: r.note.value });

test('1行1予約の基本形を日付・時間・名前・人数・内容に分ける', () => {
  const [r] = rows('11/14 18:00 山田様 4名 会席コース');
  assert.deepEqual(v(r), { date: '2026-11-14', start: '18:00', end: '20:00', name: '山田', guests: 4, content: '会席コース', note: '' });
  assert.equal(r.date.status, 'ok'); assert.equal(r.start.status, 'ok'); assert.equal(r.name.status, 'ok'); assert.equal(r.guests.status, 'ok');
  assert.equal(r.end.status, 'check', '終了時刻は台帳にないので仮置き・要確認');
});

test('複数行・日付見出し・括弧の備考・姓名の空白を扱う', () => {
  const out = rows(['ご予約台帳', '11月14日(土)', '12:00  佐藤様  2名  昼懐石', '18時半  山田 花子様  4名  お祝い会席  (えびアレルギー)', '11月16日（月）', '19:00 鈴木様 6名 法事'].join('\n'));
  assert.equal(out.length, 3);
  assert.deepEqual(v(out[0]), { date: '2026-11-14', start: '12:00', end: '14:00', name: '佐藤', guests: 2, content: '昼懐石', note: '' });
  assert.deepEqual(v(out[1]), { date: '2026-11-14', start: '18:30', end: '20:30', name: '山田 花子', guests: 4, content: 'お祝い会席', note: 'えびアレルギー' });
  assert.equal(out[2].date.value, '2026-11-16');
});

test('日付表記の違い（/・月日・年付き・令和・区切り欠け）', () => {
  assert.equal(rows('2026/11/20 18:00 a様 2名 会席')[0].date.value, '2026-11-20');
  assert.equal(rows('令和8年11月21日 18:00 b様 2名 会席')[0].date.value, '2026-11-21');
  assert.equal(rows('十一月二十二日 18:00 c様 2名 会席')[0].date.value, '2026-11-22');
  const r = rows('1121 19:30 d様 5名 法事')[0];
  assert.equal(r.date.value, '2026-11-21'); assert.equal(r.date.status, 'check');
  const y = rows('1/5 18:00 e様 2名 新年会', { ...BASE, baseDate: '2026-12-20' })[0];
  assert.equal(y.date.value, '2027-01-05'); assert.equal(y.date.status, 'check');
});

test('存在しない日付・範囲外の時刻は値を入れず、理由を表示する', () => {
  const [bad] = rows('11/31 18:00 鈴木様 2名 会席コース');
  assert.equal(bad.date.value, ''); assert.equal(bad.date.status, 'missing'); assert.match(bad.date.note, /存在しない日付/);
  const [badTime] = rows('11/16 25:00 高橋様 3名 接待');
  assert.equal(badTime.start.value, ''); assert.equal(badTime.start.status, 'missing'); assert.match(badTime.start.note, /正しい時刻ではありません/);
  assert.equal(rows('2/29 18:00 x様 2名 会席', { ...BASE, baseDate: '2027-02-01' })[0].date.value, '', '平年の2/29');
});

test('曜日が日付と合わない場合は要確認にする', () => {
  const [r] = rows('11月20日(月) 19:00 小林様 2名 記念日');
  assert.equal(r.date.value, '2026-11-20'); assert.equal(r.date.status, 'check'); assert.match(r.date.note, /曜日/);
});

test('時刻の書き方の違い（時・半・分・午後・夜・範囲）', () => {
  assert.equal(rows('11/15 午後6時 田中様 2名 法事')[0].start.value, '18:00');
  assert.equal(rows('11/15 夜7時半 田中様 2名 法事')[0].start.value, '19:30');
  assert.equal(rows('11/15 18時15分 田中様 2名 法事')[0].start.value, '18:15');
  const r = rows('11/17 18:00-20:30 渡辺様 4名 誕生日祝い')[0];
  assert.equal(r.start.value, '18:00'); assert.equal(r.end.value, '20:30'); assert.equal(r.end.status, 'ok');
  assert.equal(rows('11/17 18:00〜21:00 渡辺様 4名 祝い')[0].end.value, '21:00');
});

test('午前/午後が分からない時刻は推測しない。営業時間が設定されていれば判定する', () => {
  const [amb] = rows('11/16 6時 伊藤様 4名 顔合わせ');
  assert.equal(amb.start.value, ''); assert.equal(amb.start.status, 'check'); assert.match(amb.start.note, /午前\/午後が不明/);
  const [set] = rows('11/16 6時 伊藤様 4名 顔合わせ', HOURS);
  assert.equal(set.start.value, '18:00'); assert.equal(set.start.status, 'check');
  assert.equal(rows('11/16 11:30 伊藤様 4名 昼懐石', HOURS)[0].start.value, '11:30');
});

test('人数：漢数字・名様に対応し、複数の記載や記載なしは推測で埋めない', () => {
  assert.equal(rows('11/15 18:00 田中様 六名 法事')[0].guests.value, 6);
  assert.equal(rows('11/15 18:00 田中様 十二名様 法事')[0].guests.value, 12);
  const multi = rows('11/17 18:00 渡辺様 大人2名 子供1名 誕生日祝い')[0];
  assert.equal(multi.guests.value, ''); assert.equal(multi.guests.status, 'check');
  const none = rows('11/23 18:00 人数なし様 お祝い会席')[0];
  assert.equal(none.guests.value, ''); assert.equal(none.guests.status, 'missing');
  const zero = rows('11/23 18:00 a様 0名 会席')[0];
  assert.equal(zero.guests.value, ''); assert.equal(zero.guests.status, 'missing');
  const table = rows('11/18 18:00 中村 4 会席コース')[0];
  assert.equal(table.guests.value, 4); assert.equal(table.guests.status, 'check', '「名」のない数字は要確認');
});

test('名前：様がなければ要確認。名前らしい語がなければ空欄（補わない）', () => {
  const r = rows('11/18 18:00 中村 4名 会席コース')[0];
  assert.equal(r.name.value, '中村'); assert.equal(r.name.status, 'check');
  const n = rows('11/25 18:00 4名 会席コース')[0];
  assert.equal(n.name.value, ''); assert.equal(n.name.status, 'missing');
  assert.equal(rows('11/25 18:00 #様 4名 会席')[0].name.status, 'check', '記号を含む名前');
});

test('OCRの誤認識しやすい文字・旧字体・日付と時刻の連結を正規化する', () => {
  const r = rows('11/18 l8:OO 中村樣 4名 會席コ-ス')[0];
  assert.equal(r.start.value, '18:00'); assert.equal(r.name.value, '中村'); assert.equal(r.content.value, '会席コース');
  const c = rows('11/2417:30池田様4名還暦祝い')[0];
  assert.equal(c.date.value, '2026-11-24'); assert.equal(c.start.value, '17:30'); assert.equal(c.name.value, '池田'); assert.equal(c.guests.value, 4);
  assert.equal(rows('１１／２０　１８：００　森様　２名　会席')[0].start.value, '18:00', '全角');
});

test('認識モデルが簡体字で出した字を日本語の字形へ戻す（名前・内容・時刻）', () => {
  const r = rows('11/20 18:00 铃木样 4名 颜合わせ')[0];
  assert.equal(r.name.value, '鈴木'); assert.equal(r.content.value, '顔合わせ');
  assert.equal(P.normalizeLine('午后3时'), '午後3時');
});

test('内容と備考の振り分け、ノイズ文字の除外は要確認として示す', () => {
  const r = rows('11/12 19:00 松本様 2名 季節のコース 個室希望')[0];
  assert.equal(r.content.value, '季節のコース'); assert.equal(r.note.value, '個室希望');
  const noisy = rows('11/12 18:00 中村様 美 12名 懐石コース')[0];
  assert.equal(noisy.content.value, '懐石コース'); assert.equal(noisy.content.status, 'check');
});

test('表の見出し行・タイトル行は予約にしない', () => {
  const out = plain(P.parseLedgerText('予約帳\n日付 時間 お名前 人数 ご予約内容 備考\n11/11 13:00 中川様 10名 顔合わせ', BASE));
  assert.equal(out.rows.length, 1);
  assert.equal(out.ignored.length, 2);
});

test('読み取りの確信度が低い行は、読めた項目も要確認にする', () => {
  const out = plain(P.parseLedgerText('11/21 12:30 青誠様 5名 懐ス', BASE, [{ score: 0.95, minChar: 0.31 }]));
  assert.equal(out.rows[0].lowConfidence, true);
  assert.equal(out.rows[0].name.status, 'check');
});

test('候補の検証：不正な日付・時刻・人数・逆転時間を登録させない', () => {
  const ok = { date: '2026-11-14', start: '18:00', end: '20:00', name: '山田様', guests: 4, content: '会席', note: '' };
  assert.deepEqual(plain(P.validateCandidate(ok)), []);
  assert.ok(P.validateCandidate({ ...ok, date: '2026-02-30' }).length);
  assert.ok(P.validateCandidate({ ...ok, start: '24:00' }).length);
  assert.ok(P.validateCandidate({ ...ok, end: '17:00' }).length);
  assert.ok(P.validateCandidate({ ...ok, name: ' ' }).length);
  assert.ok(P.validateCandidate({ ...ok, guests: 0 }).length);
  assert.ok(P.validateCandidate({ ...ok, guests: 2.5 }).length);
  assert.deepEqual(plain(P.validateCandidate({ ...ok, guests: '' })), [], '人数は未入力でも可（確認画面で警告）');
});

test('重複検出：登録済み台帳と同じ予約・カレンダー側の同じ予約・同日同名を区別する', () => {
  const c = { date: '2026-11-14', start: '18:00', end: '20:00', name: '山田' };
  const recs = [
    { id: '1', type: 'ledger', date: '2026-11-14', start: '18:00', end: '20:00', name: '山田様' },
    { id: '2', type: 'booking', date: '2026-11-14', start: '18:00', end: '20:00', name: '山田 ' },
    { id: '3', type: 'ledger', date: '2026-11-14', start: '12:00', end: '14:00', name: '山田様' },
    { id: '4', type: 'ledger', date: '2026-11-15', start: '18:00', end: '20:00', name: '山田様' },
  ];
  const d = plain(P.findDuplicates(c, recs));
  assert.deepEqual(d.exact.map(x => x.id), ['1']);
  assert.deepEqual(d.calendar.map(x => x.id), ['2']);
  assert.deepEqual(d.sameDay.map(x => x.id), ['3']);
  assert.deepEqual(plain(P.overlapping(c, [{ date: '2026-11-14', start: '19:00', end: '19:30', name: '外出' }])).length, 1);
});

test('OCRエンジン：CTCの復号と、表のセルを行にまとめる処理', () => {
  const ectx = { setTimeout, console };
  vm.createContext(ectx);
  vm.runInContext(readFileSync(path.resolve(DIR, '../ocr/ocr-engine.js'), 'utf8'), ectx);
  const E = ectx.KaisekiOcrEngine;
  const rowsOut = plain(E._groupRows([
    { cx: 300, cy: 102, w: 200, h: 40, angle: 0, text: '山田様', score: 0.9, charScores: [0.9, 0.9, 0.9] },
    { cx: 80, cy: 100, w: 100, h: 40, angle: 0, text: '11/14', score: 0.95, charScores: [0.95] },
    { cx: 90, cy: 160, w: 120, h: 40, angle: 0, text: '11/15', score: 0.95, charScores: [0.95] },
    { cx: 300, cy: 158, w: 200, h: 40, angle: 0, text: '佐藤様', score: 0.4, charScores: [0.4] },
  ]));
  assert.deepEqual(rowsOut.map(r => r.text), ['11/14 山田様', '11/15 佐藤様']);
  assert.ok(rowsOut[1].minChar < 0.5);
  assert.equal(E.isReady(), false);
});
