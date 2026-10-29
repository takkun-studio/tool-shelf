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

## QA continuation — 2026-10-30 (supersedes the earlier checkpoint)

Branch base: `30ef06941065d1f8dddd697a9bc98b2b3ef4cd77`. All checks below apply to the subsequent committed source unless a limitation is stated. Main, production, free tools, pricing and database were not changed.

### Product status

`OK` below means the bounded browser workflow described in this section passed; it is not an assertion that every possible calculation or accessibility case has been covered. **All ten remain on HOLD for a final sale decision** because the remaining checks listed below have not been completed. No product is marked sale-approved.

| Product | Chromium PC/mobile | WebKit PC/mobile | Distinctive PRO function checked | Sale decision |
| --- | --- | --- | --- | --- |
| breakeven | OK | OK | Goal quantity/revenue and quantity simulation | HOLD |
| channel | OK | OK | A/B goal prices, quantities and comparison | HOLD |
| discount | OK | OK | Safe discount ceiling and discount scenarios | HOLD |
| inventory | OK | OK | Target stock, replenishment quantity and cost | HOLD |
| investment | OK | OK | Whole-sale recovery and target-period analysis | HOLD |
| market | OK | OK | Additional target quantity and sales simulation | HOLD |
| payout | OK | OK | Payout/profit rates and price comparison | HOLD |
| profit | OK | OK | Product comparison, target-price calculation and CSV import | HOLD (old version cannot read new CSV) |
| service | OK | OK | Goal-inclusive service fee and effective hourly rate | HOLD |
| target | OK | OK | Additional goal and 4-week sales target | HOLD |

### Verified in this continuation

- Chromium and Playwright WebKit, 1280×800 desktop and 390×844 mobile emulation: all 40 product/engine/viewport combinations passed `tests/browser-check.cjs`. Each covered representative calculation, save, keyboard edit, delete, comparison presence, CSV download, JSON backup, restore success/cancel/invalid JSON, horizontal page overflow, accessible input labels, print-button invocation and print media, HTML injection, and `file://` save. Chromium also produced a PDF through the browser printing engine. Dialogs were handled with a Playwright `dialog` event; the previous Ego Lite dialog automation stall is avoided without changing Safari settings.
- Ten A4 PDFs were generated in Chromium and visually reviewed as pages; each included a saved record. The profit report gained an explicit print title. No physical printer was used. The mobile tests use emulated viewports and WebKit, not physical iOS/Android devices.
- `node --test standalone-pro/v3/tests/calculators-check.cjs`: 115/115 pass, independently rerun. Tests cover representative values, zero and invalid input for each product, relevant losses, fractional comparisons, zero-denominator and extreme-result protection. These are bounded examples, not exhaustive proof against floating-point error.
- `pnpm test`: 102/102 pass. `pnpm lint` and `pnpm build`: pass. Build-generated `dist` changes were restored and are not included.
- The new profit CSV has a consistent eight-column versioned header. The current version imports both the older `name` format and `name:csv-safe-v1`; actual old-version export into the new version succeeded. Actual old-version import of the new version is rejected. The new UI states this compatibility limit. Unsafe spreadsheet formulas are escaped; retain JSON backups for exact transfer.
- Corrected recovery months using whole sales, conservative maximum-discount rounding, zero-goal cases, matching fractional comparison labels/results, service hourly-rate validation, keyboard-edit access, and out-of-range calculations. The latter blocks saving newly entered unsafe results without replacing existing records; some older extreme imported records can be shown as out of range.

### Remaining before sale approval

- Test on actual mobile devices and assistive technologies, including full keyboard traversal, screen reader announcements, contrast, focus order and all long-data layouts. The performed input-label and edit-key checks are not a full accessibility audit.
- Exercise additional product-specific extreme decimal/rounding cases and long record lists, and review print pagination with realistic nonzero, multi-record data. Printing to PDF and sample-page inspection do not prove every print layout or physical printer.
- Product-specific paid value was reviewed against the corresponding free calculator and extended with the functions in the table, but buyer testing and commercial sufficiency are not established by the technical tests.
- Profit's new CSV cannot be imported by the old standalone version. Do not silently strip formula-protection apostrophes from unversioned old files; use the current version and JSON backups when exact names must be preserved.
- Storage remains browser-local; the snapshot comparison is not a transactional cross-tab lock. Corrupt raw data export is preservation evidence, not a valid backup.

Reproduce the deterministic suite with `node --test standalone-pro/v3/tests/calculators-check.cjs`. `tests/browser-check.cjs` additionally needs a compatible installed Playwright runtime and browser binaries; set `QA_PLAYWRIGHT_MODULE` if Playwright is outside the project, `QA_ENGINE=webkit` for WebKit, and optionally `QA_CHROMIUM_PATH` or `QA_BASE_URL`. Start a local static server on `127.0.0.1:18763` first. The one-time WebKit installation used only `/private/tmp/pro-qa-browsers` and did not change Safari settings or project dependencies.
