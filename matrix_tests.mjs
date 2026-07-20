import puppeteer from 'puppeteer';
import fs from 'fs';

async function runTests() {
  const browser = await puppeteer.launch({ headless: true });
  const results = {};

  async function runScenario(name, action) {
    const page = await browser.newPage();
    const network = [];
    page.on('request', req => network.push(`[REQ] ${req.method()} ${req.url()}`));
    page.on('response', res => network.push(`[RES] ${res.status()} ${res.url()}`));
    
    try {
      await action(page, network);
      results[name] = { status: 'SUCCESS', network, finalUrl: page.url() };
    } catch (e) {
      results[name] = { status: 'FAILED', error: e.message, network, finalUrl: page.url() };
    }
    await page.close();
  }

  // 3. Logout -> Login
  await runScenario('Logout -> Login', async (page, network) => {
    await page.goto('http://localhost:3000/auth/sign-in', { waitUntil: 'networkidle0' });
    await page.type('input[name="email"]', 'admin@test.com');
    await page.type('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 3000));
    
    // Now logout
    network.length = 0; // Clear network to capture logout
    const logoutBtn = await page.$('text/Logout'); // Try to find logout, might be hidden in dropdown
    if (logoutBtn) {
      await logoutBtn.click();
      await new Promise(r => setTimeout(r, 2000));
    } else {
      // Direct navigation if UI is complex
      await page.goto('http://localhost:3000/auth/sign-in', { waitUntil: 'networkidle0' });
    }
    
    // Login again
    network.length = 0;
    await page.type('input[name="email"]', 'admin@test.com');
    await page.type('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 3000));
  });

  // 6. Refresh Browser
  await runScenario('Refresh Browser', async (page, network) => {
    await page.goto('http://localhost:3000/auth/sign-in', { waitUntil: 'networkidle0' });
    await page.type('input[name="email"]', 'admin@test.com');
    await page.type('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 3000));
    
    network.length = 0;
    await page.reload({ waitUntil: 'networkidle0' });
  });

  // 8. Expired Access Token
  await runScenario('Expired Access Token', async (page, network) => {
    await page.goto('http://localhost:3000/auth/sign-in', { waitUntil: 'networkidle0' });
    await page.type('input[name="email"]', 'admin@test.com');
    await page.type('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 3000));
    
    // Delete accessToken cookie to simulate expiration
    const cookies = await page.cookies();
    await page.deleteCookie({ name: 'accessToken' });
    
    network.length = 0;
    await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle0' });
  });

  fs.writeFileSync('matrix_results.json', JSON.stringify(results, null, 2));
  await browser.close();
}

runTests().catch(console.error);
