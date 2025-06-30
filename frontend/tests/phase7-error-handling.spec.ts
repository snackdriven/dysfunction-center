import { test, expect } from '@playwright/test';

test.describe('Phase 7: Error Handling and Edge Cases Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('7.1 Error Boundary Testing', () => {
    test('JavaScript error handling', async ({ page }) => {
      console.log('Testing JavaScript error handling...');
      
      // Listen for console errors
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      // Try to trigger a JavaScript error
      await page.evaluate(() => {
        // Try to access undefined property
        try {
          (window as any).nonExistentFunction();
        } catch (error) {
          console.error('Intentional test error:', error);
        }
      });
      
      await page.waitForTimeout(500);
      
      // Check if error boundary caught the error
      const errorBoundary = page.locator('[data-testid*="error-boundary"], .error-boundary, [class*="error-fallback"]').first();
      const errorBoundaryVisible = await errorBoundary.isVisible();
      
      console.log(`Error boundary displayed: ${errorBoundaryVisible}`);
      console.log(`Console errors captured: ${consoleErrors.length}`);
      
      if (consoleErrors.length > 0) {
        console.log(`First error: ${consoleErrors[0]}`);
      }
      
      console.log('✅ JavaScript error handling tested');
    });

    test('Component crash recovery', async ({ page }) => {
      console.log('Testing component crash recovery...');
      
      // Try to navigate to different pages and check for error boundaries
      const testPages = ['/tasks', '/habits', '/mood', '/journal', '/calendar', '/settings'];
      
      for (const testPage of testPages) {
        await page.goto(`http://localhost:3000${testPage}`);
        await page.waitForLoadState('networkidle');
        
        // Check for error boundaries or fallback UI
        const errorFallback = page.locator('[data-testid*="error"], .error-fallback, [class*="error-boundary"]').first();
        const errorVisible = await errorFallback.isVisible();
        
        if (errorVisible) {
          console.log(`Error boundary found on ${testPage}`);
          
          // Look for recovery options
          const retryButton = errorFallback.locator('button:has-text("Retry"), button:has-text("Reload"), button[data-testid*="retry"]').first();
          if (await retryButton.count() > 0) {
            await retryButton.click();
            await page.waitForTimeout(500);
            console.log(`Recovery option available on ${testPage}`);
          }
        }
      }
      
      console.log('✅ Component crash recovery tested');
    });

    test('Network error handling', async ({ page }) => {
      console.log('Testing network error handling...');
      
      // Simulate network issues by intercepting requests
      await page.route('**/api/**', route => route.abort());
      
      // Try to perform actions that require network calls
      const taskButton = page.locator('button:has-text("Add Task"), button:has-text("Task")').first();
      
      if (await taskButton.count() > 0) {
        await taskButton.click();
        await page.waitForTimeout(500);
        
        const form = page.locator('form, [role="dialog"]').first();
        
        if (await form.isVisible()) {
          const titleInput = form.locator('input[name*="title"], input[placeholder*="title"]').first();
          const submitButton = form.locator('button[type="submit"], button:has-text("Save")').first();
          
          if (await titleInput.count() > 0 && await submitButton.count() > 0) {
            await titleInput.fill('Network Test Task');
            await submitButton.click();
            await page.waitForTimeout(1000);
            
            // Check for network error display
            const errorMessage = page.locator('[role="alert"], .error, [class*="error"], .toast').first();
            const errorVisible = await errorMessage.isVisible();
            
            console.log(`Network error message displayed: ${errorVisible}`);
            
            if (errorVisible) {
              const errorText = await errorMessage.textContent();
              console.log(`Error message: ${errorText}`);
            }
          }
        }
      }
      
      // Restore network
      await page.unroute('**/api/**');
      console.log('✅ Network error handling tested');
    });

    test('Form validation error displays', async ({ page }) => {
      console.log('Testing form validation error displays...');
      
      const taskButton = page.locator('button:has-text("Add Task"), button:has-text("Task")').first();
      
      if (await taskButton.count() > 0) {
        await taskButton.click();
        await page.waitForTimeout(500);
        
        const form = page.locator('form, [role="dialog"]').first();
        
        if (await form.isVisible()) {
          // Try to submit empty form
          const submitButton = form.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")').first();
          
          if (await submitButton.count() > 0) {
            await submitButton.click();
            await page.waitForTimeout(300);
            
            // Check for validation errors
            const validationErrors = form.locator('.error, [class*="error"], [role="alert"], [aria-invalid="true"]');
            const errorCount = await validationErrors.count();
            
            console.log(`Validation errors displayed: ${errorCount}`);
            
            if (errorCount > 0) {
              for (let i = 0; i < Math.min(errorCount, 3); i++) {
                const error = validationErrors.nth(i);
                const errorText = await error.textContent();
                console.log(`Validation error ${i + 1}: ${errorText}`);
              }
              
              // Check if errors are properly associated with form fields
              const ariaDescribedByElements = form.locator('[aria-describedby]');
              const describedByCount = await ariaDescribedByElements.count();
              
              console.log(`Form fields with error associations: ${describedByCount}`);
            }
          }
        }
      }
      
      console.log('✅ Form validation error displays tested');
    });
  });

  test.describe('7.2 Performance and Loading States Testing', () => {
    test('Loading spinner functionality', async ({ page }) => {
      console.log('Testing loading spinner functionality...');
      
      // Check for loading spinners on initial page load
      await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
      
      const loadingSpinners = page.locator('[class*="loading"], [class*="spinner"], [data-testid*="loading"], [aria-busy="true"]');
      const spinnerCount = await loadingSpinners.count();
      
      console.log(`Loading spinners found: ${spinnerCount}`);
      
      if (spinnerCount > 0) {
        // Wait for loading to complete
        await page.waitForLoadState('networkidle');
        
        // Check if spinners are hidden after loading
        const spinnersAfterLoad = await loadingSpinners.count();
        console.log(`Spinners remaining after load: ${spinnersAfterLoad}`);
      }
      
      console.log('✅ Loading spinner functionality tested');
    });

    test('Skeleton loader display', async ({ page }) => {
      console.log('Testing skeleton loader display...');
      
      // Navigate to a data-heavy page
      await page.goto('http://localhost:3000/tasks', { waitUntil: 'domcontentloaded' });
      
      // Look for skeleton loaders
      const skeletonLoaders = page.locator('[class*="skeleton"], [data-testid*="skeleton"], [class*="pulse"]');
      const skeletonCount = await skeletonLoaders.count();
      
      console.log(`Skeleton loaders found: ${skeletonCount}`);
      
      if (skeletonCount > 0) {
        // Wait for content to load
        await page.waitForLoadState('networkidle');
        
        // Check if skeletons are replaced with actual content
        const skeletonsAfterLoad = await skeletonLoaders.count();
        console.log(`Skeletons remaining after load: ${skeletonsAfterLoad}`);
      }
      
      console.log('✅ Skeleton loader display tested');
    });

    test('Slow network condition handling', async ({ page }) => {
      console.log('Testing slow network condition handling...');
      
      // Simulate slow network
      await page.route('**/api/**', async route => {
        await page.waitForTimeout(2000); // 2 second delay
        route.continue();
      });
      
      // Try to load a page with data
      const startTime = Date.now();
      await page.goto('http://localhost:3000/tasks');
      
      // Check for loading indicators during slow load
      const loadingIndicators = page.locator('[class*="loading"], [class*="spinner"], [aria-busy="true"]');
      const indicatorVisible = await loadingIndicators.first().isVisible();
      
      console.log(`Loading indicators visible during slow load: ${indicatorVisible}`);
      
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      console.log(`Page load time with slow network: ${loadTime}ms`);
      
      // Check for timeout handling
      const timeoutMessage = page.locator(':has-text("timeout"), :has-text("slow"), [class*="timeout"]').first();
      const timeoutVisible = await timeoutMessage.isVisible();
      
      console.log(`Timeout message displayed: ${timeoutVisible}`);
      
      // Restore normal network
      await page.unroute('**/api/**');
      console.log('✅ Slow network condition handling tested');
    });

    test('Large dataset performance', async ({ page }) => {
      console.log('Testing large dataset performance...');
      
      // Navigate to tasks page (likely to have data)
      const startTime = Date.now();
      await page.goto('http://localhost:3000/tasks');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      console.log(`Tasks page load time: ${loadTime}ms`);
      
      // Count displayed items
      const taskItems = page.locator('[data-testid*="task"], .task-item, li, tr').filter({ hasText: /.+/ });
      const itemCount = await taskItems.count();
      
      console.log(`Task items displayed: ${itemCount}`);
      
      // Test scrolling performance if many items
      if (itemCount > 10) {
        const scrollStartTime = Date.now();
        
        for (let i = 0; i < 3; i++) {
          await page.keyboard.press('PageDown');
          await page.waitForTimeout(100);
        }
        
        const scrollTime = Date.now() - scrollStartTime;
        console.log(`Scrolling performance: ${scrollTime}ms for 3 page downs`);
      }
      
      // Check for pagination or infinite scroll
      const paginationControls = page.locator('[aria-label*="pagination"], .pagination, button:has-text("Next"), button:has-text("Load More")');
      const paginationCount = await paginationControls.count();
      
      console.log(`Pagination controls found: ${paginationCount}`);
      
      console.log('✅ Large dataset performance tested');
    });

    test('Memory usage monitoring', async ({ page }) => {
      console.log('Testing memory usage patterns...');
      
      // Get baseline memory usage
      const initialMemory = await page.evaluate(() => {
        return (performance as any).memory ? {
          used: (performance as any).memory.usedJSHeapSize,
          total: (performance as any).memory.totalJSHeapSize,
          limit: (performance as any).memory.jsHeapSizeLimit
        } : null;
      });
      
      if (initialMemory) {
        console.log(`Initial memory usage: ${Math.round(initialMemory.used / 1024 / 1024)}MB`);
        
        // Navigate through different pages
        const testPages = ['/tasks', '/habits', '/mood', '/journal', '/calendar'];
        
        for (const testPage of testPages) {
          await page.goto(`http://localhost:3000${testPage}`);
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(500);
        }
        
        // Check memory after navigation
        const finalMemory = await page.evaluate(() => {
          return (performance as any).memory ? {
            used: (performance as any).memory.usedJSHeapSize,
            total: (performance as any).memory.totalJSHeapSize,
            limit: (performance as any).memory.jsHeapSizeLimit
          } : null;
        });
        
        if (finalMemory) {
          console.log(`Final memory usage: ${Math.round(finalMemory.used / 1024 / 1024)}MB`);
          const memoryIncrease = finalMemory.used - initialMemory.used;
          console.log(`Memory increase: ${Math.round(memoryIncrease / 1024 / 1024)}MB`);
          
          if (memoryIncrease > 50 * 1024 * 1024) { // 50MB threshold
            console.log('⚠️ Significant memory increase detected');
          }
        }
      } else {
        console.log('ℹ️ Memory performance API not available');
      }
      
      console.log('✅ Memory usage monitoring tested');
    });
  });

  test.describe('Edge Case Testing', () => {
    test('Empty state handling', async ({ page }) => {
      console.log('Testing empty state handling...');
      
      // Test various pages for empty state displays
      const testPages = [
        { path: '/tasks', emptyText: ['no tasks', 'empty', 'get started'] },
        { path: '/habits', emptyText: ['no habits', 'empty', 'create'] },
        { path: '/mood', emptyText: ['no mood', 'empty', 'track'] },
        { path: '/journal', emptyText: ['no entries', 'empty', 'write'] }
      ];
      
      for (const testPage of testPages) {
        await page.goto(`http://localhost:3000${testPage.path}`);
        await page.waitForLoadState('networkidle');
        
        // Look for empty state indicators
        let emptyStateFound = false;
        
        for (const emptyText of testPage.emptyText) {
          const emptyStateElement = page.locator(`:has-text("${emptyText}")`, { hasText: new RegExp(emptyText, 'i') }).first();
          
          if (await emptyStateElement.count() > 0) {
            emptyStateFound = true;
            const emptyStateText = await emptyStateElement.textContent();
            console.log(`Empty state found on ${testPage.path}: "${emptyStateText}"`);
            break;
          }
        }
        
        if (!emptyStateFound) {
          console.log(`No empty state message found on ${testPage.path}`);
        }
      }
      
      console.log('✅ Empty state handling tested');
    });

    test('Invalid URL handling', async ({ page }) => {
      console.log('Testing invalid URL handling...');
      
      const invalidUrls = [
        '/invalid-page',
        '/tasks/999999',
        '/habits/nonexistent',
        '/mood/invalid-id',
        '/journal/fake-entry'
      ];
      
      for (const invalidUrl of invalidUrls) {
        await page.goto(`http://localhost:3000${invalidUrl}`);
        await page.waitForLoadState('networkidle');
        
        // Check for 404 or error page
        const notFoundElements = page.locator(':has-text("404"), :has-text("not found"), :has-text("page not found"), [class*="not-found"]', { hasText: /404|not found/i });
        const notFoundVisible = await notFoundElements.first().isVisible();
        
        console.log(`404/Not Found page for ${invalidUrl}: ${notFoundVisible}`);
        
        // Check for navigation back to home
        const homeLink = page.locator('a[href="/"], a:has-text("Home"), button:has-text("Home")').first();
        if (await homeLink.count() > 0) {
          console.log(`Home navigation available on error page`);
        }
      }
      
      console.log('✅ Invalid URL handling tested');
    });

    test('Browser compatibility edge cases', async ({ page }) => {
      console.log('Testing browser compatibility edge cases...');
      
      // Test local storage availability
      const localStorageTest = await page.evaluate(() => {
        try {
          localStorage.setItem('test', 'value');
          const value = localStorage.getItem('test');
          localStorage.removeItem('test');
          return value === 'value';
        } catch (error) {
          return false;
        }
      });
      
      console.log(`Local storage available: ${localStorageTest}`);
      
      // Test modern JavaScript features
      const modernJsTest = await page.evaluate(() => {
        try {
          // Test arrow functions, destructuring, template literals
          const test = (arr: number[]) => arr.map(x => `Value: ${x}`);
          const [first] = test([1, 2, 3]);
          return first === 'Value: 1';
        } catch (error) {
          return false;
        }
      });
      
      console.log(`Modern JavaScript features: ${modernJsTest}`);
      
      // Test CSS features
      const cssTest = await page.evaluate(() => {
        const testElement = document.createElement('div');
        testElement.style.display = 'grid';
        return testElement.style.display === 'grid';
      });
      
      console.log(`CSS Grid support: ${cssTest}`);
      
      console.log('✅ Browser compatibility tested');
    });

    test('Concurrent user simulation', async ({ page }) => {
      console.log('Testing concurrent user simulation...');
      
      // Simulate multiple rapid actions
      const actions = [
        () => page.goto('http://localhost:3000/tasks'),
        () => page.goto('http://localhost:3000/habits'),
        () => page.goto('http://localhost:3000/mood'),
        () => page.goto('http://localhost:3000/')
      ];
      
      // Execute actions rapidly
      const promises = actions.map((action, index) => {
        return new Promise(resolve => {
          setTimeout(async () => {
            try {
              await action();
              await page.waitForLoadState('networkidle');
              resolve(`Action ${index + 1} completed`);
            } catch (error) {
              resolve(`Action ${index + 1} failed: ${error}`);
            }
          }, index * 100);
        });
      });
      
      const results = await Promise.all(promises);
      results.forEach(result => console.log(result));
      
      // Check if application remained stable
      const currentUrl = page.url();
      const pageTitle = await page.title();
      
      console.log(`Final state - URL: ${currentUrl}, Title: ${pageTitle}`);
      
      // Check for any error messages
      const errorMessages = page.locator('[role="alert"], .error, [class*="error"]');
      const errorCount = await errorMessages.count();
      
      console.log(`Error messages after concurrent actions: ${errorCount}`);
      
      console.log('✅ Concurrent user simulation tested');
    });
  });
}); 