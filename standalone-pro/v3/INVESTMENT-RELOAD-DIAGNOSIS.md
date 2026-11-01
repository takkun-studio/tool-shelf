# 初期投資回収の再読込調査（2026-11-01）

## 結論

**未解決。** 初期投資回収の商品コードを使わない最小HTMLでも同じ症状を再現したため、商品固有の描画処理が症状の発生に必須ではないことを確認した。ただし、Chrome・Playwright・macOSや並列実行のどの組合せが引き金か、実利用でも起きるか、元の1回と今回が同一原因かは特定できていない。DOMの読み込み待ちだけで説明することもできない。初期投資回収は販売不可を維持する。別の商品にも同様の保存基盤があり、実利用への一般化は未検証。

## 実測した証拠

macOS 27.0.1 arm64、Chrome 154.0.8037.93、Playwrightのヘッドレス・隔離プロファイル・合成データで実施。実ユーザーデータには触れていない。

- `investment-reload-diagnostic.cjs` で6プロファイルを並列、最大150回再読込。計測用のStorage置換を**無効**にした実行で4/6プロファイルに症状が発生し、それぞれ1、67、69、93回目で停止。各失敗の直前は同じURLの保存領域1キー・1レコード・一覧1行。
- 失敗直後は `readyState=complete`、`localStorage.length=0`、対象キー `getItem(...) === null`、商品内レコード0件、一覧0行。300ms後も空。例外・ブラウザログは記録されなかった。
- 同一プロファイルの**同じファイルを開いた別タブ**、別コピー、ブラウザ再起動後は、いずれも元の1レコードを取得し一覧に表示。計測を有効にした別の実行でも、失敗ページの対象キー取得は `null` で、ページ上の `setItem` / `removeItem` / `clear` は観測されなかった。
- 商品コードを含まない `file-storage-control.cjs` は、起動時にキーを読むだけの静的HTMLを使用。同じChromeを6プロファイル並列、最大300回再読込したところ、file://はオンライン2/2・オフライン2/2で同様の空状態を記録。失敗時は別タブと再起動後に元データを取得した。同時実行したHTTP 2/2は300回を通過した。この比較だけでは file:// や並列性が単独の原因だとは証明できない。
- 以前の元の失敗には直後の保存値の記録がない。今回の症状と見かけは一致するが、元の失敗原因を断定できない。通常の10商品file://保存・再読込・別コピー・再起動試験は今回10/10通過したが、上記の失敗を打ち消すものではない。

`file-storage-check.cjs` は失敗直後に保存値・DOM・エラーを採取するよう改良した。失敗を再試行で合格扱いにはしない。

## 再実行

Playwrightがインストール済みなら、次の環境変数でChromeの実行ファイルとPlaywrightモジュールを指定する。失敗観測時は終了コード1となる。どちらも使い捨てプロファイルと合成データを使う。出力はJSON Linesで、環境によって発生しない場合もある。

```sh
QA_PLAYWRIGHT_MODULE=/path/to/playwright QA_CHROMIUM_PATH='/path/to/Chrome' QA_TRACE=0 QA_WORKERS=6 QA_ITERATIONS=150 node standalone-pro/v3/tests/investment-reload-diagnostic.cjs
QA_PLAYWRIGHT_MODULE=/path/to/playwright QA_CHROMIUM_PATH='/path/to/Chrome' QA_CONTROL_WORKERS=2 QA_ITERATIONS=300 node standalone-pro/v3/tests/file-storage-control.cjs
```

次の調査では、実際の通常操作に近い条件とChrome以外の環境を切り分け、空の保存領域から新規保存した場合の整合性を合成データで確認する。保存領域が空に見えたときの書込み安全性と対処が未確認のため、原因をテスト環境だけに限定して販売可能とは判定しない。
