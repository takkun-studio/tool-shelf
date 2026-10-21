# ツール棚

個人販売・小規模出店向けの計算・判断ツール棚。React + Vite + TypeScript + React Router + Vitest。

## 現在の構成

- 公開ツール: 既存10件
- 実装済み非公開ツール: 追加30件
- 通常版: 公開10件は未登録でも無料
- CSV出力: 無料
- 無料登録: お気に入り棚3枠
- 月480円 / 5件PRO: 公開ツールから選んだ5件だけPRO対象、入れ替え可能
- 月980円 / 全件PRO: 公開ツールが全件PRO対象、棚は10件

## 1ツール1フォルダ

各ツールは `src/tools/<tool-id>/` に分離。

```text
src/tools/<tool-id>/
  definition.ts
  calculate.ts
  calculate.test.ts
  index.ts
```

`src/tools/index.ts` は本番公開する10件だけをリンクする公開registry。
`src/tools/hidden.ts` は実装済みだがまだ公開しない追加30件を保持する非公開registry。
一覧とrouteは公開registryだけから生成するため、追加30件はホームにも直URLにも出さない。

## 計算監査

追加30件は計算式とテストまで実装済み。非公開中も各フォルダとテストは残し、公開する時だけ `src/tools/index.ts` へ移す。

監査記録: `docs/calculation-audit-2026-10-19.md`

## 検証

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

PC / スマホ実画面QAでは、公開10件のみ表示、追加30件の代表直URLが404、小数率入力、横スクロールなしを確認する。

## 正本

GitHub `takkun-studio/tool-shelf` の `main` がコード正本。
追加30件は削除せず、非公開状態で保持する。
