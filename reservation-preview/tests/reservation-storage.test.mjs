import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const HTML_PATH = path.resolve(TEST_DIR, '../index.html');
const HTML = readFileSync(HTML_PATH, 'utf8');
const SCRIPT = HTML.match(/<script>\s*([\s\S]*?)\s*<\/script>/)?.[1];
assert.ok(SCRIPT, `script not found in ${HTML_PATH}`);

const TODAY = '2026-10-26';

class FakeClassList {
  #values = new Set();

  add(...values) {
    values.forEach(value => this.#values.add(value));
  }

  remove(...values) {
    values.forEach(value => this.#values.delete(value));
  }

  toggle(value, force) {
    const next = force === undefined ? !this.#values.has(value) : Boolean(force);
    if (next) this.#values.add(value);
    else this.#values.delete(value);
    return next;
  }

  contains(value) {
    return this.#values.has(value);
  }
}

class FakeElement {
  constructor({ id = '', dataset = {} } = {}) {
    this.id = id;
    this.dataset = { ...dataset };
    this.classList = new FakeClassList();
    this.textContent = '';
    this.innerHTML = '';
    this.value = '';
    this.hidden = false;
    this.files = [];
    this.onclick = null;
    this.onchange = null;
    this.onsubmit = null;
    this.listeners = new Map();
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) ?? [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  dispatchEvent(event) {
    for (const listener of this.listeners.get(event.type) ?? []) listener(event);
  }

  click() {
    return this.onclick?.({ target: this });
  }

  focus() {}
}

class FakeStorage {
  constructor({ raw, getThrows = false } = {}) {
    this.values = new Map();
    if (raw !== undefined) this.values.set('schedule-demo-v2', raw);
    this.getThrows = getThrows;
    this.failWrites = false;
    this.getCalls = 0;
    this.setCalls = 0;
  }

  getItem(key) {
    this.getCalls += 1;
    if (this.getThrows) throw new Error('storage unavailable');
    return this.values.has(key) ? this.values.get(key) : null;
  }

  setItem(key, value) {
    if (this.failWrites) throw new Error('quota exceeded');
    this.setCalls += 1;
    this.values.set(key, String(value));
  }

  raw() {
    return this.values.has('schedule-demo-v2') ? this.values.get('schedule-demo-v2') : null;
  }

  replace(raw) {
    this.values.set('schedule-demo-v2', raw);
  }
}

function record(overrides = {}) {
  return {
    id: 'r1',
    type: 'booking',
    date: TODAY,
    start: '10:00',
    end: '11:00',
    name: '既存予約',
    menu: 'カット',
    note: 'メモ',
    ...overrides,
  };
}

function validPayload(records, version = 2) {
  return { version, records };
}

function createApp({ records, raw, storage: givenStorage, getThrows = false } = {}) {
  const storage = givenStorage ?? new FakeStorage({ getThrows });
  if (records !== undefined) storage.replace(JSON.stringify({ records }));
  if (raw !== undefined) storage.replace(raw);

  const ids = [
    'viewTitle', 'mainContent', 'metricBooking', 'metricPersonal', 'metricIssue', 'metricOpen',
    'timelineTitle', 'timeline', 'issueList', 'photoInput', 'photoPreview', 'ledgerBtn', 'prevDay', 'nextDay',
    'exportBtn', 'importInput', 'resetBtn', 'monthTitle', 'prevMonth', 'monthToday', 'nextMonth',
    'calGrid', 'detailPrev', 'detailDate', 'detailNext', 'datePicker', 'detailAdd', 'detailList',
    'compareCount', 'compareList', 'detailPhoto', 'detailLedger', 'editModal', 'editForm',
    'editId', 'editType', 'editDate', 'editTime', 'editEnd', 'editName', 'editMenu', 'editNote',
    'deleteBtn', 'cancelBtn', 'closeModal', 'modalHeading', 'toast', 'newBtn', 'todayBtn',
    'dashboard', 'month', 'detail',
  ];
  const elements = Object.fromEntries(ids.map(id => [id, new FakeElement({ id })]));
  const viewElements = ['dashboard', 'month', 'detail'].map(view => new FakeElement({ dataset: { view } }));
  const screenElements = [elements.dashboard, elements.month, elements.detail];
  const documentListeners = new Map();
  const downloads = [];
  const objectUrls = new Map();
  let objectUrlNumber = 0;

  elements.editForm.reset = () => {
    for (const id of ['editId', 'editType', 'editDate', 'editTime', 'editEnd', 'editName', 'editMenu', 'editNote']) {
      elements[id].value = '';
    }
  };

  const document = {
    querySelector(selector) {
      if (selector.startsWith('#')) return elements[selector.slice(1)] ?? null;
      return null;
    },
    querySelectorAll(selector) {
      if (selector === '[data-view]') return viewElements;
      if (selector === '.screen') return screenElements;
      return [];
    },
    addEventListener(type, listener) {
      const listeners = documentListeners.get(type) ?? [];
      listeners.push(listener);
      documentListeners.set(type, listeners);
    },
    dispatchEvent(event) {
      for (const listener of documentListeners.get(event.type) ?? []) listener(event);
    },
    createElement(tagName) {
      const element = new FakeElement();
      if (tagName === 'a') {
        element.click = () => downloads.push({
          blob: objectUrls.get(element.href),
          href: element.href,
          download: element.download,
        });
      }
      return element;
    },
  };

  const RealDate = Date;
  const fixedEpoch = RealDate.UTC(2026, 9, 26, 3, 0, 0);
  class TestDate extends RealDate {
    constructor(...args) {
      super(...(args.length ? args : [fixedEpoch]));
    }

    static now() {
      return fixedEpoch;
    }
  }

  let confirmCalls = 0;
  const context = {
    console,
    document,
    localStorage: storage,
    structuredClone,
    Date: TestDate,
    Blob,
    URL: {
      createObjectURL(blob) {
        const url = `blob:test-${++objectUrlNumber}`;
        objectUrls.set(url, blob);
        return url;
      },
      revokeObjectURL() {},
    },
    crypto: {
      randomUUID: (() => {
        let number = 0;
        return () => `00000000-0000-4000-8000-${String(++number).padStart(12, '0')}`;
      })(),
    },
    confirm() {
      confirmCalls += 1;
      return true;
    },
    setTimeout() {
      return 1;
    },
    clearTimeout() {},
  };
  vm.runInNewContext(SCRIPT, context, { filename: HTML_PATH });

  return {
    context,
    document,
    elements,
    storage,
    downloads,
    get confirmCalls() {
      return confirmCalls;
    },
  };
}

function storedRecords(app) {
  const raw = app.storage.raw();
  assert.notEqual(raw, null, 'expected a persisted localStorage value');
  return JSON.parse(raw).records;
}

function submitForm(app, values) {
  app.elements.editType.value = values.type ?? 'booking';
  app.elements.editDate.value = values.date ?? TODAY;
  app.elements.editTime.value = values.start ?? '10:00';
  app.elements.editEnd.value = values.end ?? '11:00';
  app.elements.editName.value = values.name ?? '新規予約';
  app.elements.editMenu.value = values.menu ?? '';
  app.elements.editNote.value = values.note ?? '';
  app.elements.editForm.onsubmit({ preventDefault() {} });
}

function clickData(app, attrs) {
  const target = {
    closest(selector) {
      if (selector === '[data-day]' && attrs.day) return { dataset: { day: attrs.day } };
      if (selector === '[data-goto]' && attrs.goto) return { dataset: { goto: attrs.goto } };
      if (selector === '[data-edit]' && attrs.edit) return { dataset: { edit: attrs.edit } };
      if (selector === '[data-reconcile]' && attrs.reconcile) {
        return {
          dataset: {
            reconcile: attrs.reconcile,
            ledger: attrs.ledger ?? '',
            booking: attrs.booking ?? '',
          },
        };
      }
      return null;
    },
  };
  app.document.dispatchEvent({ type: 'click', target });
}

async function importJson(app, json) {
  app.elements.importInput.files = [{ text: async () => JSON.stringify(json) }];
  await app.elements.importInput.onchange({ target: app.elements.importInput });
}

function assertNoSuccessToast(app, successText) {
  assert.ok(!app.elements.toast.textContent.includes(successText), `unexpected success toast: ${app.elements.toast.textContent}`);
}

test('通常の追加・編集・削除は保存後の再起動でも維持される', () => {
  const app = createApp({ records: [] });

  app.elements.newBtn.click();
  submitForm(app, { start: '09:00', end: '10:00', name: '追加予約', menu: '初回', note: '受付' });
  const added = storedRecords(app);
  assert.equal(added.length, 1);
  assert.equal(added[0].name, '追加予約');
  assert.equal(app.elements.editModal.classList.contains('open'), false);

  const addedId = added[0].id;
  const afterAdd = createApp({ storage: app.storage });
  clickData(afterAdd, { edit: addedId });
  afterAdd.elements.editName.value = '編集後の予約';
  afterAdd.elements.editTime.value = '09:30';
  afterAdd.elements.editNote.value = '変更済み';
  afterAdd.elements.editForm.onsubmit({ preventDefault() {} });
  assert.deepEqual(storedRecords(afterAdd), [record({
    id: addedId,
    start: '09:30',
    end: '10:00',
    name: '編集後の予約',
    menu: '初回',
    note: '変更済み',
  })]);

  const afterEdit = createApp({ storage: app.storage });
  clickData(afterEdit, { edit: addedId });
  afterEdit.elements.deleteBtn.onclick();
  assert.deepEqual(storedRecords(afterEdit), []);

  const afterDelete = createApp({ storage: app.storage });
  assert.match(afterDelete.elements.detailList.innerHTML, /この日の予定はありません/);
});

test('照合の反映は保存され、再起動後も予約側へ反映内容が残る', () => {
  const app = createApp({ records: [
    record({ id: 'booking-1', name: '同一顧客', start: '10:00', end: '11:00', menu: '旧メニュー', note: '旧メモ' }),
    record({ id: 'ledger-1', type: 'ledger', name: '同一顧客', start: '11:00', end: '12:00', menu: '新メニュー', note: '新メモ' }),
  ] });

  clickData(app, { reconcile: 'ledger', ledger: 'ledger-1', booking: 'booking-1' });
  const saved = storedRecords(app);
  assert.deepEqual(saved.find(x => x.id === 'booking-1'), record({
    id: 'booking-1',
    name: '同一顧客',
    start: '11:00',
    end: '12:00',
    menu: '新メニュー',
    note: '新メモ',
  }));

  const reloaded = createApp({ storage: app.storage });
  assert.match(reloaded.elements.detailList.innerHTML, /新メニュー/);
  assert.doesNotMatch(reloaded.elements.compareList.innerHTML, /内容に違いがあります/);
});

test('v2 JSONインポートとリセットは保存される', async () => {
  const imported = [record({ id: 'imported-1', name: 'JSON予約', start: '13:00', end: '14:00', menu: 'カラー', note: 'JSON' })];
  const app = createApp({ records: [record({ id: 'old-1' })] });

  await importJson(app, validPayload(imported));
  assert.deepEqual(storedRecords(app), imported);
  const reloaded = createApp({ storage: app.storage });
  assert.match(reloaded.elements.detailList.innerHTML, /JSON予約/);

  reloaded.elements.resetBtn.click();
  const reset = storedRecords(reloaded);
  assert.deepEqual(reset.map(x => x.id), ['b1', 'b2', 'b3', 'p1', 'p2', 'l1', 'l2', 'l3', 'l4']);
  const afterReset = createApp({ storage: app.storage });
  assert.match(afterReset.elements.detailList.innerHTML, /山田様/);
});

test('setItem例外時の追加は元データ・入力フォームを維持し、成功toastを出さない', () => {
  const app = createApp({ records: [record()] });
  const before = app.storage.raw();
  app.storage.failWrites = true;
  app.elements.newBtn.click();
  submitForm(app, { start: '12:00', end: '13:00', name: '保存失敗追加', menu: 'メニュー', note: '入力保持' });

  assert.equal(app.storage.raw(), before);
  assert.equal(app.elements.editModal.classList.contains('open'), true);
  assert.equal(app.elements.editName.value, '保存失敗追加');
  assertNoSuccessToast(app, '予定を保存しました');
});

test('setItem例外時の編集は元データ・編集フォームを維持し、成功toastを出さない', () => {
  const app = createApp({ records: [record()] });
  const before = app.storage.raw();
  app.storage.failWrites = true;
  clickData(app, { edit: 'r1' });
  app.elements.editName.value = '保存失敗編集';
  app.elements.editNote.value = '編集入力保持';
  app.elements.editForm.onsubmit({ preventDefault() {} });

  assert.equal(app.storage.raw(), before);
  assert.equal(app.elements.editModal.classList.contains('open'), true);
  assert.equal(app.elements.editName.value, '保存失敗編集');
  assert.equal(app.elements.editNote.value, '編集入力保持');
  assertNoSuccessToast(app, '予定を保存しました');
});

test('setItem例外時の削除は元データ・編集フォームを維持し、成功toastを出さない', () => {
  const app = createApp({ records: [record()] });
  const before = app.storage.raw();
  app.storage.failWrites = true;
  clickData(app, { edit: 'r1' });
  app.elements.deleteBtn.onclick();

  assert.equal(app.storage.raw(), before);
  assert.equal(app.elements.editModal.classList.contains('open'), true);
  assert.equal(app.elements.editId.value, 'r1');
  assertNoSuccessToast(app, '削除しました');
});

test('setItem例外時の照合は元データを維持し、成功toastを出さない', () => {
  const app = createApp({ records: [
    record({ id: 'booking-1', name: '同一顧客', menu: '旧メニュー' }),
    record({ id: 'ledger-1', type: 'ledger', name: '同一顧客', start: '11:00', end: '12:00', menu: '新メニュー' }),
  ] });
  const before = app.storage.raw();
  app.storage.failWrites = true;
  clickData(app, { reconcile: 'ledger', ledger: 'ledger-1', booking: 'booking-1' });

  assert.equal(app.storage.raw(), before);
  assert.match(app.elements.compareList.innerHTML, /内容に違いがあります/);
  assertNoSuccessToast(app, '照合内容を試作データに反映しました');
});

test('setItem例外時のJSONインポートは元データを維持し、成功toastを出さない', async () => {
  const app = createApp({ records: [record({ id: 'old-1', name: '元データ' })] });
  const before = app.storage.raw();
  app.storage.failWrites = true;
  await importJson(app, validPayload([record({ id: 'new-1', name: '新データ' })]));

  assert.equal(app.storage.raw(), before);
  assert.match(app.elements.detailList.innerHTML, /元データ/);
  assert.doesNotMatch(app.elements.detailList.innerHTML, /新データ/);
  assertNoSuccessToast(app, '読み込みました');
});

test('setItem例外時のリセットは元データを維持し、成功toastを出さない', () => {
  const app = createApp({ records: [record({ id: 'custom-1', name: '保持対象' })] });
  const before = app.storage.raw();
  app.storage.failWrites = true;
  app.elements.resetBtn.click();

  assert.equal(app.storage.raw(), before);
  assert.match(app.elements.detailList.innerHTML, /保持対象/);
  assertNoSuccessToast(app, '初期状態に戻しました');
});

const invalidImports = [
  ['ID欠落', (() => { const x = record(); delete x.id; return [x]; })()],
  ['ID重複', [record({ id: 'dup' }), record({ id: 'dup', name: '重複' })]],
  ['実在しない日付', [record({ date: '2026-02-30' })]],
  ['不正な日付形式', [record({ date: '2026-1-01' })]],
  ['不正な時刻', [record({ start: '9:00' })]],
  ['終了が開始以前', [record({ start: '12:00', end: '11:00' })]],
  ['空名前', [record({ name: '   ' })]],
  ['不正menu型', [record({ menu: 123 })]],
  ['不正note型', [record({ note: { value: '不正' } })]],
  ['menu長超過', [record({ menu: 'x'.repeat(151) })]],
  ['note長超過', [record({ note: 'x'.repeat(501) })]],
  ['不正な予定種別', [record({ type: 'unknown' })]],
  ['非対応version', [record({ id: 'version-1' })]],
].map(([name, records]) => [name, name === '非対応version' ? { version: 1, records } : validPayload(records)]);

for (const [name, payload] of invalidImports) {
  test(`不正JSONを拒否する: ${name}`, async () => {
    const app = createApp({ records: [record({ id: 'keep-1', name: '保持データ' })] });
    const before = app.storage.raw();
    await importJson(app, payload);

    assert.equal(app.storage.raw(), before);
    assert.match(app.elements.toast.textContent, /対応したJSON形式ではありません/);
    assert.equal(app.confirmCalls, 0, 'invalid JSON must be rejected before replacement confirmation');
  });
}

test('正常v2とmenu/note省略の旧形式JSONを受け入れる', async () => {
  const v2 = record({ id: 'v2-1', name: 'v2予約', menu: 'メニュー', note: 'メモ' });
  const app = createApp({ records: [record({ id: 'old-1' })] });
  await importJson(app, validPayload([v2]));
  assert.deepEqual(storedRecords(app), [v2]);

  const legacy = record({ id: 'legacy-1', name: '旧形式予約' });
  delete legacy.menu;
  delete legacy.note;
  await importJson(app, { records: [legacy] });
  const importedLegacy = storedRecords(app)[0];
  assert.equal(importedLegacy.id, 'legacy-1');
  assert.equal(importedLegacy.name, '旧形式予約');
  assert.equal(importedLegacy.menu, '');
  assert.equal(importedLegacy.note, '');
});

test('壊れたlocalStorageは無断上書きせず、変更を停止する', () => {
  const raw = '{broken-json';
  const app = createApp({ raw });

  assert.equal(app.storage.raw(), raw);
  assert.equal(app.storage.setCalls, 0);
  assert.match(app.elements.toast.textContent, /元データを保護するため変更を停止/);
  assert.match(app.elements.detailList.innerHTML, /この日の予定はありません/);

  app.elements.newBtn.click();
  submitForm(app, { name: '壊れた保存への追加' });
  assert.equal(app.storage.raw(), raw);
  assert.equal(app.elements.editModal.classList.contains('open'), true);
  assertNoSuccessToast(app, '予定を保存しました');
});

test('localStorageの保存済みレコードが壊れていても無断上書きしない', () => {
  const raw = JSON.stringify({ records: [record({ id: 'bad', date: '2026-02-30' })] });
  const app = createApp({ raw });

  assert.equal(app.storage.raw(), raw);
  assert.equal(app.storage.setCalls, 0);
  assert.match(app.elements.toast.textContent, /元データを保護するため変更を停止/);
});

test('壊れたlocalStorageの元文字列はJSON書き出しで退避できる', async () => {
  const raw = '{broken-json';
  const app = createApp({ raw });
  app.elements.exportBtn.click();

  assert.equal(app.downloads.length, 1);
  assert.equal(await app.downloads[0].blob.text(), raw);
});

test('localStorageへアクセスできない場合は書き出しも停止する', () => {
  const app = createApp({ getThrows: true });
  app.elements.exportBtn.click();

  assert.equal(app.downloads.length, 0);
  assert.match(app.elements.toast.textContent, /アクセスできないため書き出せません/);
});

test('他タブ更新を検知した保存は拒否し、入力フォームを維持する', () => {
  const app = createApp({ records: [record({ id: 'same-1' })] });
  const external = JSON.stringify({ records: [record({ id: 'external-1', name: '他タブ更新' })] });
  app.storage.replace(external);

  app.elements.newBtn.click();
  submitForm(app, { name: '上書きしてはいけない入力' });

  assert.equal(app.storage.raw(), external);
  assert.equal(app.elements.editModal.classList.contains('open'), true);
  assert.equal(app.elements.editName.value, '上書きしてはいけない入力');
  assert.match(app.elements.toast.textContent, /別の画面でデータが更新/);
  assertNoSuccessToast(app, '予定を保存しました');
});


test('Google Calendar連携は読み取り専用で、利用者本人のCalendar一覧と予定を取得する', () => {
  assert.match(HTML, /id="googlePanel"/);
  assert.match(HTML, /https:\/\/www\.googleapis\.com\/auth\/calendar\.readonly/);
  assert.match(HTML, /\/users\/me\/calendarList/);
  assert.match(HTML, /\/events\?/);
  assert.doesNotMatch(HTML, /method:\s*['"](?:POST|PUT|PATCH|DELETE)['"]/);
});

test('GoogleアクセストークンをlocalStorageへ保存しない', () => {
  assert.doesNotMatch(HTML, /localStorage\.setItem\([^\n;]*(?:googleAccessToken|access_token)/);
  assert.match(HTML, /let googleAccessToken=''/);
});

test('Google予定は既存表示と空き時間判定へ合流するが読み取り専用', () => {
  assert.match(HTML, /return \[\.\.\.data,\.\.\.googleEvents\]/);
  assert.match(HTML, /Google予定は読み取り専用/);
  assert.match(HTML, /予約の空き時間判定に反映/);
});

test('運営側OAuth設定が未投入でも既存アプリは起動できる構成', () => {
  assert.match(HTML, /<meta name="google-client-id" content="">/);
  assert.match(HTML, /運営側のGoogle OAuth設定がまだ入っていません/);
});
