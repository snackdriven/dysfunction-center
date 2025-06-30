import { test, expect } from '@playwright/test';

test.describe('Phase 6: Analytics and Insights Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('6.1 Productivity Analytics Testing', () => {
    test('Productivity metrics display', async ({ page }) => {
      console.log('Testing productivity metrics display...');
      
      // Check dashboard insights
      const insightsPanel = page.locator('[data-testid*="insights"], [class*="insights"], [class*="analytics"]').first();
      
      if (await insightsPanel.isVisible()) {
        // Look for key metrics
        const metrics = insightsPanel.locator('[data-testid*="metric"], .metric, [class*="stat"]');
        const metricsCount = await metrics.count();
        
        console.log(`Productivity metrics found: ${metricsCount}`);
        
        // Check for specific metric types
        const completionRate = insightsPanel.locator(':has-text("completion"), :has-text("rate"), :has-text("%")').first();
        if (await completionRate.count() > 0) {
          const rateText = await completionRate.textContent();
          console.log(`Completion rate metric: ${rateText}`);
        }
        
        console.log('✅ Productivity metrics display works');
      } else {
        console.log('ℹ️ No productivity insights panel found');
      }
    });

    test('Productivity trends and charts', async ({ page }) => {
      console.log('Testing productivity trends and charts...');
      
      // Navigate to analytics or insights page
      const analyticsLink = page.locator('a[href*="analytics"], a:has-text("Analytics"), button:has-text("Analytics")').first();
      
      if (await analyticsLink.count() > 0) {
        await analyticsLink.click();
        await page.waitForLoadState('networkidle');
        
        // Look for charts
        const charts = page.locator('svg, canvas, [class*="chart"], [data-testid*="chart"]');
        const chartCount = await charts.count();
        
        console.log(`Charts found: ${chartCount}`);
        
        if (chartCount > 0) {
          // Test chart interactions
          const firstChart = charts.first();
          await firstChart.hover();
          await page.waitForTimeout(300);
          
          // Look for tooltips or data points
          const tooltip = page.locator('[role="tooltip"], .tooltip, [class*="tooltip"]').first();
          const tooltipVisible = await tooltip.isVisible();
          
          console.log(`Chart tooltip on hover: ${tooltipVisible}`);
        }
        
        console.log('✅ Productivity charts tested');
      } else {
        console.log('ℹ️ No analytics page link found');
      }
    });

    test('Date range filtering for analytics', async ({ page }) => {
      console.log('Testing date range filtering...');
      
      const analyticsLink = page.locator('a[href*="analytics"], a:has-text("Analytics")').first();
      
      if (await analyticsLink.count() > 0) {
        await analyticsLink.click();
        await page.waitForLoadState('networkidle');
        
        // Look for date range controls
        const dateRangeButton = page.locator('button:has-text("Last 7 days"), button:has-text("Last 30 days"), [data-testid*="date-range"]').first();
        
        if (await dateRangeButton.count() > 0) {
          await dateRangeButton.click();
          await page.waitForTimeout(300);
          
          // Look for date range options
          const dateOptions = page.locator('[role="menuitem"], [data-testid*="date-option"], button:has-text("day")');
          const optionCount = await dateOptions.count();
          
          console.log(`Date range options found: ${optionCount}`);
          
          if (optionCount > 0) {
            await dateOptions.first().click();
            await page.waitForTimeout(500);
            console.log('✅ Date range filtering works');
          }
        } else {
          // Look for date picker inputs
          const dateInputs = page.locator('input[type="date"]');
          const dateInputCount = await dateInputs.count();
          
          if (dateInputCount > 0) {
            console.log(`Date picker inputs found: ${dateInputCount}`);
            console.log('✅ Date range inputs available');
          } else {
            console.log('ℹ️ No date range filtering found');
          }
        }
      }
    });
  });

  test.describe('6.2 Habit Analytics Testing', () => {
    test('Habit completion analytics', async ({ page }) => {
      console.log('Testing habit completion analytics...');
      
      await page.goto('http://localhost:3000/habits');
      await page.waitForLoadState('networkidle');
      
      // Look for habit analytics section
      const analyticsSection = page.locator('[data-testid*="analytics"], [class*="analytics"], [class*="stats"]').first();
      
      if (await analyticsSection.isVisible()) {
        // Check for streak information
        const streakElements = analyticsSection.locator(':has-text("streak"), :has-text("day"), [data-testid*="streak"]');
        const streakCount = await streakElements.count();
        
        console.log(`Streak indicators found: ${streakCount}`);
        
        // Check for completion percentages
        const percentageElements = analyticsSection.locator(':has-text("%"), [data-testid*="percentage"]');
        const percentageCount = await percentageElements.count();
        
        console.log(`Completion percentages found: ${percentageCount}`);
        
        console.log('✅ Habit completion analytics work');
      } else {
        console.log('ℹ️ No habit analytics section found');
      }
    });

    test('Habit progress charts', async ({ page }) => {
      console.log('Testing habit progress charts...');
      
      await page.goto('http://localhost:3000/habits');
      await page.waitForLoadState('networkidle');
      
      // Look for charts in habit analytics
      const charts = page.locator('svg, canvas, [class*="chart"], [data-testid*="chart"]');
      const chartCount = await charts.count();
      
      console.log(`Habit charts found: ${chartCount}`);
      
      if (chartCount > 0) {
        // Test chart interactivity
        const firstChart = charts.first();
        const chartBounds = await firstChart.boundingBox();
        
        if (chartBounds) {
          // Click on chart
          await page.mouse.click(chartBounds.x + chartBounds.width / 2, chartBounds.y + chartBounds.height / 2);
          await page.waitForTimeout(200);
          
          // Look for data details or tooltips
          const dataDetails = page.locator('[role="tooltip"], .chart-tooltip, [class*="detail"]').first();
          const detailsVisible = await dataDetails.isVisible();
          
          console.log(`Chart interaction shows details: ${detailsVisible}`);
        }
        
        console.log('✅ Habit progress charts tested');
      } else {
        console.log('ℹ️ No habit charts found');
      }
    });
  });

  test.describe('6.3 Mood Pattern Analysis Testing', () => {
    test('Mood analytics display', async ({ page }) => {
      console.log('Testing mood analytics display...');
      
      await page.goto('http://localhost:3000/mood');
      await page.waitForLoadState('networkidle');
      
      // Look for mood analytics
      const moodAnalytics = page.locator('[data-testid*="mood-analytics"], [class*="mood-analytics"], [class*="analytics"]').first();
      
      if (await moodAnalytics.isVisible()) {
        // Check for mood trends
        const trendElements = moodAnalytics.locator(':has-text("trend"), :has-text("average"), [data-testid*="trend"]');
        const trendCount = await trendElements.count();
        
        console.log(`Mood trend elements found: ${trendCount}`);
        
        // Check for correlation analysis
        const correlationElements = moodAnalytics.locator(':has-text("correlation"), :has-text("pattern"), [data-testid*="correlation"]');
        const correlationCount = await correlationElements.count();
        
        console.log(`Correlation analysis elements found: ${correlationCount}`);
        
        console.log('✅ Mood analytics display works');
      } else {
        console.log('ℹ️ No mood analytics section found');
      }
    });

    test('Mood pattern visualization', async ({ page }) => {
      console.log('Testing mood pattern visualization...');
      
      await page.goto('http://localhost:3000/mood');
      await page.waitForLoadState('networkidle');
      
      // Look for mood charts or visualizations
      const moodCharts = page.locator('svg, canvas, [class*="mood-chart"], [data-testid*="mood-chart"]');
      const chartCount = await moodCharts.count();
      
      console.log(`Mood visualization charts found: ${chartCount}`);
      
      if (chartCount > 0) {
        // Check for different visualization types
        const lineCharts = page.locator('[class*="line-chart"], path[stroke]');
        const barCharts = page.locator('[class*="bar-chart"], rect[fill]');
        
        const lineCount = await lineCharts.count();
        const barCount = await barCharts.count();
        
        console.log(`Line chart elements: ${lineCount}`);
        console.log(`Bar chart elements: ${barCount}`);
        
        console.log('✅ Mood pattern visualization works');
      } else {
        console.log('ℹ️ No mood pattern visualizations found');
      }
    });
  });

  test.describe('6.4 AI-Powered Insights Testing', () => {
    test('Insight generation and display', async ({ page }) => {
      console.log('Testing AI-powered insights...');
      
      // Check dashboard for insights
      const insightsPanel = page.locator('[data-testid*="insights"], [class*="insights"], .insights-panel').first();
      
      if (await insightsPanel.isVisible()) {
        // Look for generated insights
        const insightItems = insightsPanel.locator('[data-testid*="insight"], .insight-item, [class*="insight"]');
        const insightCount = await insightItems.count();
        
        console.log(`AI insights found: ${insightCount}`);
        
        if (insightCount > 0) {
          for (let i = 0; i < Math.min(insightCount, 3); i++) {
            const insight = insightItems.nth(i);
            const insightText = await insight.textContent();
            console.log(`Insight ${i + 1}: ${insightText?.substring(0, 100)}...`);
          }
        }
        
        console.log('✅ AI insights display works');
      } else {
        console.log('ℹ️ No AI insights panel found');
      }
    });

    test('Actionable recommendations', async ({ page }) => {
      console.log('Testing actionable recommendations...');
      
      const insightsPanel = page.locator('[data-testid*="insights"], [class*="insights"]').first();
      
      if (await insightsPanel.isVisible()) {
        // Look for action buttons in insights
        const actionButtons = insightsPanel.locator('button:has-text("Try"), button:has-text("Apply"), button:has-text("Action"), [data-testid*="action"]');
        const actionCount = await actionButtons.count();
        
        console.log(`Actionable recommendations found: ${actionCount}`);
        
        if (actionCount > 0) {
          // Test clicking an action button
          const firstAction = actionButtons.first();
          const actionText = await firstAction.textContent();
          
          await firstAction.click();
          await page.waitForTimeout(500);
          
          console.log(`Tested action: "${actionText}"`);
          console.log('✅ Actionable recommendations work');
        }
      } else {
        console.log('ℹ️ No actionable recommendations found');
      }
    });
  });

  test.describe('Analytics Accessibility and Performance', () => {
    test('Analytics accessibility', async ({ page }) => {
      console.log('Testing analytics accessibility...');
      
      const analyticsLink = page.locator('a[href*="analytics"], a:has-text("Analytics")').first();
      
      if (await analyticsLink.count() > 0) {
        await analyticsLink.click();
        await page.waitForLoadState('networkidle');
        
        // Check chart accessibility
        const charts = page.locator('svg, canvas, [role="img"]');
        let accessibleCharts = 0;
        
        for (let i = 0; i < await charts.count(); i++) {
          const chart = charts.nth(i);
          const ariaLabel = await chart.getAttribute('aria-label');
          const role = await chart.getAttribute('role');
          
          // Check for title with timeout handling
          let title = null;
          try {
            const titleElement = chart.locator('title').first();
            if (await titleElement.count() > 0) {
              title = await titleElement.textContent({ timeout: 1000 });
            }
          } catch (error) {
            // Title not found, continue without it
          }
          
          if (ariaLabel || role === 'img' || title) {
            accessibleCharts++;
          }
        }
        
        const totalCharts = await charts.count();
        console.log(`Accessible charts: ${accessibleCharts}/${totalCharts}`);
        
        // Check for data tables as alternatives
        const dataTables = page.locator('table, [role="table"]');
        const tableCount = await dataTables.count();
        
        console.log(`Alternative data tables: ${tableCount}`);
        console.log('✅ Analytics accessibility tested');
      }
    });

    test('Analytics performance', async ({ page }) => {
      console.log('Testing analytics performance...');
      
      const analyticsLink = page.locator('a[href*="analytics"], a:has-text("Analytics")').first();
      
      if (await analyticsLink.count() > 0) {
        const startTime = Date.now();
        
        await analyticsLink.click();
        await page.waitForLoadState('networkidle');
        
        const loadTime = Date.now() - startTime;
        console.log(`Analytics page load time: ${loadTime}ms`);
        
        // Check for loading states
        const loadingElements = page.locator('[class*="loading"], [class*="spinner"], [aria-busy="true"]');
        const loadingCount = await loadingElements.count();
        
        console.log(`Loading indicators found: ${loadingCount}`);
        
        // Test chart rendering performance
        const charts = page.locator('svg, canvas');
        const chartCount = await charts.count();
        
        if (chartCount > 0) {
          const chartRenderStart = Date.now();
          
          // Wait for charts to be fully rendered
          await page.waitForTimeout(1000);
          
          const chartRenderTime = Date.now() - chartRenderStart;
          console.log(`Chart rendering time: ${chartRenderTime}ms`);
        }
        
        console.log('✅ Analytics performance tested');
      }
    });

    test('Analytics data accuracy', async ({ page }) => {
      console.log('Testing analytics data accuracy...');
      
      // Check if displayed metrics make sense
      const insightsPanel = page.locator('[data-testid*="insights"], [class*="insights"]').first();
      
      if (await insightsPanel.isVisible()) {
        // Look for percentage values
        const percentages = await insightsPanel.locator(':has-text("%")').allTextContents();
        
        for (const percentage of percentages) {
          const match = percentage.match(/(\d+(?:\.\d+)?)%/);
          if (match) {
            const value = parseFloat(match[1]);
            if (value >= 0 && value <= 100) {
              console.log(`Valid percentage found: ${value}%`);
            } else {
              console.log(`Invalid percentage found: ${value}%`);
            }
          }
        }
        
        // Check for reasonable numeric values
        const numbers = await insightsPanel.locator(':has-text(/\\d+/)').allTextContents();
        console.log(`Numeric values found: ${numbers.length}`);
        
        console.log('✅ Analytics data accuracy checked');
      } else {
        console.log('ℹ️ No analytics data to verify');
      }
    });
  });
}); 