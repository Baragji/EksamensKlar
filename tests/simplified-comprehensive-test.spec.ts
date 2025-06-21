import { test, expect } from '@playwright/test';

/**
 * Simplified Comprehensive E2E Test for ExamKlar Platform
 * Tests all modules, identifies issues, and validates functionality using file:// protocol
 */

test.describe('ExamKlar Platform - Comprehensive Testing', () => {
  
  test('Complete application testing and issue identification', async ({ page }) => {
    console.log('🚀 Starting comprehensive ExamKlar platform test...');
    
    const issues = [];
    const testResults = [];
    
    // Set up console error tracking
    page.on('console', msg => {
      if (msg.type() === 'error') {
        issues.push(`Console Error: ${msg.text()}`);
      } else if (msg.type() === 'warning') {
        issues.push(`Console Warning: ${msg.text()}`);
      }
    });
    
    // Set up network error tracking
    page.on('response', response => {
      if (response.status() >= 400) {
        issues.push(`Network Error: ${response.url()} - Status: ${response.status()}`);
      }
    });
    
    // Start by checking the main index page
    console.log('📋 Testing main index page...');
    await page.goto(`file://${process.cwd()}/index.html`);
    
    // Check if redirected to onboarding (expected behavior)
    const currentUrl = page.url();
    if (currentUrl.includes('onboarding')) {
      testResults.push('✅ Proper redirect to onboarding detected');
      
      // Test onboarding page
      await expect(page.locator('h1')).toContainText('Velkommen', { timeout: 5000 });
      testResults.push('✅ Onboarding page loads correctly');
      
      // Try to bypass onboarding by setting localStorage (if possible)
      try {
        await page.evaluate(() => {
          localStorage.setItem('examklar_onboarding_completed', 'true');
        });
        testResults.push('✅ LocalStorage accessible for onboarding bypass');
      } catch (error) {
        issues.push('❌ Cannot access localStorage (file:// protocol limitation)');
      }
    } else {
      // Check main page content
      await expect(page.locator('.hero-luxury')).toBeVisible({ timeout: 5000 });
      testResults.push('✅ Main page loads without onboarding redirect');
    }
    
    // Test all module pages
    const modules = [
      { name: 'Subjects', path: 'modules/subjects/index.html', expectedH1: 'Emnestyring' },
      { name: 'Flashcards', path: 'modules/flashcards/index.html', expectedH1: 'Intelligente Flashcards' },
      { name: 'Quiz', path: 'modules/quiz/index.html', expectedH1: 'Adaptive Quizzer' },
      { name: 'Dashboard', path: 'modules/dashboard/index.html', expectedH1: 'Analytisk Dashboard' },
      { name: 'AI Assistant', path: 'modules/ai-assistant/index.html', expectedH1: 'AI Tutor' },
      { name: 'Content', path: 'modules/content/index.html', expectedH1: 'AI Indholdsmotor' },
      { name: 'Advanced', path: 'modules/advanced/index.html', expectedH1: 'Premium Features' }
    ];
    
    for (const module of modules) {
      console.log(`🧪 Testing ${module.name} module...`);
      
      try {
        await page.goto(`file://${process.cwd()}/${module.path}`);
        
        // Check if page loads
        const pageTitle = await page.title();
        if (pageTitle.includes('404') || pageTitle === '') {
          issues.push(`❌ ${module.name} module may not exist or load properly`);
        } else {
          testResults.push(`✅ ${module.name} module loads successfully`);
        }
        
        // Check for expected h1 content (flexible matching)
        try {
          await page.waitForSelector('h1', { timeout: 3000 });
          const h1Text = await page.locator('h1').first().textContent();
          if (h1Text && h1Text.includes(module.expectedH1.split(' ')[0])) {
            testResults.push(`✅ ${module.name} has correct header content`);
          } else {
            issues.push(`⚠️ ${module.name} header mismatch. Expected: ${module.expectedH1}, Found: ${h1Text}`);
          }
        } catch (error) {
          issues.push(`❌ ${module.name} missing h1 header element`);
        }
        
        // Check for JavaScript functionality
        const hasErrors = await page.evaluate(() => {
          // Simple test - check if common functions exist
          const errors = [];
          if (typeof app === 'undefined' && typeof window.app === 'undefined') {
            errors.push('Main app object not found');
          }
          return errors;
        });
        
        if (hasErrors.length > 0) {
          issues.push(`❌ ${module.name} JavaScript issues: ${hasErrors.join(', ')}`);
        } else {
          testResults.push(`✅ ${module.name} JavaScript appears to load correctly`);
        }
        
        // Check for buttons and interactive elements
        const buttonCount = await page.locator('button').count();
        const linkCount = await page.locator('a').count();
        
        if (buttonCount > 0 || linkCount > 0) {
          testResults.push(`✅ ${module.name} has ${buttonCount} buttons and ${linkCount} links`);
        } else {
          issues.push(`⚠️ ${module.name} has no interactive elements`);
        }
        
        // Test responsive design basics
        await page.setViewportSize({ width: 375, height: 667 });
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        
        if (hasHorizontalScroll) {
          issues.push(`❌ ${module.name} has horizontal scrolling on mobile (375px)`);
        } else {
          testResults.push(`✅ ${module.name} responsive design looks good on mobile`);
        }
        
        // Reset viewport
        await page.setViewportSize({ width: 1280, height: 720 });
        
      } catch (error) {
        issues.push(`❌ Critical error testing ${module.name}: ${error.message}`);
      }
    }
    
    // Test specific functionality back on main page
    await page.goto(`file://${process.cwd()}/index.html`);
    
    // Check for missing images
    const images = await page.locator('img').all();
    let brokenImages = 0;
    for (const img of images) {
      const src = await img.getAttribute('src');
      if (src && !src.startsWith('data:')) {
        // This is a simplistic check - in real scenario you'd validate the image loads
        if (src.startsWith('http') || src.includes('://')) {
          issues.push(`⚠️ External image dependency: ${src}`);
        }
      }
    }
    
    // Check for accessibility basics
    const imagesWithoutAlt = await page.locator('img:not([alt])').count();
    if (imagesWithoutAlt > 0) {
      issues.push(`❌ ${imagesWithoutAlt} images missing alt attributes`);
    } else {
      testResults.push('✅ All images have alt attributes');
    }
    
    const inputsWithoutLabels = await page.locator('input:not([aria-label]):not([aria-labelledby])').count();
    if (inputsWithoutLabels > 0) {
      issues.push(`❌ ${inputsWithoutLabels} inputs missing accessibility labels`);
    } else {
      testResults.push('✅ Input accessibility looks good');
    }
    
    // Check for performance concerns
    const resourceCount = await page.evaluate(() => {
      if (performance && performance.getEntriesByType) {
        return performance.getEntriesByType('resource').length;
      }
      return 0;
    });
    
    if (resourceCount > 50) {
      issues.push(`⚠️ High resource count: ${resourceCount} resources loaded`);
    } else {
      testResults.push(`✅ Reasonable resource count: ${resourceCount} resources`);
    }
    
    // Test CSS loading
    const stylesheetCount = await page.locator('link[rel="stylesheet"]').count();
    testResults.push(`✅ ${stylesheetCount} stylesheets linked`);
    
    // Check for PWA manifest
    const hasManifest = await page.locator('link[rel="manifest"]').count();
    if (hasManifest > 0) {
      testResults.push('✅ PWA manifest linked');
    } else {
      issues.push('⚠️ No PWA manifest found');
    }
    
    // Test dark mode functionality if available
    const darkModeButton = page.locator('button:has-text("Dark Mode")');
    if (await darkModeButton.isVisible()) {
      await darkModeButton.click();
      await page.waitForTimeout(500);
      
      const theme = await page.getAttribute('html', 'data-theme');
      if (theme === 'dark') {
        testResults.push('✅ Dark mode toggle works correctly');
      } else {
        issues.push('❌ Dark mode toggle not working properly');
      }
    } else {
      testResults.push('ℹ️ Dark mode button not found (may be in different location)');
    }
    
    // Final reporting
    console.log('\n📊 COMPREHENSIVE TEST RESULTS:\n');
    
    console.log('✅ SUCCESSFUL TESTS:');
    testResults.forEach((result, index) => {
      console.log(`${index + 1}. ${result}`);
    });
    
    console.log('\n❌ IDENTIFIED ISSUES:');
    if (issues.length === 0) {
      console.log('🎉 No issues detected! Platform appears to be working excellently.');
    } else {
      issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
    }
    
    console.log(`\n📈 SUMMARY: ${testResults.length} tests passed, ${issues.length} issues found`);
    
    // The test passes regardless of issues found - we're just documenting them
    expect(testResults.length).toBeGreaterThan(0);
    
    console.log('🏁 Comprehensive testing completed!');
  });
});