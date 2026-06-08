const { chromium } = require('@playwright/test');
const { execSync } = require('child_process');

async function getOtp(email) {
  try {
    // Wait for the OTP to be generated
    await new Promise(r => setTimeout(r, 2000));
    
    const cmd = `docker compose exec postgres psql -U flowlinepro -d flowlinepro -t -c "SELECT value FROM \\"Verification\\" WHERE identifier='${email}' ORDER BY \\"createdAt\\" DESC LIMIT 1;"`;
    const output = execSync(cmd).toString().trim();
    return output;
  } catch (err) {
    console.error("Failed to get OTP:", err.message);
    return null;
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("Navigating to sign-in...");
  await page.goto('http://127.0.0.1:3000/en/sign-in');

  console.log("Entering email...");
  await page.fill('input[type="email"]', 'admin@example.com');
  await page.click('button[type="submit"]');

  console.log("Fetching OTP...");
  const otp = await getOtp('admin@example.com');
  console.log("Got OTP:", otp);

  if (!otp) {
    console.log("Exiting due to no OTP");
    await browser.close();
    return;
  }

  console.log("Entering OTP...");
  // The OTP is 6 digits in separate inputs
  for (let i = 0; i < 6; i++) {
    await page.type(`input:nth-child(${i + 1})`, otp[i]);
  }
  
  await page.click('button:has-text("Verify")');

  console.log("Waiting for dashboard...");
  await page.waitForURL('**/dashboard');
  console.log("Successfully logged in!");

  const tabsToTest = [
    '/en/crm/leads',
    '/en/crm/contacts',
    '/en/crm/accounts',
    '/en/crm/opportunities',
    '/en/crm/products',
    '/en/admin/users',
  ];

  for (const tab of tabsToTest) {
    console.log(`\nTesting tab: ${tab}`);
    const start = Date.now();
    await page.goto(`http://127.0.0.1:3000${tab}`);
    
    try {
      // Wait for the main content to settle (no loading skeletons)
      await page.waitForLoadState('networkidle');
      const time = Date.now() - start;
      console.log(`✅ Loaded ${tab} in ${time}ms`);
      
      // Check for errors on the page
      const errorText = await page.evaluate(() => {
        const errorEl = document.querySelector('.text-destructive, [data-error], h1:has-text("Something went wrong")');
        return errorEl ? errorEl.textContent : null;
      });

      if (errorText) {
        console.log(`❌ ERROR on ${tab}: ${errorText}`);
      }

    } catch (err) {
      console.log(`❌ FAILED to load ${tab}: ${err.message}`);
    }
  }

  await browser.close();
})();
