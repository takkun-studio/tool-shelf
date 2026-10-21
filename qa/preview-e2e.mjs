import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const base = 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
try {
  await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
  await page.locator('.shelf-tool-row').first().waitFor();
  assert.equal(await page.locator('.shelf-tool-row').count(), 10, 'only public tools should be visible');
  assert.match(await page.locator('body').innerText(), /全10ツール、会員登録なしでも通常版は無料/);
  assert.doesNotMatch(await page.locator('body').innerText(), /税金よけとく額計算|実質時給を見て泣く計算機|今日あと何個売れば帰れる/);

  await page.goto(base + '/tools/discount', { waitUntil: 'domcontentloaded' });
  for (const [key, value] of Object.entries({
    listPrice: 1000, discountRate: 12.5, cost: 400, shipping: 100, feeRate: 8.8, fixedFee: 0, other: 0,
  })) await page.locator('#field-' + key).fill(String(value));
  await page.locator('.results').getByText('セール後利益').waitFor();
  assert.equal(await page.locator('.error').count(), 0, 'decimal rates must be accepted');

  for (const hiddenRoute of ['/tools/tax-reserve', '/tools/preorder-stock', '/tools/real-hourly-wage']) {
    await page.goto(base + hiddenRoute, { waitUntil: 'domcontentloaded' });
    assert.match(await page.locator('body').innerText(), /ページが見つかりません/, hiddenRoute + ' must remain hidden');
  }

  for (const viewport of [390, 1440]) {
    await page.setViewportSize({ width: viewport, height: 900 });
    for (const route of ['/', '/pricing', '/tools/discount']) {
      await page.goto(base + route, { waitUntil: 'domcontentloaded' });
      const width = await page.evaluate(() => document.documentElement.scrollWidth);
      assert.ok(width <= viewport + 1, route + ' overflows at ' + viewport + 'px: ' + width);
    }
  }
  console.log('PASS: 10 public tools, 30 hidden additions, decimal inputs, PC/mobile overflow');
} finally {
  await browser.close();
}
