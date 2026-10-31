const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  console.log('🎬 Starting SharePlate Demo Video Recording...');
  const videoDir = path.resolve(__dirname, 'videos');
  if (!fs.existsSync(videoDir)) {
    fs.mkdirSync(videoDir, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--use-gl=swiftshader', '--no-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: videoDir,
      size: { width: 1280, height: 720 }
    }
  });

  const page = await context.newPage();

  // Collect console errors to verify 0 errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('Browser Error:', msg.text());
      errors.push(msg.text());
    }
  });

  try {
    const baseUrl = 'http://localhost:3000';
    console.log(`📍 Navigating to ${baseUrl}...`);
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await sleep(2500); // Let 3D animations load

    console.log('📍 Scene 1: Landing Page Hero & 3D Background');
    await page.mouse.move(640, 360);
    await sleep(1500);

    // Smooth scroll down to 'How It Works'
    console.log('📍 Scrolling to How It Works...');
    await page.evaluate(() => {
      window.scrollBy({ top: 600, behavior: 'smooth' });
    });
    await sleep(2000);

    // Scroll to Featured Surplus
    console.log('📍 Scrolling to Featured Surplus...');
    await page.evaluate(() => {
      window.scrollBy({ top: 600, behavior: 'smooth' });
    });
    await sleep(2000);

    // Test "View Details" button on first card!
    console.log('📍 Testing "View Details" modal...');
    const viewDetailsBtn = page.locator('button:has-text("View Details")').first();
    if (await viewDetailsBtn.isVisible()) {
      await viewDetailsBtn.hover();
      await sleep(600);
      await viewDetailsBtn.click();
      console.log('✅ Clicked "View Details" button!');
      await sleep(2500); // Allow modal to show

      // Close the modal
      const closeBtn = page.locator('button:has-text("Close")').last();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
        console.log('✅ Closed Details modal');
        await sleep(1000);
      }
    }

    // Scroll down to 3D interactive viewer
    console.log('📍 Scrolling to 3D Interactive Food Inspector...');
    await page.evaluate(() => {
      window.scrollBy({ top: 750, behavior: 'smooth' });
    });
    await sleep(2000);

    // Interact with 3D model (drag to rotate)
    const canvas = page.locator('canvas').last();
    if (await canvas.isVisible()) {
      const box = await canvas.boundingBox();
      if (box) {
        const cx = box.x + box.width / 2;
        const cy = box.y + box.height / 2;
        await page.mouse.move(cx, cy);
        await page.mouse.down();
        await page.mouse.move(cx + 120, cy - 30, { steps: 15 });
        await page.mouse.up();
        await sleep(1500);
      }
    }

    // Scene 2: Marketplace / Explore Food
    console.log('📍 Scene 2: Exploring Marketplace (/explore)...');
    await page.goto(`${baseUrl}/explore`, { waitUntil: 'networkidle' });
    await sleep(2000);

    // Click Category Filter
    console.log('📍 Filtering by Bakery category...');
    const bakeryFilter = page.locator('button:has-text("Bakery")').first();
    if (await bakeryFilter.isVisible()) {
      await bakeryFilter.click();
      await sleep(1500);
    }

    // Click "View Details" on the filtered listing
    console.log('📍 Clicking "View Details" on Bakery listing...');
    const exploreDetailsBtn = page.locator('button:has-text("View Details")').first();
    if (await exploreDetailsBtn.isVisible()) {
      await exploreDetailsBtn.click();
      await sleep(2000);

      // Click "Request This Food" inside the details modal
      console.log('📍 Clicking "Request This Food" inside details modal...');
      const requestFoodBtn = page.locator('button:has-text("Request This Food")');
      if (await requestFoodBtn.isVisible()) {
        await requestFoodBtn.click();
        await sleep(2000);

        // Close request modal
        const reqCloseBtn = page.locator('button:has-text("Cancel")');
        if (await reqCloseBtn.isVisible()) {
          await reqCloseBtn.click();
          await sleep(1000);
        }
      }
    }

    // Reset filter
    const allFilter = page.locator('button:has-text("All")').first();
    if (await allFilter.isVisible()) {
      await allFilter.click();
      await sleep(1500);
    }

    // Scene 3: Persona Switch to Donor & Dashboard
    console.log('📍 Scene 3: Switching to Donor Persona...');
    const donorSwitch = page.locator('button:has-text("Donor: GreenLeaf Bistro")');
    if (await donorSwitch.isVisible()) {
      await donorSwitch.click();
      await sleep(1500);
    }

    console.log('📍 Navigating to Donor Dashboard (/donor)...');
    await page.goto(`${baseUrl}/donor`, { waitUntil: 'networkidle' });
    await sleep(2500);

    // Scene 4: Persona Switch to Recipient & Verification Pass
    console.log('📍 Scene 4: Switching to Recipient Persona...');
    const recipientSwitch = page.locator('button:has-text("Recipient: Hope Haven NGO")');
    if (await recipientSwitch.isVisible()) {
      await recipientSwitch.click();
      await sleep(1500);
    }

    console.log('📍 Navigating to Recipient Dashboard (/recipient)...');
    await page.goto(`${baseUrl}/recipient`, { waitUntil: 'networkidle' });
    await sleep(2500);

    // Scroll to active passes
    await page.evaluate(() => {
      window.scrollBy({ top: 300, behavior: 'smooth' });
    });
    await sleep(2000);

    // Scene 5: Impact Ledger
    console.log('📍 Scene 5: Viewing Impact Ledger (/impact)...');
    await page.goto(`${baseUrl}/impact`, { waitUntil: 'networkidle' });
    await sleep(2500);

    // Smooth scroll down impact stats
    await page.evaluate(() => {
      window.scrollBy({ top: 500, behavior: 'smooth' });
    });
    await sleep(2000);

    console.log('🎉 Demo walkthrough completed successfully!');
  } catch (err) {
    console.error('Recording Error:', err);
  } finally {
    const video = page.video();
    await page.close();
    await context.close();
    await browser.close();

    if (video) {
      const videoPath = await video.path();
      console.log(`📹 Raw video saved at: ${videoPath}`);
      const finalMp4 = path.resolve(__dirname, 'SharePlate_Demo.mp4');
      const finalWebm = path.resolve(__dirname, 'SharePlate_Demo.webm');

      // Copy webm
      fs.copyFileSync(videoPath, finalWebm);
      console.log(`✅ Demo WebM saved: ${finalWebm}`);

      // Convert to MP4 with ffmpeg for universal compatibility
      try {
        console.log('🔄 Converting to universal MP4 format with ffmpeg...');
        execSync(`ffmpeg -y -i "${videoPath}" -c:v libx264 -pix_fmt yuv420p -r 30 "${finalMp4}"`, {
          stdio: 'inherit'
        });
        console.log(`🎉 Demo MP4 successfully generated at: ${finalMp4}`);
      } catch (ffErr) {
        console.log('Note: ffmpeg mp4 conversion note, webm is ready.');
      }
    }
  }
})();
