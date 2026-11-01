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

## Final sale assessment — 2026-10-30 (supersedes earlier HOLD decisions)

Base was `60e1521c767766e6cacf471a040e7fe7569c2435`; see the commit containing this section for the finished source. The decisions below concern these independent offline HTML files and their tested features. They do not assert that checkout, paid delivery, a physical printer, or buyer acceptance has been tested. No changes to main, production, free tools, database, or pricing are included.

| Product | Decision | Distinctive PRO value |
| --- | --- | --- |
| breakeven | 販売可能 | Goal quantity/revenue and quantity simulation |
| channel | 販売可能 | A/B goal prices, quantities and comparison |
| discount | 販売可能 | Safe discount ceiling and discount scenarios |
| inventory | 販売可能 | Target stock, replenishment quantity and budget |
| investment | 販売可能 | Whole-sale recovery and target-period analysis |
| market | 販売可能 | Additional target quantity and sales simulation |
| payout | 販売可能 | Payout/profit rates and price comparison |
| profit | 条件付き販売可能 | Product comparison, target-price calculation and CSV import; distribute the current version, and use JSON for exact transfers to it. The older version cannot read its versioned CSV. |
| service | 販売可能 | Goal-inclusive service fee and effective hourly rate |
| target | 販売可能 | Additional goal and weekly sales target |

The distinctive functions were assessed against the free tools in the earlier continuation; they provide product-specific calculations beyond shared history/export. Commercial demand and actual buyer testing remain unverified. These decisions are bounded by the following evidence and limitations, not a claim of exhaustive mathematical or accessibility certification.

### Evidence after final HTML changes

- `node --test standalone-pro/v3/tests/calculators-check.cjs`: 124/124. Covers decimal ceiling/floor boundaries, fractional inputs, zero, loss, invalid and extreme values, precision rejection and preservation of earlier tiny saved values. Exact decimal rational arithmetic avoids binary floating-point threshold errors; display still rounds as indicated by each product. New nonzero inputs smaller than `1e-100`, or decimal spellings that cannot be represented without loss by the storage number format, are rejected with an error. Existing stored values remain recoverable and out-of-range legacy values are identified rather than silently discarded.
- `tests/browser-check.cjs`: Chromium and Playwright WebKit, 1280×800 and 390×844, 40/40 flows. Each exercised calculation including a decimal boundary, storage, keyboard edit and returned focus, delete, comparison, CSV, JSON backup, restore success/cancel/invalid input, overflow, input labels, print button, print media, HTML injection and local file save. Chromium additionally generated PDFs; WebKit print media and invocation were checked, not WebKit-generated PDFs.
- `tests/stress-check.cjs`: Chromium 10/10, with 100 records and long unbroken names per product. A4 multi-page PDF extraction preserved every record identifier and all name characters; table and page width and row action labels were checked. Print table headings repeat, operations are hidden, and rows avoid page breaks. Representative pages for profit and market were visually inspected; no physical printer was used. The profit mobile table is intentionally horizontally scrollable within its container.
- `tests/capacity-check.cjs`: Chromium 10/10. Nine products preserve all 500 records and profit all 5,000 records when another save exceeds the limit, report the limit, and reload the same data.
- Visible text contrast was measured in the tested pages, muted text was corrected, input labels and distinct row-action accessible names were checked, and keyboard editing/focus was exercised. This is not a complete WCAG audit or full assistive-technology traversal. Physical iOS/Android, VoiceOver and TalkBack remain untested: device-specific keyboard/zoom, focus order and announcements may differ. These risks do not by themselves demonstrate a basic-operation failure in the tested environments.
- Independent tester reran the calculator suite and separately checked decimal examples and loading/validation of prior JSON records across all ten. `pnpm test`: 102/102; `pnpm lint` and `pnpm build`: pass. Generated build outputs were restored, not committed.
- The current profit version imports old `name` and current `name:csv-safe-v1` CSV headers; old versions reject the current header. Nine other products export CSV but do not have CSV import. JSON restore success, cancel and invalid-data protection were tested in every product. Data is browser-local: retain an external JSON backup. Snapshot comparison cannot guarantee atomic protection against simultaneous edits in separate tabs; exported corrupt raw data preserves evidence but is not itself a valid backup.

Re-run the calculator suite and browser harness as in the preceding section. `tests/stress-check.cjs` also needs Chromium and `pdftotext`; `tests/capacity-check.cjs` needs Chromium. All browser scripts use the same Playwright environment variables and local test server. Failure to provide a real device, screen reader or printer is explicitly an unverified layer rather than a passed test.

## Claude audit remediation — 2026-11-01 (supersedes all earlier sale decisions)

**The earlier nine “販売可能” decisions and the profit conditional decision are withdrawn. All ten products remain HOLD, not sale-approved.** Base: `a9ba6a941d1a110825b46d403fd541e18d865282`, branch `product/profit-pro-standalone`. Claude's `audit-tests.tgz` was not found in the checked work locations; the tests added here were built from the reported reproduction conditions, not obtained from Claude.

| Product | Free-output comparison and remediation | Decision |
| --- | --- | --- |
| breakeven | Contribution ratio added; zero/nonpositive contribution explained. | HOLD |
| channel | A/B take-home amounts added; total fees at or above 100% warned without clamping losses. | HOLD |
| discount | Selling fee and profit margin added; exact safe-discount logic retained. | HOLD |
| inventory | Current stock and monthly sales restored in results; stock-duration definition explained. | HOLD |
| investment | Initial cost restored in results; monthly sales terminology and undefined cases clarified. | HOLD |
| market | Total cost, margin, per-item contribution and break-even sales added; comparison shows final profit. | HOLD |
| payout | Combined-fee warning and profit in comparison added. | HOLD |
| profit | Cost rate, whole-yen minimum price, strict UTF-8 CSV rejection, duplicate detection and editing controls added. | HOLD |
| service | Free outputs retained; common storage, editing and comparison fixes applied. | HOLD |
| target | Zero per-sale profit explained and four-week target described as an approximation. | HOLD |

The free result definitions in `src/tools/*/calculate.ts` were compared with the ten PRO calculation/display paths. The initially missing inventory current stock/monthly sales, investment initial cost and profit cost rate were added; the other reported missing free outputs were also added. This is a source-level comparison, not independent buyer acceptance.

### Changes and compatibility

- Nine non-profit products announce saves, suppress rapid repeated identical saves, expose explicit edit/copy/cancel operations, retain the pre-edit draft on cancel, and label comparison values with units. Profit exposes edit/copy/cancel and new-input controls. Switching away from an active edit warns that unsaved changes will be discarded.
- All ten distinguish unavailable storage from corrupt storage at initial load and subsequent save, validate records individually, isolate invalid records while retaining their original JSON text on ordinary writes, provide raw export and a twice-confirmed reset, and validate JSON before replacement. Restoration confirmation shows the old and replacement counts. Invalid whole-document JSON is preserved and blocks ordinary writes until recovery/reset. A raw export preserves evidence; it is not necessarily a valid backup that can be restored directly. Save an external valid JSON backup before replacing or resetting data. Local-storage stale-snapshot checking is not an atomic cross-tab lock.
- Nine non-profit CSV exports have separate input and result columns, with numeric negatives retained as numeric values and textual spreadsheet formulas neutralized. Profit CSV v2 adds separate result columns; this version accepts the original `name`, v1 and v2 formats. Older versions cannot import the new v2 header; use the current version or an appropriate JSON backup. Import rejects invalid UTF-8, including invalid Shift_JIS bytes, and detects repeated data. Formula protection is retained for CSV names.
- Result displays include units, loss wording and reasons for common undefined results. Keyboard edit/focus checks and live result regions were added; these do not establish complete assistive-technology support.

### Verification and freshness

- After the final HTML change, `node --test standalone-pro/v3/tests/calculators-check.cjs standalone-pro/v3/tests/claude-audit-check.cjs standalone-pro/v3/tests/profit-claude-check.cjs`: 243/243 passed. These are bounded test cases and do not cover every possible input or every Claude finding.
- An independent tester checked representative expected calculations for all ten, focused editing and storage recovery, and ran the previous 231-case test set. The tester found an unavailable-storage messaging issue; the fix and additional profit editing fixes have subsequent regression tests. A second independent tester reran the final 243-case suite, checked actual localStorage getter failure and preservation for all ten, and checked profit edit-status transitions. Those passed; their separate Playwright environment was unavailable, so browser, stress and capacity runs above/below are the main agent’s checks.
- Chromium and WebKit desktop and emulated mobile: 20/20 flows each passed `tests/browser-check.cjs` after the final HTML changes. Chromium `tests/audit-browser-check.cjs` passed 10/10 after the final HTML changes, including explicit edit status, draft preservation, save-as, and profit clear while editing. The browser checks cover representative save/edit/delete, CSV download, JSON backup/restore/cancel, print invocation/media, labels and local-file loading. Chromium `tests/keyboard-check.cjs` additionally passed 10/10 representative Tab/Enter flows for save, edit/cancel, save-as, CSV and JSON export, delete, JSON restore and print; file selection was supplied by Playwright after keyboard activation. A separate independent attempt could not start Chrome (SIGABRT) and therefore did not independently verify that keyboard run; the successful 10/10 result is the main agent’s run.
- Chromium stress: 10/10 for 100 long-named records, mobile width and A4 PDF text extraction, after the comparison-layout change and before the later storage-message, profit edit-status, quarantine-label and clear-state edits. Capacity: 10/10, preserving 500 records (5,000 for profit) at the limit, before those later non-capacity edits. PDF generation/extraction is not a physical-printer test.
- Repository `pnpm test`: 102/102; `pnpm lint` passed after the final HTML/test edit; `pnpm exec tsc -b` and `pnpm exec vite build --outDir /private/tmp/tool-shelf-pro-v3-build` passed after the final HTML changes.

### Remaining before a sale decision

- Keyboard traversal beyond the representative Chromium flows, real screen-reader announcements, actual iOS/Android devices, actual Excel behavior, physical printing, and customer/buyer acceptance remain unverified. The supplied audit archive was unavailable, and the new suite does not establish complete reproduction and regression coverage for every statement in the audit. Do not infer those checks passed from the bounded automated results.
- Re-run the final independent verification after any further source change. Reproduce browser scripts with a local server on port 18763 and `QA_PLAYWRIGHT_MODULE`, `QA_CHROMIUM_PATH`, and (for WebKit) `PLAYWRIGHT_BROWSERS_PATH` set to available local runtimes. `tests/stress-check.cjs` additionally needs `pdftotext`.
- No main merge, production deployment, free-tool change, database change or pricing change is authorized by this work. Next step: resolve any findings from the final independent tester, perform the remaining checks, and only then reassess each of the ten HOLD decisions.

## Final technical sale assessment — 2026-11-01 (supersedes previous HOLD)

Base `157079c3bc5db2c11fc8c568461f72c61f0c3aca`; changes are confined to `standalone-pro/v3/`. This assessment covers the standalone HTML and the expressly restricted buyer environment, not checkout, fulfillment or buyer acceptance. No site deployment, main merge, database or pricing change is included.

**Decision: 販売可能 0 / 条件付き販売可能 9 / 販売不可 1.** The nine conditional products are eligible only when distributing their matching HTML with `RELEASE-GUIDE.md`, limiting the supported environment to the verified macOS/Chrome setup, and explaining local storage, backups, format compatibility and untested environments. This is a bounded technical judgment; it is not a claim of universal browser or assistive-technology compatibility.

| Product | Decision | Reason |
| --- | --- | --- |
| breakeven | 条件付き販売可能 | Free outputs and contribution/break-even calculations matched representative cases; storage and browser flows passed within the documented environment. |
| channel | 条件付き販売可能 | Both payouts/profits and 100%/110% fee boundaries checked; above-100% loss remains negative. |
| discount | 条件付き販売可能 | Corrected fixed-fee omission in displayed selling fee; free parity and safe-discount boundary checks passed. |
| inventory | 条件付き販売可能 | Free result fields verified; stock duration is explicitly distinguished from turnover rate. |
| investment | 販売不可 | One parallel-run `file://` reload check saw an empty list immediately after reload, while the same record appeared in a second copy and after browser restart. Subsequent standalone 10-product test, five separate investment profiles and 50 additional reloads did not reproduce it; the cause remains unknown. Resolve or convincingly identify the test/environment cause before sale. |
| market | 条件付き販売可能 | Cost, margin, contribution, break-even and final-profit comparison verified. |
| payout | 条件付き販売可能 | Profit display and combined-fee boundary/loss checks passed. |
| profit | 条件付き販売可能 | Corrected cost ratio to include total cost as in free output, made loss explicit, and tested UTF-8 rejection, duplicate detection, CSV compatibility and whole-yen ceiling. Old versions do not read current v2 CSV. |
| service | 条件付き販売可能 | All three free output rows and representative standalone storage flows verified. |
| target | 条件付き販売可能 | Zero-profit reason and 4-week approximation explanation verified. |

The detailed Claude matrix is `AUDIT-MATRIX.md`: **19/19 supplied classification groups addressed; 0 of those groups remain open** (9 common groups S1–S9 plus 10 product-specific groups). The prior claim that S5 was not supplied was incorrect: S5 covers warnings or errors for combined channel/payout fees above 100%. The original Claude test archive was not supplied. The separate, newly observed investment reload anomaly remains open. Source output comparison found no missing important free result; investment and target intentionally differ from free when both the required amount and per-sale profit are zero: PRO returns zero sales instead of null.

### Fixes and evidence after base

- Reproduced and corrected fixed-fee omission in discount, wrong free-equivalent cost ratio and loss wording in profit, and investment's monthly target/surplus units. Increased visible button targets to at least 44×44 CSS pixels in the tested mobile viewport.
- The independent tester found silent omission of quarantined data in ordinary JSON backups, invalid backup output for wholly corrupt storage, an unclear profit delete confirmation, stale corruption messages after successful restore, inaccurate quarantine positions after writes, and unclassified storage getter failures. Reproduction tests were added before fixes. JSON v2 now retains quarantined raw records; current restores accept legacy v1 and current v2, validate raw elements and counts before replacing data, preserve the stale-snapshot guard, and reject over-20MB backups. Wholly corrupt data requires raw export plus an earlier valid backup. Old versions reject v2; the external raw export is not itself necessarily restorable.
- `node --test standalone-pro/v3/tests/calculators-check.cjs standalone-pro/v3/tests/claude-audit-check.cjs standalone-pro/v3/tests/free-parity-check.cjs standalone-pro/v3/tests/profit-claude-check.cjs`: **394/394**, after the final HTML change. `pnpm test`: **102/102**; `pnpm lint`, `pnpm exec tsc -b` and `pnpm exec vite build --outDir /private/tmp/tool-shelf-pro-release-build`: pass.
- Independent tester reran 394/394 and checked all ten for the three final storage findings, duplicate-ID profit, and repeated v2 restore without duplication; no release-blocking data loss was observed in that bounded verification. The tester did not independently run the browser or build tests.
- Chromium and Playwright WebKit `tests/browser-check.cjs`: 20/20 desktop/mobile emulations each. Chromium `audit-browser-check.cjs`, `quarantine-browser-check.cjs`, `touch-target-check.cjs`, `stress-check.cjs`, `capacity-check.cjs`, and the serial `keyboard-check.cjs`: each 10/10. The first parallel keyboard attempt timed out once opening a file chooser; a later isolated run passed. PDFs were generated/extracted but no physical printer was used.
- `tests/file-storage-check.cjs`: Chrome 154.0.8037.93 on macOS 27.0.1 arm64, direct `file://` and simulated offline, passed 10/10 on an isolated rerun for save, reload, same-product copy sharing and profile restart. One earlier parallel 10-product run was 9/10 due to the investment anomaly above; its copy and restart checks succeeded. Targeted investment runs: 5/5 separate profiles and 50 additional reloads passed, without identifying the original cause.
- Playwright WebKit 26.5 `file://` with `QA_OFFLINE=0` passed 10/10 for save, reload, same-product copy sharing and restart. With Playwright `setOffline(true)`, all ten could not be opened due to an internal WebKit error; the same error occurred for a minimal unrelated static HTML. This is not an offline Safari pass or proof of a product bug.

### Release requirements and follow-up

- Before selling the nine conditional products: distribute the corresponding self-contained HTML and `RELEASE-GUIDE.md`; clearly state the tested Chrome/macOS version, local storage and backup practice, shared storage between copies, CSV/JSON format restrictions, and untested environments. Keep investment off sale until the reload anomaly is resolved or its non-product cause is established. Obtain the original Claude tests if a claim of complete coverage of the original audit is required.
- Checkout, paid delivery and post-purchase support remain separate release preparations; none has been tested or enabled here. Actual mobile devices, Safari/other browsers, VoiceOver/TalkBack, Excel, physical printing, concurrent-tab atomicity and buyer acceptance remain unverified. These can be pursued after the conditional launch within the stated environment; absence of buyer feedback alone was not used as a hold reason.
- Run browser scripts with a local server on port 18763 and the environment variables documented above. `file-storage-check.cjs` uses disposable profiles; `QA_OFFLINE=0` is needed for the online WebKit check, and `QA_IDS=investment QA_RELOADS=50` reproduces the targeted reload loop.

## Reload investigation and corrected S5 — 2026-11-01 (supersedes previous assessment)

Baseline `2e072801e090f6d8c6b62d8fa8becf6276b2170f`. **Sale decision: 0 unrestricted / 9 conditional / 1 unavailable.** The nine conditional products are breakeven, channel, discount, inventory, market, payout, profit, service and target, under the environment and backup restrictions in `RELEASE-GUIDE.md`. Investment remains unavailable: the anomaly was reproduced and its exact cause and customer impact are not established. The conditional assessments rely on the previously verified bounded flows and are not a guarantee for untested browsers or devices. The minimal reproduction uses generic local storage, so a wider real-use impact has not been excluded.

- S5 was wrongly described as unspecified. The user supplied its actual content: channel/payout must warn or error when combined fees exceed 100%. There are **19 addressed classification groups, 0 unaddressed groups**: nine common S1–S9 plus ten product-specific groups, not 19 individual test cases. The separate reload issue remains open. The original Claude test archive remains unavailable.
- Six new independent expected-value cases in `claude-audit-check.cjs` and six headless Chrome `file://` cases in `s5-browser-check.cjs` cover channel A, channel B and payout at 100% and 110%. With sale 1,000 yen, cost 100 yen and shipping 50 yen, 100% yields payout 0 and profit -150; 110% yields payout -100 and profit -250. All six browser cases showed the warning and the unaltered loss. No product code was changed.
- During a 6-worker, maximum 150-reload diagnostic with instrumentation disabled, 4 workers saw the same page return zero storage keys and zero rows after reload; the same file in a new tab and the same profile after restart still returned the saved record. A product-free static control reproduced the same symptom for all four file:// workers (online and offline), while both HTTP workers completed 300 reloads. This establishes that product code is not necessary for the observed symptom, not why it happens or whether a buyer can encounter it. See `INVESTMENT-RELOAD-DIAGNOSIS.md` for observations, bounds and commands. The failing conditions are not counted as passes.
- Updated `file-storage-check.cjs` to capture storage and DOM immediately on failure without silently retrying. A separate run of its ten-product Chrome file:// checks passed 10/10, but this does not resolve the reproduced anomaly. `node --test` calculator, Claude, free-parity and profit suites: **400/400**; `pnpm test`: **102/102**; `pnpm lint`, TypeScript build and Vite build: pass. An independent tester examined the reproduction and source, and independently ran 376 source tests; their assessment also keeps investment unavailable. Product HTML was not changed.
- Before selling the nine conditional products, provide the matching standalone HTML and release guide; restrict environment claims to those actually tested, explain backups and limitations, and prepare checkout/delivery separately. Before selling investment, identify and address the reload/storage safety issue, including safe behavior if a seemingly empty storage area is written to. Physical devices, real Safari, VoiceOver, TalkBack, Excel and a physical printer remain unverified; paid release and deployment were not performed.
