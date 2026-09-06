import { chromium } from 'playwright-core';
import fs from 'node:fs/promises';
import path from 'node:path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const appUrl = process.env.APP_URL ?? 'http://localhost:5180/';
const widths = [360, 390, 412];
const outputDir = path.resolve('work', 'mobile-checks');

await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: chromePath,
  headless: true,
});

try {
  for (const width of widths) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });

    await page.goto(appUrl, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(outputDir, `${width}.png`), fullPage: true });

    const layout = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
      goalCards: document.querySelectorAll('.goal-card').length,
      clippedButtons: Array.from(document.querySelectorAll('button')).filter((button) => {
        return button.scrollWidth > button.clientWidth || button.scrollHeight > button.clientHeight;
      }).length,
    }));

    if (layout.documentScrollWidth > width || layout.bodyScrollWidth > width) {
      throw new Error(`Horizontal overflow at ${width}px: ${JSON.stringify(layout)}`);
    }

    if (layout.clippedButtons > 0) {
      throw new Error(`Clipped button content at ${width}px: ${JSON.stringify(layout)}`);
    }

    console.log(`${width}px OK`, layout);
    await page.close();
  }

  const interactionPage = await browser.newPage({
    viewport: { width: 390, height: 900 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  await interactionPage.goto(appUrl, { waitUntil: 'networkidle' });
  await interactionPage.getByRole('button', { name: 'Отстают' }).click();
  const behindCards = await interactionPage.locator('.goal-card').count();

  if (behindCards < 1) {
    throw new Error('Behind filter did not show any delayed goals.');
  }

  await interactionPage.getByRole('button', { name: 'Все' }).click();
  const before = await interactionPage.locator('.progress-head strong').first().innerText();
  await interactionPage.locator('.goal-card').first().getByRole('button', { name: '+25%' }).click();
  const after = await interactionPage.locator('.progress-head strong').first().innerText();
  const afterValue = Number(after.replace('%', ''));

  if (before === after || Number.isNaN(afterValue) || afterValue > 100) {
    throw new Error(`Progress button failed: before=${before}, after=${after}`);
  }

  console.log('interactions OK', { behindCards, before, after });
  await interactionPage.close();
} finally {
  await browser.close();
}
