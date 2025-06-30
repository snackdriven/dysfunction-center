# 🎭 Playwright UI Audit Prompt for Executive Dysfunction Center

## Overview
Use this prompt with Playwright to systematically audit the Executive Dysfunction Center frontend for modern UI standards, accessibility, and user experience. This audit will identify areas for improvement in color differentiation, visual hierarchy, and element organization.

## Playwright UI Audit Script

```javascript
// playwright-ui-audit.js
const { test, expect } = require('@playwright/test');

test.describe('Executive Dysfunction Center UI Audit', () => {
  test.beforeEach(async ({ page }) => {
    // Start the application (ensure `encore run` is running)
    await page.goto('http://localhost:3000');
  });

  test('Dashboard Visual Hierarchy Audit', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // Take full page screenshot for analysis
    await page.screenshot({ 
      path: 'audit-screenshots/dashboard-full.png', 
      fullPage: true 
    });
    
    // Audit color contrast and differentiation
    const widgets = await page.locator('[data-testid*="widget"], .widget, [class*="widget"]').all();
    
    for (let i = 0; i < widgets.length; i++) {
      const widget = widgets[i];
      await widget.screenshot({ 
        path: `audit-screenshots/widget-${i}.png` 
      });
      
      // Check for color differentiation issues
      const bgColor = await widget.evaluate(el => 
        window.getComputedStyle(el).backgroundColor
      );
      const textColor = await widget.evaluate(el => 
        window.getComputedStyle(el).color
      );
      
      console.log(`Widget ${i}: Background: ${bgColor}, Text: ${textColor}`);
    }
  });

  test('Color Palette Analysis', async ({ page }) => {
    const pages = ['/dashboard', '/tasks', '/habits', '/mood', '/calendar', '/journal'];
    
    for (const pagePath of pages) {
      await page.goto(`http://localhost:3000${pagePath}`);
      
      // Extract all colors used
      const colors = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        const colorSet = new Set();
        
        elements.forEach(el => {
          const styles = window.getComputedStyle(el);
          colorSet.add(styles.backgroundColor);
          colorSet.add(styles.color);
          colorSet.add(styles.borderColor);
        });
        
        return Array.from(colorSet).filter(color => 
          color !== 'rgba(0, 0, 0, 0)' && 
          color !== 'transparent' && 
          color !== 'initial'
        );
      });
      
      console.log(`${pagePath} colors:`, colors);
      
      // Take screenshot for visual analysis
      await page.screenshot({ 
        path: `audit-screenshots/${pagePath.replace('/', '')}-colors.png`,
        fullPage: true 
      });
    }
  });

  test('Interactive Element Audit', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    // Find all interactive elements
    const interactiveElements = await page.locator('button, a, input, select, [role="button"], [tabindex="0"]').all();
    
    for (let i = 0; i < interactiveElements.length; i++) {
      const element = interactiveElements[i];
      
      // Check hover states
      await element.hover();
      await page.screenshot({ 
        path: `audit-screenshots/interactive-hover-${i}.png` 
      });
      
      // Check focus states
      await element.focus();
      await page.screenshot({ 
        path: `audit-screenshots/interactive-focus-${i}.png` 
      });
      
      // Check accessibility attributes
      const ariaLabel = await element.getAttribute('aria-label');
      const role = await element.getAttribute('role');
      const tabIndex = await element.getAttribute('tabindex');
      
      console.log(`Interactive element ${i}:`, {
        ariaLabel,
        role,
        tabIndex,
        tagName: await element.evaluate(el => el.tagName)
      });
    }
  });

  test('Typography and Spacing Audit', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    // Analyze typography hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    
    for (let i = 0; i < headings.length; i++) {
      const heading = headings[i];
      const styles = await heading.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          fontSize: computed.fontSize,
          fontWeight: computed.fontWeight,
          lineHeight: computed.lineHeight,
          marginTop: computed.marginTop,
          marginBottom: computed.marginBottom,
          tagName: el.tagName
        };
      });
      
      console.log(`Heading ${i} (${styles.tagName}):`, styles);
    }
    
    // Check spacing consistency
    const containers = await page.locator('[class*="container"], [class*="wrapper"], [class*="grid"]').all();
    
    for (let i = 0; i < containers.length; i++) {
      const container = containers[i];
      const spacing = await container.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          padding: computed.padding,
          margin: computed.margin,
          gap: computed.gap,
          className: el.className
        };
      });
      
      console.log(`Container ${i}:`, spacing);
    }
  });

  test('Mobile Responsiveness Audit', async ({ page }) => {
    const viewports = [
      { width: 320, height: 568, name: 'mobile-small' },
      { width: 375, height: 667, name: 'mobile-medium' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1024, height: 768, name: 'desktop-small' },
      { width: 1440, height: 900, name: 'desktop-large' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('http://localhost:3000/dashboard');
      
      await page.screenshot({ 
        path: `audit-screenshots/responsive-${viewport.name}.png`,
        fullPage: true 
      });
      
      // Check for horizontal scrolling issues
      const hasHorizontalScroll = await page.evaluate(() => 
        document.documentElement.scrollWidth > window.innerWidth
      );
      
      if (hasHorizontalScroll) {
        console.log(`⚠️  Horizontal scroll detected on ${viewport.name}`);
      }
    }
  });

  test('Performance and Loading States Audit', async ({ page }) => {
    // Simulate slow network
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 1000);
    });
    
    await page.goto('http://localhost:3000/dashboard');
    
    // Check for loading states
    const loadingElements = await page.locator('[data-testid*="loading"], .loading, [class*="spinner"]').all();
    
    if (loadingElements.length > 0) {
      await page.screenshot({ 
        path: 'audit-screenshots/loading-states.png' 
      });
    }
    
    // Check for error states
    const errorElements = await page.locator('[data-testid*="error"], .error, [class*="error"]').all();
    
    if (errorElements.length > 0) {
      await page.screenshot({ 
        path: 'audit-screenshots/error-states.png' 
      });
    }
  });
});
```

## Usage Instructions

1. **Install Playwright** (if not already installed):
```bash
cd frontend
npm install -D @playwright/test
npx playwright install
```

2. **Create audit directory**:
```bash
mkdir audit-screenshots
```

3. **Run the audit**:
```bash
# Ensure the app is running
encore run

# In another terminal, run the audit
npx playwright test playwright-ui-audit.js --headed
```

## Analysis Framework

### Color Differentiation Issues to Look For:
- **Too much gray/neutral**: Excessive use of similar gray tones
- **Poor contrast ratios**: Text that's hard to read against backgrounds
- **Lack of visual hierarchy**: No clear distinction between important and secondary elements
- **Missing state indicators**: Buttons/links that don't clearly show hover/focus/active states

### Visual Hierarchy Problems:
- **Flat design**: Everything looks the same importance level
- **Poor spacing**: Inconsistent margins/paddings
- **Typography issues**: No clear heading hierarchy
- **Missing visual cues**: No clear indication of interactive elements

### Modern UI Standards to Evaluate:
- **Accessibility**: ARIA labels, keyboard navigation, color contrast
- **Responsive design**: Mobile-first approach, proper breakpoints
- **Performance**: Fast loading, smooth animations
- **User feedback**: Clear loading states, error handling

## Recommended Improvements Based on Audit Results

### Color Palette Enhancement:
```css
/* Suggested color system */
:root {
  /* Primary brand colors */
  --primary-50: #f0f9ff;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;
  
  /* Semantic colors */
  --success-500: #10b981;
  --warning-500: #f59e0b;
  --error-500: #ef4444;
  
  /* Neutral with better contrast */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-900: #111827;
}
```

### Visual Hierarchy System:
```css
/* Typography scale */
.text-xs { font-size: 0.75rem; }
.text-sm { font-size: 0.875rem; }
.text-base { font-size: 1rem; }
.text-lg { font-size: 1.125rem; }
.text-xl { font-size: 1.25rem; }
.text-2xl { font-size: 1.5rem; }

/* Spacing scale */
.space-1 { margin: 0.25rem; }
.space-2 { margin: 0.5rem; }
.space-4 { margin: 1rem; }
.space-6 { margin: 1.5rem; }
.space-8 { margin: 2rem; }
```

### Interactive Element Standards:
```css
/* Button hierarchy */
.btn-primary { /* High-contrast primary action */ }
.btn-secondary { /* Subtle secondary action */ }
.btn-ghost { /* Minimal tertiary action */ }

/* Focus and hover states */
.interactive:hover { transform: translateY(-1px); }
.interactive:focus { outline: 2px solid var(--primary-500); }
```

This comprehensive audit will identify specific areas where the UI needs improvement in terms of color differentiation, visual hierarchy, and modern design standards.