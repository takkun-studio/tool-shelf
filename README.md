# ツール棚 MVP

個人販売・小規模出店向けのブラウザ内完結計算ツール。React + Vite + TypeScript + React Router + Vitest。全10ツールの単発計算・CSV出力は未登録でも無料。登録・月額課金は自分の棚の保存・登録枠の拡張に使います。

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

未実装: 棚や試算のクラウド同期、CSV import。

## 販売準備状態

全10ツールの`access`は`free`。すべてブラウザ内で単発計算でき、ゲストでもCSV出力可能。サインイン済みなら試算をこのブラウザのlocalStorageに保存・再利用できます。無料の棚3枠、Basic（月480円）の棚5枠、Standard（月980円）の棚10枠はツールを並べ替えてすばやくアクセスするための枠数であり、計算機能のロックではありません。Unlimitedは将来構想で、現時点では販売しません。

## プラン権限レイヤー

`src/lib/plans.ts` が `free / basic / standard / unlimited` と順序を定義し、フロントエンドの全ツールの`minimumPlan`は`free`。会員の棚プランはWorkerの `/v1/billing/status` で取得したD1/Stripe由来のプランを利用し、ログインユーザー別にブラウザ内の棚登録枠を Free3、Basic5、Standard10 に制限します。localStorageのプラン値やfrontend送信値は契約の正本には使用しません。

## Clerk Auth

`VITE_CLERK_PUBLISHABLE_KEY` をgit管理外の `.env.local` に設定します（変数名は `.env.example` を参照）。`@clerk/react` が認証境界で、`/login`・`/account`・headerのユーザー操作を提供します。Clerk Secret KeyはVite/frontendへ置きません。未ログイン時はWorker APIが401を返します。

Clerk Development instanceでtest modeの新規登録・確認コード・login・session再読込・`/account`・logoutを実通信確認済みです。

## 課金backend基盤

`worker/` はCloudflare Worker + D1の認可境界です。D1の`users`、`entitlements`、`webhook_events`は`worker/migrations/0001_initial.sql`で作成します。WorkerはClerk session JWTを公開JWKSで検証し、D1にentitlementがなければ`free`として扱います。frontendからのplan値は使いません。

既存の `/v1/calculators/` 7 endpointには旧サブスクリプション権限チェックが残りますが、公開UIはこれらを呼び出さず、同じ純粋計算定義をフロントエンドに取り込んで10ツールすべて無料で計算します。Worker URLは契約状態確認と定期決済フローに使用します。旧APIは互換性のため保持し、認可・Stripe契約を勝手に緩和しません。

## 最終検証（2026-09-05時点の記録）

- `pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build`: PASS
- 内蔵ブラウザ（390 × 844）: `/`、3ツール、各計算結果、保存済みscenarioのreload復元、404、ホーム復帰、横スクロールなし、console error/warn なしを確認
- CSV: UIから改行・カンマ・ダブルクォートを含むscenario名を保存・出力し、実ダウンロードCSVでUTF-8 BOM、CRLF、RFC 4180相当の`""` escapeとfield内改行の保持を確認
- 10ツール拡張: 全10直URL、追加7ツールの主要計算、390 × 844での横スクロールなし、console error/warnなしを確認

## 2026-10-18 課金設計の訂正

未登録でも全10ツールを単発利用できることを正本とします。月額は『ツールの利用数』ではなく『自分の棚の登録枠と使いやすさ』に対するもの。ログイン済みユーザーの棚はこのブラウザごとに保存され、別端末との同期はありません。旧来の試算データ用localStorageは変更しません。
