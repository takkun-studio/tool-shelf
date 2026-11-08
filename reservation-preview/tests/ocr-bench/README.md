# OCR精度ベンチ（架空の懐石料理店 予約台帳）

画像はGitに入れず、一時フォルダに生成して評価後に削除する。

```bash
node reservation-preview/scripts/build-site.mjs            # .site を作る（OCRモデル取得・SHA-256照合）
PLAYWRIGHT_DIR=<node_modules/playwright> FONT_DIR=<node_modules/@fontsource> PW_CHANNEL=chrome \
  node reservation-preview/tests/ocr-bench/gen.mjs /tmp/ledger-synth 20261109   # 画像＋truth.json
PLAYWRIGHT_DIR=<node_modules/playwright> PW_CHANNEL=chrome \
  node reservation-preview/tests/ocr-bench/eval.mjs /tmp/ledger-synth paddle chromium   # 正解と自動比較
```

- `gen.mjs`：1行形式・日付見出し・表・漢数字/時表記・薄い文字・傾き・影/ノイズ・密な行の8パターン×2。`JITTER=2.2` で崩した字。フォントは @fontsource の zen-kurenaido / yomogi / yusei-magic と macOS の Klee（いずれも手書き風フォントで、実際の筆跡ではない）
- `eval.mjs`：日付・開始・お名前・人数・ご予約内容の一致率、要確認/空欄、要確認なしの誤り（気づかない誤り）を集計
- `realeval.mjs`：同じ文を書いた実筆跡画像フォルダの文字認識率（合成の結果とは分けて報告する）
