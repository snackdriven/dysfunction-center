import { test, expect } from '@playwright/test';

test.describe('Dashboard UI/UX Audit', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto('http://localhost:3000/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('Dashboard visual design audit', async ({ page }) => {
    // Take full page screenshot for analysis
    await page.screenshot({ 
      path: 'dashboard-full-page.png', 
      fullPage: true 
    });

    // Test typography hierarchy
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    console.log(`Found ${headingCount} heading elements`);

    for (let i = 0; i < headingCount; i++) {
      const heading = headings.nth(i);
      const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
      const text = await heading.textContent();
      const styles = await heading.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          fontSize: computed.fontSize,
          fontWeight: computed.fontWeight,
          lineHeight: computed.lineHeight,
          color: computed.color
        };
      });
      console.log(`${tagName}: "${text}" - Font: ${styles.fontSize}/${styles.fontWeight}, Line Height: ${styles.lineHeight}`);
    }

    // Check color contrast
    const primaryText = page.locator('body');
    const bodyStyles = await primaryText.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        backgroundColor: computed.backgroundColor,
        color: computed.color
      };
    });
    console.log('Body styles:', bodyStyles);

    // Check spacing consistency
    const cards = page.locator('[class*="card"], [class*="Card"]');
    const cardCount = await cards.count();
    console.log(`Found ${cardCount} card elements`);

    // Test responsive behavior
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.screenshot({ path: 'dashboard-desktop.png' });

    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({ path: 'dashboard-tablet.png' });

    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: 'dashboard-mobile.png' });
  });

  test('Dashboard accessibility audit', async ({ page }) => {
    // Check for ARIA labels
    const elementsWithAria = page.locator('[aria-label], [aria-labelledby], [aria-describedby]');
    const ariaCount = await elementsWithAria.count();
    console.log(`Found ${ariaCount} elements with ARIA attributes`);

    // Check for semantic HTML
    const semanticElements = page.locator('main, section, article, nav, header, aside, footer');
    const semanticCount = await semanticElements.count();
    console.log(`Found ${semanticCount} semantic HTML elements`);

    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    const focusedElement = await page.evaluate(() => {
      const focused = document.activeElement;
      return {
        tagName: focused?.tagName,
        className: focused?.className,
        textContent: focused?.textContent?.substring(0, 50)
      };
    });
    console.log('Focused element after 3 tabs:', focusedElement);

    // Check for skip links
    const skipLinks = page.locator('[href*="#skip"], [href*="#main"]');
    const skipCount = await skipLinks.count();
    console.log(`Found ${skipCount} skip links`);
  });

  test('Dashboard interaction patterns', async ({ page }) => {
    // Test button hover states
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    console.log(`Found ${buttonCount} buttons`);

    if (buttonCount > 0) {
      await buttons.first().hover();
      await page.screenshot({ path: 'button-hover-state.png' });
    }

    // Test loading states
    const loadingElements = page.locator('[data-testid*="loading"], [class*="loading"], [class*="spinner"]');
    const loadingCount = await loadingElements.count();
    console.log(`Found ${loadingCount} loading indicators`);

    // Test form interactions
    const inputs = page.locator('input, textarea, select');
    const inputCount = await inputs.count();
    console.log(`Found ${inputCount} form inputs`);

    // Check for focus indicators
    if (inputCount > 0) {
      await inputs.first().focus();
      await page.screenshot({ path: 'input-focus-state.png' });
    }
  });

  test('Dashboard information architecture', async ({ page }) => {
    // Analyze navigation structure
    const navLinks = page.locator('nav a, [role="navigation"] a');
    const navCount = await navLinks.count();
    console.log(`Found ${navCount} navigation links`);

    for (let i = 0; i < Math.min(navCount, 10); i++) {
      const link = navLinks.nth(i);
      const text = await link.textContent();
      const href = await link.getAttribute('href');
      console.log(`Nav link: "${text}" -> ${href}`);
    }

    // Check content hierarchy
    const sections = page.locator('section, [class*="section"], [class*="widget"]');
    const sectionCount = await sections.count();
    console.log(`Found ${sectionCount} content sections`);

    // Analyze widget/card content
    const widgets = page.locator('[class*="widget"], [class*="card"]');
    const widgetCount = await widgets.count();
    console.log(`Found ${widgetCount} widgets/cards`);

    for (let i = 0; i < Math.min(widgetCount, 5); i++) {
      const widget = widgets.nth(i);
      const title = await widget.locator('h1, h2, h3, h4, h5, h6').first().textContent();
      const content = await widget.textContent();
      console.log(`Widget ${i + 1}: "${title}" (${content?.length} chars)`);
    }
  });

  test('Dashboard performance metrics', async ({ page }) => {
    // Measure page load performance
    const performanceTiming = await page.evaluate(() => {
      const timing = performance.timing;
      return {
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        fullyLoaded: timing.loadEventEnd - timing.navigationStart,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0
      };
    });
    console.log('Performance metrics:', performanceTiming);

    // Check for layout shifts
    const layoutShifts = await page.evaluate(() => {
      return new Promise((resolve) => {
        let shifts = [];
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
              shifts.push(entry.value);
            }
          }
        });
        observer.observe({ entryTypes: ['layout-shift'] });
        
        setTimeout(() => {
          observer.disconnect();
          resolve(shifts);
        }, 2000);
      });
    });
    console.log('Layout shifts detected:', layoutShifts);

    // Check for large content areas
    const largeElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const large = [];
      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 1000 || rect.height > 500) {
          large.push({
            tag: el.tagName,
            class: el.className,
            width: rect.width,
            height: rect.height
          });
        }
      }
      return large.slice(0, 10);
    });
    console.log('Large elements:', largeElements);
  });
});