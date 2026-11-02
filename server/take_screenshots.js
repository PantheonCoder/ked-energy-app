const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const BRAVE_PATH = 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const executablePath = fs.existsSync(BRAVE_PATH) ? BRAVE_PATH : EDGE_PATH;

const ARTIFACT_DIR = 'C:\\Users\\Best Tech\\.gemini\\antigravity-ide\\brain\\fb94a07b-0f8b-48a5-9ce1-6571ec130537';

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function capture() {
  console.log('Launching browser with:', executablePath);
  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 420, height: 900 });

  console.log('Navigating to http://localhost:5173 ...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  await sleep(1000);

  // If on login, sign in
  const isLogin = await page.$('input[type="password"]');
  if (isLogin) {
    const signInBtn = await page.$('button[type="submit"]');
    if (signInBtn) {
      await signInBtn.click();
      await sleep(1500);
    }
  }

  // Navigate to Account / Settings
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const accountBtn = buttons.find(b => b.innerText.includes('Account') || b.innerText.includes('Settings'));
    if (accountBtn) accountBtn.click();
  });
  await sleep(1500);

  // Capture Account screen in Dark mode
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screen_account_dark.png') });
  console.log('Captured Account dark screen');

  // Toggle theme to daylight
  await page.evaluate(() => {
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) themeBtn.click();
  });
  await sleep(1200);

  // Capture Account screen in Light mode
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screen_account_light.png') });
  console.log('Captured Account light screen');

  // Toggle back to dark
  await page.evaluate(() => {
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) themeBtn.click();
  });
  await sleep(1000);

  // Navigate to Dashboard
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const dashBtn = buttons.find(b => b.innerText.includes('Usage') || b.innerText.includes('Dashboard'));
    if (dashBtn) dashBtn.click();
  });
  await sleep(1000);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screen_dashboard_dark.png') });
  console.log('Captured Dashboard dark screen');

  // Toggle theme to daylight on Dashboard
  await page.evaluate(() => {
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) themeBtn.click();
  });
  await sleep(1000);

  // Capture Dashboard screen in Light mode
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screen_dashboard_light.png') });
  console.log('Captured Dashboard light screen');

  // Navigate to Analytics in light mode
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.innerText.includes('Analytics'));
    if (btn) btn.click();
  });
  await sleep(1000);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screen_analytics_light.png') });
  console.log('Captured Analytics light screen');

  // Navigate to Invoices/Bills in light mode
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.innerText.includes('Bills') || b.innerText.includes('Invoices'));
    if (btn) btn.click();
  });
  await sleep(1000);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screen_invoices_light.png') });
  console.log('Captured Invoices light screen');

  // Toggle back to dark
  await page.evaluate(() => {
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) themeBtn.click();
  });
  await sleep(800);

  await browser.close();
  console.log('All screenshots captured successfully!');
}

capture().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});
