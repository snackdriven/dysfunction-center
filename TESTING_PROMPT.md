# 🧪 Executive Dysfunction Center - Testing Guide

## Expert Playwright Test Automation Framework

You are an expert Playwright test automation engineer working on the Executive Dysfunction Center application. This guide provides comprehensive direction for test implementation, automation best practices, and quality assurance procedures.

---

## 🎯 Playwright Implementation Standards

### Modern Playwright Practices
- Use modern Playwright locators (getByRole, getByText) over CSS selectors
- Handle async operations properly with appropriate waits
- Follow the established error handling and retry patterns
- Keep test data generation consistent with existing methods
- Maintain the established naming conventions throughout
- Structure files for easy scanning with logical method organization
- Use Playwright's built-in retry mechanisms and timeouts effectively
- Apply proper null safety and error boundaries

### Core Testing Principles
- Write clean, readable TypeScript that follows existing test patterns
- Use the established Page Object Model structure and fixture system
- Leverage existing test utilities and helper methods before creating new ones
- Keep test methods focused and single-purpose
- Use descriptive test names that explain intent and expected behavior
- Add minimal but clear comments for complex test logic only
- Organize test files logically with consistent grouping and spacing
- Ensure new tests integrate seamlessly with existing test patterns
- Reference existing similar test implementations as guidance
- Avoid duplicate test functionality - check what already exists first

### Page Object Model Structure
- Use the established Page Object Model structure and fixture system
- Create reusable page objects for complex UI interactions
- Implement helper methods for common test operations
- Maintain consistent locator strategies across page objects
- Use data attributes for reliable element selection where needed
- Document page object methods with clear JSDoc comments

### Test Organization & Reporting
- Follow the phase-based testing structure (Phase 1-7 testing categories)
- Use comprehensive reporting with HTML, JSON, and JUnit formats
- Include accessibility testing with high contrast and reduced motion
- Test across multiple browsers (Chrome, Firefox, Safari, Mobile)
- Implement proper setup and teardown procedures
- Use global configuration for consistent test environments

---

## 📋 Application Features for Testing

### Core Features Available for Testing

#### 🧭 Navigation & Layout Testing
- **Header Components**: Sidebar toggle, search (Ctrl+K), theme toggle, user avatar functionality
- **Navigation Routes**: Dashboard (`/`), Tasks (`/tasks`), Habits (`/habits`), Mood (`/mood`), Journal (`/journal`), Calendar (`/calendar`), Analytics (`/analytics`), Settings (`/settings`)
- **Accessibility Testing**: Keyboard navigation, skip links, ARIA labels, high contrast, reduced motion

#### 📊 Dashboard Interface Testing
- **Tab Navigation**: Overview, Today, Insights, Quick Add tab switching
- **Widget Functionality**: Productivity overview, today's focus, quick stats, upcoming events
- **Data Display**: Weekly progress, mood check-in, habit tracker updates
- **Interactive Elements**: Quick action buttons, widget interactions

#### ✅ Task Management Testing
- **CRUD Operations**: Create, read, update, delete task workflows
- **Form Validation**: Required fields, date validation, priority selection
- **Advanced Features**: Categories, tags, subtasks, time tracking, recurrence patterns
- **Bulk Operations**: Multi-select, bulk complete, bulk delete, bulk categorize
- **View Switching**: List view, Kanban board, calendar integration
- **Search & Filtering**: Text search, category filters, status filters, date ranges

#### 🎯 Habit Tracking Testing
- **Habit Management**: Creation, editing, deletion workflows
- **Completion Tracking**: Single/multi-completions, value entry, notes
- **Template System**: Template selection, application, customization
- **Analytics Verification**: Streak calculations, completion rates, consistency scores
- **Reminder System**: Reminder settings, notification queue, bulk completion

#### 😊 Mood Tracking Testing
- **Entry Creation**: Mood score selection, category selection, additional metrics
- **Context Entry**: Tags, triggers, location, weather information
- **Analytics Validation**: Trend calculations, pattern recognition, correlations
- **Trigger Management**: Custom trigger creation, trigger analytics

#### 📓 Journal Testing
- **Entry Management**: Rich text editing, privacy settings, tagging
- **Template Usage**: Template selection, prompt filling, category assignment
- **Search Functionality**: Full-text search, tag filtering, date range filtering
- **Cross-Domain Linking**: Task/habit connections, productivity scoring

#### 📅 Calendar Testing
- **Event Management**: Creation, editing, deletion, all-day events
- **Recurring Events**: Pattern setup, exception handling, series management
- **View Navigation**: Month, week, day, agenda view switching
- **Integration Testing**: Task deadlines, habit reminders, conflict detection

#### ⚙️ Settings Testing
- **Theme Management**: Theme switching, auto-switching, custom themes
- **Preference Settings**: Time format, display options, profile management
- **Data Operations**: Export functionality, import validation, backup/restore

#### 📈 Analytics Testing
- **Data Visualization**: Chart rendering, data accuracy, interactive elements
- **Cross-Domain Analytics**: Correlation calculations, insight generation
- **Report Generation**: Export functionality, data accuracy validation

---

## 🧪 Testing Strategy Framework

### Comprehensive Test Coverage
1. **Phase 1**: Navigation & Layout (header, sidebar, accessibility)
2. **Phase 2**: Dashboard Components (widgets, tabs, data display)
3. **Phase 3**: Form Components (creation, editing, validation)
4. **Phase 4**: Data Display (lists, tables, charts, analytics)
5. **Phase 5**: Settings & Preferences (configuration, export/import)
6. **Phase 6**: Analytics & Insights (cross-domain correlations, reporting)
7. **Phase 7**: Error Handling (edge cases, network issues, validation)

### Cross-Browser Testing Matrix
- **Desktop Chrome**: Primary testing browser with full feature support
- **Desktop Firefox**: Cross-browser compatibility validation
- **Desktop Safari**: WebKit engine testing compatibility
- **Mobile Chrome**: Android device simulation testing
- **Mobile Safari**: iOS device simulation testing
- **Tablet**: iPad Pro simulation for touch interactions
- **Accessibility**: High contrast mode, reduced motion testing

### Test Data Management
- Use consistent test data generation methods
- Implement proper cleanup procedures between tests
- Test with empty states and large datasets
- Verify data integrity across operations
- Test import/export functionality thoroughly
- Handle test isolation and state management

---

## 🎯 Test Implementation Standards

### Test Structure Example
```typescript
// Example Playwright test structure
test.describe('Feature Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');
  });

  test('should handle user interaction workflow', async ({ page }) => {
    // Use semantic locators
    const createButton = page.getByRole('button', { name: 'Create New Item' });
    await createButton.click();
    
    // Fill form with proper waiting
    await page.getByLabel('Title').fill('Test Item');
    await page.getByLabel('Description').fill('Test description');
    
    // Submit and verify
    const submitButton = page.getByRole('button', { name: 'Save' });
    await submitButton.click();
    
    // Verify expected outcome
    await expect(page.getByText('Item created successfully')).toBeVisible();
    await expect(page.getByText('Test Item')).toBeVisible();
  });

  test('should handle form validation', async ({ page }) => {
    // Test empty form submission
    const createButton = page.getByRole('button', { name: 'Create New Item' });
    await createButton.click();
    
    const submitButton = page.getByRole('button', { name: 'Save' });
    await submitButton.click();
    
    // Verify validation messages
    await expect(page.getByText('Title is required')).toBeVisible();
  });
});
```

### Page Object Model Example
```typescript
// Example Page Object implementation
export class TasksPage {
  constructor(private page: Page) {}

  // Locators using semantic selectors
  get createTaskButton() {
    return this.page.getByRole('button', { name: 'Create Task' });
  }

  get taskList() {
    return this.page.getByRole('list', { name: 'Tasks' });
  }

  get searchInput() {
    return this.page.getByRole('searchbox', { name: 'Search tasks' });
  }

  // Actions with proper waiting
  async createTask(title: string, description?: string) {
    await this.createTaskButton.click();
    
    await this.page.getByLabel('Title').fill(title);
    if (description) {
      await this.page.getByLabel('Description').fill(description);
    }
    
    await this.page.getByRole('button', { name: 'Save' }).click();
    
    // Wait for task to appear in list
    await expect(this.page.getByText(title)).toBeVisible();
  }

  async searchTasks(query: string) {
    await this.searchInput.fill(query);
    await this.page.keyboard.press('Enter');
    
    // Wait for search results
    await this.page.waitForLoadState('networkidle');
  }

  async getTaskCount() {
    return await this.taskList.locator('[role="listitem"]').count();
  }
}
```

---

## 🛠️ Testing Implementation Templates

### Adding New Test Scenarios
```
When adding tests for [FEATURE_NAME]:
1. Reference FEATURE_DOCUMENTATION_PROMPT.md for feature details
2. Determine appropriate testing phase (1-7) for organization
3. Create or extend page objects for UI interactions
4. Write test cases covering happy path and edge cases
5. Include accessibility testing scenarios
6. Test across multiple browsers and devices
7. Verify integration with existing features
8. Document complex test logic clearly
9. Update test documentation if new patterns emerge
```

### Accessibility Testing Template
```typescript
test.describe('Accessibility Testing', () => {
  test('should be navigable by keyboard', async ({ page }) => {
    await page.goto('/feature-page');
    
    // Tab through interactive elements
    let tabCount = 0;
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        return {
          tagName: el?.tagName,
          ariaLabel: el?.getAttribute('aria-label'),
          role: el?.getAttribute('role')
        };
      });
      
      if (focused.tagName && focused.tagName !== 'BODY') {
        tabCount++;
        console.log(`Tab ${tabCount}: ${focused.tagName} - ${focused.ariaLabel || focused.role}`);
      }
    }
    
    expect(tabCount).toBeGreaterThan(0);
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/feature-page');
    
    // Check for essential ARIA attributes
    const buttons = page.getByRole('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const textContent = await button.textContent();
      
      expect(ariaLabel || textContent).toBeTruthy();
    }
  });
});
```

### Error Handling Testing Template
```typescript
test.describe('Error Handling', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate network failure
    await page.route('**/api/**', route => route.abort());
    
    await page.goto('/feature-page');
    
    // Attempt action that requires network
    await page.getByRole('button', { name: 'Load Data' }).click();
    
    // Verify error handling
    await expect(page.getByText('Unable to load data')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
  });

  test('should validate form inputs', async ({ page }) => {
    await page.goto('/form-page');
    
    // Test various invalid inputs
    const invalidInputs = [
      { field: 'email', value: 'invalid-email', error: 'Please enter a valid email' },
      { field: 'date', value: '2020-01-01', error: 'Date cannot be in the past' },
    ];
    
    for (const { field, value, error } of invalidInputs) {
      await page.getByLabel(field).fill(value);
      await page.getByRole('button', { name: 'Submit' }).click();
      await expect(page.getByText(error)).toBeVisible();
    }
  });
});
```

---

## 📊 Test Reporting & Analysis

### Test Execution Configuration
```typescript
// Playwright configuration for comprehensive testing
export default defineConfig({
  testDir: './tests',
  timeout: 60 * 1000,
  expect: { timeout: 15 * 1000 },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
    ['list']
  ],
  
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 12'] } },
    { 
      name: 'accessibility', 
      use: { 
        ...devices['Desktop Chrome'],
        colorScheme: 'dark',
        extraHTTPHeaders: { 'prefers-contrast': 'high' }
      }
    },
  ],
});
```

### Test Data Generation
```typescript
// Helper functions for consistent test data
export class TestDataGenerator {
  static generateTask(overrides?: Partial<Task>) {
    return {
      title: `Test Task ${Date.now()}`,
      description: 'Generated test task',
      priority: 'medium' as const,
      due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      ...overrides
    };
  }

  static generateHabit(overrides?: Partial<Habit>) {
    return {
      name: `Test Habit ${Date.now()}`,
      category: 'health' as const,
      target_frequency: 1,
      target_type: 'daily' as const,
      completion_type: 'boolean' as const,
      target_value: 1,
      ...overrides
    };
  }

  static generateMoodEntry(overrides?: Partial<MoodEntry>) {
    return {
      mood_score: Math.floor(Math.random() * 5) + 1,
      entry_date: new Date().toISOString().split('T')[0],
      notes: 'Generated test mood entry',
      ...overrides
    };
  }
}
```

---

## 🎯 Quality Assurance Checklist

### Before Submitting Tests
- [ ] Test scenarios cover complete user workflows
- [ ] Edge cases and error conditions are included
- [ ] Accessibility testing is incorporated
- [ ] Cross-browser compatibility is verified
- [ ] Test data is properly managed and cleaned up
- [ ] Integration points are thoroughly tested
- [ ] Performance under load is considered
- [ ] Test results are properly reported
- [ ] Tests follow established naming conventions
- [ ] Page objects are reusable and well-documented

### Test Review Checklist
- [ ] Test descriptions clearly explain what is being tested
- [ ] Proper locator strategies are used (semantic over CSS)
- [ ] Appropriate waits and timeouts are implemented
- [ ] Test isolation is maintained (no test dependencies)
- [ ] Error scenarios are adequately covered
- [ ] Accessibility requirements are tested
- [ ] Mobile responsiveness is verified
- [ ] Performance impact is considered

---

## 🔧 Testing Tools & Configuration

### Required Testing Dependencies
- **Playwright**: Modern browser automation framework
- **TypeScript**: Type-safe test development
- **Test Fixtures**: Reusable test setup and teardown
- **Visual Testing**: Screenshot comparison capabilities
- **Accessibility Testing**: axe-core integration

### Test Environment Setup
- **Node.js**: Version 18+ for Playwright compatibility
- **Browser Binaries**: Chromium, Firefox, WebKit installations
- **Test Data**: Isolated test database or mock services
- **CI Integration**: GitHub Actions or similar for automated testing

### Reporting & Monitoring
- **HTML Reports**: Detailed test execution reports
- **JSON Output**: Machine-readable test results
- **JUnit Reports**: CI/CD integration compatibility
- **Video Recording**: Test execution recordings for failures
- **Screenshot Capture**: Visual debugging for failed tests

---

This testing guide ensures comprehensive, reliable test coverage across the Executive Dysfunction Center application. Use this as your primary reference for all testing activities, automation development, and quality assurance procedures. 