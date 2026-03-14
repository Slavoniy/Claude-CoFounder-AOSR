const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Taking screenshot of /login...');
  await page.goto('http://localhost:3000/login');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'login.png' });

  console.log('Taking screenshot of /register...');
  await page.goto('http://localhost:3000/register');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'register.png' });

  console.log('Logging in...');
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', 'admin@stroydocs.ru');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
  await page.waitForTimeout(2000);

  console.log('Taking screenshot of Dashboard...');
  await page.screenshot({ path: 'dashboard.png' });

  console.log('Taking screenshot of /projects...');
  await page.goto('http://localhost:3000/projects');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'projects.png' });

  console.log('Taking screenshot of Project...');
  await page.goto('http://localhost:3000/projects/00000000-0000-0000-0000-000000000001');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'project.png' });

  console.log('Taking screenshot of Contract...');
  await page.goto('http://localhost:3000/projects/00000000-0000-0000-0000-000000000001/contracts/00000000-0000-0000-0000-000000000010');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'contract.png' });

  console.log('Taking screenshot of Organizations...');
  await page.goto('http://localhost:3000/organizations');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'organizations.png' });

  await browser.close();
  console.log('Done!');
})();
