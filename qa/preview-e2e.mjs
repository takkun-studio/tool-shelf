import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const base = 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
try {
  await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
  await page.locator('.shelf-tool-row').first().waitFor();
  assert.equal(await page.locator('.shelf-tool-row').count(), 10, 'all tools should be visible to guests');
  assert.match(await page.locator('body').innerText(), /全10ツール、会員登録なしでも無料/);

  await page.goto(base + '/tools/discount', { waitUntil: 'domcontentloaded' });
  await page.locator('#field-listPrice').waitFor();
  assert.equal(await page.locator('.pro-note').count(), 0, 'guests must not see a paywall');
  assert.equal(await page.locator('.error').count(), 0, 'empty initial form should not show errors');
  for (const [key, value] of Object.entries({
    listPrice: 1000, discountRate: 20, cost: 400, shipping: 100, feeRate: 10, fixedFee: 0, other: 0,
  })) await page.locator('#field-' + key).fill(String(value));
  await page.locator('.results').getByText('セール後利益').waitFor();
  assert.match(await page.locator('.results').innerText(), /220 円/, 'guest calculator must return the expected profit');
  const downloadButton = page.getByRole('button', { name: /現在の試算をCSV出力/ });
  assert.equal(await downloadButton.isDisabled(), false, 'CSV must be free after calculation');
  const downloadPromise = page.waitForEvent('download');
  await downloadButton.click();
  const download = await downloadPromise;
  assert.match(download.suggestedFilename(), /\.csv$/, 'download should be a CSV file');

  for (const viewport of [390, 1440]) {
    await page.setViewportSize({ width: viewport, height: 900 });
    for (const route of ['/', '/pricing', '/tools/discount']) {
      await page.goto(base + route, { waitUntil: 'domcontentloaded' });
      await page.locator(route === '/' ? '.shelf-tool-list' : route === '/pricing' ? '.pricing dl' : '.inputs').waitFor();
      const width = await page.evaluate(() => document.documentElement.scrollWidth);
      assert.ok(width <= viewport + 1, route + ' overflows at ' + viewport + 'px: ' + width);
    }
  }
  console.log('PASS: guest tool catalog, paid-tool math unlocked, CSV download, no initial errors, PC/mobile overflow');
} finally {
  await browser.close();
}
