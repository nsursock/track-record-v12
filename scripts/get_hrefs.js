import { chromium } from 'playwright';

const base = 'https://trackrecord.ink/posts';
// const base = 'http://localhost:3000/posts';
const totalPages = 5;

const browser = await chromium.launch();
const page = await browser.newPage();

for (let i = 1; i <= totalPages; i++) {
  const url = i === 1 ? base : `${base}/page/${i}/`;
  console.log(`Fetching ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle' });

  const hrefs = await page.$$eval('article a', links =>
    links.map(link => link.href)
  );

  new Set(hrefs).forEach(href => console.log(href));
}

await browser.close();
