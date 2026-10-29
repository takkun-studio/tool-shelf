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
