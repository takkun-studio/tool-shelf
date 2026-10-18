# ツール棚

個人販売・小規模出店向けの計算・判断ツール棚。React + Vite + TypeScript + React Router + Vitest。

## 現在の構成

- 公開ツール: 40件
- 通常版: 全40件、未登録でも無料
- CSV出力: 無料
- 無料登録: お気に入り棚3枠
- 月480円 / 5件PRO: 選んだ5件だけPRO対象、入れ替え可能
- 月980円 / 全件PRO: 全40件がPRO対象、棚は10件

## 1ツール1フォルダ

各ツールは `src/tools/<tool-id>/` に分離。

```text
src/tools/<tool-id>/
  definition.ts
  calculate.ts
  calculate.test.ts
  index.ts
```

`src/tools/index.ts` が公開registryで、一覧・route・計算を自動リンクする。計算式は各フォルダの `calculate.ts` を正本とし、Worker互換APIも同じ式を再利用する。

## 入力仕様

- 金額・個数・件数・回数は原則0以上の整数
- %は0〜100の小数対応
- 作業時間・売切り月数など必要な項目は小数対応
- 全角数字・全角小数点・カンマ入り数値を正規化
- 選択式の入力は `Field.options` で定義

## 計算監査

2026-10-19に公開10件 + 候補30件を全レビューし、BLOCKだった6件も入力定義と式を修正してから実装。

特に以下を修正:

- 源泉徴収: 低率部分 / 上限超部分 / 境界額を入力式に変更
- 固定資産: 税務上の減価償却額を断定せず、資金流出と年割り参考値に限定
- インボイス: 税込仕入額 / 税率 / 控除割合を入力式に変更
- 予約販売: `ceil(必要良品数 / (1 - 不良率))` で不足しない式へ修正
- 売れ残り現金化: 将来の保管費と売切り期間で比較
- キャッシュレス: 粗利率とキャッシュレス比率を追加して採算計算

監査記録: `docs/calculation-audit-2026-10-19.md`

## 検証

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

PC / スマホ実画面QAでは、40件表示、小数率入力、選択式入力、予約100・不良10%・予備5%→117個、横スクロールなしを確認する。

## 正本とバックアップ

GitHub `takkun-studio/tool-shelf` の `main` がコード正本。

40ツール実装直前バックアップ:

`backup/2026-10-19-before-40-tool-implementation`

本番Cloudflare Pages / WorkerはGitHubのCI成功とは別に公開物を確認する。
