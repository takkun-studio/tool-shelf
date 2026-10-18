# ツール棚 MVP

個人販売・小規模出店向けのブラウザ内完結計算ツール。React + Vite + TypeScript + React Router + Vitest。全10ツールの単発計算・CSV出力は未登録でも無料。無料登録ではお気に入り3件の保存ができ、月額プランでは実際にPRO比較機能を利用できます。

## 起動

`pnpm install` → `pnpm dev`。確認は `pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build`。

## 構成

- `src/lib/tools.ts`: 唯一のtool registry（metadata、順序、route、入力定義）
- `src/lib/calculators/`: UIから独立した純粋計算
- `src/lib/storage.ts`: `tool-shelf:v1:scenarios`、schema version 1 の安全なlocalStorage
- `src/lib/csv.ts`: UTF-8 BOM / CRLF / RFC 4180相当CSV
- `src/pages/`: ホームと各ツール共通画面

すべての入力は必須。金額・数量は0以上の整数、%は0〜100の整数。空欄や不正値では計算しない。率は保存・表示とも0〜100で、計算時だけ100で割る。

計算式は画面の各結果と `src/lib/calculators/index.ts` に集約。損益ゼロ売価と損益分岐点数量は安全側で切り上げる。

## 実装済みツール

1. 原価・利益計算
2. 損益分岐点計算
3. マルシェ出店収支計算
4. 値引き・セール利益計算
5. 手取り売上計算
6. サービス料金設計
7. 月次売上目標計算
8. 在庫回転・仕入れ資金計算
9. 販売チャネル比較計算
10. 初期投資回収計算

## 新しいツールを追加する

1. `src/lib/tools.ts` にmetadataと入力項目を追加
2. `src/lib/calculators/index.ts` に計算分岐を追加
3. `src/main.tsx` にrouteを追加

未実装: 無料お気に入りと通常試算のクラウド同期、CSV import。月480円のPRO選択5件はD1同期済み。

## 販売準備状態

全10ツールの`access`は`free`。すべてブラウザ内で単発計算でき、ゲストでもCSV出力可能。サインイン済みなら試算をこのブラウザのlocalStorageに保存・再利用できます。無料会員はお気に入り3件、月480円（内部コード: basic）はD1保存した5件のPRO比較、月980円（内部コード: standard）は全10件のPRO比較が使えます。通常版の計算・CSVはどのプランも無料。Unlimitedは構想のみで販売しません。

## プラン権限レイヤー

`src/lib/plans.ts` が `free / basic / standard / unlimited` と順序を定義し、フロントエンドの全ツールの`minimumPlan`は`free`。会員のPROプランはWorkerが署名付きClerk JWTを確認し、Stripe Price ID・契約状態からD1内のプランを導出して判定します。月480円プランは `/v1/pro/selections` を使い、ユーザー単位のPRO選択を5件までD1で保存。スマホとPCは同一の選択状態を共有します。無料お気に入り3件と通常試算の保存は引き続きブラウザ内です。localStorageやfrontend送信のplanをPRO利用権限には使いません。

## Clerk Auth

`VITE_CLERK_PUBLISHABLE_KEY` をgit管理外の `.env.local` に設定します（変数名は `.env.example` を参照）。`@clerk/react` が認証境界で、`/login`・`/account`・headerのユーザー操作を提供します。Clerk Secret KeyはVite/frontendへ置きません。未ログイン時はWorker APIが401を返します。

Clerk Development instanceでtest modeの新規登録・確認コード・login・session再読込・`/account`・logoutを実通信確認済みです。

## 課金backend基盤

`worker/` はCloudflare Worker + D1の認可境界です。D1の`users`、`entitlements`、`webhook_events`は`worker/migrations/0001_initial.sql`で作成します。WorkerはClerk session JWTを公開JWKSで検証し、D1にentitlementがなければ`free`として扱います。frontendからのplan値は使いません。

既存の `/v1/calculators/` 7 endpointには旧サブスクリプション権限チェックが残りますが、公開UIはこれらを呼び出さず、同じ純粋計算定義をフロントエンドに取り込んで10ツールすべて無料で計算します。Worker URLは契約状態確認と定期決済フローに使用します。旧APIは互換性のため保持しますが、全ての旧有料計算APIもPRO選択とStripe契約で認可し、直接APIを叩いてPROを迂回できないようにしています。

## 最終検証（2026-09-05時点の記録）

- `pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build`: PASS
- 内蔵ブラウザ（390 × 844）: `/`、3ツール、各計算結果、保存済みscenarioのreload復元、404、ホーム復帰、横スクロールなし、console error/warn なしを確認
- CSV: UIから改行・カンマ・ダブルクォートを含むscenario名を保存・出力し、実ダウンロードCSVでUTF-8 BOM、CRLF、RFC 4180相当の`""` escapeとfield内改行の保持を確認
- 10ツール拡張: 全10直URL、追加7ツールの主要計算、390 × 844での横スクロールなし、console error/warnなしを確認

## 2026-10-18 課金設計の訂正（バックアップ済み旧方針）

未登録でも全10ツールを単発利用できることは今後も維持。**旧方針の月額『棚枠数だけ』は2026-10-18に撤回**。変更前の状態は次のGitHubバックアップブランチに保存。旧来の試算データ用localStorageは変更しません。

## 2026-10-18 PRO契約仕様（現行作業）

- **無料:** 全10通常計算・CSV、無料会員のお気に入り3件、ローカル試算保存。
- **月480円（basic）:** 選んだ5種類のPRO比較。D1の `pro_selections` に格納し、PRO枠に入れ替える際は5件を一括更新。複数端末の同時更新はCAS版数で409を返し、画面で最新選択を再取得。
- **月980円（standard）:** 全ツールのPRO比較。個別登録なし。今後の追加ツールも自動対象。
- PRO版として **現在実装済みの追加機能は2案比較のみ**。両シナリオの入力・結果と数値差を返す。その他の拡張は完成していないため課金説明で約束しない。
- 認可はWorkerがClerk JWT・Stripe Price・D1 `pro_selections` を毎回照合。ブラウザ保存だけでPRO版を解放しない。
- バックアップ: [旧main](https://github.com/takkun-studio/tool-shelf/tree/backup/2026-10-18-before-pro-main)、[旧v4案](https://github.com/takkun-studio/tool-shelf/tree/backup/2026-10-18-before-pro-design-v4)。

### 本番へ出す順番

1. 現行Worker/D1とCloudflare Pagesの設定・前回バックアップ状態を確認。
2. D1に **追加分のみ** migrationを適用: `pnpm exec wrangler d1 migrations apply tool-shelf-entitlements --remote`。既存3テーブルと契約データは削除しない。
3. 新Workerを公開して `GET /v1/pro/selections` と `POST /v1/pro/compare/:id` を認証済みで確認。
4. 新フロントをCloudflare Pagesに公開、Clerk/Stripe本番導線を実アカウントで確認。

**PR作成だけではD1 migration・Worker・Cloudflare Pagesの公開は行われません。** CLIの認証状態とデプロイ権限が必要です。現在のプランは既存Stripe Price IDをそのまま使用します。
