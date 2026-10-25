# Codex 引継ぎ: 予約管理アプリ

更新日: 2026-10-26

## 目的
手書きの予約台帳とGoogleカレンダーの予定の食い違いを解消し、PC・スマホで使いやすい予約管理アプリを完成させる。

公開そのものが最終目的ではない。現在は「操作できる試作UIをCloudflare Pagesで正常公開できた」段階。

## 正本
- GitHub: takkun-studio/tool-shelf
- 作業ブランチ: reservation-dashboard-preview
- 現在の正本HTML: reservation-preview/index.html
- バックアップ: backup/2026-10-26-reservation-dashboard-preview
- main には予約管理コードを入れないこと
- 現在の公開実測URL: https://0654fa86.takkun-tool-shelf.pages.dev

## 公開QA済み
GitHub Actions + Playwrightで実URLに対して以下をPASS確認済み。
- Content-Type: text/html
- 公開HTMLと正本HTMLの完全一致
- PC 1440x900でデスクトップ表示
- スマホ 390x844でモバイル表示
- 全体管理 / 月間表示 / 詳細表示の3画面切替
- 予定追加
- 予定編集
- 予定削除

一時QAワークフローは削除済み。既存tool-shelf本番mainは変更していない。

## 現在実装済み
- 全体管理画面
- 月間カレンダー
- 日別詳細
- 予約 / 個人予定 / 手書き台帳予定の追加・編集・削除
- 台帳とカレンダーの手動比較
- 不一致検出
- 重複時間検出
- 「台帳を採用」「予定を採用」の試作照合
- 手書き台帳写真の添付
- JSON書き出し / 読み込み
- localStorageによる端末内保存
- PC / スマホレスポンシブ
- スマホで上部ヘッダー固定、下部3タブ固定、中央のみスクロール

## 未実装
- Googleカレンダー実同期
- 台帳写真のAI文字読み取り
- PC・スマホ間のデータ共有
- 実データ用バックエンド
- 認証 / 利用者管理
- Googleカレンダー側への変更・キャンセル反映
- 実運用向けの競合・重複・更新確認処理

## Supabase
- lelien-repair は一時的に予約管理の仮公開に使用したが不採用
- 現在プロジェクトは INACTIVE
- reservation-dashboard-demo Edge Functionはプロジェクト内に残っているが、予約管理の正本・公開経路として使わない
- 既存DB・HPは変更しない

## Lovable
- 生成版は不採用
- UI正本ではない
- 今後も、明確にUI/操作性が向上する根拠がない限り採用しない

## 固定条件
1. 既存成果物を破棄しない
2. UI・配色・レイアウト・操作を勝手に作り直さない
3. 既存GitHub / Cloudflare Pagesを優先
4. main・既存tool-shelf本番・既存HP・既存DBへ無断変更しない
5. 不要なサービスを追加しない
6. 追加API課金を前提にしない
7. 公開方式を変える場合は、必要性・メリット・費用・既存環境への影響を先に確認する
8. 問題が出ても場当たり的な回避策を増やさない
9. 未確認事項を完了扱いしない
10. Gitでロールバック可能な状態を常に維持する
11. 作業前に現行コードを読む。推測で再構築しない
12. 変更後はPC/スマホの実画面と主要操作を必ず確認する
13. コミット・pushまで行い、変更点と検証結果を残す

## 次にやること
まず reservation-preview/index.html を読んで、実装済み機能とコード構造を監査する。

そのうえで、本来の目的に必要な未実装機能を依存関係順に整理し、既存環境で最短に完成させる。

優先順位:
1. Googleカレンダー同期の実装方式確定
2. 実データ保存方式の確定
3. 手書き台帳写真の読み取り
4. 台帳とGoogle予定の照合ロジック本実装
5. 変更 / キャンセル確認フロー
6. PC・スマホ間共有
7. 認証・実運用安全性
8. 最終PC/スマホE2E

## Googleカレンダー実装時の注意
- 有料APIを前提にしない
- 既存のGoogleアカウント / Calendarを活用する
- 認証情報をGitへコミットしない
- まず読み取り同期から始める
- 書き込みは確認画面を挟む
- 台帳側とGoogle側の差分を表示し、勝手に上書きしない
- 変更・削除はユーザー確認後のみ反映

## 台帳読み取り実装時の注意
- 写真選択の既存UIは残す
- AI/OCR結果は自動確定しない
- 日付・時間・名前・内容を候補として表示し、人が確認・修正してから登録
- 読み取り不能を明示できること
- 追加課金を前提とする外部OCR APIは使わない

## 作業開始時
最初に以下を確認してから実装する。
- git status
- 現在ブランチ
- reservation-preview/index.html
- 既存Cloudflare公開構成
- 利用可能な既存認証 / Google Calendar接続環境
- 追加費用の有無

勝手に構成変更せず、この引継ぎを正として進めること。

## 2026-10-26 ローカル再開・現状監査

### 復元基準と作業範囲
- ローカル: `/Users/yoshinagamegumi/Documents/ChatGPT/開発/tool-shelf`
- ブランチ: `reservation-dashboard-preview`
- 作業開始HEAD: `b18713245607d04c7dfcb5e8c7207aa3f738d97c`（取得時 clean）
- 既存バックアップ: `origin/backup/2026-10-26-reservation-dashboard-preview` = `cf533b6a09fe03df56576b330b7b973c08ff9b9e`。HTMLは開始HEADと同一。
- `origin/main` は `0748fa22ad5645dca4c1a86ed981965509cb610c`。mainへの切替・変更はしていない。
- 初回監査時はcommit/pushが未承認だったためローカル差分として保持した。後続のユーザー直接指示で、この差分のcommitとreservation-dashboard-previewへのpushが承認された。main・本番・DBへの反映は引き続き禁止。
- 戻す場合の対象は本節追加分と `index.html` の今回差分のみ。後続作業がある場合は先に差分を退避し、基準HEADとの差分を確認してから部分復元する。自動reset/cleanはしない。

### 確認済み
- 公開URLはHTTP 200 / `text/html; charset=utf-8`。取得時の公開HTMLと開始HEADのHTMLはバイト単位で一致。
- 開始HTMLのSHA-256: `52144a6fa675068e26eba96347a4bfd7a31bb2ad867e9225d87142792780aa69`。
- 予約アプリは単一HTMLのCSS、DOM、即時実行JavaScriptで完結。React/Viteのtool-shelf本体とは独立。初回監査時点で予約用の既存テスト・ビルドスクリプトはなかった。回帰テストは後述の確定工程でtestsへ移管。
- 状態は `data`、日付別の一時 `photos`、選択日・表示月・表示画面。localStorageキーは `schedule-demo-v2`。写真は保存・JSON出力対象ではない。
- 照合は同日・空白除去後の同名を先着で結び付ける試作。顧客ID、Google event ID、変更履歴、バージョン比較はない。
- 既存 `wrangler.toml` はtool-shelf用Worker/Clerk/Stripe/権限管理D1。予約アプリからの接続はない。既存D1は予約保存先として流用しない。
- 残存GitHub Actionsの公開処理はmainとdist向け。予約の一時QAは削除済み。Cloudflareダッシュボードの現在のビルド出力設定・環境変数・課金プランは未確認。
- CodexのGoogle Calendarコネクタはprofile取得成功。ただしアプリ用OAuthクライアントやブラウザから利用できる認証ではない。予定本文・顧客データは取得していない。
- ユーザー回答: Google OAuthと共有保存先は未設定。「既存Cloudflare内の構成案をまとめて」。外部環境の作成・DB実行は未承認。

### 今回の修正
- `index.html` の保存を、候補検証 → localStorage書込 → メモリ状態更新の順に変更。追加/編集/削除/照合/JSON読込/初期化で保存失敗時に成功表示せず、元データと編集フォームを保持。
- ID欠落/重複、存在しない日付、不正時刻、逆転時間、空の名前、フィールド型・既存フォーム上限を検証。正常な既存records形式とversion 2を受理し、省略menu/noteは空文字として扱う。
- 新規IDはUUID。既存IDと未知の追加フィールドは維持。
- 破損保存データはデモへ自動置換しない。書込を止めて元文字列をJSON書出しで退避できる。退避後の修復・復元導線は未実装。ストレージ自体が読めない場合は書出しも成功扱いしない。
- 読込後に別画面の保存値が変わっていた場合は上書きを拒否。ただしlocalStorageのread/writeは複数タブ間のトランザクションではなく、厳密な同時更新排他を保証しない。実運用時はサーバ側version条件更新が必要。
- CSS・DOM・既存の正常操作時文言・写真処理・照合方式・公開構成は変更していない。

### 監査で残った問題
- 予約件数の「台帳とカレンダーを合算」という説明に対して集計はbookingのみ。台帳だけの予約は空き時間計算にも入らない。意図を決めてから修正。
- 9〜19時以外の予定は日別詳細には出るが全体管理タイムラインには出ない。
- 同名の複数予約があると照合候補を誤結合し得る。試作の採用ボタンは即時反映で、本運用用の差分確認・変更履歴はない。
- 写真読込中の日付変更で添付先がずれる可能性、全体管理の写真表示が日付変更に追随しない問題。別途修正対象として切り分ける。
- localStorageの本格的な競合処理、ブラウザ終了後の写真保存、実機Safari/iPhone検証は未達。

## 既存Cloudflare内の構成案（未作成・未反映）

### 推奨する分離
- UI正本は本ブランチの `reservation-preview/index.html` を維持。
- 既存Cloudflareアカウント内に予約専用Workerと予約専用D1を分離する案。tool-shelf本体Worker、権限管理D1、既存HP、Supabaseには予約コード・テーブルを追加しない。
- UIのpreview公開先は維持。アプリ用OAuthに登録する安定したpreview originとWorker API originを先に確定する。現在のハッシュ付き公開URLを恒久の認証先として決め打ちしない。
- 個人利用から開始するならGoogleログインの検証済み `sub` を利用者IDとし、許可された利用者だけが予約APIへアクセスする。Calendar権限への同意とアプリログインは別の確認として実装。既存Clerk/Stripe設定を変更しない。
- API側で署名・issuer・audience・期限を検証し、許可利用者/所有者を毎回検査。CORSのorigin許可だけを認証として扱わない。認証未実装のまま共有APIを公開しない。

### Googleの読み取り同期を先行
1. Google Cloud側にアプリ用OAuth Webクライアント・同意画面・Calendar API設定を用意する。ユーザーのログイン/同意は本人操作。設定値や秘密値をこの文書やGitに転記しない。
2. 最初はGIS token modelで、利用者が押した時だけ読み取り権限 `calendar.readonly` を取得。短期アクセストークンはメモリのみ、JSON/localStorage/ログ/Gitに保存しない。期限切れは再接続を表示する。
3. 対象Calendarを利用者が選択。取得したGoogle予定は台帳や手入力予約と別のsnapshotとして扱い、同名だけで自動上書きしない。Google ID・calendar ID・etag・updated・timezone・終日/繰返し/取消状態を保持。
4. 全ページ取得後だけsnapshotとsync tokenを更新する。途中の通信エラーでは旧データを保持。増分同期の410はGoogle snapshotだけ再取得し、台帳・手入力・照合履歴を削除しない。
5. まず読取専用でUIへ表示、差分候補は確認待ち。Googleへの書込・キャンセルは別段階で権限を追加し、内容確認、etag条件更新、再試行時の二重登録防止を実装。
6. この方式はアプリを閉じている間の常時同期を提供しない。常時同期が必要ならサーバOAuth/refresh token保管を別途設計し、その必要性を先に確認する。

根拠: [Google token model](https://developers.google.com/identity/oauth2/web/guides/use-token-model)、[Calendar増分同期](https://developers.google.com/workspace/calendar/api/guides/sync)。

### 保存・共有とSQLたたき台
- D1は台帳/手入力予定、Google snapshot、明示的な対応付け、更新履歴を保存する候補。Googleの認証トークンと写真バイナリはこのSQLへ保存しない。
- 初期は写真を現在同様に端末内で扱う。写真の端末間共有が必要なら予約専用R2、非公開アクセス、保存期間・削除方法・費用を別途確認する。現時点でバケットを作らない。
- まず個人所有モデル。店舗スタッフ間共有が必要なら所有者モデルの採用前に店舗/所属/権限設計を確定する。
- 以下はSQL案のみ。DB未作成、migration未追加、実行なし。Google snapshotと照合履歴の表は同期仕様確定後に追加する。

```sql
-- 新規の予約専用D1に限る。既存DBでは実行しない。
CREATE TABLE reservation_records (
  owner_sub TEXT NOT NULL,
  id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('booking','personal','ledger')),
  local_date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  time_zone TEXT NOT NULL DEFAULT 'Asia/Tokyo',
  name TEXT NOT NULL,
  menu TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  PRIMARY KEY (owner_sub, id)
);
CREATE INDEX reservation_records_owner_date
  ON reservation_records(owner_sub, local_date);
-- 更新は必ず認証済みowner_sub、id、期待versionをWHEREに指定し、
-- versionを1増加。変更0件なら409で再確認。日付等はサーバ側でも検証。
```

### 費用と採用条件
- Calendar APIの標準利用は追加料金なし。ただし公式には2026年後半のクォータ超過課金予定の記載があるため「無制限無料」とは扱わない。最初は手動同期、連打抑制、リクエスト上限、バックオフを設ける。[Google料金・クォータ](https://developers.google.com/workspace/calendar/api/guides/quota)
- D1 Freeは読取500万行/日、書込10万行/日、合計5GBの枠。Pages FunctionsはWorkers枠を消費する。現アカウントの契約・他サービスと共有する使用量は未確認で、無料枠内の運用可能性は採用前に確認する。[D1料金](https://developers.cloudflare.com/d1/platform/pricing/)、[Pages Functions料金](https://developers.cloudflare.com/pages/functions/pricing/)
- 有料プランへの変更、課金有効化、サービス追加、公開方式変更は実施していない。構成案の採用前に必要性・メリット・費用・既存環境への影響を確認する。
- 外部有料OCRは前提にしない。既存写真選択を保ち、端末内OCRを候補として手書き日本語の実サンプルで精度・負荷・ライセンスを確認後に選定。OCR未確定候補を人が修正・承認して台帳へ登録する。

### 依存関係順の再開地点
1. 今回の保存保護の検証結果とGit状態を確認し、確定コミットを復元基準として維持。
2. 安定preview origin、Google OAuth設定、対象カレンダー、個人利用/店舗共有の境界を確定。
3. 既存UIに読み取り接続・Google snapshot表示・未同期/失敗の状態を最小追加。終日・繰返し・取消・timezone・ページングをテスト。
4. 予約専用Worker/D1とSQL案の採用を確認してから構築。認証と所有者分離を共有機能より先に実装。DB実行は別承認。
5. サーバ保存・version競合を実装し、PCとスマホの別セッションで共有確認。
6. 同名誤結合を避ける明示対応付け、差分確認、変更/取消確認、監査履歴を実装。
7. OCR候補確認を追加。最後にGoogle実予定・写真・端末間共有・競合を含むPC/スマホE2E。現時点ではアプリ完成扱いしない。

### 今回の検証結果
2026-10-26 JST、今回の最終コードに対して確認。
- 独立tester: `node --test reservation-preview/tests/reservation-storage.test.mjs`（リポジトリルートから実行）、28 PASS / 0 FAIL。Node組込test/vmで実HTMLのスクリプトを実行し、6つの保存経路、破損/不正入力、他タブ更新、退避出力を検証。メインも同テストを実行し28 PASS。初回検証時はworkに置いたが、保存処理の継続的な回帰検証に必要なため `reservation-preview/tests/reservation-storage.test.mjs` へ移管。新規依存なし。
- inline JavaScript構文検証 PASS、`git diff --check` PASS。
- CSS・静的DOM・既存固定文言は開始HEADと文字列比較で完全一致。
- 実ブラウザ: Ego Lite / Chromium、`http://127.0.0.1:8765/`。ページタイトル・内容を確認。PC 1440x900、スマホ390x844で3画面切替、追加/編集/削除、保存後再読込 PASS。
- スマホでStorage書込例外を注入: 元ストレージ不変、フォーム開いたまま、入力保持、失敗メッセージを確認。例外解除後の再保存 PASS。この操作区間のerror/unhandledrejection収集は0件。全操作・全起動の完全なコンソール監査ではない。
- 実UIのJSON書出し→照合（b2開始15:00）→JSON再読込（14:30復元）→初期化（9件） PASS。合成データのみ。公開URLのデータや実Calendarには書込なし。
- スマホ中央スクロール0→627.5でヘッダー上端0・下タブ下端844を維持。横はみ出しなし。PC/スマホ画像を目視確認。
- 画面証跡: `../work/reservation-after-desktop.png`、`../work/reservation-after-mobile.png`。実操作で保存したJSON退避は `../work/reservation-ui-backup.json`。
- 最終HTML SHA-256: `51bf9705cfb4e4246aabc780f511e8910301955b0af65b711707944b60d5f1a4`。
- ブラウザ標準screenshotはタイムアウト。対象タブを前面に出しraw撮影へ切替後に取得成功。検証用TaskSpace 16は終了。Ego Liteの更新通知はあったが更新していない。
- tool-shelf本体のlint/typecheck/buildは未実行。変更対象が独立した静的予約HTML・引継ぎ文書のため、本体のbuildでdistを更新しない。
- 実機iPhone/Safari、Google実同期、認証、DB永続化、端末間共有、OCR、本番公開反映は未検証/未実装。今回の完了は現状監査・保存保護・構成案まで。アプリ全体完成ではない。
- 構成案の独立レビューも完了。固定条件との矛盾・未実施の実施済み扱いは指摘なし。公開HTML一致の対象が開始HEADであることも再確認。
- 初回監査ではcommit/push/PR/deploy/DB実行なし。後続の確定工程ではユーザー承認に基づき予約ブランチだけcommit/pushする。PR/deploy/DB実行は引き続き対象外。

## 2026-10-26 ローカル差分の確定工程

- 対象は `index.html`、本引継ぎ、`tests/reservation-storage.test.mjs` の3ファイルのみ。予約管理以外の変更を含めない。
- テストは今後の保存保護の回帰検証に必要と判断。旧workのファイルを移動し、HTML参照を `../index.html` に変更。重複ファイルは残さない。
- 実行コマンド: `node --test reservation-preview/tests/reservation-storage.test.mjs`。ブラウザUI試験とは別の28ケース。
- commit前に移管後の28ケース・構文・差分を再検証する。push先は `origin/reservation-dashboard-preview` のみ。
- push後はGitHub上の3ファイルの内容をローカルと照合する。commit/pushと照合の実行結果はこのチャットで報告し、未実施を先に成功記録しない。
- その後の調査はOAuth設定・対象Calendar・安定preview URLの既存環境の読み取りだけ。設定変更、サービス追加、課金、DB作成、公開方式変更は実行しない。
