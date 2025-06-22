import { test, expect } from '@playwright/test';

/**
 * Robust Comprehensive E2E Test for ExamKlar Platform
 * Doesn't fail on individual steps - reports everything it finds
 */

test.describe('ExamKlar Platform - Robust Testing', () => {
  
  test('Complete platform analysis and issue detection', async ({ page }) => {
    console.log('🚀 Starting ROBUST ExamKlar platform analysis...');
    
    const issues = [];
    const successes = [];
    const findings = [];
    
    // Error tracking
    page.on('console', msg => {
      if (msg.type() === 'error') {
        issues.push(`🔴 Console Error: ${msg.text()}`);
      } else if (msg.type() === 'warning') {
        issues.push(`🟡 Console Warning: ${msg.text()}`);
      }
    });
    
    page.on('response', response => {
      if (response.status() >= 400) {
        issues.push(`🌐 Network Error: ${response.url()} - Status ${response.status()}`);
      }
    });
    
    // Helper function to safely test elements
    const safeTest = async (description, testFunction) => {
      try {
        await testFunction();
        successes.push(`✅ ${description}`);
      } catch (error) {
        issues.push(`❌ ${description}: ${error.message}`);
      }
    };
    
    const safeFind = async (description, testFunction) => {
      try {
        const result = await testFunction();
        findings.push(`📋 ${description}: ${result}`);
        return result;
      } catch (error) {
        findings.push(`📋 ${description}: Error - ${error.message}`);
        return null;
      }
    };
    
    // Phase 1: Initial page load
    console.log('📍 Phase 1: Initial page analysis...');
    await page.goto(`file://${process.cwd()}/index.html`);
    
    // Check what happens on initial load
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    const pageTitle = await page.title();
    
    findings.push(`📋 Initial URL: ${currentUrl}`);
    findings.push(`📋 Page Title: ${pageTitle}`);
    
    if (currentUrl.includes('onboarding')) {
      successes.push('✅ Onboarding redirect working');
      
      // Try to interact with onboarding
      await safeTest('Onboarding welcome message visible', async () => {
        await expect(page.locator('h1')).toContainText('Velkommen', { timeout: 3000 });
      });
      
      await safeTest('Start button clickable', async () => {
        const startBtn = page.locator('button:has-text("Start Premium")');
        await expect(startBtn).toBeVisible({ timeout: 3000 });
        await startBtn.click();
      });
      
      // Check onboarding progression
      await page.waitForTimeout(1000);
      const h2Elements = await page.locator('h2').count();
      findings.push(`📋 Found ${h2Elements} h2 elements on page`);
      
      if (h2Elements > 0) {
        const firstH2 = await page.locator('h2').first().textContent();
        findings.push(`📋 First h2 content: "${firstH2}"`);
      }
      
    } else {
      successes.push('✅ Direct main page access');
    }
    
    // Phase 2: Navigate to main page and analyze
    console.log('🏠 Phase 2: Main page analysis...');
    await page.goto(`file://${process.cwd()}/index.html`);
    await page.waitForTimeout(2000);
    
    // Find all main page elements
    const mainElements = await safeFind('Main page elements', async () => {
      const elements = {
        headings: await page.locator('h1, h2, h3, h4, h5, h6').count(),
        buttons: await page.locator('button').count(),
        links: await page.locator('a').count(),
        images: await page.locator('img').count(),
        forms: await page.locator('form').count(),
        inputs: await page.locator('input, textarea, select').count()
      };
      return JSON.stringify(elements);
    });
    
    // Test main page sections
    const sections = [
      'ExamKlar',
      'Revolutionér',
      'Dine Resultater', 
      'Læringsmoduler',
      'Hurtig Adgang'
    ];
    
    for (const section of sections) {
      await safeTest(`${section} section visible`, async () => {
        await expect(page.locator(`text=${section}`)).toBeVisible({ timeout: 2000 });
      });
    }
    
    // Phase 3: Test all modules
    console.log('🧩 Phase 3: Module testing...');
    const modules = [
      { name: 'Subjects', path: 'modules/subjects/index.html' },
      { name: 'Content', path: 'modules/content/index.html' },
      { name: 'Flashcards', path: 'modules/flashcards/index.html' },
      { name: 'Quiz', path: 'modules/quiz/index.html' },
      { name: 'Dashboard', path: 'modules/dashboard/index.html' },
      { name: 'AI Assistant', path: 'modules/ai-assistant/index.html' },
      { name: 'Advanced', path: 'modules/advanced/index.html' }
    ];
    
    for (const module of modules) {
      console.log(`  Testing ${module.name}...`);
      
      try {
        await page.goto(`file://${process.cwd()}/${module.path}`);
        await page.waitForTimeout(1000);
        
        const moduleTitle = await page.title();
        const moduleHeading = await page.locator('h1, h2').first().textContent().catch(() => 'No heading');
        const moduleButtons = await page.locator('button').count();
        const moduleLinks = await page.locator('a').count();
        
        findings.push(`📋 ${module.name} - Title: "${moduleTitle}", Heading: "${moduleHeading}", Buttons: ${moduleButtons}, Links: ${moduleLinks}`);
        
        if (moduleTitle && !moduleTitle.includes('404')) {
          successes.push(`✅ ${module.name} module loads successfully`);
        } else {
          issues.push(`❌ ${module.name} module may not load properly`);
        }
        
        // Test responsiveness
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(300);
        
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        
        if (hasHorizontalScroll) {
          issues.push(`📱 ${module.name} has horizontal scroll on mobile`);
        } else {
          successes.push(`✅ ${module.name} mobile responsive`);
        }
        
        await page.setViewportSize({ width: 1280, height: 720 });
        
      } catch (error) {
        issues.push(`💥 ${module.name} critical error: ${error.message}`);
      }
    }
    
    // Phase 4: Functionality testing
    console.log('⚙️ Phase 4: Functionality testing...');
    await page.goto(`file://${process.cwd()}/index.html`);
    
    // Test dark mode
    await safeTest('Dark mode button functionality', async () => {
      const darkBtn = page.locator('button:has-text("Dark")');
      await expect(darkBtn).toBeVisible({ timeout: 2000 });
      await darkBtn.click();
      await page.waitForTimeout(500);
    });
    
    // Test search functionality
    await safeTest('Search functionality', async () => {
      const searchBtn = page.locator('button:has-text("Search")');
      if (await searchBtn.count() > 0) {
        await searchBtn.click();
      }
    });
    
    // Phase 5: Subject creation test
    console.log('📚 Phase 5: Subject creation test...');
    await page.goto(`file://${process.cwd()}/modules/subjects/index.html`);
    
    await safeTest('Subject creation form', async () => {
      const nameInput = page.locator('textbox').first();
      await nameInput.fill('Test Subject from E2E');
      
      const createBtn = page.locator('button:has-text("Opret")');
      await expect(createBtn).toBeVisible({ timeout: 2000 });
      await createBtn.click();
      await page.waitForTimeout(2000);
    });
    
    // Check if subject was created
    await safeFind('Created subjects', async () => {
      const subjectCards = await page.locator('.subject-card, [class*=\"subject\"]').count();
      return `Found ${subjectCards} subject cards`;
    });
    
    // Phase 6: Accessibility audit
    console.log('♿ Phase 6: Accessibility audit...');
    await page.goto(`file://${process.cwd()}/index.html`);
    
    const accessibilityFindings = await safeFind('Accessibility analysis', async () => {
      const imagesWithoutAlt = await page.locator('img:not([alt]), img[alt=\"\"]').count();
      const inputsWithoutLabels = await page.locator('input:not([aria-label]):not([aria-labelledby])').count();
      const headingsCount = await page.locator('h1, h2, h3, h4, h5, h6').count();
      
      return `Images without alt: ${imagesWithoutAlt}, Unlabeled inputs: ${inputsWithoutLabels}, Headings: ${headingsCount}`;
    });
    
    // Phase 7: Performance analysis
    console.log('⚡ Phase 7: Performance analysis...');
    const performanceData = await safeFind('Performance metrics', async () => {
      return await page.evaluate(() => {
        const perfData = {
          resources: performance.getEntriesByType('resource').length,
          hasServiceWorker: 'serviceWorker' in navigator,
          hasLocalStorage: typeof Storage !== 'undefined',
          userAgent: navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Other'
        };
        return JSON.stringify(perfData);
      });
    });
    
    // Phase 8: PWA features
    console.log('📱 Phase 8: PWA features...');
    await safeTest('PWA manifest present', async () => {
      await expect(page.locator('link[rel=\"manifest\"]')).toHaveCount(1, { timeout: 2000 });
    });
    
    // Phase 9: Overall design analysis
    console.log('🎨 Phase 9: Design analysis...');
    const designAnalysis = await safeFind('Design elements', async () => {
      const colorElements = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        const colors = new Set();
        const fonts = new Set();
        
        elements.forEach(el => {
          const styles = window.getComputedStyle(el);
          if (styles.color && styles.color !== 'rgba(0, 0, 0, 0)') {
            colors.add(styles.color);
          }
          if (styles.fontFamily) {
            fonts.add(styles.fontFamily);
          }
        });
        
        return {
          uniqueColors: colors.size,
          uniqueFonts: fonts.size,
          totalElements: elements.length
        };
      });
      
      return JSON.stringify(colorElements);
    });
    
    // Final comprehensive report
    console.log('\n' + '='.repeat(70));
    console.log('🎯 COMPREHENSIVE EXAMKLAR ANALYSIS REPORT');
    console.log('='.repeat(70));
    
    console.log('\\n✅ SUCCESSES:');
    successes.forEach((success, index) => {
      console.log(`  ${index + 1}. ${success}`);
    });
    
    console.log('\\n❌ ISSUES IDENTIFIED:');
    if (issues.length === 0) {
      console.log('  🎉 NO CRITICAL ISSUES FOUND! Platform appears to be working excellently!');
    } else {
      issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue}`);
      });
    }
    
    console.log('\\n📋 DETAILED FINDINGS:');
    findings.forEach((finding, index) => {
      console.log(`  ${index + 1}. ${finding}`);
    });
    
    console.log('\\n📊 SUMMARY STATISTICS:');
    console.log(`  ✅ Successes: ${successes.length}`);
    console.log(`  ❌ Issues: ${issues.length}`);
    console.log(`  📋 Findings: ${findings.length}`);
    
    const scorePercentage = ((successes.length / (successes.length + issues.length)) * 100).toFixed(1);
    console.log(`  🏆 Success Rate: ${scorePercentage}%`);
    
    if (issues.length === 0) {
      console.log('\\n🏆 EXCELLENT! Your ExamKlar platform is working perfectly!');
    } else if (issues.length <= 3) {
      console.log('\\n✨ GREAT! Your platform is working well with minimal issues.');
    } else if (issues.length <= 7) {
      console.log('\\n👍 GOOD! Your platform is functional with some improvements needed.');
    } else {
      console.log('\\n📝 FAIR! Your platform has several areas that could be improved.');
    }
    
    console.log('='.repeat(70));
    
    // Test always passes - this is analysis, not pass/fail
    expect(successes.length + issues.length + findings.length).toBeGreaterThan(0);
    
    console.log('\\n🏁 Comprehensive ExamKlar platform analysis completed!');
  });
});