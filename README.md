# ツール棚 MVP

個人販売・小規模出店向けのブラウザ内完結計算ツール。React + Vite + TypeScript + React Router + Vitest。無料3・有料候補7の全10ツールを、現時点ではすべてローカルで利用できる状態で提供します。

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

未実装: Stripe決済、クラウド同期、CSV import。

## 販売準備状態

tool registryの`access`は`free`または`paid`。無料は最初の3ツール、有料は残り7ツールです。Freeはローカル計算、有料7ツールは認証済みの対象planでWorker計算を利用します。Stripe決済は未実装です。

## プラン権限レイヤー

`src/lib/plans.ts` が `free / basic / standard / unlimited` と順序を定義し、tool registryは各toolの`minimumPlan`を保持します。WorkerはD1 entitlementの`free / basic / standard`を正本として使い、未知のplan・toolIdは拒否します。localStorageとfrontend送信値は権限の正本に使用しません。

## Clerk Auth

`VITE_CLERK_PUBLISHABLE_KEY` をgit管理外の `.env.local` に設定します（変数名は `.env.example` を参照）。`@clerk/react` が認証境界で、`/login`・`/account`・headerのユーザー操作を提供します。Clerk Secret KeyはVite/frontendへ置きません。未ログイン時はWorker APIが401を返します。

Clerk Development instanceでtest modeの新規登録・確認コード・login・session再読込・`/account`・logoutを実通信確認済みです。

## 課金backend基盤

`worker/` はCloudflare Worker + D1の認可境界です。D1の`users`、`entitlements`、`webhook_events`は`worker/migrations/0001_initial.sql`で作成します。WorkerはClerk session JWTを公開JWKSで検証し、D1にentitlementがなければ`free`として扱います。frontendからのplan値は使いません。

`/v1/calculators/discount`、`payout`、`service`、`target`、`inventory`、`channel`、`investment`の7 endpointでWorker計算を行います。Basicはdiscount/payout、Standardは全7ツールを利用できます。trial overrideは存在せず、Worker認可を迂回しません。Worker URLはgit管理外の`.env.local`に`VITE_WORKER_API_URL`として設定します。

## 最終検証（2026-09-05）

- `pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build`: PASS
- 内蔵ブラウザ（390 × 844）: `/`、3ツール、各計算結果、保存済みscenarioのreload復元、404、ホーム復帰、横スクロールなし、console error/warn なしを確認
- CSV: UIから改行・カンマ・ダブルクォートを含むscenario名を保存・出力し、実ダウンロードCSVでUTF-8 BOM、CRLF、RFC 4180相当の`""` escapeとfield内改行の保持を確認
- 10ツール拡張: 全10直URL、追加7ツールの主要計算、390 × 844での横スクロールなし、console error/warnなしを確認
