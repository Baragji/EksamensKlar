import { test, expect } from '@playwright/test';

test.describe('ExamKlar - Critical Function Test for Production', () => {
  
  test('Homepage loads correctly', async ({ page }) => {
    await page.goto('http://localhost:8080');
    
    // Check page loads
    await expect(page).toHaveTitle(/ExamKlar/);
    
    // Check main elements exist
    await expect(page.locator('h1')).toContainText('Revolutionér Din Eksamensforberedelse');
    await expect(page.locator('.btn-luxury')).toBeVisible();
    
    console.log('✅ Homepage loads correctly');
  });

  test('Onboarding flow works', async ({ page }) => {
    await page.goto('http://localhost:8080');
    
    // Clear any existing data
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    // Navigate to dashboard (should redirect to onboarding)
    await page.click('a[href*="dashboard"]');
    
    // Should be redirected to onboarding
    await expect(page.url()).toContain('onboarding');
    
    console.log('✅ Onboarding redirect works');
  });

  test('Subject creation works', async ({ page }) => {
    await page.goto('http://localhost:8080/modules/subjects/index.html');
    
    // Check subject creation form
    await expect(page.locator('#createSubjectForm')).toBeVisible();
    await expect(page.locator('#subjectName')).toBeVisible();
    
    console.log('✅ Subject creation interface available');
  });

  test('Flashcards module loads', async ({ page }) => {
    await page.goto('http://localhost:8080/modules/flashcards/index.html');
    
    // Check flashcards interface
    await expect(page.locator('.flashcard-container, .cards-grid, .card-creation')).toBeVisible();
    
    console.log('✅ Flashcards module loads');
  });

  test('Quiz module loads', async ({ page }) => {
    await page.goto('http://localhost:8080/modules/quiz/index.html');
    
    // Check quiz interface
    await expect(page.locator('.quiz-container, .question-bank, .quiz-creation')).toBeVisible();
    
    console.log('✅ Quiz module loads');
  });

  test('Content module loads', async ({ page }) => {
    await page.goto('http://localhost:8080/modules/content/index.html');
    
    // Check content interface
    await expect(page.locator('.content-container, .content-list, .content-upload')).toBeVisible();
    
    console.log('✅ Content module loads');
  });

  test('AI Assistant available', async ({ page }) => {
    await page.goto('http://localhost:8080/modules/ai-assistant/index.html');
    
    // Check AI interface
    await expect(page.locator('.ai-chat, .chat-interface, .ai-container')).toBeVisible();
    
    console.log('✅ AI Assistant loads');
  });

  test('Dashboard loads', async ({ page }) => {
    await page.goto('http://localhost:8080/modules/dashboard/index.html');
    
    // Check dashboard elements
    await expect(page.locator('.dashboard, .stats, .progress')).toBeVisible();
    
    console.log('✅ Dashboard loads');
  });

  test('Service Worker registration', async ({ page }) => {
    await page.goto('http://localhost:8080');
    
    // Check service worker
    const swRegistered = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });
    
    expect(swRegistered).toBe(true);
    console.log('✅ Service Worker support available');
  });

  test('PWA Manifest exists', async ({ page }) => {
    const manifestResponse = await page.request.get('http://localhost:8080/manifest.json');
    expect(manifestResponse.status()).toBe(200);
    
    const manifest = await manifestResponse.json();
    expect(manifest.name).toBeTruthy();
    expect(manifest.icons).toBeTruthy();
    
    console.log('✅ PWA Manifest valid');
  });

});
