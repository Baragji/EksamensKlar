import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests for ExamKlar UI Inconsistencies
 * 
 * This test suite captures visual evidence of UI problems across the platform.
 * It creates baseline screenshots to track UI inconsistencies and changes.
 */

test.describe('ExamKlar Visual Regression - UI Inconsistency Detection', () => {
  
  test.beforeEach(async ({ page }) => {
    // Configure for consistent screenshots
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('Visual: Homepage Layout and Branding', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for any dynamic content
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('homepage-full-layout.png');
  });

  test('Visual: Onboarding Flow Quality (BASELINE GOOD)', async ({ page }) => {
    await page.goto('/modules/onboarding/index.html');
    await page.waitForLoadState('domcontentloaded');
    
    // Screenshot welcome screen
    await expect(page).toHaveScreenshot('onboarding-01-welcome.png');
    
    // Go to step 1
    await page.click('text=Start Premium Oplevelse');
    await page.waitForSelector('text=1 af 4');
    await expect(page).toHaveScreenshot('onboarding-02-subject-selection.png');
    
    // Select subject and continue
    await page.click('text=Matematik');
    await page.click('text=Fortsæt');
    await page.waitForSelector('text=2 af 4');
    await expect(page).toHaveScreenshot('onboarding-03-material-upload.png');
    
    // Continue to timing
    await page.click('text=Fortsæt (kan også gøres senere)');
    await page.waitForSelector('text=3 af 4');
    await expect(page).toHaveScreenshot('onboarding-04-exam-timing.png');
    
    // Select timing and finish
    await page.click('text=1 måned');
    await page.click('text=Fortsæt');
    await page.waitForSelector('text=4 af 4');
    await expect(page).toHaveScreenshot('onboarding-05-processing.png');
    
    // Wait for completion
    await page.waitForTimeout(4000);
    await expect(page).toHaveScreenshot('onboarding-06-complete.png');
  });

  test('Visual: Dashboard Layout Problems', async ({ page }) => {
    await page.goto('/modules/dashboard/index.html');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    
    // Full dashboard screenshot showing layout issues
    await expect(page).toHaveScreenshot('dashboard-layout-problems.png');
    
    // Test mobile layout problems
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page).toHaveScreenshot('dashboard-mobile-layout.png');
  });

  test('Visual: Subjects Module with 404 Error', async ({ page }) => {
    await page.goto('/modules/subjects/index.html');
    await page.waitForLoadState('domcontentloaded');
    
    // Screenshot subjects page
    await expect(page).toHaveScreenshot('subjects-main-page.png');
    
    // Try to click "Åbn Emne" to trigger 404
    const openSubjectLink = page.locator('text=Åbn Emne').first();
    if (await openSubjectLink.count() > 0) {
      await openSubjectLink.click();
      
      // Screenshot 404 error
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveScreenshot('subjects-404-error.png');
    }
  });

  test('Visual: Quiz Module Data Problems', async ({ page }) => {
    await page.goto('/modules/quiz/index.html');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    
    // Screenshot showing data inconsistencies
    await expect(page).toHaveScreenshot('quiz-data-inconsistencies.png');
  });

  test('Visual: Content Manager Language Mix', async ({ page }) => {
    await page.goto('/modules/content/index.html');
    await page.waitForLoadState('domcontentloaded');
    
    // Screenshot showing English/Danish language mix
    await expect(page).toHaveScreenshot('content-language-inconsistency.png');
  });

  test('Visual: Flashcards Module Layout', async ({ page }) => {
    await page.goto('/modules/flashcards/index.html');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    
    // Screenshot flashcards layout
    await expect(page).toHaveScreenshot('flashcards-layout.png');
  });

  test('Visual: Cross-Module Navigation Inconsistency', async ({ page }) => {
    const modules = [
      { url: '/modules/dashboard/index.html', name: 'dashboard' },
      { url: '/modules/subjects/index.html', name: 'subjects' },
      { url: '/modules/quiz/index.html', name: 'quiz' },
      { url: '/modules/content/index.html', name: 'content' },
      { url: '/modules/flashcards/index.html', name: 'flashcards' }
    ];
    
    for (const module of modules) {
      await page.goto(module.url);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(500);
      
      // Focus on navigation area
      await expect(page).toHaveScreenshot(`navigation-${module.name}.png`);
    }
  });

  test('Visual: Responsive Design Issues', async ({ page }) => {
    const viewports = [
      { width: 320, height: 568, name: 'mobile-small' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1920, height: 1080, name: 'desktop-large' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // Test responsive issues on dashboard
      await page.goto('/modules/dashboard/index.html');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveScreenshot(`responsive-dashboard-${viewport.name}.png`);
    }
  });

  test('Visual: Dark Mode Inconsistencies', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Light mode baseline
    await expect(page).toHaveScreenshot('theme-light-homepage.png');
    
    // Try to toggle dark mode
    const darkModeButton = page.locator('button[aria-label*="mørk"], button[aria-label*="dark"], text=🌙').first();
    if (await darkModeButton.count() > 0) {
      await darkModeButton.click();
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('theme-dark-homepage.png');
      
      // Test dark mode on other pages
      await page.goto('/modules/dashboard/index.html');
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveScreenshot('theme-dark-dashboard.png');
    }
  });

  test('Visual: UI Component Consistency Analysis', async ({ page }) => {
    // Test button styles across modules
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Screenshot of main page buttons
    await expect(page).toHaveScreenshot('buttons-homepage-style.png');
    
    // Test buttons in different modules
    await page.goto('/modules/onboarding/index.html');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveScreenshot('buttons-onboarding-style.png');
    
    await page.goto('/modules/dashboard/index.html');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveScreenshot('buttons-dashboard-style.png');
  });
});