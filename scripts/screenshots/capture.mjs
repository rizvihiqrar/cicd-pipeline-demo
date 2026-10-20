// Refreshes the screenshots in docs/assets/.
//   cd scripts/screenshots && npm install && npx playwright install chromium && npm run capture
// Pass names to capture only some: npm run capture -- actions-run actions-run-dark
// The Actions run is a real public run on main; change RUN to point at a newer one.
// The Playwright report is built by a real local run of the integration tests (run from the repo root first):
//   npm ci && npm run test:integration
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const REPO = 'https://github.com/rizvihiqrar/cicd-pipeline-demo';
const RUN = 39320454369;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, 'docs/assets');
const REPORT = path.join(ROOT, 'playwright-report/index.html');
const RUN_URL = `${REPO}/actions/runs/${RUN}`;
const GRAPH = { x: 350, y: 270, width: 910, height: 385 };

const shots = [
  // The summary card and the five-job graph at the top of the run page.
  { name: 'actions-run', url: RUN_URL, scheme: 'light', wait: 'text=Deploy to Staging', scale: 2, clip: GRAPH },
  { name: 'actions-run-dark', url: RUN_URL, scheme: 'dark', wait: 'text=Deploy to Staging', scale: 2, clip: GRAPH },
  // The Artifacts table at the bottom of the same run page (from its heading to the end of the page).
  { name: 'actions-artifacts', url: RUN_URL, scheme: 'light', wait: 'text=Produced during runtime', scale: 2, below: 'Produced during runtime' },
  { name: 'actions-workflow-runs', url: `${REPO}/actions/workflows/ci-cd.yml?query=branch%3Amain`, scheme: 'light', wait: 'text=CI / CD Pipeline' },
  { name: 'playwright-report', url: pathToFileURL(REPORT).href, scheme: 'light', local: true, wait: 'text=Product API' },
];

const wanted = process.argv.slice(2);
const browser = await chromium.launch();
for (const s of shots) {
  if (wanted.length && !wanted.includes(s.name)) continue;
  if (s.local && !fs.existsSync(REPORT)) {
    console.warn(`skipped ${s.name}: run "npm run test:integration" in the repo root first`);
    continue;
  }
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: s.scheme, deviceScaleFactor: s.scale ?? 1 });
  const page = await context.newPage();
  await page.goto(s.url, { waitUntil: 'networkidle' });
  if (s.wait) await page.waitForSelector(s.wait, { timeout: 20_000 }).catch(() => {});
  let clip = s.clip;
  if (s.below) {
    // Clip from just above the card that holds this text, down to the end of the page.
    clip = await page.evaluate((text) => {
      const el = [...document.querySelectorAll('*')].find((e) => e.children.length === 0 && e.textContent.trim() === text);
      const top = Math.max(0, el.getBoundingClientRect().top + window.scrollY - 60);
      return { x: 350, y: top, width: 920, height: document.documentElement.scrollHeight - top - 40 };
    }, s.below);
  }
  const file = path.join(OUT, `${s.name}.png`);
  await page.screenshot({ path: file, fullPage: !s.local, ...(clip ? { clip } : {}) });
  console.log('saved', file);
  await context.close();
}
await browser.close();
