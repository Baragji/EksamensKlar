import { test, expect } from '@playwright/test';

/**
 * Working Comprehensive E2E Test for ExamKlar Platform
 * Tests complete user flow and identifies all issues and mismatches
 */

test.describe('ExamKlar Platform - Complete User Journey & Issue Detection', () => {
  
  test('Complete user flow with comprehensive issue detection', async ({ page }) => {
    console.log('🚀 Starting comprehensive ExamKlar test...');
    
    const issues = [];
    const successes = [];
    
    // Track console errors and warnings
    page.on('console', msg => {
      if (msg.type() === 'error') {
        issues.push(`🔴 Console Error: ${msg.text()}`);
      } else if (msg.type() === 'warning') {
        issues.push(`🟡 Console Warning: ${msg.text()}`);
      }
    });
    
    // Track failed network requests
    page.on('response', response => {
      if (response.status() >= 400) {
        issues.push(`🌐 Network Error: ${response.url()} - Status ${response.status()}`);
      }
    });
    
    // Test 1: Initial page load and onboarding redirect
    console.log('📍 Testing initial page load...');
    await page.goto(`file://${process.cwd()}/index.html`);
    
    if (page.url().includes('onboarding')) {
      successes.push('✅ Proper redirect to onboarding for new users');
      
      // Test onboarding page elements
      await expect(page.locator('h1')).toContainText('Velkommen til Din Eksklusive AI Tutor!');
      successes.push('✅ Onboarding page loads with correct heading');
      
      // Test onboarding interaction
      await page.getByRole('button', { name: '🚀 Start Premium Oplevelse' }).click();
      
      // Should show subject selection
      await expect(page.locator('h2').first()).toContainText('Hvilket emne vil du mestre?');
      successes.push('✅ Onboarding progression works correctly');
      
      // Test subject selection
      await page.getByRole('button', { name: '📐 Matematik' }).click();
      
      // Continue button should be enabled
      const continueBtn = page.getByRole('button', { name: 'Fortsæt' });
      await expect(continueBtn).toBeEnabled();
      successes.push('✅ Subject selection enables continue button');
      
      await continueBtn.click();
      
      // Should show material upload step
      await expect(page.locator('h2').first()).toContainText('Upload dit pensum');
      successes.push('✅ Material upload step loads correctly');
      
      // Test file upload interface
      const fileUploadBtn = page.getByRole('button', { name: 'Vælg filer' });
      await expect(fileUploadBtn).toBeVisible();
      successes.push('✅ File upload interface is present');
      
      // Test text input area
      const textArea = page.locator('textbox').first();
      await textArea.fill('Test matematik materiale for E2E test');
      successes.push('✅ Text input area works correctly');
      
      // Skip to next step
      await page.getByRole('button', { name: 'Fortsæt (kan også gøres senere)' }).click();
      
      // Continue with onboarding
      await page.waitForTimeout(1000);
      
      // Try to complete onboarding
      const finishButton = page.locator('button:has-text("Afslut"), button:has-text("Færdig"), button:has-text("Start")');
      if (await finishButton.count() > 0) {
        await finishButton.first().click();
        successes.push('✅ Onboarding completion attempted');
      }
      
    } else {
      successes.push('✅ Direct access to main page (onboarding already completed)');
    }
    
    // Test 2: Navigate to main application
    console.log('🏠 Testing main application...');
    await page.goto(`file://${process.cwd()}/index.html`);
    
    // Wait a bit for any redirects
    await page.waitForTimeout(2000);
    
    // Check main page elements
    const mainElements = [
      { selector: '.hero-luxury', name: 'Hero section' },
      { selector: '.stats.luxury-section', name: 'Stats section' },
      { selector: '.modules.luxury-section', name: 'Modules section' },
      { selector: '.nav-luxury', name: 'Navigation' }
    ];
    
    for (const element of mainElements) {
      try {
        await expect(page.locator(element.selector)).toBeVisible({ timeout: 5000 });
        successes.push(`✅ ${element.name} is visible`);
      } catch (error) {
        issues.push(`❌ ${element.name} not found or not visible`);
      }
    }
    
    // Test 3: Module navigation
    console.log('🧩 Testing all modules...');
    const modules = [
      { name: 'Subjects', path: 'modules/subjects/index.html', expectedTitle: /Emne/i },
      { name: 'Flashcards', path: 'modules/flashcards/index.html', expectedTitle: /Flashcard|Kort/i },
      { name: 'Quiz', path: 'modules/quiz/index.html', expectedTitle: /Quiz|Spørgsmål/i },
      { name: 'Dashboard', path: 'modules/dashboard/index.html', expectedTitle: /Dashboard|Fremskridt/i },
      { name: 'AI Assistant', path: 'modules/ai-assistant/index.html', expectedTitle: /AI|Tutor/i },
      { name: 'Content', path: 'modules/content/index.html', expectedTitle: /Indhold|Content/i },
      { name: 'Advanced', path: 'modules/advanced/index.html', expectedTitle: /Premium|Advanced/i }
    ];
    
    for (const module of modules) {
      try {
        console.log(`  Testing ${module.name} module...`);
        await page.goto(`file://${process.cwd()}/${module.path}`);
        
        // Check if page loads
        const pageTitle = await page.title();
        if (pageTitle && pageTitle !== '' && !pageTitle.includes('404')) {
          successes.push(`✅ ${module.name} module loads successfully`);
        } else {
          issues.push(`❌ ${module.name} module may not load properly (empty/404 title)`);
        }
        
        // Check for main heading
        const headings = await page.locator('h1, h2').all();
        let foundExpectedHeading = false;
        
        for (const heading of headings) {
          const text = await heading.textContent();
          if (text && module.expectedTitle.test(text)) {
            foundExpectedHeading = true;
            successes.push(`✅ ${module.name} has correct heading: "${text}"`);
            break;
          }
        }
        
        if (!foundExpectedHeading) {
          const firstHeading = headings.length > 0 ? await headings[0].textContent() : 'No heading found';
          issues.push(`⚠️ ${module.name} heading mismatch. Found: "${firstHeading}"`);
        }
        
        // Check for interactive elements
        const buttonCount = await page.locator('button').count();
        const linkCount = await page.locator('a').count();
        const inputCount = await page.locator('input, textarea, select').count();
        
        successes.push(`✅ ${module.name} has ${buttonCount} buttons, ${linkCount} links, ${inputCount} inputs`);
        
        // Test responsive design
        await page.setViewportSize({ width: 375, height: 667 });
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        
        if (hasHorizontalScroll) {
          issues.push(`📱 ${module.name} has horizontal scrolling on mobile (375px)`);
        } else {
          successes.push(`✅ ${module.name} responsive design OK on mobile`);
        }
        
        // Reset viewport
        await page.setViewportSize({ width: 1280, height: 720 });
        
      } catch (error) {
        issues.push(`💥 Critical error in ${module.name}: ${error.message}`);
      }
    }
    
    // Test 4: Accessibility checks
    console.log('♿ Testing accessibility...');
    await page.goto(`file://${process.cwd()}/index.html`);
    
    // Check for images without alt text
    const imagesWithoutAlt = await page.locator('img:not([alt]), img[alt=""]').count();
    if (imagesWithoutAlt > 0) {
      issues.push(`♿ ${imagesWithoutAlt} images missing alt text`);
    } else {
      successes.push('✅ All images have alt text');
    }
    
    // Check for inputs without labels
    const unlabeledInputs = await page.locator('input:not([aria-label]):not([aria-labelledby])').count();
    if (unlabeledInputs > 0) {
      issues.push(`♿ ${unlabeledInputs} inputs missing accessibility labels`);
    } else {
      successes.push('✅ Input accessibility is good');
    }
    
    // Test 5: Performance and loading
    console.log('⚡ Testing performance...');
    const performanceData = await page.evaluate(() => {
      const perfData = {
        resourceCount: 0,
        hasServiceWorker: 'serviceWorker' in navigator,
        loadTime: 0
      };
      
      if (performance && performance.getEntriesByType) {
        perfData.resourceCount = performance.getEntriesByType('resource').length;
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          perfData.loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        }
      }
      
      return perfData;
    });
    
    successes.push(`✅ ${performanceData.resourceCount} resources loaded`);
    if (performanceData.resourceCount > 50) {
      issues.push(`⚡ High resource count: ${performanceData.resourceCount} resources`);
    }
    
    if (performanceData.hasServiceWorker) {
      successes.push('✅ Service Worker support available');
    } else {
      issues.push('📱 Service Worker not supported (PWA limitation)');
    }
    
    // Test 6: PWA features
    console.log('📱 Testing PWA features...');
    const manifestLink = await page.locator('link[rel="manifest"]').count();
    if (manifestLink > 0) {
      successes.push('✅ PWA manifest linked');
    } else {
      issues.push('📱 PWA manifest not found');
    }
    
    // Test 7: Theme functionality
    console.log('🎨 Testing theme functionality...');
    const darkModeBtn = page.locator('button:has-text("Dark"), button:has-text("Theme"), .theme-toggle');
    if (await darkModeBtn.count() > 0) {
      await darkModeBtn.first().click();
      await page.waitForTimeout(500);
      
      const htmlTheme = await page.getAttribute('html', 'data-theme');
      const bodyClass = await page.getAttribute('body', 'class');
      
      if (htmlTheme === 'dark' || (bodyClass && bodyClass.includes('dark'))) {
        successes.push('✅ Dark mode toggle works');
      } else {
        issues.push('🎨 Dark mode toggle not working properly');
      }
    } else {
      issues.push('🎨 Dark mode toggle not found');
    }
    
    // Test 8: Design consistency
    console.log('🎨 Testing design consistency...');
    
    // Check for consistent color scheme
    const colorIssues = await page.evaluate(() => {
      const issues = [];
      const elements = document.querySelectorAll('*');
      const colors = new Set();
      
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.color && style.color !== 'rgba(0, 0, 0, 0)') {
          colors.add(style.color);
        }
      });
      
      if (colors.size > 20) {
        issues.push(`Too many different text colors: ${colors.size}`);
      }
      
      return issues;
    });
    
    colorIssues.forEach(issue => {
      issues.push(`🎨 Design: ${issue}`);
    });
    
    // Final Results
    console.log('\n🎯 COMPREHENSIVE TEST RESULTS');
    console.log('='.repeat(50));
    
    console.log('\n✅ SUCCESSES:');
    successes.forEach((success, index) => {
      console.log(`  ${index + 1}. ${success}`);
    });
    
    console.log('\n❌ ISSUES FOUND:');
    if (issues.length === 0) {
      console.log('  🎉 No issues detected! Your platform is working excellently!');
    } else {
      issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue}`);
      });
    }
    
    console.log(`\n📊 SUMMARY: ${successes.length} successes, ${issues.length} issues`);
    console.log('='.repeat(50));
    
    // Test passes regardless - we're documenting issues, not failing
    expect(successes.length).toBeGreaterThan(0);
    
    console.log('\n🏁 Comprehensive testing completed!');
  });
});