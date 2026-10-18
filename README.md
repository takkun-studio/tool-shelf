# ツール棚

個人販売・小規模出店向けの計算・判断ツール棚。React + Vite + TypeScript + React Router + Vitest。通常版の計算とCSV出力は未登録でも無料です。

## 起動・検証

`pnpm install` → `pnpm dev`

変更後は必ず以下を通します。

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## 1ツール1フォルダ

ツール本体の正本は `src/tools/<tool-id>/` です。既存10ツールは次の形に統一しています。

```text
src/tools/
  profit/
    definition.ts
    calculate.ts
    calculate.test.ts
    index.ts
  breakeven/
    definition.ts
    calculate.ts
    calculate.test.ts
    index.ts
  ...
  index.ts
  drafts.ts
  types.ts
```

各ファイルの役割:

- `definition.ts`: ID、名前、説明、カテゴリ、順番、URL、入力項目
- `calculate.ts`: そのツールだけの純粋計算
- `calculate.test.ts`: そのツールだけの回帰テスト
- `index.ts`: definition と calculate を1モジュールとしてリンク
- `src/tools/index.ts`: **公開済みツールだけ**をまとめる中央registry（レジストリ）
- `src/tools/drafts.ts`: **未公開候補だけ**をまとめる下書きregistry
- `src/tools/types.ts`: 全ツール共通の型と結果ヘルパー

`src/lib/tools.ts` と `src/lib/calculators/index.ts` は既存コード互換用のリンクだけにし、ツール固有ロジックは置きません。

## ルート

`src/main.tsx` は `src/tools/index.ts` の公開registryからrouteを自動生成します。

そのため、新しい完成ツールを公開registryへリンクすれば `/tools/<id>` が自動で増えます。routeの手書き追加は不要です。

## 下書き30ツール

2026-10-19時点で、既存10ツールとは別に追加候補30件のフォルダと `definition.ts` を先に確保しています。

下書きは `src/tools/drafts.ts` にだけリンクされ、`src/tools/index.ts` には入りません。したがって、計算未実装の候補が本番一覧やrouteに出ることはありません。

完成させる時だけ、そのフォルダへ以下を追加します。

1. `calculate.ts`
2. `calculate.test.ts`
3. `index.ts`
4. `src/tools/index.ts` へ1行リンク
5. `src/tools/drafts.ts` から外す

## 実装済み10ツール

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

## 入力・計算ルール

通常版は全ツール無料。すべての数値入力は0以上の整数、%は0〜100の整数を基本とします。空欄や不正値では計算しません。

損益ゼロ売価や必要販売数など、安全側に寄せる値は切り上げます。

## PRO料金

- **無料**: 全ツールの通常版 + CSV出力。無料登録でお気に入り棚3枠
- **月480円 / 5件PRO**: 棚に入れた5件だけPRO対象。5件は入れ替え可能
- **月980円 / 全件PRO**: 全ツールPRO対象。棚は10件まで利用可能

内部コード名として `basic` / `standard` は残しますが、ユーザー画面では「5件PRO」「全件PRO」と表示します。

月480円の5件はCloudflare D1の `pro_selections` にアカウント単位で保存します。revision（リビジョン）を使い、別タブ・別端末の同時変更で古い内容が上書きされないようにしています。

## PRO機能の扱い

料金だけ先に作って、未実装のPRO機能を「使える」と表示しないこと。

各ツール固有のPRO機能を作る場合は、そのツールのフォルダ内に `pro.ts` と `pro.test.ts` を追加します。PRO固有機能がないツールには空の `pro.ts` を作りません。

## Worker

`worker/` はCloudflare Worker + D1の認証・課金・PRO権限境界です。

既存 `/v1/calculators/:id` の互換APIは残しますが、計算式そのものは `src/tools/<id>/calculate.ts` を再利用します。Worker側に同じ計算式を複製しません。

## 保存

- 試算: `tool-shelf:v1:scenarios`
- 無料 / 全件PROの棚並び: browser localStorage
- 月480円のPRO対象5件: D1

## 正本とバックアップ

GitHub `takkun-studio/tool-shelf` の `main` がコード正本。

この1ツール1フォルダ化の直前バックアップ:

`backup/2026-10-19-before-tool-folder-refactor`

本番Cloudflare PagesはGitHubのコード変更とは別に公開物を確認し、CI成功だけで「本番反映済み」と判断しません。
