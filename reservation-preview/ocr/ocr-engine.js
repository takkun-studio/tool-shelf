/*
 * 端末内日本語OCRエンジン（PP-OCRv5 mobile + ONNX Runtime Web / WebAssembly）
 * - 画像は端末内（ブラウザ内）だけで処理し、外部サービスへ送信しない。
 * - モデル・ランタイムは同じ公開先（./ocr/vendor/）から読み込む。
 * - 読み込み失敗時は状態を破棄し、再試行できるようにする。
 */
(function (global) {
  'use strict';

  var DEFAULTS = {
    vendor: 'ocr/vendor/',
    detModel: 'ppocrv5-mobile-det.onnx',
    recModel: 'ppocrv5-mobile-rec.onnx',
    dict: 'ppocrv5_dict.txt',
    runtime: 'ort.wasm.min.js',
    detLimit: 1280,
    detThresh: 0.3,
    boxThresh: 0.5,
    unclipRatio: 1.6,
    recHeight: 48,
    maxRecWidth: 2400,
    minLineScore: 0.3
  };

  var state = { loading: null, det: null, rec: null, chars: null, options: null };

  function absUrl(path) {
    try { return new URL(path, global.document ? global.document.baseURI : global.location.href).href; }
    catch (e) { return path; }
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var existing = global.document.querySelector('script[data-ocr-runtime]');
      if (existing && global.ort) return resolve();
      if (existing) existing.remove();
      var s = global.document.createElement('script');
      s.src = src;
      s.async = true;
      s.dataset.ocrRuntime = '1';
      s.onload = function () { global.ort ? resolve() : reject(new Error('OCRランタイムを初期化できませんでした')); };
      s.onerror = function () { s.remove(); reject(new Error('OCRランタイムを読み込めませんでした（通信を確認してください）')); };
      global.document.head.appendChild(s);
    });
  }

  async function fetchBytes(url, label, onProgress, signal) {
    var res;
    try { res = await fetch(url, { cache: 'force-cache', signal: signal }); }
    catch (e) { throw new Error(label + 'を読み込めませんでした（通信を確認してください）'); }
    if (!res.ok) throw new Error(label + 'を読み込めませんでした（HTTP ' + res.status + '）');
    var total = Number(res.headers.get('content-length')) || 0;
    if (!res.body || !res.body.getReader || !total) {
      var buf = new Uint8Array(await res.arrayBuffer());
      if (onProgress) onProgress(1);
      return buf;
    }
    var reader = res.body.getReader(), chunks = [], got = 0;
    for (;;) {
      var step = await reader.read();
      if (step.done) break;
      chunks.push(step.value); got += step.value.length;
      if (onProgress) onProgress(Math.min(1, got / total));
    }
    var out = new Uint8Array(got), pos = 0;
    chunks.forEach(function (c) { out.set(c, pos); pos += c.length; });
    return out;
  }

  function load(options, onStatus) {
    if (state.det && state.rec && state.chars) return Promise.resolve();
    if (state.loading) return state.loading;
    var opt = Object.assign({}, DEFAULTS, options || {});
    var alive = true, ac = typeof AbortController === 'function' ? new AbortController() : null;
    var status = function (m) { if (alive && onStatus) onStatus(m); };
    state.loading = (async function () {
      var vendor = absUrl(opt.vendor);
      status('読み取りエンジンを準備しています…');
      if (!global.ort) await loadScript(vendor + opt.runtime);
      var ort = global.ort;
      ort.env.wasm.wasmPaths = vendor;
      ort.env.wasm.numThreads = global.crossOriginIsolated ? Math.max(1, Math.min(4, (global.navigator && global.navigator.hardwareConcurrency) || 1)) : 1;
      ort.env.logLevel = 'error';
      var prog = { det: 0, rec: 0 };
      var report = function () { status('認識データを読み込み中… ' + Math.round((prog.det * 4.7 + prog.rec * 16.5) / 21.2 * 100) + '%'); };
      var results = await Promise.all([
        fetchBytes(vendor + opt.detModel, '文字検出データ', function (p) { prog.det = p; report(); }, ac && ac.signal),
        fetchBytes(vendor + opt.recModel, '文字認識データ', function (p) { prog.rec = p; report(); }, ac && ac.signal),
        fetchBytes(vendor + opt.dict, '文字一覧', null, ac && ac.signal)
      ]);
      status('読み取りエンジンを起動しています…');
      var so = { executionProviders: ['wasm'], graphOptimizationLevel: 'all' };
      var det, rec;
      try {
        det = await ort.InferenceSession.create(results[0], so);
        rec = await ort.InferenceSession.create(results[1], so);
      } catch (e) {
        throw new Error('読み取りエンジンを起動できませんでした（' + (e && e.message ? e.message : e) + '）');
      }
      var text = new TextDecoder('utf-8').decode(results[2]).replace(/\r/g, '');
      var lines = text.split('\n');
      if (lines.length && lines[lines.length - 1] === '') lines.pop();
      state.chars = ['<blank>'].concat(lines, [' ']);
      state.det = det; state.rec = rec; state.options = opt;
      alive = false;
    })().catch(function (err) {
      alive = false;
      if (ac) { try { ac.abort(); } catch (e) { /* 何もしない */ } }
      state.loading = null; state.det = null; state.rec = null; state.chars = null;
      throw err;
    });
    return state.loading;
  }

  function isReady() { return Boolean(state.det && state.rec && state.chars); }

  function reset() { state.loading = null; state.det = null; state.rec = null; state.chars = null; }

  /* ---------- 画像の準備 ---------- */
  function makeCanvas(w, h) {
    var c = global.document.createElement('canvas');
    c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h));
    return c;
  }

  async function toCanvas(source, maxSide) {
    var img = source;
    if (typeof source === 'string' || source instanceof Blob) {
      img = new Image();
      var url = typeof source === 'string' ? source : URL.createObjectURL(source);
      try {
        await new Promise(function (resolve, reject) {
          img.onload = resolve;
          img.onerror = function () { reject(new Error('写真を開けませんでした（画像形式を確認してください）')); };
          img.src = url;
        });
      } finally {
        if (typeof source !== 'string') setTimeout(function () { URL.revokeObjectURL(url); }, 0);
      }
    }
    var w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
    if (!w || !h) throw new Error('写真の大きさを取得できませんでした');
    var scale = Math.min(1, maxSide / Math.max(w, h));
    var c = makeCanvas(w * scale, h * scale);
    var ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return c;
  }

  /* 薄い文字・低コントラスト写真の補正（明るさの分布を引き伸ばす） */
  function enhanceContrast(canvas, force) {
    var ctx = canvas.getContext('2d', { willReadFrequently: true });
    var img = ctx.getImageData(0, 0, canvas.width, canvas.height), px = img.data;
    var hist = new Uint32Array(256), n = px.length / 4;
    for (var i = 0; i < px.length; i += 4) hist[(px[i] * 77 + px[i + 1] * 150 + px[i + 2] * 29) >> 8]++;
    var cut = Math.max(1, Math.floor(n * 0.005)), lo = 0, hi = 255, acc = 0;
    for (; lo < 255; lo++) { acc += hist[lo]; if (acc >= cut) break; }
    acc = 0;
    for (; hi > 0; hi--) { acc += hist[hi]; if (acc >= cut) break; }
    var range = hi - lo;
    if (range < 20) return false;
    if (!force && range > 170) return false;
    for (var j = 0; j < px.length; j += 4) {
      for (var k = 0; k < 3; k++) {
        var v = (px[j + k] - lo) * 255 / range;
        px[j + k] = v < 0 ? 0 : v > 255 ? 255 : v;
      }
    }
    ctx.putImageData(img, 0, 0);
    return true;
  }

  /* ---------- 文字領域の検出 ---------- */
  async function detect(canvas, opt) {
    var ort = global.ort;
    var W = canvas.width, H = canvas.height;
    var r = Math.min(1, opt.detLimit / Math.max(W, H));
    var dw = Math.max(32, Math.round(W * r / 32) * 32), dh = Math.max(32, Math.round(H * r / 32) * 32);
    var c = makeCanvas(dw, dh), ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(canvas, 0, 0, dw, dh);
    var px = ctx.getImageData(0, 0, dw, dh).data, size = dw * dh;
    var input = new Float32Array(3 * size);
    // PaddleOCRと同じBGR順・ImageNet正規化
    for (var i = 0, p = 0; i < size; i++, p += 4) {
      input[i] = (px[p + 2] / 255 - 0.485) / 0.229;
      input[size + i] = (px[p + 1] / 255 - 0.456) / 0.224;
      input[2 * size + i] = (px[p] / 255 - 0.406) / 0.225;
    }
    var feeds = {}; feeds[state.det.inputNames[0]] = new ort.Tensor('float32', input, [1, 3, dh, dw]);
    var out = await state.det.run(feeds);
    var prob = out[state.det.outputNames[0]].data;
    return boxesFromProb(prob, dw, dh, W / dw, H / dh, opt);
  }

  function boxesFromProb(prob, w, h, sx, sy, opt) {
    var size = w * h, label = new Int32Array(size), stack = new Int32Array(size), boxes = [], id = 0;
    for (var start = 0; start < size; start++) {
      if (label[start] || prob[start] <= opt.detThresh) continue;
      id++;
      var top = 0; stack[top++] = start; label[start] = id;
      var n = 0, sum = 0, mx = 0, my = 0, sxx = 0, syy = 0, sxy = 0, pts = [];
      while (top) {
        var q = stack[--top], x = q % w, y = (q - x) / w;
        n++; sum += prob[q]; mx += x; my += y; sxx += x * x; syy += y * y; sxy += x * y; pts.push(q);
        if (x > 0 && !label[q - 1] && prob[q - 1] > opt.detThresh) { label[q - 1] = id; stack[top++] = q - 1; }
        if (x < w - 1 && !label[q + 1] && prob[q + 1] > opt.detThresh) { label[q + 1] = id; stack[top++] = q + 1; }
        if (y > 0 && !label[q - w] && prob[q - w] > opt.detThresh) { label[q - w] = id; stack[top++] = q - w; }
        if (y < h - 1 && !label[q + w] && prob[q + w] > opt.detThresh) { label[q + w] = id; stack[top++] = q + w; }
      }
      if (n < 12 || sum / n < opt.boxThresh) continue;
      var cx = mx / n, cy = my / n;
      var cxx = sxx / n - cx * cx, cyy = syy / n - cy * cy, cxy = sxy / n - cx * cy;
      var theta = 0.5 * Math.atan2(2 * cxy, cxx - cyy);
      var cos = Math.cos(theta), sin = Math.sin(theta);
      var umin = Infinity, umax = -Infinity, vmin = Infinity, vmax = -Infinity;
      for (var k = 0; k < pts.length; k++) {
        var px = pts[k] % w, py = (pts[k] - px) / w, dx = px - cx, dy = py - cy;
        var u = dx * cos + dy * sin, v = -dx * sin + dy * cos;
        if (u < umin) umin = u; if (u > umax) umax = u; if (v < vmin) vmin = v; if (v > vmax) vmax = v;
      }
      var bw = umax - umin + 1, bh = vmax - vmin + 1;
      if (Math.min(bw, bh) < 3) continue;
      var ucen = (umin + umax) / 2, vcen = (vmin + vmax) / 2;
      var ccx = cx + ucen * cos - vcen * sin, ccy = cy + ucen * sin + vcen * cos;
      var d = (bw * bh) * opt.unclipRatio / (2 * (bw + bh));
      bw += 2 * d; bh += 2 * d;
      boxes.push({ cx: ccx * sx, cy: ccy * sy, w: bw, h: bh, theta: theta, sx: sx, sy: sy, score: sum / n });
    }
    // 検出座標を元画像座標へ（縦横比の丸め差も考慮）
    return boxes.map(function (b) {
      var c = Math.cos(b.theta), s = Math.sin(b.theta);
      var ux = c * b.sx, uy = s * b.sy, vx = -s * b.sx, vy = c * b.sy;
      var w = b.w * Math.hypot(ux, uy), hh = b.h * Math.hypot(vx, vy);
      return { cx: b.cx, cy: b.cy, w: w, h: hh, angle: Math.atan2(uy, ux), score: b.score };
    });
  }

  /* ---------- 文字認識 ---------- */
  async function recognizeBox(canvas, box, opt) {
    var ort = global.ort;
    var angle = box.angle, w = box.w, h = box.h;
    if (h > w * 1.5) { angle += Math.PI / 2; var t = w; w = h; h = t; }
    var H = opt.recHeight, s = H / h;
    var W = Math.max(16, Math.min(opt.maxRecWidth, Math.round(w * s)));
    var c = makeCanvas(W, H), ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.translate(W / 2, H / 2);
    ctx.scale(W / w, s);
    ctx.rotate(-angle);
    ctx.drawImage(canvas, -box.cx, -box.cy);
    var px = ctx.getImageData(0, 0, W, H).data, size = W * H, input = new Float32Array(3 * size);
    for (var i = 0, p = 0; i < size; i++, p += 4) {
      input[i] = (px[p + 2] / 255 - 0.5) / 0.5;
      input[size + i] = (px[p + 1] / 255 - 0.5) / 0.5;
      input[2 * size + i] = (px[p] / 255 - 0.5) / 0.5;
    }
    var feeds = {}; feeds[state.rec.inputNames[0]] = new ort.Tensor('float32', input, [1, 3, H, W]);
    var out = await state.rec.run(feeds);
    var tensor = out[state.rec.outputNames[0]];
    return ctcDecode(tensor.data, tensor.dims[1], tensor.dims[2]);
  }

  function ctcDecode(data, steps, classes) {
    var chars = state.chars, text = '', scores = [], prev = -1;
    for (var t = 0; t < steps; t++) {
      var best = 0, bestP = -Infinity, off = t * classes;
      for (var c = 0; c < classes; c++) { var v = data[off + c]; if (v > bestP) { bestP = v; best = c; } }
      if (best !== 0 && best !== prev) { text += chars[best] !== undefined ? chars[best] : ''; scores.push(bestP); }
      prev = best;
    }
    var mean = scores.length ? scores.reduce(function (a, b) { return a + b; }, 0) / scores.length : 0;
    return { text: text, score: mean, charScores: scores };
  }

  /* ---------- 行のまとめ（表形式の台帳はセルごとに検出されるため横方向に連結） ---------- */
  function groupRows(items) {
    if (!items.length) return [];
    var wide = items.filter(function (b) { return b.w > b.h * 2; }).map(function (b) { return b.angle; }).sort(function (a, b) { return a - b; });
    var skew = wide.length ? wide[Math.floor(wide.length / 2)] : 0;
    var c = Math.cos(-skew), s = Math.sin(-skew);
    items.forEach(function (b) { b.rx = b.cx * c - b.cy * s; b.ry = b.cx * s + b.cy * c; });
    var heights = items.map(function (b) { return Math.min(b.w, b.h); }).sort(function (a, b) { return a - b; });
    var medH = heights[Math.floor(heights.length / 2)] || 20;
    var sorted = items.slice().sort(function (a, b) { return a.ry - b.ry; });
    var rows = [];
    sorted.forEach(function (b) {
      var row = null, bestGap = Infinity;
      rows.forEach(function (r) {
        var gap = Math.abs(r.y - b.ry);
        if (gap < medH * 0.55 && gap < bestGap) { bestGap = gap; row = r; }
      });
      if (row) { row.items.push(b); row.y = row.items.reduce(function (a, x) { return a + x.ry; }, 0) / row.items.length; }
      else rows.push({ y: b.ry, items: [b] });
    });
    rows.sort(function (a, b) { return a.y - b.y; });
    return rows.map(function (r) {
      r.items.sort(function (a, b) { return a.rx - b.rx; });
      var score = r.items.reduce(function (a, x) { return a + x.score * x.text.length; }, 0) / Math.max(1, r.items.reduce(function (a, x) { return a + x.text.length; }, 0));
      var minChar = 1; r.items.forEach(function (x) { (x.charScores || []).forEach(function (v) { if (v < minChar) minChar = v; }); });
      return { text: r.items.map(function (x) { return x.text; }).join(' '), score: score, minChar: minChar, minScore: Math.min.apply(null, r.items.map(function (x) { return x.score; })), cells: r.items.map(function (x) { return { text: x.text, score: x.score }; }) };
    });
  }

  function nextFrame() { return new Promise(function (r) { setTimeout(r, 0); }); }

  async function recognize(source, options, onStatus) {
    var status = onStatus || function () {};
    await load(options, status);
    var opt = Object.assign({}, state.options, options || {});
    status('写真を準備しています…');
    var canvas = await toCanvas(source, 2000);
    var enhanced = enhanceContrast(canvas, Boolean(opt.enhance));
    status('文字の位置を探しています…');
    await nextFrame();
    var boxes = await detect(canvas, opt);
    var items = [];
    for (var i = 0; i < boxes.length; i++) {
      status('文字を読み取り中… ' + Math.round((i + 1) / boxes.length * 100) + '%');
      if (i % 3 === 0) await nextFrame();
      var r = await recognizeBox(canvas, boxes[i], opt);
      if (!r.text.trim() || r.score < opt.minLineScore) continue;
      items.push(Object.assign({}, boxes[i], r));
    }
    var rows = groupRows(items);
    return {
      text: rows.map(function (r) { return r.text; }).join('\n'),
      lines: rows,
      boxes: items.length,
      enhanced: enhanced,
      width: canvas.width,
      height: canvas.height
    };
  }

  global.KaisekiOcrEngine = { load: load, recognize: recognize, isReady: isReady, reset: reset, _groupRows: groupRows, _ctcDecode: ctcDecode };
})(typeof window !== 'undefined' ? window : globalThis);
