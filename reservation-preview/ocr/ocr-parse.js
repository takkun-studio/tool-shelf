/*
 * 手書き予約台帳のOCR結果 → 予約候補（懐石料理店向け）
 * 方針：
 * - 読めた文字だけを候補にする。人数・名前を推測で補わない。
 * - 存在しない日付、範囲外の時刻は候補にしない（空欄＋理由を表示）。
 * - 各項目に状態を付ける：ok（読み取り）/ check（要確認）/ missing（未読取）。
 * - 登録は必ず人の確認後。ここでは保存しない。
 */
(function (global) {
  'use strict';

  var pad = function (n) { return String(n).padStart(2, '0'); };
  var KANJI_DIGIT = { '〇': 0, '零': 0, '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9 };
  var WEEKDAYS = '日月火水木金土';
  var CONTENT_WORDS = /(コース|会席|懐石|個室|法事|法要|祝|顔合わせ|結納|接待|記念|誕生|還暦|喜寿|米寿|古希|七五三|お食い初め|弁当|ランチ|ディナー|昼|夜|献立|料理|会食|食事|宴|送別|歓迎|忘年|新年|お茶|持込|アレルギー|希望|予約|備考)/;
  // 認識モデルが中国語の簡体字で出力しやすい字を、日本語の字形へ戻す（日本語でも使う字は対象外）
  var SIMPLIFIED = { '资': '資', '样': '様', '颜': '顔', '预': '予', '约': '約', '时': '時', '发': '発', '记': '記', '设': '設', '话': '話', '诞': '誕', '庆': '慶', '节': '節', '欢': '歓', '别': '別', '应': '応', '对': '対', '个': '個', '为': '為', '乐': '楽', '业': '業', '动': '動', '务': '務', '单': '単', '卖': '売', '历': '歴', '变': '変', '员': '員', '图': '図', '备': '備', '岁': '歳', '岛': '島', '带': '帯', '广': '広', '开': '開', '张': '張', '归': '帰', '录': '録', '怀': '懐', '总': '総', '户': '戸', '无': '無', '气': '気', '汤': '湯', '满': '満', '热': '熱', '电': '電', '结': '結', '纳': '納', '缘': '縁', '见': '見', '计': '計', '订': '訂', '议': '議', '语': '語', '贺': '賀', '车': '車', '进': '進', '远': '遠', '达': '達', '连': '連', '门': '門', '间': '間', '阳': '陽', '饭': '飯', '马': '馬', '鸟': '鳥', '鹤': '鶴', '龟': '亀', '盐': '塩', '桥': '橋', '泽': '沢', '边': '辺', '冈': '岡', '关': '関', '长': '長', '东': '東', '宫': '宮', '场': '場', '铃': '鈴', '银': '銀', '钱': '銭', '泷': '滝', '樱': '桜', '实': '実', '爱': '愛', '纪': '紀', '织': '織', '绘': '絵', '荣': '栄', '华': '華', '齐': '斉', '斋': '斎', '滨': '浜', '陆': '陸', '陈': '陳', '刘': '劉', '吴': '呉', '孙': '孫', '郑': '鄭', '谢': '謝', '韩': '韓', '许': '許', '邓': '鄧', '苏': '蘇', '顾': '顧', '钟': '鍾', '罗': '羅', '杨': '楊', '赵': '趙', '赖': '頼', '馆': '館', '鱼': '魚', '鲜': '鮮', '宾': '賓', '筑': '築', '惠': '恵', '细': '細', '组': '組', '经': '経', '统': '統', '绿': '緑', '线': '線', '练': '練', '读': '読', '说': '説', '请': '請', '调': '調', '谈': '談', '识': '識', '证': '証', '试': '試', '询': '詢', '认': '認', '让': '譲', '讲': '講', '论': '論', '访': '訪', '评': '評', '课': '課', '处': '処', '圆': '円', '价': '価', '优': '優', '传': '伝' };
  var SIMPLIFIED_RE = /[资样颜预约时发记设话诞庆节欢别应对个为乐业动务单卖历变员图备岁岛带广开张归录怀总户无气汤满热电结纳缘见计订议语贺车进远达连门间阳饭马鸟鹤龟盐桥泽边冈关长东宫场铃银钱泷樱实爱纪织绘荣华齐斋滨陆陈刘吴孙郑谢韩许邓苏顾钟罗杨赵赖馆鱼鲜宾筑惠细组经统绿线练读说请调谈识证试询认让讲论访评课处圆价优传]/g;
  var VARIANTS = { '樣': '様', '顏': '顔', '曆': '暦', '懷': '懐', '會': '会', '壽': '寿', '禮': '礼', '歲': '歳', '號': '号', '拜': '拝', '祝': '祝', '黑': '黒', '澤': '沢', '邊': '辺', '邉': '辺', '齋': '斎', '齊': '斉', '濱': '浜', '廣': '広', '惠': '恵', '眞': '真', '櫻': '桜', '龍': '竜' };
  var NOTE_WORDS = /(希望|アレルギー|椅子|いす|イス|持込|持ち込み|禁煙|喫煙|車いす|車椅子|ベビーカー|駐車|送迎|苦手|抜き|不可|NG|要|電話|TEL|連絡|席$)/;
  var HEADER_WORDS = /^(日付|月日|時間|時刻|お名前|名前|氏名|人数|ご予約内容|予約内容|内容|備考|コース|電話)$/;

  function kanjiToNumber(s) {
    if (!s) return NaN;
    if (/^\d+$/.test(s)) return Number(s);
    var total = 0, cur = 0, any = false;
    for (var i = 0; i < s.length; i++) {
      var ch = s[i];
      if (ch in KANJI_DIGIT) { cur = KANJI_DIGIT[ch]; any = true; }
      else if (ch === '十') { total += (cur || 1) * 10; cur = 0; any = true; }
      else return NaN;
    }
    return any ? total + cur : NaN;
  }

  function isValidDate(y, m, d) {
    if (!(y >= 2000 && y <= 2100 && m >= 1 && m <= 12 && d >= 1 && d <= 31)) return false;
    var dt = new Date(y, m - 1, d);
    return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
  }
  function isoDate(y, m, d) { return y + '-' + pad(m) + '-' + pad(d); }
  function isValidIsoDate(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ''));
    return Boolean(m) && isValidDate(Number(m[1]), Number(m[2]), Number(m[3]));
  }
  function isValidTime(s) { return /^([01]\d|2[0-3]):[0-5]\d$/.test(String(s || '')); }
  function toMinutes(t) { var p = t.split(':'); return Number(p[0]) * 60 + Number(p[1]); }
  function fromMinutes(m) { return pad(Math.floor(m / 60)) + ':' + pad(m % 60); }

  /* OCRで混同しやすい文字を、数字の文脈でだけ直す */
  function normalizeLine(line) {
    var s = String(line || '').normalize('NFKC').replace(/[樣顏曆懷會壽禮歲號拜黑澤邊邉齋齊濱廣惠眞櫻龍]/g, function (c) { return VARIANTS[c] || c; })
      .replace(SIMPLIFIED_RE, function (c) { return SIMPLIFIED[c] || c; }).replace(/午后/g, '午後');
    s = s.replace(/[〜～~∼－–—―ー−]/g, function (ch, i, str) {
      // 長音「ー」はカタカナの後なら残す
      if (ch === 'ー' && /[ァ-ヶ]/.test(str[i - 1] || '')) return ch;
      return '-';
    });
    s = s.replace(/([ァ-ヶ])[\-‐](?=[ァ-ヶ])/g, '$1ー');
    s = s.replace(/[，､、]/g, ' ').replace(/[｡。]/g, ' ').replace(/[（]/g, '(').replace(/[）]/g, ')');
    // 数字に挟まれた/隣接した O o 〇 l I | を数字へ
    s = s.replace(/(^|[\s:/.\-])[lI|!](?=[\dOo〇])/g, '$11').replace(/(\d)[lI|](?=\d|[:時名人])/g, '$11');
    for (var k = 0; k < 2; k++) s = s.replace(/([\d:])[Oo〇](?=[\dOo〇]|\s|$|[:時名人分\-])/g, '$10').replace(/(^|[\s:/])[Oo〇](?=\d)/g, '$10');
    s = s.replace(/(\d)\s*[;；]\s*(\d{2})/g, '$1:$2');
    s = s.replace(/(\d{1,2})\s+:\s*(\d{2})/g, '$1:$2').replace(/(\d{1,2}):\s+(\d{2})/g, '$1:$2');
    // 「11/2417:30」のように日付と時刻が続いた場合は区切る
    s = s.replace(/(^|[^\d])(\d{1,2})\/(\d{1,2})(\d{1,2}:\d{2})/g, function (all, pre, mo, d, t) {
      var dd = d + t.split(':')[0];
      if (d.length === 2 && Number(d) <= 31) return pre + mo + '/' + d + ' ' + t;
      if (d.length === 1 && Number(dd.slice(0, 2)) <= 31 && Number(t.split(':')[0].slice(1) || 'x') <= 23 && t.split(':')[0].length === 2) return pre + mo + '/' + dd.slice(0, 2) + ' ' + t.split(':')[0].slice(1) + ':' + t.split(':')[1];
      return pre + mo + '/' + d + ' ' + t;
    });
    s = s.replace(/(\d{1,2}月\d{1,2}日)(?=\d)/g, '$1 ');
    return s.replace(/\s+/g, ' ').trim();
  }

  function field(value, status, note) { return { value: value === undefined || value === null ? '' : value, status: status, note: note || '' }; }

  /* ---- 日付 ---- */
  function findDate(s, ctx) {
    var res = null, m, y, mo, d;
    var patterns = [
      { re: /(?:令和|R)\s*(元|\d{1,2})\s*[年.\/-]\s*(\d{1,2})\s*[月.\/-]\s*(\d{1,2})\s*日?/, f: function (m) { return [2018 + (m[1] === '元' ? 1 : Number(m[1])), Number(m[2]), Number(m[3]), true]; } },
      { re: /(20\d{2})\s*[年.\/-]\s*(\d{1,2})\s*[月.\/-]\s*(\d{1,2})\s*日?/, f: function (m) { return [Number(m[1]), Number(m[2]), Number(m[3]), true]; } },
      { re: /(\d{1,2}|[一二三四五六七八九十]{1,3})\s*月\s*(\d{1,2}|[一二三四五六七八九十]{1,3})\s*日/, f: function (m) { return [null, kanjiToNumber(m[1]), kanjiToNumber(m[2]), false]; } },
      { re: /(?:^|[^\d:])(\d{1,2})\s*\/\s*(\d{1,2})(?![\d:])/, f: function (m) { return [null, Number(m[1]), Number(m[2]), false]; } },
      { re: /(?:^)(\d{1,2})\.(\d{1,2})(?=\s|\(|$)/, f: function (m) { return [null, Number(m[1]), Number(m[2]), false]; } },
      { re: /^(1[0-2]|0?[1-9])([0-3]\d)(?=\s+\d{1,2}:\d{2})/, f: function (m) { return [null, Number(m[1]), Number(m[2]), false, '区切り記号が読み取れないため「' + m[0] + '」を日付と判断しました']; } }
    ];
    for (var i = 0; i < patterns.length; i++) {
      m = patterns[i].re.exec(s);
      if (!m) continue;
      var parts = patterns[i].f(m);
      y = parts[0]; mo = parts[1]; d = parts[2];
      var status = parts[4] ? 'check' : 'ok', note = parts[4] || '';
      if (y === null) {
        y = ctx.baseYear;
        // 年をまたぐ場合（12月に1月の予約など）
        if (mo < ctx.baseMonth - 6) { y += 1; status = 'check'; note = '年を' + y + '年と判断しました'; }
        else if (mo > ctx.baseMonth + 6) { y -= 1; status = 'check'; note = '年を' + y + '年と判断しました'; }
      }
      var raw = m[0].trim();
      if (!isValidDate(y, mo, d)) {
        res = { value: '', status: 'missing', note: '日付「' + raw + '」は存在しない日付です', match: m };
      } else {
        res = { value: isoDate(y, mo, d), status: status, note: note, match: m };
      }
      break;
    }
    if (!res) {
      m = /(?:^|\s)(\d{1,2})\s*日(?:\s*\(?([日月火水木金土])\)?)?(?=\s|$)/.exec(s);
      if (m && ctx.currentDate) {
        var b = ctx.currentDate.split('-').map(Number);
        if (isValidDate(b[0], b[1], Number(m[1]))) res = { value: isoDate(b[0], b[1], Number(m[1])), status: 'check', note: '月は前の行・見出しから補いました', match: m };
      }
    }
    if (res) {
      // 曜日の照合
      var after = s.slice(res.match.index + res.match[0].length, res.match.index + res.match[0].length + 5);
      var wd = /^\s*\(?\s*([日月火水木金土])\s*(?:曜日?)?\s*\)?/.exec(after);
      if (wd) {
        res.weekdayText = wd[0];
        if (res.value) {
          var p = res.value.split('-').map(Number), real = WEEKDAYS[new Date(p[0], p[1] - 1, p[2]).getDay()];
          if (real !== wd[1]) { res.status = 'check'; res.note = (res.note ? res.note + '。' : '') + '曜日「' + wd[1] + '」が日付（' + real + '曜日）と合いません'; }
        }
      }
    }
    return res;
  }

  /* ---- 時刻 ---- */
  function resolveHour(h, marker, ctx) {
    if (/午後|PM|pm|夜|夕/.test(marker || '')) return { hour: h < 12 ? h + 12 : h, ambiguous: false };
    if (/昼/.test(marker || '')) return { hour: h <= 5 ? h + 12 : h, ambiguous: false };
    if (/午前|AM|am|朝/.test(marker || '')) return { hour: h === 12 ? 0 : h, ambiguous: false };
    if (h >= 12 || h === 0) return { hour: h, ambiguous: false };
    // 1〜11時：営業時間が設定されていれば、その範囲に入る方を採用
    if (ctx.openTime && ctx.closeTime) {
      var a = h * 60, b = (h + 12) * 60, o = toMinutes(ctx.openTime), c = toMinutes(ctx.closeTime);
      var ina = a >= o && a < c, inb = b >= o && b < c;
      if (ina && !inb) return { hour: h, ambiguous: false };
      if (inb && !ina) return { hour: h + 12, ambiguous: false, converted: true };
    }
    return { hour: h, ambiguous: true };
  }

  function findTimes(s, ctx) {
    var found = [], m;
    var re = /(午前|午後|AM|PM|am|pm|朝|昼|夕方?|夜)?\s*(\d{1,2})\s*(?::(\d{2})|時\s*(半|(\d{1,2})\s*分)?)/g;
    while ((m = re.exec(s))) {
      var h = Number(m[2]), min = m[3] !== undefined ? Number(m[3]) : m[4] === '半' ? 30 : m[5] !== undefined ? Number(m[5]) : 0;
      // 日付の一部（11/12 18:00 の 12 など）を誤検出しない
      var before = s.slice(Math.max(0, m.index - 1), m.index + (m[1] ? m[1].length : 0));
      if (/[\/]$/.test(before) && !m[1]) continue;
      found.push({ raw: m[0].trim(), index: m.index, length: m[0].length, h: h, min: min, marker: m[1] || '', explicit: m[3] !== undefined || /時/.test(m[0]) });
    }
    return found.map(function (t) {
      if (t.h > 24 || t.min > 59 || (t.h === 24 && t.min > 0)) return Object.assign(t, { invalid: true });
      var r = resolveHour(t.h === 24 ? 0 : t.h, t.marker, ctx);
      return Object.assign(t, { value: pad(r.hour) + ':' + pad(t.min), ambiguous: r.ambiguous, converted: r.converted });
    });
  }

  /* ---- 人数 ---- */
  function findGuests(s) {
    var m, list = [];
    var re = /(大人|子供|子ども|お子様|小人|幼児)?\s*(\d{1,3}|[一二三四五六七八九十]{1,3})\s*(名様|名|人|ﾒｲ|めい)(?![a-zA-Z])/g;
    while ((m = re.exec(s))) list.push({ raw: m[0].trim(), index: m.index, length: m[0].length, n: kanjiToNumber(m[2]), kind: m[1] || '' });
    re = /(大人|子供|子ども|お子様|小人)\s*(\d{1,2})(?!\s*(?:名|人|\d))/g;
    while ((m = re.exec(s))) list.push({ raw: m[0].trim(), index: m.index, length: m[0].length, n: Number(m[2]), kind: m[1] });
    return list;
  }

  function stripRanges(s, ranges) {
    var chars = s.split('');
    ranges.forEach(function (r) { for (var i = r.index; i < r.index + r.length && i < chars.length; i++) chars[i] = '\u0000'; });
    return chars.join('');
  }

  function parseLine(line, ctx) {
    var s = normalizeLine(line);
    if (!s) return null;
    var removed = [];
    var date = findDate(s, ctx);
    if (date) {
      removed.push({ index: date.match.index + (date.match[0].length - date.match[0].replace(/^[^\d令R一二三四五六七八九十]+/, '').length), length: date.match[0].replace(/^[^\d令R一二三四五六七八九十]+/, '').length + (date.weekdayText ? date.weekdayText.length : 0) });
    }
    var rest = stripRanges(s, removed);
    var times = findTimes(rest, ctx);
    times.forEach(function (t) { removed.push({ index: t.index, length: t.length }); });
    rest = stripRanges(s, removed);
    var guests = findGuests(rest);
    guests.forEach(function (g) { removed.push({ index: g.index, length: g.length }); });
    rest = stripRanges(s, removed);

    var hasTime = times.length > 0;
    // 日付だけの行は見出し（以降の行の日付）として扱う
    var leftover = rest.replace(/\u0000+/g, ' ').replace(/[()\[\]【】「」・:\-\/]/g, ' ').replace(/\s+/g, ' ').trim();
    if (date && !hasTime && !guests.length && leftover.replace(/曜日?|御?予約|台帳|控/g, '').trim().length <= 2) {
      return { kind: 'header', date: date };
    }
    if (!hasTime && !date && !guests.length) {
      var tokens = leftover.split(' ').filter(Boolean);
      if (!tokens.length || tokens.every(function (t) { return HEADER_WORDS.test(t) || t.length <= 1; })) return { kind: 'ignore' };
      if (!/様|さま|殿/.test(leftover)) return { kind: 'ignore' };
    }

    // ---- 名前・内容・備考 ----
    var noteParts = [];
    var body = rest.replace(/\(([^()\u0000]*)\)/g, function (_, x) { if (x.trim()) noteParts.push(x.trim()); return ' '; });
    body = body.replace(/(?:備考|※)\s*[:：]?\s*([^\u0000]*)$/, function (_, x) { if (x.trim()) noteParts.push(x.trim()); return ' '; });
    var segs = body.split(/\u0000+/).map(function (x) { return x.replace(/[()\[\]【】「」]/g, ' ').replace(/\s+/g, ' ').trim(); }).filter(Boolean);
    var words = [];
    segs.forEach(function (seg) { seg.split(' ').forEach(function (w) { w = w.replace(/^[・:\-\/|]+|[・:\-\/|]+$/g, ''); if (w) words.push(w); }); });
    var name = field('', 'missing', 'お名前を読み取れませんでした'), contentWords = [];
    var nameIdx = -1;
    for (var i = 0; i < words.length; i++) {
      var mm = /^(.*?)(様|さま|サマ|殿)(.*)$/.exec(words[i]);
      if (mm && (mm[1] || (i > 0))) {
        var nm = mm[1];
        var startIdx = i;
        if (!nm && i > 0) { nm = words[i - 1]; startIdx = i - 1; }
        // 「山田 花子様」のような姓名の間の空白
        else if (i > 0 && /^[一-龯々ァ-ヶぁ-ん]{1,4}$/.test(words[i - 1]) && /^[一-龯々]{1,4}$/.test(nm) && !CONTENT_WORDS.test(words[i - 1]) && !HEADER_WORDS.test(words[i - 1])) { nm = words[i - 1] + ' ' + nm; startIdx = i - 1; }
        if (nm && !/\d/.test(nm)) {
          name = /^[一-龯々〆ヶァ-ヶーぁ-んA-Za-z\s]+$/.test(nm.trim()) ? field(nm.trim(), 'ok') : field(nm.trim(), 'check', '名前に記号などが含まれています。確認してください');
          nameIdx = startIdx;
          words.splice(startIdx, i - startIdx + 1, mm[3] ? mm[3] : null);
          words = words.filter(function (w) { return w; });
          break;
        }
      }
    }
    if (nameIdx < 0) {
      for (var j = 0; j < words.length; j++) {
        if (/^[一-龯々ァ-ヶぁ-んA-Za-z]{1,10}$/.test(words[j]) && !CONTENT_WORDS.test(words[j]) && !HEADER_WORDS.test(words[j])) {
          name = field(words[j], 'check', '「様」が読み取れないため、名前かどうか確認してください');
          words.splice(j, 1);
          break;
        }
      }
    }
    // 表形式の人数欄（「4」だけ）の読み取り：単独の数字は要確認で人数候補にする
    var bareNumbers = [];
    words = words.filter(function (w) {
      if (/^\d{1,2}$/.test(w)) { bareNumbers.push(Number(w)); return false; }
      return true;
    });
    // 単独の1文字（読み取りノイズの可能性）や、人数の直後に残った「名」は内容から外す
    var dropped = [];
    contentWords = [];
    words.forEach(function (w) {
      if (/^[名様]/.test(w) && w.length > 1 && guests.length) { w = w.slice(1); }
      if (w.length === 1 && !/[昼夜個祝膳]/.test(w)) { dropped.push(w); return; }
      if (contentWords.length && NOTE_WORDS.test(w)) { noteParts.push(w); return; }
      contentWords.push(w);
    });

    // ---- 項目の確定 ----
    var out = { kind: 'row', raw: String(line || '').trim(), normalized: s };
    if (date) {
      out.date = field(date.value, date.status, date.note);
      if (date.value) ctx.currentDate = date.value;
    } else if (ctx.currentDate) {
      out.date = field(ctx.currentDate, ctx.currentFromHeader ? 'ok' : 'check', ctx.currentFromHeader ? '見出しの日付' : '前の行と同じ日付として補いました');
    } else {
      out.date = field('', 'missing', '日付を読み取れませんでした');
    }
    var valid = times.filter(function (t) { return !t.invalid; });
    var invalid = times.filter(function (t) { return t.invalid; });
    var st = valid[0], en = valid[1];
    // 「18:00-20:00」の範囲表記
    if (st) {
      var stNote = st.ambiguous ? '「' + st.raw + '」は午前/午後が不明です。営業時間を設定すると判定できます' : st.converted ? '営業時間から「' + st.raw + '」を' + st.value + 'と判断しました' : '';
      out.start = field(st.ambiguous ? '' : st.value, st.ambiguous || st.converted ? 'check' : 'ok', st.ambiguous ? '「' + st.raw + '」は午前/午後が不明です（' + st.value + ' または ' + pad(Number(st.value.slice(0, 2)) + 12) + st.value.slice(2) + '）。入力してください。営業時間を設定すると自動で判定できます' : stNote);
    } else if (invalid.length) {
      out.start = field('', 'missing', '時刻「' + invalid[0].raw + '」は正しい時刻ではありません');
    } else {
      out.start = field('', 'missing', '開始時刻を読み取れませんでした');
    }
    if (st && en && en.value > st.value) {
      out.end = field(en.value, en.ambiguous ? 'check' : 'ok', en.ambiguous ? '終了時刻の午前/午後を確認してください' : '');
    } else if (st && !st.ambiguous && isValidTime(st.value) && ctx.defaultDuration) {
      var endMin = toMinutes(st.value) + ctx.defaultDuration;
      out.end = endMin < 24 * 60 ? field(fromMinutes(endMin), 'check', '終了時刻は台帳にないため、仮に' + ctx.defaultDuration + '分後としています（店舗の設定で変更できます）') : field('23:59', 'check', '終了時刻を確認してください');
    } else {
      out.end = field('', 'missing', '終了時刻を入力してください');
    }
    out.name = name;
    var counted = guests.filter(function (g) { return Number.isFinite(g.n); });
    if (counted.length === 1 && !counted[0].kind) {
      var n = counted[0].n;
      out.guests = n >= 1 && n <= (ctx.maxGuests || 200) ? field(n, 'ok') : field('', 'missing', '人数「' + counted[0].raw + '」が範囲外です');
    } else if (counted.length > 1 || (counted.length === 1 && counted[0].kind)) {
      out.guests = field('', 'check', '人数の記載が複数あります（' + counted.map(function (g) { return g.raw; }).join('・') + '）。合計を入力してください');
    } else if (bareNumbers.length === 1 && bareNumbers[0] >= 1 && bareNumbers[0] <= (ctx.maxGuests || 200)) {
      out.guests = field(bareNumbers[0], 'check', '数字「' + bareNumbers[0] + '」を人数として読み取りました。確認してください');
    } else {
      out.guests = field('', 'missing', '人数を読み取れませんでした');
    }
    var content = contentWords.join(' ').trim();
    out.content = content ? field(content.slice(0, 150), dropped.length ? 'check' : 'ok', dropped.length ? '判読できない文字（' + dropped.join('・') + '）を除外しました' : '') : field('', 'missing', '予約内容は読み取れませんでした（空欄のままでも登録できます）');
    out.note = field(noteParts.join(' / ').slice(0, 500), noteParts.length ? 'ok' : 'ok');
    return out;
  }

  function settingsContext(opts) {
    var o = opts || {};
    var base = isValidIsoDate(o.baseDate) ? o.baseDate : new Date().toISOString().slice(0, 10);
    var b = base.split('-').map(Number);
    return {
      baseYear: b[0], baseMonth: b[1], currentDate: '', currentFromHeader: false,
      openTime: isValidTime(o.openTime) ? o.openTime : '',
      closeTime: isValidTime(o.closeTime) ? o.closeTime : '',
      defaultDuration: Number(o.defaultDuration) > 0 ? Number(o.defaultDuration) : 0,
      maxGuests: Number(o.maxGuests) > 0 ? Number(o.maxGuests) : 200
    };
  }

  /* OCR結果全体（複数行）→ 予約候補の一覧 */
  function parseLedgerText(text, opts, lineMeta) {
    var ctx = settingsContext(opts);
    var rows = [], ignored = [];
    String(text || '').split(/\r?\n/).forEach(function (line, idx) {
      if (!line.trim()) return;
      var r = parseLine(line, ctx);
      if (!r) return;
      if (r.kind === 'header') {
        if (r.date.value) { ctx.currentDate = r.date.value; ctx.currentFromHeader = true; }
        ignored.push({ line: line, reason: '日付の見出し' });
        return;
      }
      if (r.kind === 'ignore') { ignored.push({ line: line, reason: '予約の行ではないと判断' }); return; }
      if (r.date.status === 'ok' && r.date.note !== '見出しの日付') ctx.currentFromHeader = false;
      r.lineNo = idx + 1;
      var meta = lineMeta && lineMeta[idx];
      if (meta && ((typeof meta.score === 'number' && meta.score < 0.85) || (typeof meta.minChar === 'number' && meta.minChar < 0.5))) {
        ['date', 'start', 'name', 'guests', 'content'].forEach(function (k) {
          if (r[k].status === 'ok') { r[k].status = 'check'; r[k].note = '読み取りの確信度が低い文字を含む行です。写真と見比べてください'; }
        });
        r.lowConfidence = true;
      }
      rows.push(r);
    });
    return { rows: rows, ignored: ignored };
  }

  function normalizeName(s) {
    return String(s || '').normalize('NFKC').replace(/\s+/g, '').replace(/(様|さま|殿)$/, '');
  }

  /* 候補（編集後の値）の検証：不正な日付・時刻・人数を登録させない */
  function validateCandidate(c, opts) {
    var errors = [], o = opts || {};
    if (!isValidIsoDate(c.date)) errors.push('日付が正しくありません');
    if (!isValidTime(c.start)) errors.push('開始時刻が正しくありません');
    if (!isValidTime(c.end)) errors.push('終了時刻が正しくありません');
    if (isValidTime(c.start) && isValidTime(c.end) && c.start >= c.end) errors.push('終了時刻は開始時刻より後にしてください');
    if (!String(c.name || '').trim()) errors.push('お名前を入力してください');
    if (String(c.name || '').length > 100) errors.push('お名前が長すぎます');
    if (c.guests !== '' && c.guests !== null && c.guests !== undefined) {
      var g = Number(c.guests);
      if (!Number.isInteger(g) || g < 1 || g > (Number(o.maxGuests) || 200)) errors.push('人数は1〜' + (Number(o.maxGuests) || 200) + 'の整数で入力してください');
    }
    if (String(c.content || '').length > 150) errors.push('予約内容が長すぎます（150文字まで）');
    if (String(c.note || '').length > 500) errors.push('備考が長すぎます（500文字まで）');
    return errors;
  }

  /* 登録済み予約・同じ取込内の重複 */
  function findDuplicates(c, records) {
    var name = normalizeName(c.name), exact = [], sameDay = [], calendar = [];
    (records || []).forEach(function (r) {
      if (!r || r.date !== c.date || normalizeName(r.name) !== name || !name) return;
      if (r.start === c.start) {
        if (r.type === 'ledger') exact.push(r); else calendar.push(r);
      } else sameDay.push(r);
    });
    return { exact: exact, sameDay: sameDay, calendar: calendar };
  }

  function overlapping(c, records) {
    if (!isValidTime(c.start) || !isValidTime(c.end)) return [];
    return (records || []).filter(function (r) {
      return r && r.date === c.date && r.start < c.end && c.start < r.end && normalizeName(r.name) !== normalizeName(c.name);
    });
  }

  var api = {
    parseLedgerText: parseLedgerText,
    parseLine: function (line, opts) { return parseLine(line, settingsContext(opts)); },
    normalizeLine: normalizeLine,
    normalizeName: normalizeName,
    validateCandidate: validateCandidate,
    findDuplicates: findDuplicates,
    overlapping: overlapping,
    isValidIsoDate: isValidIsoDate,
    isValidTime: isValidTime,
    kanjiToNumber: kanjiToNumber
  };
  global.KaisekiOcrParse = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
