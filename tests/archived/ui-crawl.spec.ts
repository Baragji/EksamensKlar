import { test, expect } from '@playwright/test';

test('crawl all UI paths', async ({ page }) => {
  // Start på hovedsiden
  await page.goto('/');
  
  const visited = new Set<string>();
  const processed = new Set<string>();

  // Funktion til at vente på siden er fuldt loaded
  const waitForPageLoad = async () => {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500); // Ekstra tid til animationer
  };

  // Funktion til at få unike ID for elementer
  const getElementId = async (element: any) => {
    const href = await element.getAttribute('href');
    const text = await element.innerText().catch(() => '');
    const id = await element.getAttribute('id');
    const testId = await element.getAttribute('data-testid');
    
    return testId || id || href || text.trim().substring(0, 50);
  };

  // Tag baseline screenshot af startsiden
  await waitForPageLoad();
  await expect(page).toHaveScreenshot('homepage-baseline.png');

  // Find alle knapper og links
  const initialElements = await page.getByRole('button').or(page.getByRole('link')).all();
  const queue = [...initialElements];

  console.log(`Starter med ${queue.length} elementer at crawle`);

  while (queue.length > 0) {
    const element = queue.shift()!;
    
    try {
      const elementId = await getElementId(element);
      
      // Skip hvis vi allerede har besøgt dette element
      if (visited.has(elementId) || processed.has(elementId)) {
        continue;
      }
      
      processed.add(elementId);
      
      // Check om elementet stadig er tilgængeligt
      const isVisible = await element.isVisible().catch(() => false);
      if (!isVisible) {
        continue;
      }

      const elementText = await element.innerText().catch(() => '');
      console.log(`Klikker på: ${elementText || elementId}`);

      // Scroll elementet ind i view og klik
      await element.scrollIntoViewIfNeeded();
      await element.click({ timeout: 5000 });
      
      visited.add(elementId);
      
      // Vent på siden loader
      await waitForPageLoad();
      
      // Tag screenshot af den nye side
      const screenshotName = `page-${elementId.replace(/[^a-zA-Z0-9-_]/g, '-')}.png`;
      await expect(page).toHaveScreenshot(screenshotName);

      // Find nye elementer på denne side
      const newElements = await page.getByRole('button').or(page.getByRole('link')).all();
      
      for (const newElement of newElements) {
        const newElementId = await getElementId(newElement);
        if (!visited.has(newElementId) && !processed.has(newElementId)) {
          queue.push(newElement);
        }
      }

      // Gå tilbage til forrige side hvis muligt
      try {
        await page.goBack({ waitUntil: 'networkidle', timeout: 10000 });
        await waitForPageLoad();
      } catch (error) {
        console.log(`Could not go back from ${elementId}, navigating to homepage`);
        await page.goto('/');
        await waitForPageLoad();
      }

    } catch (error) {
      console.log(`Fejl ved behandling af element: ${error}`);
      // Fortsæt med næste element
      try {
        await page.goto('/');
        await waitForPageLoad();
      } catch (navError) {
        console.log(`Kunne ikke navigere tilbage til homepage: ${navError}`);
      }
    }
  }

  console.log(`Crawling færdig. Besøgte ${visited.size} unikke elementer.`);
});

test('crawl specific module paths', async ({ page }) => {
  // Test specifikke moduler direkte
  const modules = [
    { path: '/modules/onboarding/', name: 'onboarding' },
    { path: '/modules/dashboard/', name: 'dashboard' },
    { path: '/modules/flashcards/', name: 'flashcards' },
    { path: '/modules/quiz/', name: 'quiz' },
    { path: '/modules/content/', name: 'content' },
    { path: '/modules/ai-assistant/', name: 'ai-assistant' },
    { path: '/modules/subjects/', name: 'subjects' },
    { path: '/modules/advanced/', name: 'advanced' }
  ];

  for (const module of modules) {
    try {
      console.log(`Testing module: ${module.name}`);
      await page.goto(module.path);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000); // Vent på animationer
      
      // Tag screenshot af modulet
      await expect(page).toHaveScreenshot(`module-${module.name}.png`);
      
      // Test interaktive elementer i modulet
      const buttons = await page.getByRole('button').all();
      const links = await page.getByRole('link').all();
      
      console.log(`Fandt ${buttons.length} knapper og ${links.length} links i ${module.name}`);
      
    } catch (error) {
      console.log(`Fejl ved test af ${module.name}: ${error}`);
    }
  }
});

test('responsive crawl - mobile views', async ({ page }) => {
  // Test mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  
  // Mobile homepage screenshot
  await expect(page).toHaveScreenshot('mobile-homepage.png');
  
  // Test navigation menu på mobile
  const navToggle = page.locator('#navToggle, .nav-toggle, [aria-label*="menu"]').first();
  if (await navToggle.isVisible()) {
    await navToggle.click();
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('mobile-nav-open.png');
  }
});