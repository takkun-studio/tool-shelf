# Claude監査指摘の照合表（v3・2026-11-01）

## 集計の単位

依頼に提示された共通指摘9分類（S1〜S9）と商品別10分類を1件ずつ数える。計19分類。各行はその分類に含まれる複数条件をまとめたもので、19個の個別テストという意味ではない。S5についての以前の「内容未提供」という記載は誤りで、ユーザーが明示した「channel / payoutで合計手数料率が100%を超える場合の警告またはエラー」を以下に追加した。実装は100%ちょうども含めて警告する。Claudeの `audit-tests.tgz` 自体は未提供で、報告条件から作成したテストとコード照合による証拠を記載する。

最初の修正照合の基準は `157079c3bc5db2c11fc8c568461f72c61f0c3aca`、今回のS5追加照合と再読込調査の基準は `2e072801e090f6d8c6b62d8fa8becf6276b2170f`。以下の「回帰」は実施した範囲であり、未知の入力や未確認環境の合格を意味しない。

## 共通指摘

| 分類 | 指摘と修正 | 確認・証拠 |
| --- | --- | --- |
| S1 | 利益計算以外の9商品で保存成功・一覧の場所を通知。短時間の同条件連打を抑止し、時間を置いた意図的な再保存は可能。 | `tests/claude-audit-check.cjs` の保存通知・連打／再保存。`tests/browser-check.cjs` の実ブラウザ保存。 |
| S2 | 商品別の主要結果を項目名と単位付きで表示。利益のある商品は利益を含め、計算不能でも同じ項目名を維持。数値部分は折り返さない。 | `claude-audit-check.cjs` の商品別比較項目・計算不能、`tests/stress-check.cjs` の長い名称・スマホ幅・印刷。 |
| S3 | 行クリックで編集せず、編集を明示。新規・更新・別名保存・取消を区別し、元の入力を復元。編集中の切替は破棄を確認。 | `tests/audit-browser-check.cjs` の10商品、`tests/keyboard-check.cjs`、`tests/profit-claude-check.cjs` の全件削除中の状態。 |
| S4 | 不正レコードを隔離し原文保持。正常記録は読込・保存可能。隔離込みversion 2 JSONバックアップ／復元、原本保存、2段階確認の初期化、利用不可と破損の区別、旧形式検証。全体破損時は不正JSONを正常なバックアップとして出力しない。 | `claude-audit-check.cjs` の混在・原文・旧v1・2MB超・不正バックアップ・利用不可・初期化取消、`tests/quarantine-browser-check.cjs` の10商品実ブラウザ往復。不正JSON全体の原本は正常バックアップではない。 |
| S5 | channel・payoutは合計手数料率100%以上で警告。100%超でも正しい負の手取り・利益を補正せず表示。 | `claude-audit-check.cjs` と `s5-browser-check.cjs` のchannel A/Bおよびpayoutの100%・110%各ケース。 |
| S6 | CSVは計算結果を別列にし、数値のマイナスを数値として保持。文字列の数式注入対策と利益計算の旧CSV入力を維持。 | `claude-audit-check.cjs` の別列・負数、`tests/calculators-check.cjs` の数式名・旧CSV、`tests/profit-claude-check.cjs`。Excel実アプリは未検証。 |
| S7 | 復元前に現在・復元後の件数を表示し、取消後も同じファイルを選択可能。不正形式は保存値を変更しない。 | `claude-audit-check.cjs` の10商品件数・取消・null等の不正、`browser-check.cjs` と `quarantine-browser-check.cjs`。 |
| S8 | 金額・割合・数量の単位と計算不能理由を表示。赤字を文言でも示す。表示丸めは内部計算を変更しない。 | `claude-audit-check.cjs` の赤字・単位・計算不能、`calculators-check.cjs` の小数・境界・微小値・既存計算、`free-parity-check.cjs`。 |
| S9 | 計算結果のライブ領域、削除後フォーカス、縦横44px以上のボタンを用意。 | `tests/touch-target-check.cjs` の10商品スマホ幅・削除後フォーカス、`keyboard-check.cjs` の10商品代表Tab/Enter操作。実機・VoiceOver・TalkBackは未検証。 |

## 商品別指摘

| 分類 | 修正・照合 | 確認・証拠 |
| --- | --- | --- |
| breakeven | 限界利益率と限界利益0以下の理由を表示。 | `claude-audit-check.cjs`、`free-parity-check.cjs`、`calculators-check.cjs`。 |
| channel | A/B手取りを表示し、手数料率合計100%以上を警告。超過時の赤字を補正しない。 | `claude-audit-check.cjs` の100%・110%と独立期待値、`free-parity-check.cjs`。 |
| discount | 利益率と固定手数料込みの販売手数料を表示。最大安全値引率の計算を保持。 | 今回、固定手数料欠落を基準版で再現後に修正。`claude-audit-check.cjs`、`free-parity-check.cjs`、`calculators-check.cjs` の安全値引率境界。 |
| inventory | 共通修正。現在庫・月間販売数を結果に含め、持ち月数と在庫回転率の違いを説明。 | `free-parity-check.cjs`、`claude-audit-check.cjs`、共通ブラウザ試験。 |
| investment | 月間販売数へ表現統一、計算不能理由と単位を修正。 | 今回、目標販売数の「件／月」と回収余裕額の誤単位を再現後に修正。`claude-audit-check.cjs`、`free-parity-check.cjs`。 |
| market | 総コスト・利益率・1個あたり限界利益・損益分岐点売上を表示し、一覧に最終利益を表示。 | `free-parity-check.cjs`、`claude-audit-check.cjs`、`calculators-check.cjs`。 |
| payout | 合計手数料率100%以上を警告し、一覧に利益を表示。 | `claude-audit-check.cjs` の100%・110%赤字、`free-parity-check.cjs`。 |
| profit | 厳格UTF-8、旧CSV互換・重複検出・数式保護、編集状態、新規／更新／別名、入力初期化、1円切上げ、原価率を確認。 | 今回、無料版と異なる原価率と赤字文言の欠落を再現後に修正。`profit-claude-check.cjs`、`claude-audit-check.cjs`、`free-parity-check.cjs`、`audit-browser-check.cjs`。Shift_JISは明示拒否。 |
| service | 共通修正と無料版全出力を確認。 | `free-parity-check.cjs`、`calculators-check.cjs`、共通ブラウザ試験。 |
| target | 利益0円の理由と、4週換算が月間金額ではない旨を表示。 | `claude-audit-check.cjs`、`free-parity-check.cjs`、`calculators-check.cjs`。 |

無料版との代表値比較は全10商品の全結果行を `free-parity-check.cjs` で検証した。重要な結果項目の欠落はない。投資額／必要利益が0かつ1件利益が0の境界では、無料版は計算不能、PROは「回収・達成する必要がない」として0件を返す既存仕様で、両者は同じ値ではない。この差は同テストで明示的に固定した。

## 未検証・制限

- Claudeの元テスト、実際のSafari、Windows、実機iOS／Android、VoiceOver、TalkBack、Excel実アプリ、物理プリンターは未確認。
- キーボードは主要操作の実ブラウザ試験を実施したが、全設定・全環境の完全な巡回や支援技術の読み上げを検証したものではない。
- 投資回収の再読込時、当該タブでlocalStorage自体が空に見える事象が再現した。商品コードを含まない対照HTMLでも並列Chrome試験のfile://で再現し、同一URLの別タブ・ブラウザ再起動後は元データを取得した。ブラウザ／自動操作環境の関与は明らかだが、根本原因と購入者環境への影響は未特定。投資回収は販売不可を維持する。詳細は `INVESTMENT-RELOAD-DIAGNOSIS.md`。
- 一覧の安全性はブラウザの単一プロファイル内での検証。複数タブの同時書き込みを原子的に防ぐ仕組みではない。販売条件と利用者への説明は `RELEASE-GUIDE.md` を参照。
