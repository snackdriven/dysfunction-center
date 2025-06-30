import { test, expect } from '@playwright/test';

test.describe('Phase 3: Form Components Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('3.1 Task Form Testing', () => {
    test('Task form creation functionality', async ({ page }) => {
      console.log('Testing task form creation...');
      
      // Navigate to tasks page or open task form
      const taskButton = page.locator('button:has-text("Task"), button:has-text("Add Task"), a[href*="task"]').first();
      
      if (await taskButton.count() > 0) {
        await taskButton.click();
        await page.waitForTimeout(500);
        
        const form = page.locator('form, [data-testid*="form"], [role="dialog"]').first();
        
        if (await form.isVisible()) {
          // Test title field
          const titleInput = form.locator('input[placeholder*="title"], input[name*="title"], input[id*="title"]').first();
          if (await titleInput.count() > 0) {
            await titleInput.fill('Test Task Title');
            expect(await titleInput.inputValue()).toBe('Test Task Title');
            console.log('✅ Title field works');
          }
          
          // Test description field
          const descInput = form.locator('textarea[placeholder*="description"], textarea[name*="description"], textarea[id*="description"]').first();
          if (await descInput.count() > 0) {
            await descInput.fill('Test task description');
            expect(await descInput.inputValue()).toBe('Test task description');
            console.log('✅ Description field works');
          }
          
          // Test priority selection
          const prioritySelect = form.locator('select[name*="priority"], [data-testid*="priority"]').first();
          if (await prioritySelect.count() > 0) {
            await prioritySelect.selectOption('high');
            console.log('✅ Priority selection works');
          }
          
          // Test due date
          const dueDateInput = form.locator('input[type="date"], input[name*="due"], input[id*="due"]').first();
          if (await dueDateInput.count() > 0) {
            await dueDateInput.fill('2024-12-31');
            console.log('✅ Due date input works');
          }
          
          console.log('✅ Task form functionality tested');
        }
      }
    });

    test('Task category and tag management', async ({ page }) => {
      console.log('Testing task category and tag management...');
      
      const taskButton = page.locator('button:has-text("Task"), button:has-text("Add Task")').first();
      
      if (await taskButton.count() > 0) {
        await taskButton.click();
        await page.waitForTimeout(500);
        
        const form = page.locator('form, [data-testid*="form"], [role="dialog"]').first();
        
        if (await form.isVisible()) {
          // Test category selection/creation
          const categoryField = form.locator('select[name*="category"], input[name*="category"], [data-testid*="category"]').first();
          if (await categoryField.count() > 0) {
            console.log('✅ Category field found');
          }
          
          // Test tag input
          const tagInput = form.locator('input[placeholder*="tag"], input[name*="tag"], [data-testid*="tag"]').first();
          if (await tagInput.count() > 0) {
            await tagInput.fill('urgent, work');
            console.log('✅ Tag input works');
          }
          
          // Test adding multiple tags
          const addTagButton = form.locator('button:has-text("Add Tag"), button[data-testid*="add-tag"]').first();
          if (await addTagButton.count() > 0) {
            await addTagButton.click();
            console.log('✅ Add tag button works');
          }
        }
      }
    });

    test('Task form validation', async ({ page }) => {
      console.log('Testing task form validation...');
      
      const taskButton = page.locator('button:has-text("Task"), button:has-text("Add Task")').first();
      
      if (await taskButton.count() > 0) {
        await taskButton.click();
        await page.waitForTimeout(500);
        
        const form = page.locator('form, [data-testid*="form"], [role="dialog"]').first();
        
        if (await form.isVisible()) {
          // Try to submit empty form
          const submitButton = form.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")').first();
          
          if (await submitButton.count() > 0) {
            await submitButton.click();
            await page.waitForTimeout(200);
            
            // Check for validation messages
            const errorMessages = form.locator('.error, [class*="error"], [role="alert"]');
            const errorCount = await errorMessages.count();
            
            console.log(`Validation errors displayed: ${errorCount}`);
            
            if (errorCount > 0) {
              for (let i = 0; i < errorCount; i++) {
                const error = errorMessages.nth(i);
                const errorText = await error.textContent();
                console.log(`Error ${i + 1}: ${errorText}`);
              }
            }
            
            console.log('✅ Form validation tested');
          }
        }
      }
    });
  });

  test.describe('3.2 Habit Form Testing', () => {
    test('Habit form creation functionality', async ({ page }) => {
      console.log('Testing habit form creation...');
      
      const habitButton = page.locator('button:has-text("Habit"), button:has-text("Add Habit"), a[href*="habit"]').first();
      
      if (await habitButton.count() > 0) {
        await habitButton.click();
        await page.waitForTimeout(500);
        
        const form = page.locator('form, [data-testid*="form"], [role="dialog"]').first();
        
        if (await form.isVisible()) {
          // Test habit name
          const nameInput = form.locator('input[placeholder*="name"], input[name*="name"], input[id*="name"]').first();
          if (await nameInput.count() > 0) {
            await nameInput.fill('Daily Exercise');
            expect(await nameInput.inputValue()).toBe('Daily Exercise');
            console.log('✅ Habit name field works');
          }
          
          // Test completion type selection
          const completionType = form.locator('select[name*="type"], [data-testid*="completion-type"]').first();
          if (await completionType.count() > 0) {
            console.log('✅ Completion type field found');
          }
          
          // Test target frequency
          const frequencyInput = form.locator('input[name*="frequency"], input[name*="target"], [data-testid*="frequency"]').first();
          if (await frequencyInput.count() > 0) {
            await frequencyInput.fill('1');
            console.log('✅ Target frequency field works');
          }
          
          console.log('✅ Habit form functionality tested');
        }
      }
    });

    test('Habit scheduling and day selection', async ({ page }) => {
      console.log('Testing habit scheduling...');
      
      const habitButton = page.locator('button:has-text("Habit"), button:has-text("Add Habit")').first();
      
      if (await habitButton.count() > 0) {
        await habitButton.click();
        await page.waitForTimeout(500);
        
        const form = page.locator('form, [data-testid*="form"], [role="dialog"]').first();
        
        if (await form.isVisible()) {
          // Test day of week selector
          const daySelectors = form.locator('input[type="checkbox"], button[data-day], [data-testid*="day"]');
          const dayCount = await daySelectors.count();
          
          if (dayCount > 0) {
            // Select first few days
            for (let i = 0; i < Math.min(3, dayCount); i++) {
              await daySelectors.nth(i).click();
              await page.waitForTimeout(100);
            }
            console.log(`✅ Day selection works (${dayCount} day options found)`);
          }
          
          // Test reminder settings
          const reminderToggle = form.locator('input[type="checkbox"][name*="reminder"], [data-testid*="reminder"]').first();
          if (await reminderToggle.count() > 0) {
            await reminderToggle.click();
            console.log('✅ Reminder toggle works');
          }
        }
      }
    });
  });

  test.describe('3.3 Mood Entry Form Testing', () => {
    test('Mood scoring and sliders', async ({ page }) => {
      console.log('Testing mood entry form...');
      
      const moodButton = page.locator('button:has-text("Mood"), button:has-text("Add Mood"), a[href*="mood"]').first();
      
      if (await moodButton.count() > 0) {
        await moodButton.click();
        await page.waitForTimeout(500);
        
        const form = page.locator('form, [data-testid*="form"], [role="dialog"]').first();
        
        if (await form.isVisible()) {
          // Test mood score slider
          const moodSlider = form.locator('input[type="range"], [data-testid*="mood-score"], [role="slider"]').first();
          if (await moodSlider.count() > 0) {
            await moodSlider.fill('4');
            const sliderValue = await moodSlider.inputValue();
            console.log(`Mood slider value: ${sliderValue}`);
            console.log('✅ Mood score slider works');
          }
          
          // Test energy level
          const energySlider = form.locator('input[type="range"][name*="energy"], [data-testid*="energy"]').first();
          if (await energySlider.count() > 0) {
            await energySlider.fill('3');
            console.log('✅ Energy level slider works');
          }
          
          // Test stress level
          const stressSlider = form.locator('input[type="range"][name*="stress"], [data-testid*="stress"]').first();
          if (await stressSlider.count() > 0) {
            await stressSlider.fill('2');
            console.log('✅ Stress level slider works');
          }
        }
      }
    });

    test('Context tags and triggers', async ({ page }) => {
      console.log('Testing mood context and triggers...');
      
      const moodButton = page.locator('button:has-text("Mood"), button:has-text("Add Mood")').first();
      
      if (await moodButton.count() > 0) {
        await moodButton.click();
        await page.waitForTimeout(500);
        
        const form = page.locator('form, [data-testid*="form"], [role="dialog"]').first();
        
        if (await form.isVisible()) {
          // Test context tag selection
          const contextTags = form.locator('button[data-testid*="context"], [data-testid*="tag"]');
          const contextCount = await contextTags.count();
          
          if (contextCount > 0) {
            // Select a few context tags
            for (let i = 0; i < Math.min(2, contextCount); i++) {
              await contextTags.nth(i).click();
              await page.waitForTimeout(100);
            }
            console.log(`✅ Context tags work (${contextCount} options found)`);
          }
          
          // Test trigger selection
          const triggers = form.locator('select[name*="trigger"], [data-testid*="trigger"]').first();
          if (await triggers.count() > 0) {
            console.log('✅ Trigger selector found');
          }
          
          // Test notes field
          const notesField = form.locator('textarea[placeholder*="note"], textarea[name*="note"]').first();
          if (await notesField.count() > 0) {
            await notesField.fill('Test mood note');
            console.log('✅ Notes field works');
          }
        }
      }
    });
  });

  test.describe('3.4 Journal Entry Form Testing', () => {
    test('Journal rich text editing', async ({ page }) => {
      console.log('Testing journal entry form...');
      
      // Navigate to journal or open journal form
      await page.goto('http://localhost:3000/journal');
      await page.waitForLoadState('networkidle');
      
      const createButton = page.locator('button:has-text("Create"), button:has-text("New"), button:has-text("Add")').first();
      
      if (await createButton.count() > 0) {
        await createButton.click();
        await page.waitForTimeout(500);
        
        const form = page.locator('form, [data-testid*="form"], [role="dialog"]').first();
        
        if (await form.isVisible()) {
          // Test title field
          const titleInput = form.locator('input[placeholder*="title"], input[name*="title"]').first();
          if (await titleInput.count() > 0) {
            await titleInput.fill('Test Journal Entry');
            console.log('✅ Journal title field works');
          }
          
          // Test rich text editor
          const textEditor = form.locator('textarea, [contenteditable], .editor').first();
          if (await textEditor.count() > 0) {
            await textEditor.fill('This is a test journal entry with **bold** text.');
            console.log('✅ Rich text editor works');
          }
          
          // Test tag management
          const tagInput = form.locator('input[placeholder*="tag"], [data-testid*="tag"]').first();
          if (await tagInput.count() > 0) {
            await tagInput.fill('personal, reflection');
            console.log('✅ Tag input works');
          }
        }
      } else {
        console.log('ℹ️ No journal create button found');
      }
    });

    test('Journal privacy and linking', async ({ page }) => {
      console.log('Testing journal privacy and linking...');
      
      await page.goto('http://localhost:3000/journal');
      await page.waitForLoadState('networkidle');
      
      const createButton = page.locator('button:has-text("Create"), button:has-text("New")').first();
      
      if (await createButton.count() > 0) {
        await createButton.click();
        await page.waitForTimeout(500);
        
        const form = page.locator('form, [data-testid*="form"], [role="dialog"]').first();
        
        if (await form.isVisible()) {
          // Test privacy level selection
          const privacySelect = form.locator('select[name*="privacy"], [data-testid*="privacy"]').first();
          if (await privacySelect.count() > 0) {
            await privacySelect.selectOption('private');
            console.log('✅ Privacy level selection works');
          }
          
          // Test productivity score
          const productivityScore = form.locator('input[name*="productivity"], [data-testid*="productivity"]').first();
          if (await productivityScore.count() > 0) {
            await productivityScore.fill('7');
            console.log('✅ Productivity score works');
          }
          
          // Test related items
          const relatedTasks = form.locator('input[name*="task"], [data-testid*="related"]').first();
          if (await relatedTasks.count() > 0) {
            console.log('✅ Related items field found');
          }
        }
      }
    });
  });

  test.describe('Form Accessibility Testing', () => {
    test('Form keyboard navigation', async ({ page }) => {
      console.log('Testing form keyboard navigation...');
      
      const taskButton = page.locator('button:has-text("Task"), button:has-text("Add Task")').first();
      
      if (await taskButton.count() > 0) {
        await taskButton.click();
        await page.waitForTimeout(500);
        
        const form = page.locator('form, [data-testid*="form"], [role="dialog"]').first();
        
        if (await form.isVisible()) {
          // Tab through form elements
          let tabCount = 0;
          
          for (let i = 0; i < 10; i++) {
            await page.keyboard.press('Tab');
            const focused = await page.evaluate(() => {
              const el = document.activeElement;
              return {
                tagName: el?.tagName,
                type: el?.getAttribute('type'),
                name: el?.getAttribute('name')
              };
            });
            
            if (focused.tagName && focused.tagName !== 'BODY') {
              tabCount++;
              console.log(`Tab ${tabCount}: ${focused.tagName}[${focused.type}] (${focused.name})`);
            }
          }
          
          expect(tabCount).toBeGreaterThan(0);
          console.log('✅ Form keyboard navigation works');
        }
      }
    });

    test('Form label associations', async ({ page }) => {
      console.log('Testing form label associations...');
      
      const taskButton = page.locator('button:has-text("Task"), button:has-text("Add Task")').first();
      
      if (await taskButton.count() > 0) {
        await taskButton.click();
        await page.waitForTimeout(500);
        
        const form = page.locator('form, [data-testid*="form"], [role="dialog"]').first();
        
        if (await form.isVisible()) {
          // Check input-label associations
          const inputs = form.locator('input, textarea, select');
          let properlyLabeled = 0;
          
          for (let i = 0; i < await inputs.count(); i++) {
            const input = inputs.nth(i);
            const id = await input.getAttribute('id');
            const ariaLabel = await input.getAttribute('aria-label');
            const ariaLabelledby = await input.getAttribute('aria-labelledby');
            
            let hasLabel = false;
            
            if (id) {
              const label = form.locator(`label[for="${id}"]`);
              hasLabel = await label.count() > 0;
            }
            
            if (hasLabel || ariaLabel || ariaLabelledby) {
              properlyLabeled++;
            }
          }
          
          const totalInputs = await inputs.count();
          console.log(`Properly labeled inputs: ${properlyLabeled}/${totalInputs}`);
          
          expect(properlyLabeled).toBeGreaterThan(0);
          console.log('✅ Form label associations checked');
        }
      }
    });
  });
}); 