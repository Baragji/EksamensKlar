⠙
Running 50 tests using 4 workers

[1/50] …yse - ExamKlar › 03 - Dashboard: ALVORLIGE Layout Problemer
[2/50] … - ExamKlar › 01 - Hovedside: Layout og branding konsistens
[3/50] …xamKlar › 02 - Onboarding Flow: Design konsistens (POSITIV)
[4/50] … - ExamKlar › 04 - Subjects: Kritisk 404 Fejl og Navigation
  1) [chromium] › tests/ui-inconsistencies-analysis.spec.js:81:3 › UI Inkonsistens Analyse - ExamKlar › 03 - Dashboard: ALVORLIGE Layout Problemer 

    Error: expect(received).toBeGreaterThan(expected)

    Expected: > 1
    Received:   0

      86 |     // PROBLEM 1: Overlappende indhold i toppen
      87 |     const exportDataElements = page.locator('text=Export Data');
    > 88 |     expect(await exportDataElements.count()).toBeGreaterThan(1); // Duplikeret
         |                                              ^
      89 |     
      90 |     // PROBLEM 2: Inkonsistent navigation
      91 |     const navigationElements = page.locator('nav[aria-label="Hovednavigation"]');
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:88:46

    Error Context: test-results/ui-inconsistencies-analysi-17ece--ALVORLIGE-Layout-Problemer-chromium/error-context.md


  2) [chromium] › tests/ui-inconsistencies-analysis.spec.js:25:3 › UI Inkonsistens Analyse - ExamKlar › 01 - Hovedside: Layout og branding konsistens 

    Error: expect(received).toBeGreaterThan(expected)

    Expected: > 0
    Received:   0

      35 |     const danishElements = page.locator('text=Læringsmoduler');
      36 |     
    > 37 |     expect(await englishElements.count()).toBeGreaterThan(0);
         |                                           ^
      38 |     expect(await danishElements.count()).toBeGreaterThan(0);
      39 |     
      40 |     // Visual snapshot af hovedside
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:37:43

    Error Context: test-results/ui-inconsistencies-analysi-7ee1c-yout-og-branding-konsistens-chromium/error-context.md


  3) [chromium] › tests/ui-inconsistencies-analysis.spec.js:106:3 › UI Inkonsistens Analyse - ExamKlar › 04 - Subjects: Kritisk 404 Fejl og Navigation 

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/04-subjects-layout-chromium-darwin.png, writing actual.

      128 |     
      129 |     // Test normal subjects layout
    > 130 |     await expect(page).toHaveScreenshot('04-subjects-layout.png');
          |     ^
      131 |   });
      132 |
      133 |   test('05 - Quiz: Data Format Inkonsistenser', async ({ page }) => {
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:130:5

    attachment #1: 04-subjects-layout-expected.png (image/png) ────
    tests/ui-inconsistencies-analysis.spec.js-snapshots/04-subjects-layout-chromium-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #2: 04-subjects-layout-actual.png (image/png) ──────
    test-results/ui-inconsistencies-analysi-2462b-tisk-404-Fejl-og-Navigation-chromium/04-subjects-layout-actual.png
    ───────────────────────────────────────────────────────────────

    Error Context: test-results/ui-inconsistencies-analysi-2462b-tisk-404-Fejl-og-Navigation-chromium/error-context.md


[5/50] … Analyse - ExamKlar › 05 - Quiz: Data Format Inkonsistenser
[6/50] … ExamKlar › 06 - Content Manager: Engelsk Interface Problem
[7/50] …yse - ExamKlar › 07 - Flashcards: Layout og Data Konsistens
  4) [chromium] › tests/ui-inconsistencies-analysis.spec.js:133:3 › UI Inkonsistens Analyse - ExamKlar › 05 - Quiz: Data Format Inkonsistenser 

    Error: expect(received).toBeGreaterThan(expected)

    Expected: > 0
    Received:   0

      138 |     // PROBLEM: NaN værdi i statistikker
      139 |     const nanElement = page.locator('text=NaN');
    > 140 |     expect(await nanElement.count()).toBeGreaterThan(0);
          |                                      ^
      141 |     
      142 |     // PROBLEM: Inkonsistent tal formatering
      143 |     const numberElements = page.locator('text="2"');
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:140:38

    Error Context: test-results/ui-inconsistencies-analysi-505b2--Data-Format-Inkonsistenser-chromium/error-context.md


  5) [chromium] › tests/ui-inconsistencies-analysis.spec.js:153:3 › UI Inkonsistens Analyse - ExamKlar › 06 - Content Manager: Engelsk Interface Problem 

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/06-content-language-mix-chromium-darwin.png, writing actual.

      164 |     const danishContent = page.locator('text=Sværhedsgrad');
      165 |     
    > 166 |     await expect(page).toHaveScreenshot('06-content-language-mix.png');
          |     ^
      167 |   });
      168 |
      169 |   test('07 - Flashcards: Layout og Data Konsistens', async ({ page }) => {
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:166:5

    attachment #1: 06-content-language-mix-expected.png (image/png) 
    tests/ui-inconsistencies-analysis.spec.js-snapshots/06-content-language-mix-chromium-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #2: 06-content-language-mix-actual.png (image/png) ─
    test-results/ui-inconsistencies-analysi-35d3b-r-Engelsk-Interface-Problem-chromium/06-content-language-mix-actual.png
    ───────────────────────────────────────────────────────────────

    Error Context: test-results/ui-inconsistencies-analysi-35d3b-r-Engelsk-Interface-Problem-chromium/error-context.md


[8/50] …- ExamKlar › 08 - Navigation Konsistens På Tværs Af Moduler
[9/50] …stens Analyse - ExamKlar › 09 - Responsive Design Problemer
  6) [chromium] › tests/ui-inconsistencies-analysis.spec.js:186:3 › UI Inkonsistens Analyse - ExamKlar › 08 - Navigation Konsistens På Tværs Af Moduler 

    Error: expect(received).toBeGreaterThan(expected)

    Expected: > 0
    Received:   0

      199 |       // Test navigation konsistens
      200 |       const homeLinks = page.locator('text=Forside, text=Tilbage til forside, text=Hjem');
    > 201 |       expect(await homeLinks.count()).toBeGreaterThan(0);
          |                                       ^
      202 |       
      203 |       // Test ExamKlar branding
      204 |       const brandElements = page.locator('text=ExamKlar');
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:201:39

    Error Context: test-results/ui-inconsistencies-analysi-d2b49-sistens-På-Tværs-Af-Moduler-chromium/error-context.md


[10/50] …nkonsistens Analyse - ExamKlar › 10 - Dark Mode Konsistens
  7) [chromium] › tests/ui-inconsistencies-analysis.spec.js:169:3 › UI Inkonsistens Analyse - ExamKlar › 07 - Flashcards: Layout og Data Konsistens 

    Error: Timed out 5000ms waiting for expect(locator).toBeVisible()

    Locator: locator('text="3"')
    Expected: visible
    Received: <element(s) not found>
    Call log:
      - Expect "toBeVisible" with timeout 5000ms
      - waiting for locator('text="3"')


      173 |     
      174 |     // Test data konsistens
    > 175 |     await expect(page.locator('text="3"')).toBeVisible(); // Total cards
          |                                            ^
      176 |     await expect(page.locator('text="0"')).toBeVisible(); // Mastered
      177 |     await expect(page.locator('text=0%')).toBeVisible(); // Success rate
      178 |     
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:175:44

    Error Context: test-results/ui-inconsistencies-analysi-1a529-s-Layout-og-Data-Konsistens-chromium/error-context.md


[11/50] …- ExamKlar › 01 - Hovedside: Layout og branding konsistens
  8) [chromium] › tests/ui-inconsistencies-analysis.spec.js:211:3 › UI Inkonsistens Analyse - ExamKlar › 09 - Responsive Design Problemer 

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-dashboard-mobile-small-chromium-darwin.png, writing actual.

      225 |       await page.waitForLoadState('domcontentloaded');
      226 |       
    > 227 |       await expect(page).toHaveScreenshot(`09-responsive-dashboard-${viewport.name}.png`);
          |       ^
      228 |       
      229 |       // Test hovedside
      230 |       await page.goto('/');
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:227:7

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-home-mobile-small-chromium-darwin.png, writing actual.

      231 |       await page.waitForLoadState('domcontentloaded');
      232 |       
    > 233 |       await expect(page).toHaveScreenshot(`09-responsive-home-${viewport.name}.png`);
          |       ^
      234 |     }
      235 |   });
      236 |
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:233:7

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-dashboard-mobile-medium-chromium-darwin.png, writing actual.

      225 |       await page.waitForLoadState('domcontentloaded');
      226 |       
    > 227 |       await expect(page).toHaveScreenshot(`09-responsive-dashboard-${viewport.name}.png`);
          |       ^
      228 |       
      229 |       // Test hovedside
      230 |       await page.goto('/');
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:227:7

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-home-mobile-medium-chromium-darwin.png, writing actual.

      231 |       await page.waitForLoadState('domcontentloaded');
      232 |       
    > 233 |       await expect(page).toHaveScreenshot(`09-responsive-home-${viewport.name}.png`);
          |       ^
      234 |     }
      235 |   });
      236 |
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:233:7

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-dashboard-tablet-chromium-darwin.png, writing actual.

      225 |       await page.waitForLoadState('domcontentloaded');
      226 |       
    > 227 |       await expect(page).toHaveScreenshot(`09-responsive-dashboard-${viewport.name}.png`);
          |       ^
      228 |       
      229 |       // Test hovedside
      230 |       await page.goto('/');
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:227:7

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-home-tablet-chromium-darwin.png, writing actual.

      231 |       await page.waitForLoadState('domcontentloaded');
      232 |       
    > 233 |       await expect(page).toHaveScreenshot(`09-responsive-home-${viewport.name}.png`);
          |       ^
      234 |     }
      235 |   });
      236 |
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:233:7

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-dashboard-tablet-landscape-chromium-darwin.png, writing actual.

      225 |       await page.waitForLoadState('domcontentloaded');
      226 |       
    > 227 |       await expect(page).toHaveScreenshot(`09-responsive-dashboard-${viewport.name}.png`);
          |       ^
      228 |       
      229 |       // Test hovedside
      230 |       await page.goto('/');
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:227:7

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-home-tablet-landscape-chromium-darwin.png, writing actual.

      231 |       await page.waitForLoadState('domcontentloaded');
      232 |       
    > 233 |       await expect(page).toHaveScreenshot(`09-responsive-home-${viewport.name}.png`);
          |       ^
      234 |     }
      235 |   });
      236 |
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:233:7

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-dashboard-desktop-chromium-darwin.png, writing actual.

      225 |       await page.waitForLoadState('domcontentloaded');
      226 |       
    > 227 |       await expect(page).toHaveScreenshot(`09-responsive-dashboard-${viewport.name}.png`);
          |       ^
      228 |       
      229 |       // Test hovedside
      230 |       await page.goto('/');
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:227:7

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-home-desktop-chromium-darwin.png, writing actual.

      231 |       await page.waitForLoadState('domcontentloaded');
      232 |       
    > 233 |       await expect(page).toHaveScreenshot(`09-responsive-home-${viewport.name}.png`);
          |       ^
      234 |     }
      235 |   });
      236 |
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:233:7

    attachment #1: 09-responsive-dashboard-mobile-small-expected.png (image/png) 
    tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-dashboard-mobile-small-chromium-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #2: 09-responsive-dashboard-mobile-small-actual.png (image/png) 
    test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-chromium/09-responsive-dashboard-mobile-small-actual.png
    ───────────────────────────────────────────────────────────────

    attachment #3: 09-responsive-home-mobile-small-expected.png (image/png) 
    tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-home-mobile-small-chromium-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #4: 09-responsive-home-mobile-small-actual.png (image/png) 
    test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-chromium/09-responsive-home-mobile-small-actual.png
    ───────────────────────────────────────────────────────────────

    attachment #5: 09-responsive-dashboard-mobile-medium-expected.png (image/png) 
    tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-dashboard-mobile-medium-chromium-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #6: 09-responsive-dashboard-mobile-medium-actual.png (image/png) 
    test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-chromium/09-responsive-dashboard-mobile-medium-actual.png
    ───────────────────────────────────────────────────────────────

    attachment #7: 09-responsive-home-mobile-medium-expected.png (image/png) 
    tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-home-mobile-medium-chromium-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #8: 09-responsive-home-mobile-medium-actual.png (image/png) 
    test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-chromium/09-responsive-home-mobile-medium-actual.png
    ───────────────────────────────────────────────────────────────

    attachment #9: 09-responsive-dashboard-tablet-expected.png (image/png) 
    tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-dashboard-tablet-chromium-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #10: 09-responsive-dashboard-tablet-actual.png (image/png) 
    test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-chromium/09-responsive-dashboard-tablet-actual.png
    ───────────────────────────────────────────────────────────────

    attachment #11: 09-responsive-home-tablet-expected.png (image/png) 
    tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-home-tablet-chromium-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #12: 09-responsive-home-tablet-actual.png (image/png) 
    test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-chromium/09-responsive-home-tablet-actual.png
    ───────────────────────────────────────────────────────────────

    attachment #13: 09-responsive-dashboard-tablet-landscape-expected.png (image/png) 
    tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-dashboard-tablet-landscape-chromium-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #14: 09-responsive-dashboard-tablet-landscape-actual.png (image/png) 
    test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-chromium/09-responsive-dashboard-tablet-landscape-actual.png
    ───────────────────────────────────────────────────────────────

    attachment #15: 09-responsive-home-tablet-landscape-expected.png (image/png) 
    tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-home-tablet-landscape-chromium-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #16: 09-responsive-home-tablet-landscape-actual.png (image/png) 
    test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-chromium/09-responsive-home-tablet-landscape-actual.png
    ───────────────────────────────────────────────────────────────

    attachment #17: 09-responsive-dashboard-desktop-expected.png (image/png) 
    tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-dashboard-desktop-chromium-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #18: 09-responsive-dashboard-desktop-actual.png (image/png) 
    test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-chromium/09-responsive-dashboard-desktop-actual.png
    ───────────────────────────────────────────────────────────────

    attachment #19: 09-responsive-home-desktop-expected.png (image/png) 
    tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-home-desktop-chromium-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #20: 09-responsive-home-desktop-actual.png (image/png) 
    test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-chromium/09-responsive-home-desktop-actual.png
    ───────────────────────────────────────────────────────────────

    Error Context: test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-chromium/error-context.md


[12/50] …amKlar › 02 - Onboarding Flow: Design konsistens (POSITIV)
  9) [firefox] › tests/ui-inconsistencies-analysis.spec.js:25:3 › UI Inkonsistens Analyse - ExamKlar › 01 - Hovedside: Layout og branding konsistens 

    Error: expect(received).toBeGreaterThan(expected)

    Expected: > 0
    Received:   0

      35 |     const danishElements = page.locator('text=Læringsmoduler');
      36 |     
    > 37 |     expect(await englishElements.count()).toBeGreaterThan(0);
         |                                           ^
      38 |     expect(await danishElements.count()).toBeGreaterThan(0);
      39 |     
      40 |     // Visual snapshot af hovedside
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:37:43

    Error Context: test-results/ui-inconsistencies-analysi-7ee1c-yout-og-branding-konsistens-firefox/error-context.md


[13/50] …se - ExamKlar › 03 - Dashboard: ALVORLIGE Layout Problemer
  10) [chromium] › tests/ui-inconsistencies-analysis.spec.js:44:3 › UI Inkonsistens Analyse - ExamKlar › 02 - Onboarding Flow: Design konsistens (POSITIV) 

    Test timeout of 30000ms exceeded.

    Error: page.click: Test timeout of 30000ms exceeded.
    Call log:
      - waiting for locator('text=Start Onboarding')


      44 |   test('02 - Onboarding Flow: Design konsistens (POSITIV)', async ({ page }) => {
      45 |     // Naviger til onboarding
    > 46 |     await page.click('text=Start Onboarding');
         |                ^
      47 |     await page.waitForURL('**/modules/onboarding/index.html');
      48 |     
      49 |     // Test onboarding step 1
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:46:16

    Error Context: test-results/ui-inconsistencies-analysi-5a92b--Design-konsistens-POSITIV--chromium/error-context.md


[14/50] …- ExamKlar › 04 - Subjects: Kritisk 404 Fejl og Navigation
  11) [firefox] › tests/ui-inconsistencies-analysis.spec.js:81:3 › UI Inkonsistens Analyse - ExamKlar › 03 - Dashboard: ALVORLIGE Layout Problemer 

    Error: expect(received).toBeGreaterThan(expected)

    Expected: > 1
    Received:   0

      86 |     // PROBLEM 1: Overlappende indhold i toppen
      87 |     const exportDataElements = page.locator('text=Export Data');
    > 88 |     expect(await exportDataElements.count()).toBeGreaterThan(1); // Duplikeret
         |                                              ^
      89 |     
      90 |     // PROBLEM 2: Inkonsistent navigation
      91 |     const navigationElements = page.locator('nav[aria-label="Hovednavigation"]');
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:88:46

    Error Context: test-results/ui-inconsistencies-analysi-17ece--ALVORLIGE-Layout-Problemer-firefox/error-context.md


  12) [chromium] › tests/ui-inconsistencies-analysis.spec.js:237:3 › UI Inkonsistens Analyse - ExamKlar › 10 - Dark Mode Konsistens 

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/10-light-mode-home-chromium-darwin.png, writing actual.

      237 |   test('10 - Dark Mode Konsistens', async ({ page }) => {
      238 |     // Test light mode først
    > 239 |     await expect(page).toHaveScreenshot('10-light-mode-home.png');
          |     ^
      240 |     
      241 |     // Skift til dark mode
      242 |     await page.click('button[aria-label*="mørk"], button[aria-label*="dark"]');
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:239:5

    Test timeout of 30000ms exceeded.

    Error: page.click: Test ended.
    Call log:
      - waiting for locator('button[aria-label*="mørk"], button[aria-label*="dark"]')


      240 |     
      241 |     // Skift til dark mode
    > 242 |     await page.click('button[aria-label*="mørk"], button[aria-label*="dark"]');
          |                ^
      243 |     await page.waitForTimeout(500);
      244 |     
      245 |     await expect(page).toHaveScreenshot('10-dark-mode-home.png');
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:242:16

    attachment #1: 10-light-mode-home-expected.png (image/png) ────
    tests/ui-inconsistencies-analysis.spec.js-snapshots/10-light-mode-home-chromium-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #2: 10-light-mode-home-actual.png (image/png) ──────
    test-results/ui-inconsistencies-analysi-9f6c4-r-10---Dark-Mode-Konsistens-chromium/10-light-mode-home-actual.png
    ───────────────────────────────────────────────────────────────

    Error Context: test-results/ui-inconsistencies-analysi-9f6c4-r-10---Dark-Mode-Konsistens-chromium/error-context.md


[15/50] …Analyse - ExamKlar › 05 - Quiz: Data Format Inkonsistenser
  13) [firefox] › tests/ui-inconsistencies-analysis.spec.js:106:3 › UI Inkonsistens Analyse - ExamKlar › 04 - Subjects: Kritisk 404 Fejl og Navigation 

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/04-subjects-layout-firefox-darwin.png, writing actual.

      128 |     
      129 |     // Test normal subjects layout
    > 130 |     await expect(page).toHaveScreenshot('04-subjects-layout.png');
          |     ^
      131 |   });
      132 |
      133 |   test('05 - Quiz: Data Format Inkonsistenser', async ({ page }) => {
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:130:5

    attachment #1: 04-subjects-layout-expected.png (image/png) ────
    tests/ui-inconsistencies-analysis.spec.js-snapshots/04-subjects-layout-firefox-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #2: 04-subjects-layout-actual.png (image/png) ──────
    test-results/ui-inconsistencies-analysi-2462b-tisk-404-Fejl-og-Navigation-firefox/04-subjects-layout-actual.png
    ───────────────────────────────────────────────────────────────

    Error Context: test-results/ui-inconsistencies-analysi-2462b-tisk-404-Fejl-og-Navigation-firefox/error-context.md


[16/50] …ExamKlar › 06 - Content Manager: Engelsk Interface Problem
[17/50] …se - ExamKlar › 07 - Flashcards: Layout og Data Konsistens
  14) [firefox] › tests/ui-inconsistencies-analysis.spec.js:133:3 › UI Inkonsistens Analyse - ExamKlar › 05 - Quiz: Data Format Inkonsistenser 

    Error: expect(received).toBeGreaterThan(expected)

    Expected: > 0
    Received:   0

      138 |     // PROBLEM: NaN værdi i statistikker
      139 |     const nanElement = page.locator('text=NaN');
    > 140 |     expect(await nanElement.count()).toBeGreaterThan(0);
          |                                      ^
      141 |     
      142 |     // PROBLEM: Inkonsistent tal formatering
      143 |     const numberElements = page.locator('text="2"');
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:140:38

    Error Context: test-results/ui-inconsistencies-analysi-505b2--Data-Format-Inkonsistenser-firefox/error-context.md


[18/50] … ExamKlar › 08 - Navigation Konsistens På Tværs Af Moduler
  15) [firefox] › tests/ui-inconsistencies-analysis.spec.js:153:3 › UI Inkonsistens Analyse - ExamKlar › 06 - Content Manager: Engelsk Interface Problem 

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/06-content-language-mix-firefox-darwin.png, writing actual.

      164 |     const danishContent = page.locator('text=Sværhedsgrad');
      165 |     
    > 166 |     await expect(page).toHaveScreenshot('06-content-language-mix.png');
          |     ^
      167 |   });
      168 |
      169 |   test('07 - Flashcards: Layout og Data Konsistens', async ({ page }) => {
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:166:5

    attachment #1: 06-content-language-mix-expected.png (image/png) 
    tests/ui-inconsistencies-analysis.spec.js-snapshots/06-content-language-mix-firefox-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #2: 06-content-language-mix-actual.png (image/png) ─
    test-results/ui-inconsistencies-analysi-35d3b-r-Engelsk-Interface-Problem-firefox/06-content-language-mix-actual.png
    ───────────────────────────────────────────────────────────────

    Error Context: test-results/ui-inconsistencies-analysi-35d3b-r-Engelsk-Interface-Problem-firefox/error-context.md


[19/50] …tens Analyse - ExamKlar › 09 - Responsive Design Problemer
  16) [firefox] › tests/ui-inconsistencies-analysis.spec.js:169:3 › UI Inkonsistens Analyse - ExamKlar › 07 - Flashcards: Layout og Data Konsistens 

    Error: Timed out 5000ms waiting for expect(locator).toBeVisible()

    Locator: locator('text="3"')
    Expected: visible
    Received: <element(s) not found>
    Call log:
      - Expect "toBeVisible" with timeout 5000ms
      - waiting for locator('text="3"')


      173 |     
      174 |     // Test data konsistens
    > 175 |     await expect(page.locator('text="3"')).toBeVisible(); // Total cards
          |                                            ^
      176 |     await expect(page.locator('text="0"')).toBeVisible(); // Mastered
      177 |     await expect(page.locator('text=0%')).toBeVisible(); // Success rate
      178 |     
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:175:44

    Error Context: test-results/ui-inconsistencies-analysi-1a529-s-Layout-og-Data-Konsistens-firefox/error-context.md


  17) [firefox] › tests/ui-inconsistencies-analysis.spec.js:44:3 › UI Inkonsistens Analyse - ExamKlar › 02 - Onboarding Flow: Design konsistens (POSITIV) 

    Test timeout of 30000ms exceeded.

    Error: page.click: Test timeout of 30000ms exceeded.
    Call log:
      - waiting for locator('text=Start Onboarding')


      44 |   test('02 - Onboarding Flow: Design konsistens (POSITIV)', async ({ page }) => {
      45 |     // Naviger til onboarding
    > 46 |     await page.click('text=Start Onboarding');
         |                ^
      47 |     await page.waitForURL('**/modules/onboarding/index.html');
      48 |     
      49 |     // Test onboarding step 1
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:46:16

    Error Context: test-results/ui-inconsistencies-analysi-5a92b--Design-konsistens-POSITIV--firefox/error-context.md


[20/50] …nkonsistens Analyse - ExamKlar › 10 - Dark Mode Konsistens
  18) [firefox] › tests/ui-inconsistencies-analysis.spec.js:186:3 › UI Inkonsistens Analyse - ExamKlar › 08 - Navigation Konsistens På Tværs Af Moduler 

    Error: expect(received).toBeGreaterThan(expected)

    Expected: > 0
    Received:   0

      199 |       // Test navigation konsistens
      200 |       const homeLinks = page.locator('text=Forside, text=Tilbage til forside, text=Hjem');
    > 201 |       expect(await homeLinks.count()).toBeGreaterThan(0);
          |                                       ^
      202 |       
      203 |       // Test ExamKlar branding
      204 |       const brandElements = page.locator('text=ExamKlar');
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:201:39

    Error Context: test-results/ui-inconsistencies-analysi-d2b49-sistens-På-Tværs-Af-Moduler-firefox/error-context.md


[21/50] …- ExamKlar › 01 - Hovedside: Layout og branding konsistens
[22/50] …amKlar › 02 - Onboarding Flow: Design konsistens (POSITIV)
  19) [webkit] › tests/ui-inconsistencies-analysis.spec.js:25:3 › UI Inkonsistens Analyse - ExamKlar › 01 - Hovedside: Layout og branding konsistens 

    Error: expect(received).toBeGreaterThan(expected)

    Expected: > 0
    Received:   0

      35 |     const danishElements = page.locator('text=Læringsmoduler');
      36 |     
    > 37 |     expect(await englishElements.count()).toBeGreaterThan(0);
         |                                           ^
      38 |     expect(await danishElements.count()).toBeGreaterThan(0);
      39 |     
      40 |     // Visual snapshot af hovedside
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:37:43

    Error Context: test-results/ui-inconsistencies-analysi-7ee1c-yout-og-branding-konsistens-webkit/error-context.md


[23/50] …se - ExamKlar › 03 - Dashboard: ALVORLIGE Layout Problemer
  20) [webkit] › tests/ui-inconsistencies-analysis.spec.js:81:3 › UI Inkonsistens Analyse - ExamKlar › 03 - Dashboard: ALVORLIGE Layout Problemer 

    Error: expect(received).toBeGreaterThan(expected)

    Expected: > 1
    Received:   0

      86 |     // PROBLEM 1: Overlappende indhold i toppen
      87 |     const exportDataElements = page.locator('text=Export Data');
    > 88 |     expect(await exportDataElements.count()).toBeGreaterThan(1); // Duplikeret
         |                                              ^
      89 |     
      90 |     // PROBLEM 2: Inkonsistent navigation
      91 |     const navigationElements = page.locator('nav[aria-label="Hovednavigation"]');
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:88:46

    Error Context: test-results/ui-inconsistencies-analysi-17ece--ALVORLIGE-Layout-Problemer-webkit/error-context.md


[24/50] …- ExamKlar › 04 - Subjects: Kritisk 404 Fejl og Navigation
  21) [firefox] › tests/ui-inconsistencies-analysis.spec.js:211:3 › UI Inkonsistens Analyse - ExamKlar › 09 - Responsive Design Problemer 

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-dashboard-mobile-small-firefox-darwin.png, writing actual.

      225 |       await page.waitForLoadState('domcontentloaded');
      226 |       
    > 227 |       await expect(page).toHaveScreenshot(`09-responsive-dashboard-${viewport.name}.png`);
          |       ^
      228 |       
      229 |       // Test hovedside
      230 |       await page.goto('/');
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:227:7

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-home-mobile-small-firefox-darwin.png, writing actual.

      231 |       await page.waitForLoadState('domcontentloaded');
      232 |       
    > 233 |       await expect(page).toHaveScreenshot(`09-responsive-home-${viewport.name}.png`);
          |       ^
      234 |     }
      235 |   });
      236 |
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:233:7

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-dashboard-mobile-medium-firefox-darwin.png, writing actual.

      225 |       await page.waitForLoadState('domcontentloaded');
      226 |       
    > 227 |       await expect(page).toHaveScreenshot(`09-responsive-dashboard-${viewport.name}.png`);
          |       ^
      228 |       
      229 |       // Test hovedside
      230 |       await page.goto('/');
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:227:7

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-home-mobile-medium-firefox-darwin.png, writing actual.

      231 |       await page.waitForLoadState('domcontentloaded');
      232 |       
    > 233 |       await expect(page).toHaveScreenshot(`09-responsive-home-${viewport.name}.png`);
          |       ^
      234 |     }
      235 |   });
      236 |
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:233:7

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-dashboard-tablet-firefox-darwin.png, writing actual.

      225 |       await page.waitForLoadState('domcontentloaded');
      226 |       
    > 227 |       await expect(page).toHaveScreenshot(`09-responsive-dashboard-${viewport.name}.png`);
          |       ^
      228 |       
      229 |       // Test hovedside
      230 |       await page.goto('/');
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:227:7

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-home-tablet-firefox-darwin.png, writing actual.

      231 |       await page.waitForLoadState('domcontentloaded');
      232 |       
    > 233 |       await expect(page).toHaveScreenshot(`09-responsive-home-${viewport.name}.png`);
          |       ^
      234 |     }
      235 |   });
      236 |
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:233:7

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-dashboard-tablet-landscape-firefox-darwin.png, writing actual.

      225 |       await page.waitForLoadState('domcontentloaded');
      226 |       
    > 227 |       await expect(page).toHaveScreenshot(`09-responsive-dashboard-${viewport.name}.png`);
          |       ^
      228 |       
      229 |       // Test hovedside
      230 |       await page.goto('/');
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:227:7

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-home-tablet-landscape-firefox-darwin.png, writing actual.

      231 |       await page.waitForLoadState('domcontentloaded');
      232 |       
    > 233 |       await expect(page).toHaveScreenshot(`09-responsive-home-${viewport.name}.png`);
          |       ^
      234 |     }
      235 |   });
      236 |
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:233:7

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-dashboard-desktop-firefox-darwin.png, writing actual.

      225 |       await page.waitForLoadState('domcontentloaded');
      226 |       
    > 227 |       await expect(page).toHaveScreenshot(`09-responsive-dashboard-${viewport.name}.png`);
          |       ^
      228 |       
      229 |       // Test hovedside
      230 |       await page.goto('/');
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:227:7

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-home-desktop-firefox-darwin.png, writing actual.

      231 |       await page.waitForLoadState('domcontentloaded');
      232 |       
    > 233 |       await expect(page).toHaveScreenshot(`09-responsive-home-${viewport.name}.png`);
          |       ^
      234 |     }
      235 |   });
      236 |
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:233:7

    attachment #1: 09-responsive-dashboard-mobile-small-expected.png (image/png) 
    tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-dashboard-mobile-small-firefox-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #2: 09-responsive-dashboard-mobile-small-actual.png (image/png) 
    test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-firefox/09-responsive-dashboard-mobile-small-actual.png
    ───────────────────────────────────────────────────────────────

    attachment #3: 09-responsive-home-mobile-small-expected.png (image/png) 
    tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-home-mobile-small-firefox-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #4: 09-responsive-home-mobile-small-actual.png (image/png) 
    test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-firefox/09-responsive-home-mobile-small-actual.png
    ───────────────────────────────────────────────────────────────

    attachment #5: 09-responsive-dashboard-mobile-medium-expected.png (image/png) 
    tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-dashboard-mobile-medium-firefox-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #6: 09-responsive-dashboard-mobile-medium-actual.png (image/png) 
    test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-firefox/09-responsive-dashboard-mobile-medium-actual.png
    ───────────────────────────────────────────────────────────────

    attachment #7: 09-responsive-home-mobile-medium-expected.png (image/png) 
    tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-home-mobile-medium-firefox-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #8: 09-responsive-home-mobile-medium-actual.png (image/png) 
    test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-firefox/09-responsive-home-mobile-medium-actual.png
    ───────────────────────────────────────────────────────────────

    attachment #9: 09-responsive-dashboard-tablet-expected.png (image/png) 
    tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-dashboard-tablet-firefox-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #10: 09-responsive-dashboard-tablet-actual.png (image/png) 
    test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-firefox/09-responsive-dashboard-tablet-actual.png
    ───────────────────────────────────────────────────────────────

    attachment #11: 09-responsive-home-tablet-expected.png (image/png) 
    tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-home-tablet-firefox-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #12: 09-responsive-home-tablet-actual.png (image/png) 
    test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-firefox/09-responsive-home-tablet-actual.png
    ───────────────────────────────────────────────────────────────

    attachment #13: 09-responsive-dashboard-tablet-landscape-expected.png (image/png) 
    tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-dashboard-tablet-landscape-firefox-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #14: 09-responsive-dashboard-tablet-landscape-actual.png (image/png) 
    test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-firefox/09-responsive-dashboard-tablet-landscape-actual.png
    ───────────────────────────────────────────────────────────────

    attachment #15: 09-responsive-home-tablet-landscape-expected.png (image/png) 
    tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-home-tablet-landscape-firefox-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #16: 09-responsive-home-tablet-landscape-actual.png (image/png) 
    test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-firefox/09-responsive-home-tablet-landscape-actual.png
    ───────────────────────────────────────────────────────────────

    attachment #17: 09-responsive-dashboard-desktop-expected.png (image/png) 
    tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-dashboard-desktop-firefox-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #18: 09-responsive-dashboard-desktop-actual.png (image/png) 
    test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-firefox/09-responsive-dashboard-desktop-actual.png
    ───────────────────────────────────────────────────────────────

    attachment #19: 09-responsive-home-desktop-expected.png (image/png) 
    tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-home-desktop-firefox-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #20: 09-responsive-home-desktop-actual.png (image/png) 
    test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-firefox/09-responsive-home-desktop-actual.png
    ───────────────────────────────────────────────────────────────

    Error Context: test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-firefox/error-context.md


  22) [webkit] › tests/ui-inconsistencies-analysis.spec.js:106:3 › UI Inkonsistens Analyse - ExamKlar › 04 - Subjects: Kritisk 404 Fejl og Navigation 

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/04-subjects-layout-webkit-darwin.png, writing actual.

      128 |     
      129 |     // Test normal subjects layout
    > 130 |     await expect(page).toHaveScreenshot('04-subjects-layout.png');
          |     ^
      131 |   });
      132 |
      133 |   test('05 - Quiz: Data Format Inkonsistenser', async ({ page }) => {
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:130:5

    attachment #1: 04-subjects-layout-expected.png (image/png) ────
    tests/ui-inconsistencies-analysis.spec.js-snapshots/04-subjects-layout-webkit-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #2: 04-subjects-layout-actual.png (image/png) ──────
    test-results/ui-inconsistencies-analysi-2462b-tisk-404-Fejl-og-Navigation-webkit/04-subjects-layout-actual.png
    ───────────────────────────────────────────────────────────────

    Error Context: test-results/ui-inconsistencies-analysi-2462b-tisk-404-Fejl-og-Navigation-webkit/error-context.md


[25/50] …Analyse - ExamKlar › 05 - Quiz: Data Format Inkonsistenser
[26/50] …ExamKlar › 06 - Content Manager: Engelsk Interface Problem
  23) [webkit] › tests/ui-inconsistencies-analysis.spec.js:133:3 › UI Inkonsistens Analyse - ExamKlar › 05 - Quiz: Data Format Inkonsistenser 

    Error: expect(received).toBeGreaterThan(expected)

    Expected: > 0
    Received:   0

      138 |     // PROBLEM: NaN værdi i statistikker
      139 |     const nanElement = page.locator('text=NaN');
    > 140 |     expect(await nanElement.count()).toBeGreaterThan(0);
          |                                      ^
      141 |     
      142 |     // PROBLEM: Inkonsistent tal formatering
      143 |     const numberElements = page.locator('text="2"');
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:140:38

    Error Context: test-results/ui-inconsistencies-analysi-505b2--Data-Format-Inkonsistenser-webkit/error-context.md


  24) [webkit] › tests/ui-inconsistencies-analysis.spec.js:153:3 › UI Inkonsistens Analyse - ExamKlar › 06 - Content Manager: Engelsk Interface Problem 

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/06-content-language-mix-webkit-darwin.png, writing actual.

      164 |     const danishContent = page.locator('text=Sværhedsgrad');
      165 |     
    > 166 |     await expect(page).toHaveScreenshot('06-content-language-mix.png');
          |     ^
      167 |   });
      168 |
      169 |   test('07 - Flashcards: Layout og Data Konsistens', async ({ page }) => {
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:166:5

    attachment #1: 06-content-language-mix-expected.png (image/png) 
    tests/ui-inconsistencies-analysis.spec.js-snapshots/06-content-language-mix-webkit-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #2: 06-content-language-mix-actual.png (image/png) ─
    test-results/ui-inconsistencies-analysi-35d3b-r-Engelsk-Interface-Problem-webkit/06-content-language-mix-actual.png
    ───────────────────────────────────────────────────────────────

    Error Context: test-results/ui-inconsistencies-analysi-35d3b-r-Engelsk-Interface-Problem-webkit/error-context.md


[27/50] …se - ExamKlar › 07 - Flashcards: Layout og Data Konsistens
[28/50] … ExamKlar › 08 - Navigation Konsistens På Tværs Af Moduler
  25) [webkit] › tests/ui-inconsistencies-analysis.spec.js:186:3 › UI Inkonsistens Analyse - ExamKlar › 08 - Navigation Konsistens På Tværs Af Moduler 

    Error: expect(received).toBeGreaterThan(expected)

    Expected: > 0
    Received:   0

      199 |       // Test navigation konsistens
      200 |       const homeLinks = page.locator('text=Forside, text=Tilbage til forside, text=Hjem');
    > 201 |       expect(await homeLinks.count()).toBeGreaterThan(0);
          |                                       ^
      202 |       
      203 |       // Test ExamKlar branding
      204 |       const brandElements = page.locator('text=ExamKlar');
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:201:39

    Error Context: test-results/ui-inconsistencies-analysi-d2b49-sistens-På-Tværs-Af-Moduler-webkit/error-context.md


[29/50] …tens Analyse - ExamKlar › 09 - Responsive Design Problemer
  26) [webkit] › tests/ui-inconsistencies-analysis.spec.js:169:3 › UI Inkonsistens Analyse - ExamKlar › 07 - Flashcards: Layout og Data Konsistens 

    Error: Timed out 5000ms waiting for expect(locator).toBeVisible()

    Locator: locator('text="3"')
    Expected: visible
    Received: <element(s) not found>
    Call log:
      - Expect "toBeVisible" with timeout 5000ms
      - waiting for locator('text="3"')


      173 |     
      174 |     // Test data konsistens
    > 175 |     await expect(page.locator('text="3"')).toBeVisible(); // Total cards
          |                                            ^
      176 |     await expect(page.locator('text="0"')).toBeVisible(); // Mastered
      177 |     await expect(page.locator('text=0%')).toBeVisible(); // Success rate
      178 |     
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:175:44

    Error Context: test-results/ui-inconsistencies-analysi-1a529-s-Layout-og-Data-Konsistens-webkit/error-context.md


[30/50] …nkonsistens Analyse - ExamKlar › 10 - Dark Mode Konsistens
  27) [webkit] › tests/ui-inconsistencies-analysis.spec.js:211:3 › UI Inkonsistens Analyse - ExamKlar › 09 - Responsive Design Problemer 

    Error: Timed out 5000ms waiting for expect(page).toHaveScreenshot(expected)

      Failed to take two consecutive stable screenshots.
    Previous: /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-webkit/09-responsive-dashboard-mobile-small-previous.png
    Received: /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-webkit/09-responsive-dashboard-mobile-small-actual.png
        Diff: /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-webkit/09-responsive-dashboard-mobile-small-diff.png

    Call log:
      - Expect "toHaveScreenshot(09-responsive-dashboard-mobile-small.png)" with timeout 5000ms
        - generating new stable screenshot expectation
      - taking page screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - waiting 100ms before taking screenshot
      - taking page screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - 60 pixels (ratio 0.01 of all image pixels) are different.
      - waiting 250ms before taking screenshot
      - taking page screenshot
        - disabled all CSS animations
      - waiting for fonts to load...
      - fonts loaded
      - 60 pixels (ratio 0.01 of all image pixels) are different.
      - waiting 500ms before taking screenshot
      4 × taking page screenshot
          - disabled all CSS animations
        - waiting for fonts to load...
        - fonts loaded
        - 60 pixels (ratio 0.01 of all image pixels) are different.
        - waiting 1000ms before taking screenshot
      - Timeout 5000ms exceeded.


      225 |       await page.waitForLoadState('domcontentloaded');
      226 |       
    > 227 |       await expect(page).toHaveScreenshot(`09-responsive-dashboard-${viewport.name}.png`);
          |                          ^
      228 |       
      229 |       // Test hovedside
      230 |       await page.goto('/');
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:227:26

    attachment #1: 09-responsive-dashboard-mobile-small-previous.png (image/png) 
    test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-webkit/09-responsive-dashboard-mobile-small-previous.png
    ───────────────────────────────────────────────────────────────

    attachment #2: 09-responsive-dashboard-mobile-small-actual.png (image/png) 
    test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-webkit/09-responsive-dashboard-mobile-small-actual.png
    ───────────────────────────────────────────────────────────────

    attachment #3: 09-responsive-dashboard-mobile-small-diff.png (image/png) 
    test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-webkit/09-responsive-dashboard-mobile-small-diff.png
    ───────────────────────────────────────────────────────────────

    Error Context: test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-webkit/error-context.md


[31/50] …- ExamKlar › 01 - Hovedside: Layout og branding konsistens
  28) [webkit] › tests/ui-inconsistencies-analysis.spec.js:44:3 › UI Inkonsistens Analyse - ExamKlar › 02 - Onboarding Flow: Design konsistens (POSITIV) 

    Test timeout of 30000ms exceeded.

    Error: page.click: Test timeout of 30000ms exceeded.
    Call log:
      - waiting for locator('text=Start Onboarding')


      44 |   test('02 - Onboarding Flow: Design konsistens (POSITIV)', async ({ page }) => {
      45 |     // Naviger til onboarding
    > 46 |     await page.click('text=Start Onboarding');
         |                ^
      47 |     await page.waitForURL('**/modules/onboarding/index.html');
      48 |     
      49 |     // Test onboarding step 1
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:46:16

    Error Context: test-results/ui-inconsistencies-analysi-5a92b--Design-konsistens-POSITIV--webkit/error-context.md


  29) [Mobile Chrome] › tests/ui-inconsistencies-analysis.spec.js:25:3 › UI Inkonsistens Analyse - ExamKlar › 01 - Hovedside: Layout og branding konsistens 

    Error: expect(received).toBeGreaterThan(expected)

    Expected: > 0
    Received:   0

      35 |     const danishElements = page.locator('text=Læringsmoduler');
      36 |     
    > 37 |     expect(await englishElements.count()).toBeGreaterThan(0);
         |                                           ^
      38 |     expect(await danishElements.count()).toBeGreaterThan(0);
      39 |     
      40 |     // Visual snapshot af hovedside
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:37:43

    Error Context: test-results/ui-inconsistencies-analysi-7ee1c-yout-og-branding-konsistens-Mobile-Chrome/error-context.md


[32/50] …amKlar › 02 - Onboarding Flow: Design konsistens (POSITIV)
  30) [firefox] › tests/ui-inconsistencies-analysis.spec.js:237:3 › UI Inkonsistens Analyse - ExamKlar › 10 - Dark Mode Konsistens 

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/10-light-mode-home-firefox-darwin.png, writing actual.

      237 |   test('10 - Dark Mode Konsistens', async ({ page }) => {
      238 |     // Test light mode først
    > 239 |     await expect(page).toHaveScreenshot('10-light-mode-home.png');
          |     ^
      240 |     
      241 |     // Skift til dark mode
      242 |     await page.click('button[aria-label*="mørk"], button[aria-label*="dark"]');
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:239:5

    Test timeout of 30000ms exceeded.

    Error: page.click: Test ended.
    Call log:
      - waiting for locator('button[aria-label*="mørk"], button[aria-label*="dark"]')


      240 |     
      241 |     // Skift til dark mode
    > 242 |     await page.click('button[aria-label*="mørk"], button[aria-label*="dark"]');
          |                ^
      243 |     await page.waitForTimeout(500);
      244 |     
      245 |     await expect(page).toHaveScreenshot('10-dark-mode-home.png');
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:242:16

    attachment #1: 10-light-mode-home-expected.png (image/png) ────
    tests/ui-inconsistencies-analysis.spec.js-snapshots/10-light-mode-home-firefox-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #2: 10-light-mode-home-actual.png (image/png) ──────
    test-results/ui-inconsistencies-analysi-9f6c4-r-10---Dark-Mode-Konsistens-firefox/10-light-mode-home-actual.png
    ───────────────────────────────────────────────────────────────

    Error Context: test-results/ui-inconsistencies-analysi-9f6c4-r-10---Dark-Mode-Konsistens-firefox/error-context.md


[33/50] …se - ExamKlar › 03 - Dashboard: ALVORLIGE Layout Problemer
[34/50] …- ExamKlar › 04 - Subjects: Kritisk 404 Fejl og Navigation
  31) [Mobile Chrome] › tests/ui-inconsistencies-analysis.spec.js:81:3 › UI Inkonsistens Analyse - ExamKlar › 03 - Dashboard: ALVORLIGE Layout Problemer 

    Error: expect(received).toBeGreaterThan(expected)

    Expected: > 1
    Received:   0

      86 |     // PROBLEM 1: Overlappende indhold i toppen
      87 |     const exportDataElements = page.locator('text=Export Data');
    > 88 |     expect(await exportDataElements.count()).toBeGreaterThan(1); // Duplikeret
         |                                              ^
      89 |     
      90 |     // PROBLEM 2: Inkonsistent navigation
      91 |     const navigationElements = page.locator('nav[aria-label="Hovednavigation"]');
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:88:46

    Error Context: test-results/ui-inconsistencies-analysi-17ece--ALVORLIGE-Layout-Problemer-Mobile-Chrome/error-context.md


[35/50] …Analyse - ExamKlar › 05 - Quiz: Data Format Inkonsistenser
  32) [Mobile Chrome] › tests/ui-inconsistencies-analysis.spec.js:106:3 › UI Inkonsistens Analyse - ExamKlar › 04 - Subjects: Kritisk 404 Fejl og Navigation 

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/04-subjects-layout-Mobile-Chrome-darwin.png, writing actual.

      128 |     
      129 |     // Test normal subjects layout
    > 130 |     await expect(page).toHaveScreenshot('04-subjects-layout.png');
          |     ^
      131 |   });
      132 |
      133 |   test('05 - Quiz: Data Format Inkonsistenser', async ({ page }) => {
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:130:5

    attachment #1: 04-subjects-layout-expected.png (image/png) ────
    tests/ui-inconsistencies-analysis.spec.js-snapshots/04-subjects-layout-Mobile-Chrome-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #2: 04-subjects-layout-actual.png (image/png) ──────
    test-results/ui-inconsistencies-analysi-2462b-tisk-404-Fejl-og-Navigation-Mobile-Chrome/04-subjects-layout-actual.png
    ───────────────────────────────────────────────────────────────

    Error Context: test-results/ui-inconsistencies-analysi-2462b-tisk-404-Fejl-og-Navigation-Mobile-Chrome/error-context.md


  33) [Mobile Chrome] › tests/ui-inconsistencies-analysis.spec.js:133:3 › UI Inkonsistens Analyse - ExamKlar › 05 - Quiz: Data Format Inkonsistenser 

    Error: expect(received).toBeGreaterThan(expected)

    Expected: > 0
    Received:   0

      138 |     // PROBLEM: NaN værdi i statistikker
      139 |     const nanElement = page.locator('text=NaN');
    > 140 |     expect(await nanElement.count()).toBeGreaterThan(0);
          |                                      ^
      141 |     
      142 |     // PROBLEM: Inkonsistent tal formatering
      143 |     const numberElements = page.locator('text="2"');
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:140:38

    Error Context: test-results/ui-inconsistencies-analysi-505b2--Data-Format-Inkonsistenser-Mobile-Chrome/error-context.md


[36/50] …ExamKlar › 06 - Content Manager: Engelsk Interface Problem
[37/50] …se - ExamKlar › 07 - Flashcards: Layout og Data Konsistens
  34) [Mobile Chrome] › tests/ui-inconsistencies-analysis.spec.js:153:3 › UI Inkonsistens Analyse - ExamKlar › 06 - Content Manager: Engelsk Interface Problem 

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/06-content-language-mix-Mobile-Chrome-darwin.png, writing actual.

      164 |     const danishContent = page.locator('text=Sværhedsgrad');
      165 |     
    > 166 |     await expect(page).toHaveScreenshot('06-content-language-mix.png');
          |     ^
      167 |   });
      168 |
      169 |   test('07 - Flashcards: Layout og Data Konsistens', async ({ page }) => {
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:166:5

    attachment #1: 06-content-language-mix-expected.png (image/png) 
    tests/ui-inconsistencies-analysis.spec.js-snapshots/06-content-language-mix-Mobile-Chrome-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #2: 06-content-language-mix-actual.png (image/png) ─
    test-results/ui-inconsistencies-analysi-35d3b-r-Engelsk-Interface-Problem-Mobile-Chrome/06-content-language-mix-actual.png
    ───────────────────────────────────────────────────────────────

    Error Context: test-results/ui-inconsistencies-analysi-35d3b-r-Engelsk-Interface-Problem-Mobile-Chrome/error-context.md


[38/50] … ExamKlar › 08 - Navigation Konsistens På Tværs Af Moduler
  35) [Mobile Chrome] › tests/ui-inconsistencies-analysis.spec.js:186:3 › UI Inkonsistens Analyse - ExamKlar › 08 - Navigation Konsistens På Tværs Af Moduler 

    Error: expect(received).toBeGreaterThan(expected)

    Expected: > 0
    Received:   0

      199 |       // Test navigation konsistens
      200 |       const homeLinks = page.locator('text=Forside, text=Tilbage til forside, text=Hjem');
    > 201 |       expect(await homeLinks.count()).toBeGreaterThan(0);
          |                                       ^
      202 |       
      203 |       // Test ExamKlar branding
      204 |       const brandElements = page.locator('text=ExamKlar');
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:201:39

    Error Context: test-results/ui-inconsistencies-analysi-d2b49-sistens-På-Tværs-Af-Moduler-Mobile-Chrome/error-context.md


[39/50] …tens Analyse - ExamKlar › 09 - Responsive Design Problemer
  36) [Mobile Chrome] › tests/ui-inconsistencies-analysis.spec.js:169:3 › UI Inkonsistens Analyse - ExamKlar › 07 - Flashcards: Layout og Data Konsistens 

    Error: Timed out 5000ms waiting for expect(locator).toBeVisible()

    Locator: locator('text="3"')
    Expected: visible
    Received: <element(s) not found>
    Call log:
      - Expect "toBeVisible" with timeout 5000ms
      - waiting for locator('text="3"')


      173 |     
      174 |     // Test data konsistens
    > 175 |     await expect(page.locator('text="3"')).toBeVisible(); // Total cards
          |                                            ^
      176 |     await expect(page.locator('text="0"')).toBeVisible(); // Mastered

      177 |     await expect(page.locator('text=0%')).toBeVisible(); // Success rate
      178 |     
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:175:44

    Error Context: test-results/ui-inconsistencies-analysi-1a529-s-Layout-og-Data-Konsistens-Mobile-Chrome/error-context.md


[40/50] …nkonsistens Analyse - ExamKlar › 10 - Dark Mode Konsistens
  37) [Mobile Chrome] › tests/ui-inconsistencies-analysis.spec.js:211:3 › UI Inkonsistens Analyse - ExamKlar › 09 - Responsive Design Problemer 

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-dashboard-mobile-small-Mobile-Chrome-darwin.png, writing actual.

      225 |       await page.waitForLoadState('domcontentloaded');
      226 |       
    > 227 |       await expect(page).toHaveScreenshot(`09-responsive-dashboard-${viewport.name}.png`);
          |       ^
      228 |       
      229 |       // Test hovedside
      230 |       await page.goto('/');
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:227:7

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-home-mobile-small-Mobile-Chrome-darwin.png, writing actual.

      231 |       await page.waitForLoadState('domcontentloaded');
      232 |       
    > 233 |       await expect(page).toHaveScreenshot(`09-responsive-home-${viewport.name}.png`);
          |       ^
      234 |     }
      235 |   });
      236 |
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:233:7

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-dashboard-mobile-medium-Mobile-Chrome-darwin.png, writing actual.

      225 |       await page.waitForLoadState('domcontentloaded');
      226 |       
    > 227 |       await expect(page).toHaveScreenshot(`09-responsive-dashboard-${viewport.name}.png`);
          |       ^
      228 |       
      229 |       // Test hovedside
      230 |       await page.goto('/');
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:227:7

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-home-mobile-medium-Mobile-Chrome-darwin.png, writing actual.

      231 |       await page.waitForLoadState('domcontentloaded');
      232 |       
    > 233 |       await expect(page).toHaveScreenshot(`09-responsive-home-${viewport.name}.png`);
          |       ^
      234 |     }
      235 |   });
      236 |
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:233:7

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-dashboard-tablet-Mobile-Chrome-darwin.png, writing actual.

      225 |       await page.waitForLoadState('domcontentloaded');
      226 |       
    > 227 |       await expect(page).toHaveScreenshot(`09-responsive-dashboard-${viewport.name}.png`);
          |       ^
      228 |       
      229 |       // Test hovedside
      230 |       await page.goto('/');
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:227:7

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-home-tablet-Mobile-Chrome-darwin.png, writing actual.

      231 |       await page.waitForLoadState('domcontentloaded');
      232 |       
    > 233 |       await expect(page).toHaveScreenshot(`09-responsive-home-${viewport.name}.png`);
          |       ^
      234 |     }
      235 |   });
      236 |
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:233:7

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-dashboard-tablet-landscape-Mobile-Chrome-darwin.png, writing actual.

      225 |       await page.waitForLoadState('domcontentloaded');
      226 |       
    > 227 |       await expect(page).toHaveScreenshot(`09-responsive-dashboard-${viewport.name}.png`);
          |       ^
      228 |       
      229 |       // Test hovedside
      230 |       await page.goto('/');
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:227:7

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-home-tablet-landscape-Mobile-Chrome-darwin.png, writing actual.

      231 |       await page.waitForLoadState('domcontentloaded');
      232 |       
    > 233 |       await expect(page).toHaveScreenshot(`09-responsive-home-${viewport.name}.png`);
          |       ^
      234 |     }
      235 |   });
      236 |
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:233:7

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-dashboard-desktop-Mobile-Chrome-darwin.png, writing actual.

      225 |       await page.waitForLoadState('domcontentloaded');
      226 |       
    > 227 |       await expect(page).toHaveScreenshot(`09-responsive-dashboard-${viewport.name}.png`);
          |       ^
      228 |       
      229 |       // Test hovedside
      230 |       await page.goto('/');
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:227:7

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-home-desktop-Mobile-Chrome-darwin.png, writing actual.

      231 |       await page.waitForLoadState('domcontentloaded');
      232 |       
    > 233 |       await expect(page).toHaveScreenshot(`09-responsive-home-${viewport.name}.png`);
          |       ^
      234 |     }
      235 |   });
      236 |
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:233:7

    attachment #1: 09-responsive-dashboard-mobile-small-expected.png (image/png) 
    tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-dashboard-mobile-small-Mobile-Chrome-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #2: 09-responsive-dashboard-mobile-small-actual.png (image/png) 
    test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-Mobile-Chrome/09-responsive-dashboard-mobile-small-actual.png
    ───────────────────────────────────────────────────────────────

    attachment #3: 09-responsive-home-mobile-small-expected.png (image/png) 
    tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-home-mobile-small-Mobile-Chrome-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #4: 09-responsive-home-mobile-small-actual.png (image/png) 
    test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-Mobile-Chrome/09-responsive-home-mobile-small-actual.png
    ───────────────────────────────────────────────────────────────

    attachment #5: 09-responsive-dashboard-mobile-medium-expected.png (image/png) 
    tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-dashboard-mobile-medium-Mobile-Chrome-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #6: 09-responsive-dashboard-mobile-medium-actual.png (image/png) 
    test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-Mobile-Chrome/09-responsive-dashboard-mobile-medium-actual.png
    ───────────────────────────────────────────────────────────────

    attachment #7: 09-responsive-home-mobile-medium-expected.png (image/png) 
    tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-home-mobile-medium-Mobile-Chrome-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #8: 09-responsive-home-mobile-medium-actual.png (image/png) 
    test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-Mobile-Chrome/09-responsive-home-mobile-medium-actual.png
    ───────────────────────────────────────────────────────────────


    attachment #9: 09-responsive-dashboard-tablet-expected.png (image/png) 
    tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-dashboard-tablet-Mobile-Chrome-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #10: 09-responsive-dashboard-tablet-actual.png (image/png) 
    test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-Mobile-Chrome/09-responsive-dashboard-tablet-actual.png
    ───────────────────────────────────────────────────────────────

    attachment #11: 09-responsive-home-tablet-expected.png (image/png) 
    tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-home-tablet-Mobile-Chrome-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #12: 09-responsive-home-tablet-actual.png (image/png) 
    test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-Mobile-Chrome/09-responsive-home-tablet-actual.png
    ───────────────────────────────────────────────────────────────

    attachment #13: 09-responsive-dashboard-tablet-landscape-expected.png (image/png) 
    tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-dashboard-tablet-landscape-Mobile-Chrome-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #14: 09-responsive-dashboard-tablet-landscape-actual.png (image/png) 
    test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-Mobile-Chrome/09-responsive-dashboard-tablet-landscape-actual.png
    ───────────────────────────────────────────────────────────────

    attachment #15: 09-responsive-home-tablet-landscape-expected.png (image/png) 
    tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-home-tablet-landscape-Mobile-Chrome-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #16: 09-responsive-home-tablet-landscape-actual.png (image/png) 
    test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-Mobile-Chrome/09-responsive-home-tablet-landscape-actual.png
    ───────────────────────────────────────────────────────────────

    attachment #17: 09-responsive-dashboard-desktop-expected.png (image/png) 
    tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-dashboard-desktop-Mobile-Chrome-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #18: 09-responsive-dashboard-desktop-actual.png (image/png) 
    test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-Mobile-Chrome/09-responsive-dashboard-desktop-actual.png
    ───────────────────────────────────────────────────────────────

    attachment #19: 09-responsive-home-desktop-expected.png (image/png) 
    tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-home-desktop-Mobile-Chrome-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #20: 09-responsive-home-desktop-actual.png (image/png) 
    test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-Mobile-Chrome/09-responsive-home-desktop-actual.png
    ───────────────────────────────────────────────────────────────

    Error Context: test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-Mobile-Chrome/error-context.md


[41/50] …- ExamKlar › 01 - Hovedside: Layout og branding konsistens
  38) [Mobile Safari] › tests/ui-inconsistencies-analysis.spec.js:25:3 › UI Inkonsistens Analyse - ExamKlar › 01 - Hovedside: Layout og branding konsistens 

    Error: expect(received).toBeGreaterThan(expected)

    Expected: > 0
    Received:   0

      35 |     const danishElements = page.locator('text=Læringsmoduler');
      36 |     
    > 37 |     expect(await englishElements.count()).toBeGreaterThan(0);
         |                                           ^
      38 |     expect(await danishElements.count()).toBeGreaterThan(0);
      39 |     
      40 |     // Visual snapshot af hovedside
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:37:43

    Error Context: test-results/ui-inconsistencies-analysi-7ee1c-yout-og-branding-konsistens-Mobile-Safari/error-context.md


[42/50] …amKlar › 02 - Onboarding Flow: Design konsistens (POSITIV)
  39) [webkit] › tests/ui-inconsistencies-analysis.spec.js:237:3 › UI Inkonsistens Analyse - ExamKlar › 10 - Dark Mode Konsistens 

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/10-light-mode-home-webkit-darwin.png, writing actual.

      237 |   test('10 - Dark Mode Konsistens', async ({ page }) => {
      238 |     // Test light mode først
    > 239 |     await expect(page).toHaveScreenshot('10-light-mode-home.png');
          |     ^
      240 |     
      241 |     // Skift til dark mode
      242 |     await page.click('button[aria-label*="mørk"], button[aria-label*="dark"]');
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:239:5

    Test timeout of 30000ms exceeded.

    Error: page.click: Test ended.
    Call log:
      - waiting for locator('button[aria-label*="mørk"], button[aria-label*="dark"]')


      240 |     
      241 |     // Skift til dark mode
    > 242 |     await page.click('button[aria-label*="mørk"], button[aria-label*="dark"]');
          |                ^
      243 |     await page.waitForTimeout(500);
      244 |     
      245 |     await expect(page).toHaveScreenshot('10-dark-mode-home.png');
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:242:16

    attachment #1: 10-light-mode-home-expected.png (image/png) ────
    tests/ui-inconsistencies-analysis.spec.js-snapshots/10-light-mode-home-webkit-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #2: 10-light-mode-home-actual.png (image/png) ──────
    test-results/ui-inconsistencies-analysi-9f6c4-r-10---Dark-Mode-Konsistens-webkit/10-light-mode-home-actual.png
    ───────────────────────────────────────────────────────────────

    Error Context: test-results/ui-inconsistencies-analysi-9f6c4-r-10---Dark-Mode-Konsistens-webkit/error-context.md


[43/50] …se - ExamKlar › 03 - Dashboard: ALVORLIGE Layout Problemer
  40) [Mobile Safari] › tests/ui-inconsistencies-analysis.spec.js:81:3 › UI Inkonsistens Analyse - ExamKlar › 03 - Dashboard: ALVORLIGE Layout Problemer 

    Error: expect(received).toBeGreaterThan(expected)

    Expected: > 1
    Received:   0

      86 |     // PROBLEM 1: Overlappende indhold i toppen
      87 |     const exportDataElements = page.locator('text=Export Data');
    > 88 |     expect(await exportDataElements.count()).toBeGreaterThan(1); // Duplikeret
         |                                              ^
      89 |     
      90 |     // PROBLEM 2: Inkonsistent navigation
      91 |     const navigationElements = page.locator('nav[aria-label="Hovednavigation"]');
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:88:46

    Error Context: test-results/ui-inconsistencies-analysi-17ece--ALVORLIGE-Layout-Problemer-Mobile-Safari/error-context.md


[44/50] …- ExamKlar › 04 - Subjects: Kritisk 404 Fejl og Navigation
  41) [Mobile Safari] › tests/ui-inconsistencies-analysis.spec.js:106:3 › UI Inkonsistens Analyse - ExamKlar › 04 - Subjects: Kritisk 404 Fejl og Navigation 

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/04-subjects-layout-Mobile-Safari-darwin.png, writing actual.

      128 |     
      129 |     // Test normal subjects layout
    > 130 |     await expect(page).toHaveScreenshot('04-subjects-layout.png');
          |     ^
      131 |   });
      132 |
      133 |   test('05 - Quiz: Data Format Inkonsistenser', async ({ page }) => {
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:130:5

    attachment #1: 04-subjects-layout-expected.png (image/png) ────
    tests/ui-inconsistencies-analysis.spec.js-snapshots/04-subjects-layout-Mobile-Safari-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #2: 04-subjects-layout-actual.png (image/png) ──────
    test-results/ui-inconsistencies-analysi-2462b-tisk-404-Fejl-og-Navigation-Mobile-Safari/04-subjects-layout-actual.png
    ───────────────────────────────────────────────────────────────

    Error Context: test-results/ui-inconsistencies-analysi-2462b-tisk-404-Fejl-og-Navigation-Mobile-Safari/error-context.md


  42) [Mobile Chrome] › tests/ui-inconsistencies-analysis.spec.js:44:3 › UI Inkonsistens Analyse - ExamKlar › 02 - Onboarding Flow: Design konsistens (POSITIV) 

    Test timeout of 30000ms exceeded.

    Error: page.click: Test timeout of 30000ms exceeded.
    Call log:
      - waiting for locator('text=Start Onboarding')


      44 |   test('02 - Onboarding Flow: Design konsistens (POSITIV)', async ({ page }) => {
      45 |     // Naviger til onboarding
    > 46 |     await page.click('text=Start Onboarding');
         |                ^
      47 |     await page.waitForURL('**/modules/onboarding/index.html');
      48 |     
      49 |     // Test onboarding step 1
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:46:16

    Error Context: test-results/ui-inconsistencies-analysi-5a92b--Design-konsistens-POSITIV--Mobile-Chrome/error-context.md


[45/50] …Analyse - ExamKlar › 05 - Quiz: Data Format Inkonsistenser
[46/50] …ExamKlar › 06 - Content Manager: Engelsk Interface Problem
  43) [Mobile Safari] › tests/ui-inconsistencies-analysis.spec.js:133:3 › UI Inkonsistens Analyse - ExamKlar › 05 - Quiz: Data Format Inkonsistenser 

    Error: expect(received).toBeGreaterThan(expected)

    Expected: > 0
    Received:   0

      138 |     // PROBLEM: NaN værdi i statistikker
      139 |     const nanElement = page.locator('text=NaN');
    > 140 |     expect(await nanElement.count()).toBeGreaterThan(0);
          |                                      ^
      141 |     
      142 |     // PROBLEM: Inkonsistent tal formatering
      143 |     const numberElements = page.locator('text="2"');
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:140:38

    Error Context: test-results/ui-inconsistencies-analysi-505b2--Data-Format-Inkonsistenser-Mobile-Safari/error-context.md


[47/50] …se - ExamKlar › 07 - Flashcards: Layout og Data Konsistens
  44) [Mobile Safari] › tests/ui-inconsistencies-analysis.spec.js:153:3 › UI Inkonsistens Analyse - ExamKlar › 06 - Content Manager: Engelsk Interface Problem 

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/06-content-language-mix-Mobile-Safari-darwin.png, writing actual.

      164 |     const danishContent = page.locator('text=Sværhedsgrad');
      165 |     
    > 166 |     await expect(page).toHaveScreenshot('06-content-language-mix.png');
          |     ^
      167 |   });
      168 |
      169 |   test('07 - Flashcards: Layout og Data Konsistens', async ({ page }) => {
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:166:5

    attachment #1: 06-content-language-mix-expected.png (image/png) 
    tests/ui-inconsistencies-analysis.spec.js-snapshots/06-content-language-mix-Mobile-Safari-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #2: 06-content-language-mix-actual.png (image/png) ─
    test-results/ui-inconsistencies-analysi-35d3b-r-Engelsk-Interface-Problem-Mobile-Safari/06-content-language-mix-actual.png
    ───────────────────────────────────────────────────────────────

    Error Context: test-results/ui-inconsistencies-analysi-35d3b-r-Engelsk-Interface-Problem-Mobile-Safari/error-context.md


[48/50] … ExamKlar › 08 - Navigation Konsistens På Tværs Af Moduler
  45) [Mobile Safari] › tests/ui-inconsistencies-analysis.spec.js:186:3 › UI Inkonsistens Analyse - ExamKlar › 08 - Navigation Konsistens På Tværs Af Moduler 

    Error: expect(received).toBeGreaterThan(expected)

    Expected: > 0
    Received:   0

      199 |       // Test navigation konsistens
      200 |       const homeLinks = page.locator('text=Forside, text=Tilbage til forside, text=Hjem');
    > 201 |       expect(await homeLinks.count()).toBeGreaterThan(0);
          |                                       ^
      202 |       
      203 |       // Test ExamKlar branding
      204 |       const brandElements = page.locator('text=ExamKlar');
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:201:39

    Error Context: test-results/ui-inconsistencies-analysi-d2b49-sistens-På-Tværs-Af-Moduler-Mobile-Safari/error-context.md


[49/50] …tens Analyse - ExamKlar › 09 - Responsive Design Problemer
  46) [Mobile Safari] › tests/ui-inconsistencies-analysis.spec.js:169:3 › UI Inkonsistens Analyse - ExamKlar › 07 - Flashcards: Layout og Data Konsistens 

    Error: Timed out 5000ms waiting for expect(locator).toBeVisible()

    Locator: locator('text="3"')
    Expected: visible
    Received: <element(s) not found>
    Call log:
      - Expect "toBeVisible" with timeout 5000ms
      - waiting for locator('text="3"')


      173 |     
      174 |     // Test data konsistens
    > 175 |     await expect(page.locator('text="3"')).toBeVisible(); // Total cards
          |                                            ^
      176 |     await expect(page.locator('text="0"')).toBeVisible(); // Mastered
      177 |     await expect(page.locator('text=0%')).toBeVisible(); // Success rate
      178 |     
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:175:44

    Error Context: test-results/ui-inconsistencies-analysi-1a529-s-Layout-og-Data-Konsistens-Mobile-Safari/error-context.md


  47) [Mobile Chrome] › tests/ui-inconsistencies-analysis.spec.js:237:3 › UI Inkonsistens Analyse - ExamKlar › 10 - Dark Mode Konsistens 

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/10-light-mode-home-Mobile-Chrome-darwin.png, writing actual.

      237 |   test('10 - Dark Mode Konsistens', async ({ page }) => {
      238 |     // Test light mode først
    > 239 |     await expect(page).toHaveScreenshot('10-light-mode-home.png');
          |     ^
      240 |     
      241 |     // Skift til dark mode
      242 |     await page.click('button[aria-label*="mørk"], button[aria-label*="dark"]');
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:239:5

    Test timeout of 30000ms exceeded.

    Error: page.click: Test ended.
    Call log:
      - waiting for locator('button[aria-label*="mørk"], button[aria-label*="dark"]')


      240 |     
      241 |     // Skift til dark mode
    > 242 |     await page.click('button[aria-label*="mørk"], button[aria-label*="dark"]');
          |                ^
      243 |     await page.waitForTimeout(500);
      244 |     
      245 |     await expect(page).toHaveScreenshot('10-dark-mode-home.png');
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:242:16

    attachment #1: 10-light-mode-home-expected.png (image/png) ────
    tests/ui-inconsistencies-analysis.spec.js-snapshots/10-light-mode-home-Mobile-Chrome-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #2: 10-light-mode-home-actual.png (image/png) ──────
    test-results/ui-inconsistencies-analysi-9f6c4-r-10---Dark-Mode-Konsistens-Mobile-Chrome/10-light-mode-home-actual.png
    ───────────────────────────────────────────────────────────────

    Error Context: test-results/ui-inconsistencies-analysi-9f6c4-r-10---Dark-Mode-Konsistens-Mobile-Chrome/error-context.md


[50/50] …nkonsistens Analyse - ExamKlar › 10 - Dark Mode Konsistens
  48) [Mobile Safari] › tests/ui-inconsistencies-analysis.spec.js:44:3 › UI Inkonsistens Analyse - ExamKlar › 02 - Onboarding Flow: Design konsistens (POSITIV) 

    Test timeout of 30000ms exceeded.

    Error: page.click: Test timeout of 30000ms exceeded.
    Call log:
      - waiting for locator('text=Start Onboarding')


      44 |   test('02 - Onboarding Flow: Design konsistens (POSITIV)', async ({ page }) => {
      45 |     // Naviger til onboarding
    > 46 |     await page.click('text=Start Onboarding');
         |                ^
      47 |     await page.waitForURL('**/modules/onboarding/index.html');
      48 |     
      49 |     // Test onboarding step 1
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:46:16

    Error Context: test-results/ui-inconsistencies-analysi-5a92b--Design-konsistens-POSITIV--Mobile-Safari/error-context.md


  49) [Mobile Safari] › tests/ui-inconsistencies-analysis.spec.js:211:3 › UI Inkonsistens Analyse - ExamKlar › 09 - Responsive Design Problemer 

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-dashboard-mobile-small-Mobile-Safari-darwin.png, writing actual.

      225 |       await page.waitForLoadState('domcontentloaded');
      226 |       
    > 227 |       await expect(page).toHaveScreenshot(`09-responsive-dashboard-${viewport.name}.png`);
          |       ^
      228 |       
      229 |       // Test hovedside
      230 |       await page.goto('/');
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:227:7

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-home-mobile-small-Mobile-Safari-darwin.png, writing actual.

      231 |       await page.waitForLoadState('domcontentloaded');
      232 |       
    > 233 |       await expect(page).toHaveScreenshot(`09-responsive-home-${viewport.name}.png`);
          |       ^
      234 |     }
      235 |   });
      236 |
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:233:7

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-dashboard-mobile-medium-Mobile-Safari-darwin.png, writing actual.

      225 |       await page.waitForLoadState('domcontentloaded');
      226 |       
    > 227 |       await expect(page).toHaveScreenshot(`09-responsive-dashboard-${viewport.name}.png`);
          |       ^
      228 |       
      229 |       // Test hovedside
      230 |       await page.goto('/');
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:227:7

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-home-mobile-medium-Mobile-Safari-darwin.png, writing actual.

      231 |       await page.waitForLoadState('domcontentloaded');
      232 |       
    > 233 |       await expect(page).toHaveScreenshot(`09-responsive-home-${viewport.name}.png`);
          |       ^
      234 |     }
      235 |   });
      236 |
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:233:7

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-dashboard-tablet-Mobile-Safari-darwin.png, writing actual.

      225 |       await page.waitForLoadState('domcontentloaded');
      226 |       
    > 227 |       await expect(page).toHaveScreenshot(`09-responsive-dashboard-${viewport.name}.png`);
          |       ^
      228 |       
      229 |       // Test hovedside
      230 |       await page.goto('/');
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:227:7

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-home-tablet-Mobile-Safari-darwin.png, writing actual.

      231 |       await page.waitForLoadState('domcontentloaded');
      232 |       
    > 233 |       await expect(page).toHaveScreenshot(`09-responsive-home-${viewport.name}.png`);
          |       ^
      234 |     }
      235 |   });
      236 |
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:233:7

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-dashboard-tablet-landscape-Mobile-Safari-darwin.png, writing actual.

      225 |       await page.waitForLoadState('domcontentloaded');
      226 |       
    > 227 |       await expect(page).toHaveScreenshot(`09-responsive-dashboard-${viewport.name}.png`);
          |       ^
      228 |       
      229 |       // Test hovedside
      230 |       await page.goto('/');
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:227:7

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-home-tablet-landscape-Mobile-Safari-darwin.png, writing actual.

      231 |       await page.waitForLoadState('domcontentloaded');
      232 |       
    > 233 |       await expect(page).toHaveScreenshot(`09-responsive-home-${viewport.name}.png`);
          |       ^
      234 |     }
      235 |   });
      236 |
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:233:7

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-dashboard-desktop-Mobile-Safari-darwin.png, writing actual.

      225 |       await page.waitForLoadState('domcontentloaded');
      226 |       
    > 227 |       await expect(page).toHaveScreenshot(`09-responsive-dashboard-${viewport.name}.png`);
          |       ^
      228 |       
      229 |       // Test hovedside
      230 |       await page.goto('/');
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:227:7

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-home-desktop-Mobile-Safari-darwin.png, writing actual.

      231 |       await page.waitForLoadState('domcontentloaded');
      232 |       
    > 233 |       await expect(page).toHaveScreenshot(`09-responsive-home-${viewport.name}.png`);
          |       ^
      234 |     }
      235 |   });
      236 |
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:233:7

    attachment #1: 09-responsive-dashboard-mobile-small-expected.png (image/png) 
    tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-dashboard-mobile-small-Mobile-Safari-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #2: 09-responsive-dashboard-mobile-small-actual.png (image/png) 
    test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-Mobile-Safari/09-responsive-dashboard-mobile-small-actual.png
    ───────────────────────────────────────────────────────────────

    attachment #3: 09-responsive-home-mobile-small-expected.png (image/png) 
    tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-home-mobile-small-Mobile-Safari-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #4: 09-responsive-home-mobile-small-actual.png (image/png) 
    test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-Mobile-Safari/09-responsive-home-mobile-small-actual.png
    ───────────────────────────────────────────────────────────────

    attachment #5: 09-responsive-dashboard-mobile-medium-expected.png (image/png) 
    tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-dashboard-mobile-medium-Mobile-Safari-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #6: 09-responsive-dashboard-mobile-medium-actual.png (image/png) 
    test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-Mobile-Safari/09-responsive-dashboard-mobile-medium-actual.png
    ───────────────────────────────────────────────────────────────

    attachment #7: 09-responsive-home-mobile-medium-expected.png (image/png) 
    tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-home-mobile-medium-Mobile-Safari-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #8: 09-responsive-home-mobile-medium-actual.png (image/png) 
    test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-Mobile-Safari/09-responsive-home-mobile-medium-actual.png
    ───────────────────────────────────────────────────────────────


    attachment #9: 09-responsive-dashboard-tablet-expected.png (image/png) 
    tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-dashboard-tablet-Mobile-Safari-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #10: 09-responsive-dashboard-tablet-actual.png (image/png) 
    test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-Mobile-Safari/09-responsive-dashboard-tablet-actual.png
    ───────────────────────────────────────────────────────────────

    attachment #11: 09-responsive-home-tablet-expected.png (image/png) 
    tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-home-tablet-Mobile-Safari-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #12: 09-responsive-home-tablet-actual.png (image/png) 
    test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-Mobile-Safari/09-responsive-home-tablet-actual.png
    ───────────────────────────────────────────────────────────────

    attachment #13: 09-responsive-dashboard-tablet-landscape-expected.png (image/png) 
    tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-dashboard-tablet-landscape-Mobile-Safari-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #14: 09-responsive-dashboard-tablet-landscape-actual.png (image/png) 
    test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-Mobile-Safari/09-responsive-dashboard-tablet-landscape-actual.png
    ───────────────────────────────────────────────────────────────

    attachment #15: 09-responsive-home-tablet-landscape-expected.png (image/png) 
    tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-home-tablet-landscape-Mobile-Safari-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #16: 09-responsive-home-tablet-landscape-actual.png (image/png) 
    test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-Mobile-Safari/09-responsive-home-tablet-landscape-actual.png
    ───────────────────────────────────────────────────────────────

    attachment #17: 09-responsive-dashboard-desktop-expected.png (image/png) 
    tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-dashboard-desktop-Mobile-Safari-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #18: 09-responsive-dashboard-desktop-actual.png (image/png) 
    test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-Mobile-Safari/09-responsive-dashboard-desktop-actual.png
    ───────────────────────────────────────────────────────────────

    attachment #19: 09-responsive-home-desktop-expected.png (image/png) 
    tests/ui-inconsistencies-analysis.spec.js-snapshots/09-responsive-home-desktop-Mobile-Safari-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #20: 09-responsive-home-desktop-actual.png (image/png) 
    test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-Mobile-Safari/09-responsive-home-desktop-actual.png
    ───────────────────────────────────────────────────────────────

    Error Context: test-results/ui-inconsistencies-analysi-3f119-Responsive-Design-Problemer-Mobile-Safari/error-context.md


  50) [Mobile Safari] › tests/ui-inconsistencies-analysis.spec.js:237:3 › UI Inkonsistens Analyse - ExamKlar › 10 - Dark Mode Konsistens 

    Error: A snapshot doesn't exist at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js-snapshots/10-light-mode-home-Mobile-Safari-darwin.png, writing actual.

      237 |   test('10 - Dark Mode Konsistens', async ({ page }) => {
      238 |     // Test light mode først
    > 239 |     await expect(page).toHaveScreenshot('10-light-mode-home.png');
          |     ^
      240 |     
      241 |     // Skift til dark mode
      242 |     await page.click('button[aria-label*="mørk"], button[aria-label*="dark"]');
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:239:5

    Test timeout of 30000ms exceeded.

    Error: page.click: Test ended.
    Call log:
      - waiting for locator('button[aria-label*="mørk"], button[aria-label*="dark"]')


      240 |     
      241 |     // Skift til dark mode
    > 242 |     await page.click('button[aria-label*="mørk"], button[aria-label*="dark"]');
          |                ^
      243 |     await page.waitForTimeout(500);
      244 |     
      245 |     await expect(page).toHaveScreenshot('10-dark-mode-home.png');
        at /Users/Yousef_1/Dokumenter/HjemmesideIT/EksamensKlar/tests/ui-inconsistencies-analysis.spec.js:242:16

    attachment #1: 10-light-mode-home-expected.png (image/png) ────
    tests/ui-inconsistencies-analysis.spec.js-snapshots/10-light-mode-home-Mobile-Safari-darwin.png
    ───────────────────────────────────────────────────────────────

    attachment #2: 10-light-mode-home-actual.png (image/png) ──────
    test-results/ui-inconsistencies-analysi-9f6c4-r-10---Dark-Mode-Konsistens-Mobile-Safari/10-light-mode-home-actual.png
    ───────────────────────────────────────────────────────────────

    Error Context: test-results/ui-inconsistencies-analysi-9f6c4-r-10---Dark-Mode-Konsistens-Mobile-Safari/error-context.md


  50 failed
    [chromium] › tests/ui-inconsistencies-analysis.spec.js:25:3 › UI Inkonsistens Analyse - ExamKlar › 01 - Hovedside: Layout og branding konsistens 
    [chromium] › tests/ui-inconsistencies-analysis.spec.js:44:3 › UI Inkonsistens Analyse - ExamKlar › 02 - Onboarding Flow: Design konsistens (POSITIV) 
    [chromium] › tests/ui-inconsistencies-analysis.spec.js:81:3 › UI Inkonsistens Analyse - ExamKlar › 03 - Dashboard: ALVORLIGE Layout Problemer 
    [chromium] › tests/ui-inconsistencies-analysis.spec.js:106:3 › UI Inkonsistens Analyse - ExamKlar › 04 - Subjects: Kritisk 404 Fejl og Navigation 
    [chromium] › tests/ui-inconsistencies-analysis.spec.js:133:3 › UI Inkonsistens Analyse - ExamKlar › 05 - Quiz: Data Format Inkonsistenser 
    [chromium] › tests/ui-inconsistencies-analysis.spec.js:153:3 › UI Inkonsistens Analyse - ExamKlar › 06 - Content Manager: Engelsk Interface Problem 
    [chromium] › tests/ui-inconsistencies-analysis.spec.js:169:3 › UI Inkonsistens Analyse - ExamKlar › 07 - Flashcards: Layout og Data Konsistens 
    [chromium] › tests/ui-inconsistencies-analysis.spec.js:186:3 › UI Inkonsistens Analyse - ExamKlar › 08 - Navigation Konsistens På Tværs Af Moduler 
    [chromium] › tests/ui-inconsistencies-analysis.spec.js:211:3 › UI Inkonsistens Analyse - ExamKlar › 09 - Responsive Design Problemer 
    [chromium] › tests/ui-inconsistencies-analysis.spec.js:237:3 › UI Inkonsistens Analyse - ExamKlar › 10 - Dark Mode Konsistens 
    [firefox] › tests/ui-inconsistencies-analysis.spec.js:25:3 › UI Inkonsistens Analyse - ExamKlar › 01 - Hovedside: Layout og branding konsistens 
    [firefox] › tests/ui-inconsistencies-analysis.spec.js:44:3 › UI Inkonsistens Analyse - ExamKlar › 02 - Onboarding Flow: Design konsistens (POSITIV) 
    [firefox] › tests/ui-inconsistencies-analysis.spec.js:81:3 › UI Inkonsistens Analyse - ExamKlar › 03 - Dashboard: ALVORLIGE Layout Problemer 
    [firefox] › tests/ui-inconsistencies-analysis.spec.js:106:3 › UI Inkonsistens Analyse - ExamKlar › 04 - Subjects: Kritisk 404 Fejl og Navigation 
    [firefox] › tests/ui-inconsistencies-analysis.spec.js:133:3 › UI Inkonsistens Analyse - ExamKlar › 05 - Quiz: Data Format Inkonsistenser 
    [firefox] › tests/ui-inconsistencies-analysis.spec.js:153:3 › UI Inkonsistens Analyse - ExamKlar › 06 - Content Manager: Engelsk Interface Problem 
    [firefox] › tests/ui-inconsistencies-analysis.spec.js:169:3 › UI Inkonsistens Analyse - ExamKlar › 07 - Flashcards: Layout og Data Konsistens 
    [firefox] › tests/ui-inconsistencies-analysis.spec.js:186:3 › UI Inkonsistens Analyse - ExamKlar › 08 - Navigation Konsistens På Tværs Af Moduler 
    [firefox] › tests/ui-inconsistencies-analysis.spec.js:211:3 › UI Inkonsistens Analyse - ExamKlar › 09 - Responsive Design Problemer 
    [firefox] › tests/ui-inconsistencies-analysis.spec.js:237:3 › UI Inkonsistens Analyse - ExamKlar › 10 - Dark Mode Konsistens 
    [webkit] › tests/ui-inconsistencies-analysis.spec.js:25:3 › UI Inkonsistens Analyse - ExamKlar › 01 - Hovedside: Layout og branding konsistens 
    [webkit] › tests/ui-inconsistencies-analysis.spec.js:44:3 › UI Inkonsistens Analyse - ExamKlar › 02 - Onboarding Flow: Design konsistens (POSITIV) 
    [webkit] › tests/ui-inconsistencies-analysis.spec.js:81:3 › UI Inkonsistens Analyse - ExamKlar › 03 - Dashboard: ALVORLIGE Layout Problemer 
    [webkit] › tests/ui-inconsistencies-analysis.spec.js:106:3 › UI Inkonsistens Analyse - ExamKlar › 04 - Subjects: Kritisk 404 Fejl og Navigation 
    [webkit] › tests/ui-inconsistencies-analysis.spec.js:133:3 › UI Inkonsistens Analyse - ExamKlar › 05 - Quiz: Data Format Inkonsistenser 
    [webkit] › tests/ui-inconsistencies-analysis.spec.js:153:3 › UI Inkonsistens Analyse - ExamKlar › 06 - Content Manager: Engelsk Interface Problem 
    [webkit] › tests/ui-inconsistencies-analysis.spec.js:169:3 › UI Inkonsistens Analyse - ExamKlar › 07 - Flashcards: Layout og Data Konsistens 
    [webkit] › tests/ui-inconsistencies-analysis.spec.js:186:3 › UI Inkonsistens Analyse - ExamKlar › 08 - Navigation Konsistens På Tværs Af Moduler 
    [webkit] › tests/ui-inconsistencies-analysis.spec.js:211:3 › UI Inkonsistens Analyse - ExamKlar › 09 - Responsive Design Problemer 
    [webkit] › tests/ui-inconsistencies-analysis.spec.js:237:3 › UI Inkonsistens Analyse - ExamKlar › 10 - Dark Mode Konsistens 
    [Mobile Chrome] › tests/ui-inconsistencies-analysis.spec.js:25:3 › UI Inkonsistens Analyse - ExamKlar › 01 - Hovedside: Layout og branding konsistens 
    [Mobile Chrome] › tests/ui-inconsistencies-analysis.spec.js:44:3 › UI Inkonsistens Analyse - ExamKlar › 02 - Onboarding Flow: Design konsistens (POSITIV) 
    [Mobile Chrome] › tests/ui-inconsistencies-analysis.spec.js:81:3 › UI Inkonsistens Analyse - ExamKlar › 03 - Dashboard: ALVORLIGE Layout Problemer 
    [Mobile Chrome] › tests/ui-inconsistencies-analysis.spec.js:106:3 › UI Inkonsistens Analyse - ExamKlar › 04 - Subjects: Kritisk 404 Fejl og Navigation 
    [Mobile Chrome] › tests/ui-inconsistencies-analysis.spec.js:133:3 › UI Inkonsistens Analyse - ExamKlar › 05 - Quiz: Data Format Inkonsistenser 
    [Mobile Chrome] › tests/ui-inconsistencies-analysis.spec.js:153:3 › UI Inkonsistens Analyse - ExamKlar › 06 - Content Manager: Engelsk Interface Problem 
    [Mobile Chrome] › tests/ui-inconsistencies-analysis.spec.js:169:3 › UI Inkonsistens Analyse - ExamKlar › 07 - Flashcards: Layout og Data Konsistens 
    [Mobile Chrome] › tests/ui-inconsistencies-analysis.spec.js:186:3 › UI Inkonsistens Analyse - ExamKlar › 08 - Navigation Konsistens På Tværs Af Moduler 
    [Mobile Chrome] › tests/ui-inconsistencies-analysis.spec.js:211:3 › UI Inkonsistens Analyse - ExamKlar › 09 - Responsive Design Problemer 
    [Mobile Chrome] › tests/ui-inconsistencies-analysis.spec.js:237:3 › UI Inkonsistens Analyse - ExamKlar › 10 - Dark Mode Konsistens 
    [Mobile Safari] › tests/ui-inconsistencies-analysis.spec.js:25:3 › UI Inkonsistens Analyse - ExamKlar › 01 - Hovedside: Layout og branding konsistens 
    [Mobile Safari] › tests/ui-inconsistencies-analysis.spec.js:44:3 › UI Inkonsistens Analyse - ExamKlar › 02 - Onboarding Flow: Design konsistens (POSITIV) 
    [Mobile Safari] › tests/ui-inconsistencies-analysis.spec.js:81:3 › UI Inkonsistens Analyse - ExamKlar › 03 - Dashboard: ALVORLIGE Layout Problemer 
    [Mobile Safari] › tests/ui-inconsistencies-analysis.spec.js:106:3 › UI Inkonsistens Analyse - ExamKlar › 04 - Subjects: Kritisk 404 Fejl og Navigation 
    [Mobile Safari] › tests/ui-inconsistencies-analysis.spec.js:133:3 › UI Inkonsistens Analyse - ExamKlar › 05 - Quiz: Data Format Inkonsistenser 
    [Mobile Safari] › tests/ui-inconsistencies-analysis.spec.js:153:3 › UI Inkonsistens Analyse - ExamKlar › 06 - Content Manager: Engelsk Interface Problem 
    [Mobile Safari] › tests/ui-inconsistencies-analysis.spec.js:169:3 › UI Inkonsistens Analyse - ExamKlar › 07 - Flashcards: Layout og Data Konsistens 
    [Mobile Safari] › tests/ui-inconsistencies-analysis.spec.js:186:3 › UI Inkonsistens Analyse - ExamKlar › 08 - Navigation Konsistens På Tværs Af Moduler 
    [Mobile Safari] › tests/ui-inconsistencies-analysis.spec.js:211:3 › UI Inkonsistens Analyse - ExamKlar › 09 - Responsive Design Problemer 
    [Mobile Safari] › tests/ui-inconsistencies-analysis.spec.js:237:3 › UI Inkonsistens Analyse - ExamKlar › 10 - Dark Mode Konsistens 
⠙%                                                                  
 
