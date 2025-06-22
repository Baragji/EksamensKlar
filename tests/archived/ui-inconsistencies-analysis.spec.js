import { test, expect } from '@playwright/test';

/**
 * Komprehensiv UI Inkonsistens Analyse for ExamKlar
 * 
 * Denne test suite identificerer og dokumenterer alle UI inkonsistenser
 * baseret på dybdegående manual analyse af hele applikationen.
 * 
 * VIGTIGE FUND:
 * ✅ Onboarding: Pænt og konsistent design, fungerer godt
 * ❌ Dashboard: Mange overlappende elementer og inkonsistent layout
 * ❌ Navigation: Inkonsistent mellem moduler 
 * ❌ Subjects: Manglende subject.html fil (404 fejl)
 * ❌ Data visning: Inkonsistente værdi formater (NaN, 0 vs "0")
 * ❌ Sprog mix: Engelsk og dansk blandet i interface
 */

test.describe('UI Inkonsistens Analyse - ExamKlar', () => {
  test.beforeEach(async ({ page }) => {
    // Start altid fra hovedsiden
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('01 - Hovedside: Layout og branding konsistens', async ({ page }) => {
    // Test hovedsidens konsistens
    await page.waitForSelector('h1');
    
    // Check branding konsistens
    const brandElements = page.locator('text=ExamKlar');
    expect(await brandElements.count()).toBeGreaterThan(0);
    
    // Check for sprog inkonsistenser
    const englishElements = page.locator('text=AI-Powered');
    const danishElements = page.locator('text=Læringsmoduler');
    
    expect(await englishElements.count()).toBeGreaterThan(0);
    expect(await danishElements.count()).toBeGreaterThan(0);
    
    // Visual snapshot af hovedside
    await expect(page).toHaveScreenshot('01-hovedside-layout.png');
  });

  test('02 - Onboarding Flow: Design konsistens (POSITIV)', async ({ page }) => {
    // Naviger til onboarding
    await page.click('text=Start Onboarding');
    await page.waitForURL('**/modules/onboarding/index.html');
    
    // Test onboarding step 1
    await expect(page.locator('h1')).toContainText('Velkommen til Din Eksklusive AI Tutor');
    await expect(page).toHaveScreenshot('02-onboarding-start.png');
    
    // Gå til step 1
    await page.click('text=Start Premium Oplevelse');
    await expect(page.locator('text=1 af 4')).toBeVisible();
    await expect(page).toHaveScreenshot('02-onboarding-step1.png');
    
    // Vælg matematik og fortsæt
    await page.click('text=Matematik');
    await page.click('text=Fortsæt');
    await expect(page.locator('text=2 af 4')).toBeVisible();
    await expect(page).toHaveScreenshot('02-onboarding-step2.png');
    
    // Fortsæt til step 3
    await page.click('text=Fortsæt (kan også gøres senere)');
    await expect(page.locator('text=3 af 4')).toBeVisible();
    await expect(page).toHaveScreenshot('02-onboarding-step3.png');
    
    // Vælg tidsramme og fortsæt
    await page.click('text=1 måned');
    await page.click('text=Fortsæt');
    await expect(page.locator('text=4 af 4')).toBeVisible();
    await expect(page).toHaveScreenshot('02-onboarding-step4.png');
    
    // Vent på afslutning
    await page.waitForTimeout(4000);
    await expect(page.locator('text=Din læringsplan er klar')).toBeVisible();
    await expect(page).toHaveScreenshot('02-onboarding-complete.png');
  });

  test('03 - Dashboard: ALVORLIGE Layout Problemer', async ({ page }) => {
    // Naviger til dashboard
    await page.goto('/modules/dashboard/index.html');
    await page.waitForLoadState('domcontentloaded');
    
    // PROBLEM 1: Overlappende indhold i toppen
    const exportDataElements = page.locator('text=Export Data');
    expect(await exportDataElements.count()).toBeGreaterThan(1); // Duplikeret
    
    // PROBLEM 2: Inkonsistent navigation
    const navigationElements = page.locator('nav[aria-label="Hovednavigation"]');
    expect(await navigationElements.count()).toBe(1);
    
    // PROBLEM 3: Data format problemer  
    const zeroValues = page.locator('text="0"');
    expect(await zeroValues.count()).toBeGreaterThan(5); // Mange nuller
    
    // Visual dokumentation af problemerne
    await expect(page).toHaveScreenshot('03-dashboard-layout-problems.png');
    
    // Test mobilskalering (kan afsløre flere problemer)
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page).toHaveScreenshot('03-dashboard-mobile-problems.png');
  });

  test('04 - Subjects: Kritisk 404 Fejl og Navigation', async ({ page }) => {
    // Naviger til subjects
    await page.goto('/modules/subjects/index.html');
    await page.waitForLoadState('domcontentloaded');
    
    // Test basic layout
    await expect(page.locator('h2:has-text("Opret Nyt Emne")')).toBeVisible();
    await expect(page.locator('h2:has-text("Dine Emner")')).toBeVisible();
    
    // KRITISK FEJL: Test 404 fejl ved åbning af emne
    const openSubjectLink = page.locator('text=Åbn Emne').first();
    if (await openSubjectLink.count() > 0) {
      await openSubjectLink.click();
      
      // Forvent 404 fejl
      await expect(page.locator('h1:has-text("Error response")')).toBeVisible();
      await expect(page.locator('text=404')).toBeVisible();
      await expect(page).toHaveScreenshot('04-subjects-404-error.png');
      
      // Gå tilbage
      await page.goBack();
    }
    
    // Test normal subjects layout
    await expect(page).toHaveScreenshot('04-subjects-layout.png');
  });

  test('05 - Quiz: Data Format Inkonsistenser', async ({ page }) => {
    // Naviger til quiz
    await page.goto('/modules/quiz/index.html');
    await page.waitForLoadState('domcontentloaded');
    
    // PROBLEM: NaN værdi i statistikker
    const nanElement = page.locator('text=NaN');
    expect(await nanElement.count()).toBeGreaterThan(0);
    
    // PROBLEM: Inkonsistent tal formatering
    const numberElements = page.locator('text="2"');
    expect(await numberElements.count()).toBeGreaterThan(0);
    
    // Test layout og funktionalitet
    await expect(page.locator('h1:has-text("Quiz Manager")')).toBeVisible();
    await expect(page.locator('text=Ingen quiz spørgsmål endnu')).toBeVisible();
    
    await expect(page).toHaveScreenshot('05-quiz-data-problems.png');
  });

  test('06 - Content Manager: Engelsk Interface Problem', async ({ page }) => {
    // Naviger til content manager
    await page.goto('/modules/content/index.html');
    await page.waitForLoadState('domcontentloaded');
    
    // PROBLEM: Blandet engelsk og dansk interface
    await expect(page.locator('text=Content Manager')).toBeVisible(); // Engelsk
    await expect(page.locator('text=Upload og organiser')).toBeVisible(); // Dansk
    
    // Test navigation konsistens
    const englishLinks = page.locator('text=Dashboard, text=Subjects');
    const danishContent = page.locator('text=Sværhedsgrad');
    
    await expect(page).toHaveScreenshot('06-content-language-mix.png');
  });

  test('07 - Flashcards: Layout og Data Konsistens', async ({ page }) => {
    // Naviger til flashcards
    await page.goto('/modules/flashcards/index.html');
    await page.waitForLoadState('domcontentloaded');
    
    // Test data konsistens
    await expect(page.locator('text="3"')).toBeVisible(); // Total cards
    await expect(page.locator('text="0"')).toBeVisible(); // Mastered
    await expect(page.locator('text=0%')).toBeVisible(); // Success rate
    
    // Test for tomme tilstande konsistens
    await expect(page.locator('text=No flashcards yet')).toBeVisible();
    await expect(page.locator('text=Create your first flashcard')).toBeVisible();
    
    await expect(page).toHaveScreenshot('07-flashcards-data-consistency.png');
  });

  test('08 - Navigation Konsistens På Tværs Af Moduler', async ({ page }) => {
    const modules = [
      '/modules/dashboard/index.html',
      '/modules/subjects/index.html', 
      '/modules/quiz/index.html',
      '/modules/content/index.html',
      '/modules/flashcards/index.html'
    ];
    
    for (const [index, module] of modules.entries()) {
      await page.goto(module);
      await page.waitForLoadState('domcontentloaded');
      
      // Test navigation konsistens
      const homeLinks = page.locator('text=Forside, text=Tilbage til forside, text=Hjem');
      expect(await homeLinks.count()).toBeGreaterThan(0);
      
      // Test ExamKlar branding
      const brandElements = page.locator('text=ExamKlar');
      expect(await brandElements.count()).toBeGreaterThan(0);
      
      await expect(page).toHaveScreenshot(`08-navigation-${index + 1}-${module.split('/')[2]}.png`);
    }
  });

  test('09 - Responsive Design Problemer', async ({ page }) => {
    const viewports = [
      { width: 320, height: 568, name: 'mobile-small' },
      { width: 375, height: 667, name: 'mobile-medium' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1024, height: 768, name: 'tablet-landscape' },
      { width: 1920, height: 1080, name: 'desktop' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // Test dashboard på forskellige skærmstørrelser
      await page.goto('/modules/dashboard/index.html');
      await page.waitForLoadState('domcontentloaded');
      
      await expect(page).toHaveScreenshot(`09-responsive-dashboard-${viewport.name}.png`);
      
      // Test hovedside
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      await expect(page).toHaveScreenshot(`09-responsive-home-${viewport.name}.png`);
    }
  });

  test('10 - Dark Mode Konsistens', async ({ page }) => {
    // Test light mode først
    await expect(page).toHaveScreenshot('10-light-mode-home.png');
    
    // Skift til dark mode
    await page.click('button[aria-label*="mørk"], button[aria-label*="dark"]');
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('10-dark-mode-home.png');
    
    // Test dark mode på andre sider
    await page.goto('/modules/dashboard/index.html');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveScreenshot('10-dark-mode-dashboard.png');
    
    await page.goto('/modules/subjects/index.html');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveScreenshot('10-dark-mode-subjects.png');
  });
});