import { test, expect } from '@playwright/test';

test.describe('Live Dashboard UI/UX Audit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');
  });

  test('Visual hierarchy and information architecture audit', async ({ page }) => {
    console.log('=== VISUAL HIERARCHY AUDIT ===');
    
    // Check page title and main heading
    const pageTitle = await page.title();
    console.log(`Page title: "${pageTitle}"`);
    
    const mainHeading = page.locator('h1').first();
    const headingText = await mainHeading.textContent();
    const headingStyles = await mainHeading.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        fontSize: computed.fontSize,
        fontWeight: computed.fontWeight,
        color: computed.color,
        marginBottom: computed.marginBottom
      };
    });
    console.log(`Main heading: "${headingText}"`);
    console.log(`Heading styles:`, headingStyles);

    // Analyze all headings hierarchy
    const allHeadings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await allHeadings.count();
    console.log(`\nFound ${headingCount} heading elements:`);
    
    for (let i = 0; i < headingCount; i++) {
      const heading = allHeadings.nth(i);
      const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
      const text = await heading.textContent();
      const styles = await heading.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          fontSize: computed.fontSize,
          fontWeight: computed.fontWeight
        };
      });
      console.log(`  ${tagName}: "${text?.substring(0, 50)}..." - ${styles.fontSize}/${styles.fontWeight}`);
    }

    // Check for proper semantic structure
    const landmarks = page.locator('main, section, article, nav, header, aside, footer');
    const landmarkCount = await landmarks.count();
    console.log(`\nSemantic landmarks found: ${landmarkCount}`);
    
    for (let i = 0; i < landmarkCount; i++) {
      const landmark = landmarks.nth(i);
      const tagName = await landmark.evaluate(el => el.tagName.toLowerCase());
      const ariaLabel = await landmark.getAttribute('aria-label');
      const role = await landmark.getAttribute('role');
      console.log(`  ${tagName}${ariaLabel ? ` (aria-label: "${ariaLabel}")` : ''}${role ? ` (role: "${role}")` : ''}`);
    }

    // Take screenshot for visual analysis
    await page.screenshot({ path: 'live-dashboard-full.png', fullPage: true });
  });

  test('Dashboard content organization and cognitive load', async ({ page }) => {
    console.log('\n=== CONTENT ORGANIZATION AUDIT ===');
    
    // Count widgets/cards on dashboard
    const cards = page.locator('[class*="card"], [class*="Card"], [data-testid*="widget"], [class*="widget"]');
    const cardCount = await cards.count();
    console.log(`Dashboard widgets/cards found: ${cardCount}`);

    // Analyze each widget's content density
    for (let i = 0; i < Math.min(cardCount, 8); i++) {
      const card = cards.nth(i);
      const cardTitle = await card.locator('h1, h2, h3, h4, h5, h6').first().textContent();
      const cardText = await card.textContent();
      const buttonCount = await card.locator('button').count();
      const linkCount = await card.locator('a').count();
      
      console.log(`\nWidget ${i + 1}: "${cardTitle?.substring(0, 30)}..."`);
      console.log(`  Content length: ${cardText?.length} characters`);
      console.log(`  Interactive elements: ${buttonCount} buttons, ${linkCount} links`);
    }

    // Check for information density issues
    const allText = await page.locator('body').textContent();
    const wordCount = allText?.split(/\s+/).length || 0;
    console.log(`\nTotal word count on dashboard: ${wordCount}`);
    
    if (wordCount > 500) {
      console.log('⚠️  HIGH COGNITIVE LOAD: Dashboard contains excessive text content');
    }

    // Check for proper information grouping
    const sections = page.locator('section, [role="region"], div[class*="grid"], div[class*="space-y"]');
    const sectionCount = await sections.count();
    console.log(`Content sections/groups: ${sectionCount}`);
  });

  test('Color usage and accessibility compliance', async ({ page }) => {
    console.log('\n=== COLOR & ACCESSIBILITY AUDIT ===');
    
    // Check body background and text colors
    const bodyStyles = await page.locator('body').evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        backgroundColor: computed.backgroundColor,
        color: computed.color
      };
    });
    console.log('Body colors:', bodyStyles);

    // Check for ARIA attributes
    const elementsWithAria = page.locator('[aria-label], [aria-labelledby], [aria-describedby], [role]');
    const ariaCount = await elementsWithAria.count();
    console.log(`Elements with ARIA attributes: ${ariaCount}`);

    // Check for proper form labels
    const inputs = page.locator('input, textarea, select');
    const inputCount = await inputs.count();
    let labeledInputs = 0;
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledby = await input.getAttribute('aria-labelledby');
      
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const hasLabel = await label.count() > 0;
        if (hasLabel) labeledInputs++;
      } else if (ariaLabel || ariaLabelledby) {
        labeledInputs++;
      }
    }
    
    console.log(`Form inputs: ${inputCount} total, ${labeledInputs} properly labeled`);
    if (inputCount > 0 && labeledInputs / inputCount < 1) {
      console.log('⚠️  ACCESSIBILITY ISSUE: Some form inputs lack proper labels');
    }

    // Check for keyboard focus indicators
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => {
      const focused = document.activeElement;
      const computed = window.getComputedStyle(focused as Element);
      return {
        tagName: focused?.tagName,
        className: focused?.className,
        outline: computed.outline,
        boxShadow: computed.boxShadow
      };
    });
    console.log('First focusable element:', focusedElement);
  });

  test('Interactive elements and user experience', async ({ page }) => {
    console.log('\n=== INTERACTION PATTERNS AUDIT ===');
    
    // Count interactive elements
    const buttons = page.locator('button');
    const links = page.locator('a');
    const inputs = page.locator('input, textarea, select');
    
    const buttonCount = await buttons.count();
    const linkCount = await links.count();
    const inputCount = await inputs.count();
    
    console.log(`Interactive elements:`);
    console.log(`  Buttons: ${buttonCount}`);
    console.log(`  Links: ${linkCount}`);
    console.log(`  Form inputs: ${inputCount}`);

    // Test button hover states
    if (buttonCount > 0) {
      const firstButton = buttons.first();
      const buttonText = await firstButton.textContent();
      console.log(`\nTesting hover state on: "${buttonText}"`);
      
      const beforeHover = await firstButton.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          backgroundColor: computed.backgroundColor,
          transform: computed.transform
        };
      });
      
      await firstButton.hover();
      await page.waitForTimeout(100);
      
      const afterHover = await firstButton.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          backgroundColor: computed.backgroundColor,
          transform: computed.transform
        };
      });
      
      const hasHoverEffect = beforeHover.backgroundColor !== afterHover.backgroundColor || 
                            beforeHover.transform !== afterHover.transform;
      console.log(`  Has hover effect: ${hasHoverEffect}`);
    }

    // Check for loading states
    const loadingElements = page.locator('[class*="loading"], [class*="spinner"], [class*="animate-pulse"]');
    const loadingCount = await loadingElements.count();
    console.log(`Loading indicators found: ${loadingCount}`);

    // Test keyboard navigation
    console.log('\nTesting keyboard navigation:');
    let tabCount = 0;
    const maxTabs = 10;
    
    for (let i = 0; i < maxTabs; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        return {
          tagName: el?.tagName,
          text: el?.textContent?.substring(0, 30)
        };
      });
      
      if (focused.tagName && focused.tagName !== 'BODY') {
        tabCount++;
        console.log(`  Tab ${tabCount}: ${focused.tagName} - "${focused.text}..."`);
      }
    }
    
    if (tabCount === 0) {
      console.log('⚠️  ACCESSIBILITY ISSUE: No keyboard-accessible elements found');
    }
  });

  test('Performance and layout behavior', async ({ page }) => {
    console.log('\n=== PERFORMANCE AUDIT ===');
    
    // Measure page load performance
    const performanceMetrics = await page.evaluate(() => {
      const timing = performance.timing;
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      return {
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        fullyLoaded: timing.loadEventEnd - timing.navigationStart,
        firstContentfulPaint: navigation.domContentLoadedEventEnd - navigation.fetchStart
      };
    });
    
    console.log('Load timing (ms):', performanceMetrics);

    // Check for layout shifts during interaction
    await page.hover('button');
    await page.waitForTimeout(500);
    
    const layoutShifts = await page.evaluate(() => {
      return new Promise((resolve) => {
        let shifts: number[] = [];
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'layout-shift') {
              const layoutShiftEntry = entry as any;
              if (!layoutShiftEntry.hadRecentInput) {
                shifts.push(layoutShiftEntry.value);
              }
            }
          }
        });
        
        observer.observe({ entryTypes: ['layout-shift'] });
        
        setTimeout(() => {
          observer.disconnect();
          resolve(shifts);
        }, 1000);
      });
    });
    
    console.log('Layout shifts detected:', layoutShifts);
    const totalLayoutShift = (layoutShifts as number[]).reduce((sum, shift) => sum + shift, 0);
    
    if (totalLayoutShift > 0.1) {
      console.log('⚠️  PERFORMANCE ISSUE: Cumulative Layout Shift (CLS) above recommended threshold');
    }

    // Check responsive behavior
    console.log('\nTesting responsive behavior:');
    
    const viewports = [
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Mobile', width: 375, height: 667 }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(200);
      
      const visibleCards = await page.locator('[class*="card"], [class*="Card"]').count();
      const horizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      
      console.log(`  ${viewport.name} (${viewport.width}x${viewport.height}): ${visibleCards} cards, horizontal scroll: ${horizontalScroll}`);
      
      if (horizontalScroll) {
        console.log(`    ⚠️  RESPONSIVE ISSUE: Horizontal scrolling detected at ${viewport.name} viewport`);
      }
    }

    // Reset to desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('Component-specific usability assessment', async ({ page }) => {
    console.log('\n=== COMPONENT USABILITY AUDIT ===');
    
    // Check for modal dialogs and their accessibility
    const modalTriggers = page.locator('button:has-text("Add"), button:has-text("Create"), button:has-text("New")');
    const modalTriggerCount = await modalTriggers.count();
    console.log(`Modal trigger buttons found: ${modalTriggerCount}`);
    
    if (modalTriggerCount > 0) {
      console.log('Testing modal accessibility:');
      const firstTrigger = modalTriggers.first();
      const triggerText = await firstTrigger.textContent();
      console.log(`  Clicking: "${triggerText}"`);
      
      await firstTrigger.click();
      await page.waitForTimeout(300);
      
      // Check if modal opened
      const modalDialog = page.locator('[role="dialog"], .modal, [class*="dialog"]').first();
      const modalVisible = await modalDialog.isVisible().catch(() => false);
      
      if (modalVisible) {
        console.log('  ✅ Modal opened successfully');
        
        // Check modal focus management
        const focusedInModal = await page.evaluate(() => {
          const activeEl = document.activeElement;
          const modal = document.querySelector('[role="dialog"], .modal, [class*="dialog"]');
          return modal?.contains(activeEl) || false;
        });
        
        console.log(`  Focus trapped in modal: ${focusedInModal}`);
        
        // Test escape key
        await page.keyboard.press('Escape');
        await page.waitForTimeout(200);
        
        const modalStillVisible = await modalDialog.isVisible().catch(() => false);
        console.log(`  Escape key closes modal: ${!modalStillVisible}`);
      } else {
        console.log('  ⚠️  Modal did not open or is not accessible');
      }
    }

    // Check for form validation feedback
    const formInputs = page.locator('input[required], input[type="email"]');
    const requiredInputCount = await formInputs.count();
    console.log(`\nRequired form inputs found: ${requiredInputCount}`);
    
    if (requiredInputCount > 0) {
      const firstInput = formInputs.first();
      await firstInput.focus();
      await firstInput.fill('');
      await page.keyboard.press('Tab');
      
      const errorMessages = page.locator('[class*="error"], [role="alert"], .text-red');
      const errorCount = await errorMessages.count();
      console.log(`  Validation errors shown: ${errorCount}`);
    }

    // Check for data visualization components
    const charts = page.locator('[class*="chart"], [class*="progress"], canvas, svg');
    const chartCount = await charts.count();
    console.log(`\nData visualization elements: ${chartCount}`);
    
    if (chartCount > 0) {
      for (let i = 0; i < Math.min(chartCount, 3); i++) {
        const chart = charts.nth(i);
        const ariaLabel = await chart.getAttribute('aria-label');
        const title = await chart.getAttribute('title');
        const role = await chart.getAttribute('role');
        
        console.log(`  Chart ${i + 1}: aria-label="${ariaLabel}", title="${title}", role="${role}"`);
        
        if (!ariaLabel && !title) {
          console.log('    ⚠️  ACCESSIBILITY: Chart lacks descriptive text for screen readers');
        }
      }
    }
  });
});