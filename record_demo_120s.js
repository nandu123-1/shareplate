const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Smooth cursor gliding with quadratic ease-in-out
async function smoothMove(page, startX, startY, endX, endY, steps = 25, stepDelay = 16) {
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const curX = startX + (endX - startX) * ease;
    const curY = startY + (endY - startY) * ease;
    await page.mouse.move(curX, curY);
    await sleep(stepDelay);
  }
}

// Inject a visible virtual cursor SVG
async function injectVirtualCursor(page) {
  await page.evaluate(() => {
    if (document.getElementById('virtual-cursor')) return;
    const cursor = document.createElement('div');
    cursor.id = 'virtual-cursor';
    cursor.innerHTML = `
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style="filter: drop-shadow(0 3px 6px rgba(0,0,0,0.85));">
        <path d="M5.65 12.37H5.46L5.32 12.5L0.5 16.88V1.2L11.78 12.37H5.65Z" fill="#10B981" stroke="#FFFFFF" stroke-width="1.8"/>
        <circle cx="1" cy="1" r="2.5" fill="#34D399" />
      </svg>
    `;
    cursor.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 28px;
      height: 28px;
      z-index: 9999999;
      pointer-events: none;
      transform: translate(640px, 360px);
      transition: transform 0.04s linear;
    `;
    document.body.appendChild(cursor);

    window.addEventListener('mousemove', e => {
      cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    }, { passive: true });

    window.addEventListener('mousedown', () => {
      cursor.style.transform += ' scale(0.82)';
    }, { passive: true });

    window.addEventListener('mouseup', () => {
      cursor.style.transform = cursor.style.transform.replace(' scale(0.82)', '');
    }, { passive: true });
  });
}

(async () => {
  console.log('🎬 Starting SharePlate 120-Second Smooth 30fps Demo Video Recording...');
  const startTime = Date.now();
  const targetDurationMs = 120000; // 120 seconds target
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

  try {
    const baseUrl = 'http://localhost:3000';
    console.log('[0s] Navigating to Landing Page...');
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await injectVirtualCursor(page);
    await sleep(2500);

    // ==========================================
    // SCENE 1: HERO & SIMREADY 3D AMBIENCE (0s - 15s)
    // ==========================================
    console.log('[3s] Scene 1: Hero & SimReady floating assets...');
    await smoothMove(page, 640, 360, 300, 260, 25);
    await sleep(2000);

    await smoothMove(page, 300, 260, 220, 340, 25);
    await sleep(2000);

    await smoothMove(page, 220, 340, 160, 480, 25);
    await sleep(2000);
    await smoothMove(page, 160, 480, 330, 480, 25);
    await sleep(2500);

    // ==========================================
    // SCENE 2: INTERACTIVE 3D FOOD INSPECTOR (15s - 35s)
    // ==========================================
    console.log('[15s] Scene 2: 3D Food Inspector...');
    await smoothMove(page, 330, 480, 950, 220, 30);
    await sleep(1500);

    // Switch between 3D food items
    const modelButtons = [
      { name: 'Sourdough', x: 880, y: 560 },
      { name: 'Produce', x: 940, y: 560 },
      { name: 'Yogurt', x: 1000, y: 560 },
      { name: 'Bento', x: 1070, y: 560 }
    ];

    for (const mb of modelButtons) {
      await smoothMove(page, mb.x - 25, mb.y, mb.x, mb.y, 15);
      await page.mouse.down();
      await sleep(80);
      await page.mouse.up();
      await sleep(1800);
    }

    // 360 Orbit drag
    console.log('[25s] Dragging to orbit 3D model...');
    await smoothMove(page, 1070, 560, 950, 380, 20);
    await page.mouse.down();
    await smoothMove(page, 950, 380, 830, 370, 25, 20);
    await smoothMove(page, 830, 370, 980, 390, 25, 20);
    await page.mouse.up();
    await sleep(2000);

    // Hover metrics
    await smoothMove(page, 980, 390, 830, 515, 20);
    await sleep(1200);
    await smoothMove(page, 830, 515, 950, 515, 20);
    await sleep(1200);
    await smoothMove(page, 950, 515, 1070, 515, 20);
    await sleep(1500);

    // ==========================================
    // SCENE 3: HOW IT WORKS PROTOCOL (35s - 52s)
    // ==========================================
    console.log('[35s] Scene 3: How SharePlate Works (Dark Obsidian Cards)...');
    await page.evaluate(() => window.scrollBy({ top: 680, behavior: 'smooth' }));
    await sleep(2500);

    // Step 01
    await smoothMove(page, 1070, 515, 280, 360, 25);
    await sleep(2500);

    // Step 02
    await smoothMove(page, 280, 360, 640, 360, 25);
    await sleep(2500);

    // Step 03
    await smoothMove(page, 640, 360, 1000, 360, 25);
    await sleep(3000);

    // ==========================================
    // SCENE 4: FEATURED SURPLUS & VIEW DETAILS (52s - 74s)
    // ==========================================
    console.log('[52s] Scene 4: Featured Surplus...');
    await page.evaluate(() => window.scrollBy({ top: 620, behavior: 'smooth' }));
    await sleep(2500);

    await smoothMove(page, 1000, 360, 280, 320, 25);
    await sleep(1500);

    // Click "View Details"
    console.log('[57s] Clicking View Details button...');
    const viewDetailsBtn = page.locator('button:has-text("View Details")').first();
    const box = await viewDetailsBtn.boundingBox();
    if (box) {
      await smoothMove(page, 280, 320, box.x + box.width / 2, box.y + box.height / 2, 20);
      await sleep(400);
      await page.mouse.down();
      await sleep(80);
      await page.mouse.up();
      await sleep(2500);
    }

    // Modal Tour
    console.log('[61s] Touring modal contents...');
    await smoothMove(page, 640, 360, 520, 320, 20);
    await sleep(1500);
    await smoothMove(page, 520, 320, 640, 380, 20);
    await sleep(1500);
    await smoothMove(page, 640, 380, 520, 440, 20);
    await sleep(1500);
    await smoothMove(page, 520, 440, 640, 490, 20);
    await sleep(1800);
    await smoothMove(page, 640, 490, 640, 560, 20);
    await sleep(1800);

    // Close modal via top-right close button or escape key
    console.log('[69s] Closing details modal...');
    const closeDialogBtn = page.locator('button[aria-label="Close dialog"]').first();
    const cdbBox = await closeDialogBtn.boundingBox();
    if (cdbBox) {
      await smoothMove(page, 640, 560, cdbBox.x + cdbBox.width / 2, cdbBox.y + cdbBox.height / 2, 20);
      await page.mouse.down();
      await sleep(80);
      await page.mouse.up();
      await sleep(1500);
    } else {
      await page.keyboard.press('Escape');
      await sleep(1500);
    }

    // ==========================================
    // SCENE 5: MARKETPLACE CATALOGUE & FILTERS (74s - 92s)
    // ==========================================
    console.log('[74s] Scene 5: Exploring Marketplace (/explore)...');
    await smoothMove(page, 640, 360, 530, 35, 25);
    await page.goto(`${baseUrl}/explore`, { waitUntil: 'networkidle' });
    await injectVirtualCursor(page);
    await sleep(2500);

    // Bakery filter
    console.log('[80s] Filtering by Bakery...');
    const bakeryBtn = page.locator('button:has-text("Bakery")').first();
    const bBox = await bakeryBtn.boundingBox();
    if (bBox) {
      await smoothMove(page, 530, 35, bBox.x + bBox.width / 2, bBox.y + bBox.height / 2, 20);
      await page.mouse.down();
      await sleep(80);
      await page.mouse.up();
      await sleep(2500);
    }

    // View Details on Bakery
    console.log('[84s] View Details on Bakery item...');
    const bDetailsBtn = page.locator('button:has-text("View Details")').first();
    const bdBox = await bDetailsBtn.boundingBox();
    if (bdBox) {
      await smoothMove(page, bBox ? bBox.x : 500, bBox ? bBox.y : 200, bdBox.x + bdBox.width / 2, bdBox.y + bdBox.height / 2, 20);
      await page.mouse.down();
      await sleep(80);
      await page.mouse.up();
      await sleep(2000);
    }

    // Click Request Food
    console.log('[88s] Requesting food from details modal...');
    const reqFoodBtn = page.locator('button:has-text("Request This Food")');
    if (await reqFoodBtn.isVisible()) {
      const rBox = await reqFoodBtn.boundingBox();
      if (rBox) {
        await smoothMove(page, bdBox ? bdBox.x : 500, bdBox ? bdBox.y : 500, rBox.x + rBox.width / 2, rBox.y + rBox.height / 2, 20);
        await page.mouse.down();
        await sleep(80);
        await page.mouse.up();
        await sleep(2000);
      }
    }
    await page.keyboard.press('Escape');
    await sleep(1500);

    // ==========================================
    // SCENE 6: DONOR EXPERIENCE (92s - 105s)
    // ==========================================
    console.log('[92s] Scene 6: Switching to Donor Persona in Demo Bar...');
    const donorDemoBtn = page.locator('button:has-text("Donor (Restaurant)")');
    const dBox = await donorDemoBtn.boundingBox();
    if (dBox) {
      await smoothMove(page, 640, 360, dBox.x + dBox.width / 2, dBox.y + dBox.height / 2, 25);
      await page.mouse.down();
      await sleep(80);
      await page.mouse.up();
      await sleep(2000);
    }

    console.log('[96s] Visiting Donor Dashboard...');
    await page.goto(`${baseUrl}/donor`, { waitUntil: 'networkidle' });
    await injectVirtualCursor(page);
    await sleep(2500);

    await smoothMove(page, 400, 30, 250, 160, 20);
    await sleep(1500);
    await smoothMove(page, 250, 160, 550, 160, 20);
    await sleep(1500);

    await page.evaluate(() => window.scrollBy({ top: 380, behavior: 'smooth' }));
    await sleep(2000);
    await smoothMove(page, 550, 160, 400, 360, 20);
    await sleep(2000);

    // ==========================================
    // SCENE 7: RECIPIENT DASHBOARD & VERIFICATION PASS (105s - 116s)
    // ==========================================
    console.log('[105s] Scene 7: Switching to Recipient Persona...');
    const recDemoBtn = page.locator('button:has-text("Recipient (Food Bank)")');
    const rdBox = await recDemoBtn.boundingBox();
    if (rdBox) {
      await smoothMove(page, 400, 360, rdBox.x + rdBox.width / 2, rdBox.y + rdBox.height / 2, 25);
      await page.mouse.down();
      await sleep(80);
      await page.mouse.up();
      await sleep(2000);
    }

    console.log('[109s] Viewing 6-Digit Collection Pass on Recipient Dashboard...');
    await page.goto(`${baseUrl}/recipient`, { waitUntil: 'networkidle' });
    await injectVirtualCursor(page);
    await sleep(2500);

    // Point at 6-digit PIN Pass
    await smoothMove(page, 640, 200, 1080, 240, 25);
    await sleep(3500);

    // ==========================================
    // SCENE 8: IMPACT LEDGER & CALIBRATED FINALE (116s - 120s)
    // ==========================================
    console.log('[116s] Scene 8: Impact Ledger (/impact)...');
    await page.goto(`${baseUrl}/impact`, { waitUntil: 'networkidle' });
    await injectVirtualCursor(page);
    await sleep(2500);

    await smoothMove(page, 1080, 240, 250, 230, 20);
    await sleep(1500);
    await smoothMove(page, 250, 230, 520, 230, 20);
    await sleep(1500);
    await smoothMove(page, 520, 230, 780, 230, 20);
    await sleep(1500);
    await smoothMove(page, 780, 230, 1040, 230, 20);
    await sleep(2000);

    // Precision wait to hit exactly ~120s
    const elapsed = Date.now() - startTime;
    if (elapsed < targetDurationMs) {
      const waitRemaining = targetDurationMs - elapsed;
      console.log(`⏱️ Pacing final ${(waitRemaining / 1000).toFixed(1)}s to reach exactly 120s total...`);
      await page.evaluate(() => window.scrollBy({ top: 350, behavior: 'smooth' }));
      await smoothMove(page, 1040, 230, 640, 450, 30);
      await sleep(waitRemaining);
    }

    const totalSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`🎉 Demo walkthrough completed in ${totalSeconds} seconds!`);
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

      // Encode crystal-clear smooth 30fps MP4 with ffmpeg (trim to 120s if slightly over)
      try {
        console.log('🔄 Encoding smooth 30fps MP4 with ffmpeg...');
        execSync(
          `ffmpeg -y -i "${videoPath}" -t 120 -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -r 30 -b:v 2500k "${finalMp4}"`,
          { stdio: 'inherit' }
        );
        console.log(`🎉 Exactly 120-Second Demo MP4 successfully generated at: ${finalMp4}`);
      } catch (ffErr) {
        console.error('ffmpeg encode error:', ffErr);
      }
    }
  }
})();
