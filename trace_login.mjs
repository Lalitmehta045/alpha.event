import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const logs = [];
  const network = [];

  page.on('console', msg => {
    logs.push(`[Console] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });

  page.on('request', request => {
    network.push(`[Network] => REQUEST: ${request.method()} ${request.url()}`);
  });

  page.on('response', response => {
    network.push(`[Network] <= RESPONSE: ${response.status()} ${response.url()}`);
  });

  console.log("Navigating to /auth/sign-in...");
  await page.goto('http://localhost:3000/auth/sign-in', { waitUntil: 'networkidle0' });

  // Clear logs to only capture post-navigation
  logs.length = 0;
  network.length = 0;

  console.log("Typing credentials...");
  await page.type('input[name="email"]', 'admin@test.com');
  await page.type('input[name="password"]', 'password123');

  console.log("Submitting form...");
  await page.click('button[type="submit"]');

  // Wait 5 seconds
  await new Promise(r => setTimeout(r, 5000));

  console.log("\n--- BROWSER CONSOLE TIMELINE ---");
  console.log(logs.join('\n'));

  console.log("\n--- NETWORK TIMELINE ---");
  const filteredNetwork = network.filter(n => !n.includes('_next/static') && !n.includes('favicon.ico') && !n.includes('.png'));
  console.log(filteredNetwork.join('\n'));

  const currentUrl = page.url();
  console.log("\nFINAL URL:", currentUrl);

  await browser.close();
})();
