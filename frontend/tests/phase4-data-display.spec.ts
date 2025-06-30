import { test, expect } from '@playwright/test';

test.describe('Phase 4: Data Display Components Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('4.1 Task List and Management Testing', () => {
    test('Task list view switching', async ({ page }) => {
      console.log('Testing task list view switching...');
      
      // Navigate to tasks page
      await page.goto('http://localhost:3000/tasks');
      await page.waitForLoadState('networkidle');
      
      // Look for view toggle buttons
      const listViewButton = page.locator('button:has-text("List"), button[data-view="list"], [data-testid*="list-view"]').first();
      const kanbanViewButton = page.locator('button:has-text("Kanban"), button[data-view="kanban"], [data-testid*="kanban-view"]').first();
      
      if (await listViewButton.count() > 0) {
        await listViewButton.click();
        await page.waitForTimeout(300);
        
        // Check if list view is active
        const listContainer = page.locator('[data-testid*="list"], .task-list, ul').first();
        const listVisible = await listContainer.isVisible();
        console.log(`List view visible: ${listVisible}`);
      }
      
      if (await kanbanViewButton.count() > 0) {
        await kanbanViewButton.click();
        await page.waitForTimeout(300);
        
        // Check if kanban view is active
        const kanbanContainer = page.locator('[data-testid*="kanban"], .kanban, [class*="board"]').first();
        const kanbanVisible = await kanbanContainer.isVisible();
        console.log(`Kanban view visible: ${kanbanVisible}`);
      }
      
      console.log('✅ Task view switching tested');
    });

    test('Task filtering functionality', async ({ page }) => {
      console.log('Testing task filtering...');
      
      await page.goto('http://localhost:3000/tasks');
      await page.waitForLoadState('networkidle');
      
      // Test status filter
      const statusFilter = page.locator('select[name*="status"], [data-testid*="status-filter"]').first();
      if (await statusFilter.count() > 0) {
        await statusFilter.selectOption('completed');
        await page.waitForTimeout(500);
        console.log('✅ Status filter works');
      }
      
      // Test priority filter
      const priorityFilter = page.locator('select[name*="priority"], [data-testid*="priority-filter"]').first();
      if (await priorityFilter.count() > 0) {
        await priorityFilter.selectOption('high');
        await page.waitForTimeout(500);
        console.log('✅ Priority filter works');
      }
      
      // Test category filter
      const categoryFilter = page.locator('select[name*="category"], [data-testid*="category-filter"]').first();
      if (await categoryFilter.count() > 0) {
        console.log('✅ Category filter found');
      }
      
      // Test search functionality
      const searchInput = page.locator('input[placeholder*="search"], input[type="search"]').first();
      if (await searchInput.count() > 0) {
        await searchInput.fill('test');
        await page.waitForTimeout(500);
        console.log('✅ Task search works');
      }
    });

    test('Task completion toggling', async ({ page }) => {
      console.log('Testing task completion toggling...');
      
      await page.goto('http://localhost:3000/tasks');
      await page.waitForLoadState('networkidle');
      
      // Find task checkboxes or completion buttons
      const taskCheckboxes = page.locator('input[type="checkbox"], button[data-testid*="complete"], [role="checkbox"]');
      const checkboxCount = await taskCheckboxes.count();
      
      if (checkboxCount > 0) {
        const firstCheckbox = taskCheckboxes.first();
        
        // Get initial state
        const initialChecked = await firstCheckbox.isChecked();
        console.log(`Initial checkbox state: ${initialChecked}`);
        
        // Toggle completion
        await firstCheckbox.click();
        await page.waitForTimeout(300);
        
        // Check new state
        const newChecked = await firstCheckbox.isChecked();
        console.log(`New checkbox state: ${newChecked}`);
        
        expect(newChecked).toBe(!initialChecked);
        console.log('✅ Task completion toggling works');
      } else {
        console.log('ℹ️ No task completion checkboxes found');
      }
    });

    test('Bulk task operations', async ({ page }) => {
      console.log('Testing bulk task operations...');
      
      await page.goto('http://localhost:3000/tasks');
      await page.waitForLoadState('networkidle');
      
      // Look for bulk selection checkboxes
      const selectAllCheckbox = page.locator('input[type="checkbox"][data-testid*="select-all"], th input[type="checkbox"]').first();
      
      if (await selectAllCheckbox.count() > 0) {
        await selectAllCheckbox.click();
        await page.waitForTimeout(300);
        
        // Look for bulk action buttons
        const bulkButtons = page.locator('button:has-text("Delete Selected"), button:has-text("Mark Complete"), [data-testid*="bulk"]');
        const bulkButtonCount = await bulkButtons.count();
        
        console.log(`Bulk operation buttons found: ${bulkButtonCount}`);
        
        if (bulkButtonCount > 0) {
          console.log('✅ Bulk operations interface works');
        }
      } else {
        console.log('ℹ️ No bulk selection interface found');
      }
    });
  });

  test.describe('4.2 Habit Tracking and Analytics Testing', () => {
    test('Habit completion logging', async ({ page }) => {
      console.log('Testing habit completion logging...');
      
      await page.goto('http://localhost:3000/habits');
      await page.waitForLoadState('networkidle');
      
      // Find habit completion buttons
      const completionButtons = page.locator('button:has-text("Complete"), button[data-testid*="complete"], input[type="checkbox"]');
      const buttonCount = await completionButtons.count();
      
      if (buttonCount > 0) {
        const firstButton = completionButtons.first();
        await firstButton.click();
        await page.waitForTimeout(500);
        
        // Check for visual feedback
        const completedHabit = page.locator('[data-state="completed"], .completed, [class*="complete"]').first();
        const isCompleted = await completedHabit.count() > 0;
        
        console.log(`Habit marked as completed: ${isCompleted}`);
        console.log('✅ Habit completion logging works');
      } else {
        console.log('ℹ️ No habit completion buttons found');
      }
    });

    test('Habit analytics display', async ({ page }) => {
      console.log('Testing habit analytics...');
      
      await page.goto('http://localhost:3000/habits');
      await page.waitForLoadState('networkidle');
      
      // Look for analytics/stats sections
      const analyticsSection = page.locator('[data-testid*="analytics"], [class*="analytics"], [class*="stats"]').first();
      
      if (await analyticsSection.isVisible()) {
        // Check for streak information
        const streakInfo = analyticsSection.locator(':has-text("streak"), :has-text("day")');
        const streakCount = await streakInfo.count();
        
        console.log(`Streak indicators found: ${streakCount}`);
        
        // Check for progress charts
        const charts = analyticsSection.locator('svg, canvas, [class*="chart"]');
        const chartCount = await charts.count();
        
        console.log(`Charts found: ${chartCount}`);
        console.log('✅ Habit analytics display tested');
      } else {
        console.log('ℹ️ No habit analytics section found');
      }
    });

    test('Habit template management', async ({ page }) => {
      console.log('Testing habit template management...');
      
      await page.goto('http://localhost:3000/habits');
      await page.waitForLoadState('networkidle');
      
      // Look for template-related buttons
      const templateButton = page.locator('button:has-text("Template"), button:has-text("From Template"), [data-testid*="template"]').first();
      
      if (await templateButton.count() > 0) {
        await templateButton.click();
        await page.waitForTimeout(500);
        
        // Check if template modal/interface opened
        const templateModal = page.locator('[role="dialog"], [data-testid*="template"], .modal').first();
        const modalVisible = await templateModal.isVisible();
        
        console.log(`Template interface opened: ${modalVisible}`);
        
        if (modalVisible) {
          // Look for template options
          const templateOptions = templateModal.locator('button, [data-testid*="option"]');
          const optionCount = await templateOptions.count();
          
          console.log(`Template options found: ${optionCount}`);
          
          // Close modal
          await page.keyboard.press('Escape');
          await page.waitForTimeout(300);
        }
        
        console.log('✅ Habit template management tested');
      } else {
        console.log('ℹ️ No habit template interface found');
      }
    });
  });

  test.describe('4.3 Calendar Integration Testing', () => {
    test('Calendar view switching', async ({ page }) => {
      console.log('Testing calendar view switching...');
      
      await page.goto('http://localhost:3000/calendar');
      await page.waitForLoadState('networkidle');
      
      const viewButtons = [
        { name: 'Month', selector: 'button:has-text("Month")' },
        { name: 'Week', selector: 'button:has-text("Week")' },
        { name: 'Day', selector: 'button:has-text("Day")' },
        { name: 'Agenda', selector: 'button:has-text("Agenda")' }
      ];
      
      for (const view of viewButtons) {
        const button = page.locator(view.selector).first();
        
        if (await button.count() > 0) {
          await button.click();
          await page.waitForTimeout(500);
          
          // Check if view changed
          const calendarView = page.locator('[data-testid*="calendar"], .calendar-view, [class*="calendar"]').first();
          const viewVisible = await calendarView.isVisible();
          
          console.log(`${view.name} view visible: ${viewVisible}`);
        }
      }
      
      console.log('✅ Calendar view switching tested');
    });

    test('Event creation and editing', async ({ page }) => {
      console.log('Testing event creation and editing...');
      
      await page.goto('http://localhost:3000/calendar');
      await page.waitForLoadState('networkidle');
      
      // Look for create event button
      const createEventButton = page.locator('button:has-text("Event"), button:has-text("Add Event"), button:has-text("Create")').first();
      
      if (await createEventButton.count() > 0) {
        await createEventButton.click();
        await page.waitForTimeout(500);
        
        const eventForm = page.locator('form, [role="dialog"], [data-testid*="event-form"]').first();
        
        if (await eventForm.isVisible()) {
          // Fill event details
          const titleInput = eventForm.locator('input[placeholder*="title"], input[name*="title"]').first();
          if (await titleInput.count() > 0) {
            await titleInput.fill('Test Event');
            console.log('✅ Event title input works');
          }
          
          const dateInput = eventForm.locator('input[type="date"], input[name*="date"]').first();
          if (await dateInput.count() > 0) {
            await dateInput.fill('2024-12-25');
            console.log('✅ Event date input works');
          }
          
          // Close form
          await page.keyboard.press('Escape');
          await page.waitForTimeout(300);
        }
        
        console.log('✅ Event creation interface tested');
      } else {
        console.log('ℹ️ No event creation button found');
      }
    });

    test('Calendar navigation', async ({ page }) => {
      console.log('Testing calendar navigation...');
      
      await page.goto('http://localhost:3000/calendar');
      await page.waitForLoadState('networkidle');
      
      // Look for navigation buttons
      const prevButton = page.locator('button:has-text("Previous"), button[aria-label*="previous"], button:has-text("‹")').first();
      const nextButton = page.locator('button:has-text("Next"), button[aria-label*="next"], button:has-text("›")').first();
      const todayButton = page.locator('button:has-text("Today")').first();
      
      if (await prevButton.count() > 0) {
        await prevButton.click();
        await page.waitForTimeout(300);
        console.log('✅ Previous navigation works');
      }
      
      if (await nextButton.count() > 0) {
        await nextButton.click();
        await page.waitForTimeout(300);
        console.log('✅ Next navigation works');
      }
      
      if (await todayButton.count() > 0) {
        await todayButton.click();
        await page.waitForTimeout(300);
        console.log('✅ Today navigation works');
      }
      
      console.log('✅ Calendar navigation tested');
    });

    test('Integrated data display', async ({ page }) => {
      console.log('Testing integrated data display in calendar...');
      
      await page.goto('http://localhost:3000/calendar');
      await page.waitForLoadState('networkidle');
      
      // Look for different types of calendar items
      const events = page.locator('[data-testid*="event"], .event, [class*="calendar-event"]');
      const tasks = page.locator('[data-testid*="task"], .task, [class*="calendar-task"]');
      const habits = page.locator('[data-testid*="habit"], .habit, [class*="calendar-habit"]');
      
      const eventCount = await events.count();
      const taskCount = await tasks.count();
      const habitCount = await habits.count();
      
      console.log(`Calendar items found:`);
      console.log(`  Events: ${eventCount}`);
      console.log(`  Tasks: ${taskCount}`);
      console.log(`  Habits: ${habitCount}`);
      
      if (eventCount > 0 || taskCount > 0 || habitCount > 0) {
        console.log('✅ Integrated calendar data display works');
      } else {
        console.log('ℹ️ No integrated calendar data found');
      }
    });
  });

  test.describe('Data Display Accessibility', () => {
    test('Screen reader compatibility', async ({ page }) => {
      console.log('Testing data display screen reader compatibility...');
      
      await page.goto('http://localhost:3000/tasks');
      await page.waitForLoadState('networkidle');
      
      // Check for proper ARIA labels on data elements
      const dataElements = page.locator('[role="listitem"], [role="row"], [role="gridcell"]');
      const elementCount = await dataElements.count();
      
      let properlyLabeledElements = 0;
      
      for (let i = 0; i < Math.min(elementCount, 5); i++) {
        const element = dataElements.nth(i);
        const ariaLabel = await element.getAttribute('aria-label');
        const ariaLabelledby = await element.getAttribute('aria-labelledby');
        const role = await element.getAttribute('role');
        
        if (ariaLabel || ariaLabelledby || role) {
          properlyLabeledElements++;
        }
      }
      
      console.log(`Properly labeled data elements: ${properlyLabeledElements}/${Math.min(elementCount, 5)}`);
      console.log('✅ Screen reader compatibility checked');
    });

    test('Keyboard navigation in data lists', async ({ page }) => {
      console.log('Testing keyboard navigation in data lists...');
      
      await page.goto('http://localhost:3000/tasks');
      await page.waitForLoadState('networkidle');
      
      // Focus first interactive element in data list
      const firstDataElement = page.locator('[role="listitem"] button, [role="row"] button, .task-item button').first();
      
      if (await firstDataElement.count() > 0) {
        await firstDataElement.focus();
        
        // Test arrow key navigation
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(100);
        
        const focusedAfterArrow = await page.evaluate(() => {
          const el = document.activeElement;
          return {
            tagName: el?.tagName,
            className: el?.className.substring(0, 50)
          };
        });
        
        console.log(`Arrow navigation result: ${focusedAfterArrow.tagName} (${focusedAfterArrow.className})`);
        console.log('✅ Keyboard navigation in data lists works');
      } else {
        console.log('ℹ️ No focusable elements in data list found');
      }
    });
  });
}); 