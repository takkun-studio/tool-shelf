import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const base = 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
try {
  await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
  await page.locator('.shelf-tool-row').first().waitFor();
  assert.equal(await page.locator('.shelf-tool-row').count(), 40, 'all tools should be visible to guests');
  assert.match(await page.locator('body').innerText(), /全40ツール、会員登録なしでも通常版は無料/);

  await page.goto(base + '/tools/discount', { waitUntil: 'domcontentloaded' });
  for (const [key, value] of Object.entries({
    listPrice: 1000, discountRate: 12.5, cost: 400, shipping: 100, feeRate: 8.8, fixedFee: 0, other: 0,
  })) await page.locator('#field-' + key).fill(String(value));
  await page.locator('.results').getByText('セール後利益').waitFor();
  assert.equal(await page.locator('.error').count(), 0, 'decimal rates must be accepted');

  await page.goto(base + '/tools/tax-inclusive-exclusive', { waitUntil: 'domcontentloaded' });
  await page.locator('#field-amount').fill('1100');
  await page.locator('#field-taxRate').fill('10');
  await page.locator('#field-direction').selectOption('1');
  await page.locator('#field-rounding').selectOption('0');
  assert.match(await page.locator('.results').innerText(), /1,000 円/);

  await page.goto(base + '/tools/preorder-stock', { waitUntil: 'domcontentloaded' });
  await page.locator('#field-reservations').fill('100');
  await page.locator('#field-defectRate').fill('10');
  await page.locator('#field-bufferRate').fill('5');
  assert.match(await page.locator('.results').innerText(), /117 個/);

  for (const viewport of [390, 1440]) {
    await page.setViewportSize({ width: viewport, height: 900 });
    for (const route of ['/', '/pricing', '/tools/discount', '/tools/tax-inclusive-exclusive', '/tools/preorder-stock']) {
      await page.goto(base + route, { waitUntil: 'domcontentloaded' });
      const width = await page.evaluate(() => document.documentElement.scrollWidth);
      assert.ok(width <= viewport + 1, route + ' overflows at ' + viewport + 'px: ' + width);
    }
  }
  console.log('PASS: 40 tools, decimal inputs, choice inputs, corrected preorder formula, PC/mobile overflow');
} finally {
  await browser.close();
}
