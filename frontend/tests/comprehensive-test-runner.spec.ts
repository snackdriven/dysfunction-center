import { test, expect } from '@playwright/test';

interface TestResult {
  phase: string;
  testName: string;
  status: 'PASS' | 'CONDITIONAL_PASS' | 'FAIL' | 'CRITICAL_FAIL' | 'SKIP';
  issues: string[];
  recommendations: string[];
  duration: number;
}

interface PhaseReport {
  phaseName: string;
  totalTests: number;
  passed: number;
  conditionalPassed: number;
  failed: number;
  criticalFailed: number;
  skipped: number;
  overallStatus: 'PASS' | 'CONDITIONAL_PASS' | 'FAIL' | 'CRITICAL_FAIL';
  results: TestResult[];
}

test.describe('Comprehensive Frontend Testing Protocol Execution', () => {
  let globalReport: PhaseReport[] = [];
  
  test.beforeAll(async () => {
    console.log('🧪 Starting Comprehensive Frontend Element Testing Protocol');
    console.log('📋 Executive Dysfunction Center - Frontend Testing Suite');
    console.log('=' .repeat(80));
  });

  test.afterAll(async () => {
    console.log('\n' + '='.repeat(80));
    console.log('📊 COMPREHENSIVE TESTING PROTOCOL RESULTS');
    console.log('='.repeat(80));
    
    generateFinalReport(globalReport);
  });

  test('Execute Phase 1: Navigation & Layout Elements', async ({ page }) => {
    const phaseReport: PhaseReport = {
      phaseName: 'Phase 1: Navigation & Layout Elements',
      totalTests: 0,
      passed: 0,
      conditionalPassed: 0,
      failed: 0,
      criticalFailed: 0,
      skipped: 0,
      overallStatus: 'PASS',
      results: []
    };

    console.log('\n🔍 PHASE 1: Navigation & Layout Elements Testing');
    console.log('-'.repeat(60));

    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');

    // Test 1.1: Header Component Testing
    await executeTestWithReporting(phaseReport, 'Header Sidebar Toggle', async () => {
      const sidebarToggle = page.locator('button[aria-label*="menu"], button[data-testid*="sidebar"]').first();
      
      if (await sidebarToggle.count() === 0) {
        return { status: 'SKIP', issues: ['No sidebar toggle found'], recommendations: ['Implement sidebar toggle for better navigation'] };
      }

      const sidebar = page.locator('aside, nav[class*="sidebar"]').first();
      const initialVisible = await sidebar.isVisible();
      
      await sidebarToggle.click();
      await page.waitForTimeout(300);
      
      const newVisible = await sidebar.isVisible();
      
      if (newVisible === !initialVisible) {
        return { status: 'PASS', issues: [], recommendations: [] };
      } else {
        return { status: 'FAIL', issues: ['Sidebar toggle does not change sidebar visibility'], recommendations: ['Fix sidebar toggle functionality'] };
      }
    });

    await executeTestWithReporting(phaseReport, 'Header Search Functionality', async () => {
      const searchInput = page.locator('input[placeholder*="search"], input[type="search"]').first();
      
      if (await searchInput.count() === 0) {
        return { status: 'CONDITIONAL_PASS', issues: ['No search input found'], recommendations: ['Consider adding global search functionality'] };
      }

      await searchInput.fill('test query');
      const inputValue = await searchInput.inputValue();
      
      if (inputValue === 'test query') {
        return { status: 'PASS', issues: [], recommendations: [] };
      } else {
        return { status: 'FAIL', issues: ['Search input does not accept text'], recommendations: ['Fix search input functionality'] };
      }
    });

    await executeTestWithReporting(phaseReport, 'Theme Toggle Functionality', async () => {
      const themeToggle = page.locator('button[aria-label*="theme"], button[data-testid*="theme"]').first();
      
      if (await themeToggle.count() === 0) {
        return { status: 'CONDITIONAL_PASS', issues: ['No theme toggle found'], recommendations: ['Consider adding theme toggle for accessibility'] };
      }

      const initialBodyClass = await page.locator('body').getAttribute('class');
      await themeToggle.click();
      await page.waitForTimeout(200);
      const newBodyClass = await page.locator('body').getAttribute('class');
      
      if (initialBodyClass !== newBodyClass) {
        return { status: 'PASS', issues: [], recommendations: [] };
      } else {
        return { status: 'FAIL', issues: ['Theme toggle does not change theme'], recommendations: ['Fix theme toggle implementation'] };
      }
    });

    // Test 1.2: Navigation Links
    await executeTestWithReporting(phaseReport, 'Navigation Links Routing', async () => {
      const navLinks = page.locator('nav a, [role="navigation"] a, aside a');
      const linkCount = await navLinks.count();
      
      if (linkCount === 0) {
        return { status: 'CRITICAL_FAIL', issues: ['No navigation links found'], recommendations: ['Implement proper navigation structure'] };
      }

      let workingLinks = 0;
      const maxTestLinks = Math.min(linkCount, 5);
      
      for (let i = 0; i < maxTestLinks; i++) {
        const link = navLinks.nth(i);
        const href = await link.getAttribute('href');
        const text = await link.textContent();
        
        if (href && !href.startsWith('#') && !href.startsWith('http')) {
          try {
            await link.click();
            await page.waitForLoadState('networkidle');
            workingLinks++;
            
            // Return to home for next test
            await page.goto('http://localhost:3000/');
            await page.waitForLoadState('networkidle');
          } catch (error) {
            // Link failed to navigate
          }
        }
      }
      
      if (workingLinks === maxTestLinks) {
        return { status: 'PASS', issues: [], recommendations: [] };
      } else if (workingLinks > 0) {
        return { status: 'CONDITIONAL_PASS', issues: [`${maxTestLinks - workingLinks} navigation links failed`], recommendations: ['Fix broken navigation links'] };
      } else {
        return { status: 'FAIL', issues: ['No working navigation links found'], recommendations: ['Implement proper routing for navigation'] };
      }
    });

    phaseReport.overallStatus = calculatePhaseStatus(phaseReport);
    globalReport.push(phaseReport);
  });

  test('Execute Phase 2: Dashboard Components', async ({ page }) => {
    const phaseReport: PhaseReport = {
      phaseName: 'Phase 2: Dashboard Components',
      totalTests: 0,
      passed: 0,
      conditionalPassed: 0,
      failed: 0,
      criticalFailed: 0,
      skipped: 0,
      overallStatus: 'PASS',
      results: []
    };

    console.log('\n📊 PHASE 2: Dashboard Components Testing');
    console.log('-'.repeat(60));

    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');

    // Test 2.1: Dashboard Tabs
    await executeTestWithReporting(phaseReport, 'Dashboard Tab Switching', async () => {
      const tabs = page.locator('[role="tab"], [data-testid*="tab"], button[class*="tab"]');
      const tabCount = await tabs.count();
      
      if (tabCount === 0) {
        return { status: 'CONDITIONAL_PASS', issues: ['No tab interface found'], recommendations: ['Consider implementing tabbed dashboard for better organization'] };
      }

      let workingTabs = 0;
      
      for (let i = 0; i < tabCount; i++) {
        const tab = tabs.nth(i);
        await tab.click();
        await page.waitForTimeout(200);
        
        const isActive = await tab.evaluate(el => {
          return el.getAttribute('aria-selected') === 'true' || 
                 el.className.includes('active') ||
                 el.getAttribute('data-state') === 'active';
        });
        
        if (isActive) {
          workingTabs++;
        }
      }
      
      if (workingTabs === tabCount) {
        return { status: 'PASS', issues: [], recommendations: [] };
      } else if (workingTabs > 0) {
        return { status: 'CONDITIONAL_PASS', issues: [`${tabCount - workingTabs} tabs not working properly`], recommendations: ['Fix tab activation states'] };
      } else {
        return { status: 'FAIL', issues: ['Tab switching not functional'], recommendations: ['Implement proper tab functionality'] };
      }
    });

    // Test 2.2: Quick Actions
    await executeTestWithReporting(phaseReport, 'Quick Action Buttons', async () => {
      const quickActions = [
        'button:has-text("Task"), button:has-text("Add Task")',
        'button:has-text("Habit"), button:has-text("Add Habit")',
        'button:has-text("Mood"), button:has-text("Add Mood")',
        'button:has-text("Event"), button:has-text("Add Event")'
      ];
      
      let workingActions = 0;
      
      for (const actionSelector of quickActions) {
        const button = page.locator(actionSelector).first();
        
        if (await button.count() > 0) {
          await button.click();
          await page.waitForTimeout(500);
          
          const modal = page.locator('[role="dialog"], [data-testid*="modal"], .modal').first();
          if (await modal.isVisible()) {
            workingActions++;
            
            // Close modal
            await page.keyboard.press('Escape');
            await page.waitForTimeout(300);
          }
        }
      }
      
      if (workingActions >= 2) {
        return { status: 'PASS', issues: [], recommendations: [] };
      } else if (workingActions > 0) {
        return { status: 'CONDITIONAL_PASS', issues: [`Only ${workingActions} quick actions working`], recommendations: ['Implement all quick action buttons'] };
      } else {
        return { status: 'FAIL', issues: ['No quick action buttons functional'], recommendations: ['Implement quick action functionality'] };
      }
    });

    phaseReport.overallStatus = calculatePhaseStatus(phaseReport);
    globalReport.push(phaseReport);
  });

  test('Execute Phase 3: Form Components', async ({ page }) => {
    const phaseReport: PhaseReport = {
      phaseName: 'Phase 3: Form Components',
      totalTests: 0,
      passed: 0,
      conditionalPassed: 0,
      failed: 0,
      criticalFailed: 0,
      skipped: 0,
      overallStatus: 'PASS',
      results: []
    };

    console.log('\n📝 PHASE 3: Form Components Testing');
    console.log('-'.repeat(60));

    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');

    // Test 3.1: Task Form Functionality
    await executeTestWithReporting(phaseReport, 'Task Form Basic Functionality', async () => {
      const taskButton = page.locator('button:has-text("Task"), button:has-text("Add Task")').first();
      
      if (await taskButton.count() === 0) {
        return { status: 'FAIL', issues: ['No task creation button found'], recommendations: ['Implement task creation functionality'] };
      }

      await taskButton.click();
      await page.waitForTimeout(500);
      
      const form = page.locator('form, [role="dialog"]').first();
      
      if (!await form.isVisible()) {
        return { status: 'FAIL', issues: ['Task form does not open'], recommendations: ['Fix task form modal/dialog'] };
      }

      const titleInput = form.locator('input[placeholder*="title"], input[name*="title"]').first();
      
      if (await titleInput.count() === 0) {
        return { status: 'FAIL', issues: ['No title input found in task form'], recommendations: ['Add title input to task form'] };
      }

      await titleInput.fill('Test Task');
      const inputValue = await titleInput.inputValue();
      
      if (inputValue === 'Test Task') {
        return { status: 'PASS', issues: [], recommendations: [] };
      } else {
        return { status: 'FAIL', issues: ['Task form inputs not working'], recommendations: ['Fix task form input functionality'] };
      }
    });

    // Test form validation
    await executeTestWithReporting(phaseReport, 'Form Validation', async () => {
      const taskButton = page.locator('button:has-text("Task"), button:has-text("Add Task")').first();
      
      if (await taskButton.count() === 0) {
        return { status: 'SKIP', issues: ['No task form to test'], recommendations: [] };
      }

      await taskButton.click();
      await page.waitForTimeout(500);
      
      const form = page.locator('form, [role="dialog"]').first();
      const submitButton = form.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")').first();
      
      if (await submitButton.count() > 0) {
        // Try to submit empty form
        await submitButton.click();
        await page.waitForTimeout(300);
        
        const validationErrors = form.locator('.error, [class*="error"], [role="alert"]');
        const errorCount = await validationErrors.count();
        
        if (errorCount > 0) {
          return { status: 'PASS', issues: [], recommendations: [] };
        } else {
          return { status: 'CONDITIONAL_PASS', issues: ['No validation errors shown'], recommendations: ['Add form validation for better UX'] };
        }
      } else {
        return { status: 'SKIP', issues: ['No submit button found'], recommendations: [] };
      }
    });

    phaseReport.overallStatus = calculatePhaseStatus(phaseReport);
    globalReport.push(phaseReport);
  });

  test('Execute Accessibility Audit', async ({ page }) => {
    const phaseReport: PhaseReport = {
      phaseName: 'Cross-Phase Accessibility Audit',
      totalTests: 0,
      passed: 0,
      conditionalPassed: 0,
      failed: 0,
      criticalFailed: 0,
      skipped: 0,
      overallStatus: 'PASS',
      results: []
    };

    console.log('\n♿ CROSS-PHASE: Accessibility Audit');
    console.log('-'.repeat(60));

    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');

    // Test keyboard navigation
    await executeTestWithReporting(phaseReport, 'Keyboard Navigation', async () => {
      let tabCount = 0;
      const focusableElements: string[] = [];
      
      for (let i = 0; i < 15; i++) {
        await page.keyboard.press('Tab');
        const focused = await page.evaluate(() => {
          const el = document.activeElement;
          return {
            tagName: el?.tagName,
            className: el?.className.substring(0, 50),
            textContent: el?.textContent?.substring(0, 30)
          };
        });
        
        if (focused.tagName && focused.tagName !== 'BODY') {
          tabCount++;
          focusableElements.push(`${focused.tagName}: ${focused.textContent}`);
        }
      }
      
      if (tabCount >= 5) {
        return { status: 'PASS', issues: [], recommendations: [] };
      } else if (tabCount > 0) {
        return { status: 'CONDITIONAL_PASS', issues: [`Only ${tabCount} focusable elements found`], recommendations: ['Ensure all interactive elements are keyboard accessible'] };
      } else {
        return { status: 'FAIL', issues: ['No keyboard accessible elements found'], recommendations: ['Implement proper keyboard navigation'] };
      }
    });

    // Test ARIA labels
    await executeTestWithReporting(phaseReport, 'ARIA Labels and Roles', async () => {
      const elementsWithAria = page.locator('[aria-label], [aria-labelledby], [aria-describedby], [role]');
      const ariaCount = await elementsWithAria.count();
      
      if (ariaCount >= 10) {
        return { status: 'PASS', issues: [], recommendations: [] };
      } else if (ariaCount >= 5) {
        return { status: 'CONDITIONAL_PASS', issues: ['Limited ARIA labeling'], recommendations: ['Add more ARIA labels for better accessibility'] };
      } else {
        return { status: 'FAIL', issues: ['Insufficient ARIA labeling'], recommendations: ['Implement comprehensive ARIA labeling'] };
      }
    });

    phaseReport.overallStatus = calculatePhaseStatus(phaseReport);
    globalReport.push(phaseReport);
  });

  // Helper function to execute tests with reporting
  async function executeTestWithReporting(
    phaseReport: PhaseReport,
    testName: string,
    testFunction: () => Promise<{ status: TestResult['status'], issues: string[], recommendations: string[] }>
  ) {
    const startTime = Date.now();
    
    try {
      const result = await testFunction();
      const duration = Date.now() - startTime;
      
      const testResult: TestResult = {
        phase: phaseReport.phaseName,
        testName,
        status: result.status,
        issues: result.issues,
        recommendations: result.recommendations,
        duration
      };
      
      phaseReport.results.push(testResult);
      phaseReport.totalTests++;
      
      switch (result.status) {
        case 'PASS':
          phaseReport.passed++;
          console.log(`  ✅ ${testName}`);
          break;
        case 'CONDITIONAL_PASS':
          phaseReport.conditionalPassed++;
          console.log(`  ⚠️  ${testName} (with issues)`);
          result.issues.forEach(issue => console.log(`     - ${issue}`));
          break;
        case 'FAIL':
          phaseReport.failed++;
          console.log(`  ❌ ${testName}`);
          result.issues.forEach(issue => console.log(`     - ${issue}`));
          break;
        case 'CRITICAL_FAIL':
          phaseReport.criticalFailed++;
          console.log(`  🚨 ${testName} (CRITICAL)`);
          result.issues.forEach(issue => console.log(`     - ${issue}`));
          break;
        case 'SKIP':
          phaseReport.skipped++;
          console.log(`  ⏭️  ${testName} (skipped)`);
          break;
      }
      
      if (result.recommendations.length > 0) {
        result.recommendations.forEach(rec => console.log(`     💡 ${rec}`));
      }
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      const testResult: TestResult = {
        phase: phaseReport.phaseName,
        testName,
        status: 'CRITICAL_FAIL',
        issues: [`Test execution failed: ${error}`],
        recommendations: ['Fix test execution error'],
        duration
      };
      
      phaseReport.results.push(testResult);
      phaseReport.totalTests++;
      phaseReport.criticalFailed++;
      
      console.log(`  🚨 ${testName} (CRITICAL - Test Failed)`);
      console.log(`     - ${error}`);
    }
  }

  // Helper function to calculate phase status
  function calculatePhaseStatus(phaseReport: PhaseReport): PhaseReport['overallStatus'] {
    if (phaseReport.criticalFailed > 0) return 'CRITICAL_FAIL';
    if (phaseReport.failed > 0) return 'FAIL';
    if (phaseReport.conditionalPassed > 0) return 'CONDITIONAL_PASS';
    return 'PASS';
  }

  // Helper function to generate final report
  function generateFinalReport(reports: PhaseReport[]) {
    let totalTests = 0;
    let totalPassed = 0;
    let totalConditionalPassed = 0;
    let totalFailed = 0;
    let totalCriticalFailed = 0;
    let totalSkipped = 0;

    console.log('\n📋 PHASE SUMMARY:');
    console.log('-'.repeat(80));

    reports.forEach(report => {
      totalTests += report.totalTests;
      totalPassed += report.passed;
      totalConditionalPassed += report.conditionalPassed;
      totalFailed += report.failed;
      totalCriticalFailed += report.criticalFailed;
      totalSkipped += report.skipped;

      const statusIcon = getStatusIcon(report.overallStatus);
      console.log(`${statusIcon} ${report.phaseName}`);
      console.log(`   Tests: ${report.totalTests} | Pass: ${report.passed} | Conditional: ${report.conditionalPassed} | Fail: ${report.failed} | Critical: ${report.criticalFailed} | Skip: ${report.skipped}`);
    });

    console.log('\n📊 OVERALL RESULTS:');
    console.log('-'.repeat(80));
    console.log(`Total Tests Executed: ${totalTests}`);
    console.log(`✅ Passed: ${totalPassed} (${((totalPassed/totalTests)*100).toFixed(1)}%)`);
    console.log(`⚠️  Conditional Pass: ${totalConditionalPassed} (${((totalConditionalPassed/totalTests)*100).toFixed(1)}%)`);
    console.log(`❌ Failed: ${totalFailed} (${((totalFailed/totalTests)*100).toFixed(1)}%)`);
    console.log(`🚨 Critical Failed: ${totalCriticalFailed} (${((totalCriticalFailed/totalTests)*100).toFixed(1)}%)`);
    console.log(`⏭️  Skipped: ${totalSkipped} (${((totalSkipped/totalTests)*100).toFixed(1)}%)`);

    const overallStatus = totalCriticalFailed > 0 ? 'CRITICAL_FAIL' :
                         totalFailed > 0 ? 'FAIL' :
                         totalConditionalPassed > 0 ? 'CONDITIONAL_PASS' : 'PASS';

    console.log(`\n🎯 OVERALL STATUS: ${getStatusIcon(overallStatus)} ${overallStatus}`);

    if (overallStatus === 'PASS') {
      console.log('\n🎉 Congratulations! Your application passes the comprehensive testing protocol.');
    } else if (overallStatus === 'CONDITIONAL_PASS') {
      console.log('\n👍 Your application functions well but has some areas for improvement.');
    } else if (overallStatus === 'FAIL') {
      console.log('\n⚠️  Your application has significant issues that should be addressed.');
    } else {
      console.log('\n🚨 Your application has critical issues that require immediate attention.');
    }

    console.log('\n📚 For detailed recommendations, review the individual test results above.');
    console.log('='.repeat(80));
  }

  function getStatusIcon(status: PhaseReport['overallStatus']): string {
    switch (status) {
      case 'PASS': return '✅';
      case 'CONDITIONAL_PASS': return '⚠️';
      case 'FAIL': return '❌';
      case 'CRITICAL_FAIL': return '🚨';
      default: return '❓';
    }
  }
}); 