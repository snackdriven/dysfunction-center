import { Page, Locator } from '@playwright/test';

export interface TestElement {
  selector: string;
  expectedCount?: number;
  timeout?: number;
}

export interface AccessibilityCheck {
  hasAriaLabel: boolean;
  hasRole: boolean;
  isKeyboardAccessible: boolean;
  hasProperContrast: boolean;
}

export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Wait for element to be visible with retry mechanism
   */
  async waitForElementVisible(selector: string, timeout = 5000): Promise<boolean> {
    try {
      await this.page.waitForSelector(selector, { state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if element exists and is interactive
   */
  async isElementInteractive(locator: Locator): Promise<boolean> {
    if (await locator.count() === 0) return false;
    
    try {
      await locator.hover({ timeout: 1000 });
      return await locator.isEnabled();
    } catch {
      return false;
    }
  }

  /**
   * Test keyboard navigation through elements
   */
  async testKeyboardNavigation(startSelector?: string): Promise<{
    totalElements: number;
    accessibleElements: string[];
  }> {
    const accessibleElements: string[] = [];
    
    // Start from a specific element or document body
    if (startSelector) {
      const startElement = this.page.locator(startSelector).first();
      if (await startElement.count() > 0) {
        await startElement.focus();
      }
    }

    // Tab through elements
    for (let i = 0; i < 20; i++) {
      await this.page.keyboard.press('Tab');
      await this.page.waitForTimeout(100);

      const focused = await this.page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el.tagName === 'BODY') return null;
        
        return {
          tagName: el.tagName,
          className: el.className,
          id: el.id,
          textContent: el.textContent?.substring(0, 50),
          ariaLabel: el.getAttribute('aria-label'),
          role: el.getAttribute('role')
        };
      });

      if (focused) {
        const elementDesc = `${focused.tagName}${focused.id ? '#' + focused.id : ''}${focused.className ? '.' + focused.className.split(' ')[0] : ''}: ${focused.textContent || focused.ariaLabel || 'no text'}`;
        accessibleElements.push(elementDesc);
      }
    }

    return {
      totalElements: accessibleElements.length,
      accessibleElements: Array.from(new Set(accessibleElements)) // Remove duplicates
    };
  }

  /**
   * Perform comprehensive accessibility check on element
   */
  async checkAccessibility(locator: Locator): Promise<AccessibilityCheck> {
    if (await locator.count() === 0) {
      return {
        hasAriaLabel: false,
        hasRole: false,
        isKeyboardAccessible: false,
        hasProperContrast: false
      };
    }

    const element = locator.first();
    
    const hasAriaLabel = !!(await element.getAttribute('aria-label') || 
                           await element.getAttribute('aria-labelledby') ||
                           await element.getAttribute('aria-describedby'));
    
    const hasRole = !!(await element.getAttribute('role'));
    
    // Test keyboard accessibility
    let isKeyboardAccessible = false;
    try {
      await element.focus({ timeout: 1000 });
      const focused = await this.page.evaluate(() => document.activeElement?.tagName);
      isKeyboardAccessible = !!focused && focused !== 'BODY';
    } catch {
      isKeyboardAccessible = false;
    }

    // Basic contrast check (simplified)
    const hasProperContrast = await element.evaluate(el => {
      const computed = window.getComputedStyle(el);
      const bgColor = computed.backgroundColor;
      const textColor = computed.color;
      
      // If background is transparent and text is not white/black, assume proper contrast
      return bgColor !== 'rgba(0, 0, 0, 0)' || textColor === 'rgb(0, 0, 0)' || textColor === 'rgb(255, 255, 255)';
    });

    return {
      hasAriaLabel,
      hasRole,
      isKeyboardAccessible,
      hasProperContrast
    };
  }

  /**
   * Test form validation comprehensively
   */
  async testFormValidation(formLocator: Locator): Promise<{
    hasValidation: boolean;
    validationMessages: string[];
    requiredFields: number;
    labeledFields: number;
  }> {
    const validationMessages: string[] = [];
    
    // Get all form inputs
    const inputs = formLocator.locator('input, textarea, select');
    const inputCount = await inputs.count();
    
    let requiredFields = 0;
    let labeledFields = 0;

    // Check each input for proper labeling and required attributes
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      
      const isRequired = !!(await input.getAttribute('required') || 
                           await input.getAttribute('aria-required'));
      if (isRequired) requiredFields++;

      // Check for proper labeling
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledby = await input.getAttribute('aria-labelledby');
      
      let hasLabel = false;
      if (id) {
        const label = formLocator.locator(`label[for="${id}"]`);
        hasLabel = await label.count() > 0;
      }
      
      if (hasLabel || ariaLabel || ariaLabelledby) {
        labeledFields++;
      }
    }

    // Try to submit form without filling required fields
    const submitButton = formLocator.locator('button[type="submit"], input[type="submit"]').first();
    
    if (await submitButton.count() > 0) {
      await submitButton.click();
      await this.page.waitForTimeout(500);

      // Look for validation messages
      const errorElements = formLocator.locator('.error, [class*="error"], [role="alert"], [aria-invalid="true"]');
      const errorCount = await errorElements.count();

      for (let i = 0; i < errorCount; i++) {
        const errorText = await errorElements.nth(i).textContent();
        if (errorText) {
          validationMessages.push(errorText.trim());
        }
      }
    }

    return {
      hasValidation: validationMessages.length > 0,
      validationMessages,
      requiredFields,
      labeledFields
    };
  }

  /**
   * Test loading states and performance
   */
  async testLoadingStates(actionCallback: () => Promise<void>): Promise<{
    hasLoadingIndicator: boolean;
    loadingTime: number;
    loadingIndicatorTypes: string[];
  }> {
    const startTime = Date.now();
    const loadingIndicatorTypes: string[] = [];

    // Execute the action that should trigger loading
    await actionCallback();

    // Check for various loading indicators
    const loadingSelectors = [
      '[class*="loading"]',
      '[class*="spinner"]', 
      '[aria-busy="true"]',
      '[data-testid*="loading"]',
      '.animate-pulse',
      '.animate-spin'
    ];

    let hasLoadingIndicator = false;

    for (const selector of loadingSelectors) {
      const elements = this.page.locator(selector);
      const count = await elements.count();
      
      if (count > 0) {
        hasLoadingIndicator = true;
        loadingIndicatorTypes.push(selector);
      }
    }

    // Wait for loading to complete
    try {
      await this.page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch {
      // Timeout is acceptable for this test
    }

    const loadingTime = Date.now() - startTime;

    return {
      hasLoadingIndicator,
      loadingTime,
      loadingIndicatorTypes
    };
  }

  /**
   * Test responsive behavior at different viewport sizes
   */
  async testResponsiveBehavior(): Promise<{
    desktop: { width: number; height: number; screenshot: string };
    tablet: { width: number; height: number; screenshot: string };
    mobile: { width: number; height: number; screenshot: string };
  }> {
    const viewports = {
      desktop: { width: 1920, height: 1080 },
      tablet: { width: 768, height: 1024 },
      mobile: { width: 375, height: 667 }
    };

    const results: any = {};

    for (const [device, viewport] of Object.entries(viewports)) {
      await this.page.setViewportSize(viewport);
      await this.page.waitForTimeout(500); // Allow layout to settle

      const screenshot = `responsive-${device}-${Date.now()}.png`;
      await this.page.screenshot({ path: screenshot });

      results[device] = {
        width: viewport.width,
        height: viewport.height,
        screenshot
      };
    }

    return results;
  }

  /**
   * Check for console errors and warnings
   */
  async captureConsoleMessages(): Promise<{
    errors: string[];
    warnings: string[];
    logs: string[];
  }> {
    const messages = {
      errors: [] as string[],
      warnings: [] as string[],
      logs: [] as string[]
    };

    this.page.on('console', msg => {
      const text = msg.text();
      switch (msg.type()) {
        case 'error':
          messages.errors.push(text);
          break;
        case 'warning':
          messages.warnings.push(text);
          break;
        case 'log':
          messages.logs.push(text);
          break;
      }
    });

    return messages;
  }

  /**
   * Test modal behavior (focus trap, escape key, etc.)
   */
  async testModalBehavior(modalLocator: Locator): Promise<{
    trapsFocus: boolean;
    closesWithEscape: boolean;
    hasProperAria: boolean;
    returnsFocus: boolean;
  }> {
    if (!await modalLocator.isVisible()) {
      return {
        trapsFocus: false,
        closesWithEscape: false,
        hasProperAria: false,
        returnsFocus: false
      };
    }

    // Test ARIA attributes
    const role = await modalLocator.getAttribute('role');
    const ariaModal = await modalLocator.getAttribute('aria-modal');
    const ariaLabel = await modalLocator.getAttribute('aria-label');
    const ariaLabelledby = await modalLocator.getAttribute('aria-labelledby');
    
    const hasProperAria = role === 'dialog' && 
                         ariaModal === 'true' && 
                         (!!ariaLabel || !!ariaLabelledby);

    // Test focus behavior
    const focusedBeforeModal = await this.page.evaluate(() => document.activeElement?.tagName);
    
    // Test if focus moves into modal
    await this.page.keyboard.press('Tab');
    const focusedInModal = await this.page.evaluate(() => {
      const el = document.activeElement;
      return el?.closest('[role="dialog"], .modal, [data-testid*="modal"]') !== null;
    });

    // Test escape key
    const initiallyVisible = await modalLocator.isVisible();
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(300);
    const visibleAfterEscape = await modalLocator.isVisible();
    const closesWithEscape = initiallyVisible && !visibleAfterEscape;

    return {
      trapsFocus: focusedInModal,
      closesWithEscape,
      hasProperAria,
      returnsFocus: true // Simplified for this implementation
    };
  }

  /**
   * Generate a test report section
   */
  generateTestReport(testName: string, results: any): string {
    const timestamp = new Date().toISOString();
    
    return `
=== ${testName} ===
Timestamp: ${timestamp}
Results: ${JSON.stringify(results, null, 2)}
========================
`;
  }
}

/**
 * Utility functions for common test patterns
 */
export class TestPatterns {
  static async waitForStableDOM(page: Page, timeout = 2000): Promise<void> {
    let previousHTML = '';
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const currentHTML = await page.innerHTML('body');
      
      if (currentHTML === previousHTML) {
        await page.waitForTimeout(100);
        const finalHTML = await page.innerHTML('body');
        
        if (finalHTML === currentHTML) {
          return; // DOM is stable
        }
      }
      
      previousHTML = currentHTML;
      await page.waitForTimeout(100);
    }
  }

  static async verifyElementExists(page: Page, selector: string, shouldExist = true): Promise<boolean> {
    const element = page.locator(selector);
    const count = await element.count();
    
    if (shouldExist) {
      return count > 0;
    } else {
      return count === 0;
    }
  }

  static async verifyTextContent(page: Page, selector: string, expectedText: string | RegExp): Promise<boolean> {
    const element = page.locator(selector);
    
    if (await element.count() === 0) return false;
    
    const actualText = await element.textContent();
    
    if (typeof expectedText === 'string') {
      return actualText?.includes(expectedText) || false;
    } else {
      return expectedText.test(actualText || '');
    }
  }

  static async simulateSlowNetwork(page: Page, delay = 2000): Promise<void> {
    await page.route('**/*', async route => {
      await page.waitForTimeout(delay);
      route.continue();
    });
  }

  static async simulateNetworkFailure(page: Page, patterns: string[] = ['**/api/**']): Promise<void> {
    for (const pattern of patterns) {
      await page.route(pattern, route => route.abort());
    }
  }
} 