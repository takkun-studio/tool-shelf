# Tool Shelf standalone PRO v3 — Codex QA handoff

Source: 10 standalone HTML products in `standalone-pro/v3/<id>/index.html`.
This is an isolated development branch. Do not merge or deploy automatically.

## Required work
1. Run each HTML file in Chromium/WebKit mobile and desktop viewports. Check form input, calculations, saving/editing/deleting scenarios, CSV export, JSON backup/restore, print, accessibility and responsive overflow.
2. Add repeatable automated tests for all 10 calculators and their edge cases: zeros, negative inputs, percentages >= 100, division by zero, fractional counts, extremely large numbers, invalid JSON and malformed imported data.
3. Fix bugs and improve per-product value beyond the free versions, without changing original free calculators or production site.
4. Check user-facing Japanese text, privacy/offline claims, CSV formula injection, HTML injection, storage quota handling and backup schema compatibility.
5. Commit improvements on this branch only; keep history rollbackable. Provide a per-product pass/fail report and reproducible test commands.

Do not modify main, live Cloudflare Pages, pricing, database, or unrelated GitHub files.

## QA progress — 2026-10-30 (not release-approved)

Work remains in `product/profit-pro-standalone`. Changes are limited to the ten standalone HTML files and `tests/calculators-check.cjs`; the free tools, pricing, database and production remain out of scope. Keep all products on HOLD until the checks below have been completed.

- All ten: guard failed/stale storage writes, preserve corrupt data for export, protect CSV names from spreadsheet formulas, and validate numerical inputs. Nine history-based products can update an existing record; profit has JSON backup and restore.
- Additional calculations: breakeven goal revenue; channel goal quantities; discount maximum safe discount; inventory replenishment quantity and budget; investment goal-period surplus/shortfall; market additional quantity; payout payout/profit percentages; profit target difference; service effective hourly rate; target weekly goal. `target` scenarios now include the extra goal.
- `node --test standalone-pro/v3/tests/calculators-check.cjs`: 94 passing at this checkpoint. These use a mocked DOM and storage, not a complete browser acceptance test. The independent tester reran all 94 and separately checked the updated profit CSV and legacy-header import. The repository's `pnpm test` reported 102 passing; `pnpm lint` and `pnpm build` passed. Build outputs were restored and are not part of this work.
- Chromium browser, desktop and 390px emulated mobile: all ten pages loaded and saved a named record without document-level horizontal overflow in a local test origin. Desktop edit-and-save was also observed on nine products; channel hit a browser automation timeout. This is not a full visual or end-to-end acceptance.
- Outstanding for every product: complete PC/mobile browser verification of edit, delete, comparison, CSV download/content, JSON download/restore, print output, layout, accessibility, and regression tests after the last change. Safari/WebKit desktop displayed and saved a record in all ten, but full flows and mobile WebKit remain untested. Exercise all normal, zero, loss, invalid, extreme and boundary cases independently, including floating-point rounding. Audit per-product value against the free version and confirm the sales-ready bar. Do not call any product PASS until all its applicable checks pass.
- Corrupt raw storage export is evidence for recovery, not a valid backup: restore requires an earlier valid JSON backup. The snapshot check is not an atomic cross-tab lock.

- Chromium profit JSON backup downloaded successfully; attempting restore hit an automation dialog timeout and was not verified end-to-end. Profit CSV exports now have the versioned `name:csv-safe-v1` header; this version accepts both old and new headers, but older versions may not accept the new header.
