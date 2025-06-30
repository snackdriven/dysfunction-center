# 🚀 Executive Dysfunction Center - Development Guide

## Expert TypeScript & React Development Framework

You are an expert TypeScript and React (Next.js) developer working on the Executive Dysfunction Center application. This guide provides comprehensive direction for feature implementation, code organization, and development best practices.

---

## 🎯 Core Development Principles

### TypeScript & React Excellence
- Write clean, readable TypeScript that follows existing codebase patterns
- Use the established component structure and state management (Zustand, TanStack Query)
- Leverage existing utilities and helper methods before creating new ones
- Keep components focused and single-purpose with clear prop interfaces
- Use descriptive variable names that explain intent and business logic
- Add minimal but clear comments for complex business logic only
- Organize code logically with consistent grouping and spacing
- Ensure new code integrates seamlessly with existing patterns
- Reference existing similar implementations as guidance
- Avoid duplicate functionality - check what already exists first

### Code Quality & Maintainability
- Remove AI-sounding language from comments, function names, and console logs
- Avoid marketing terms like 'safe', 'improved', 'optimized', 'enhanced', 'updated'
- Use straightforward, natural naming without unnecessary descriptors
- Write code that looks human-authored, not generated
- When auditing files, align all code with recent architectural changes
- Ensure consistency across related files and methods
- Remove outdated patterns that no longer match current implementation
- Update any legacy approaches to match established conventions

### Integration & Architecture
- If creating new functionality, explain how it fits with existing architecture
- Always verify code works with the current configuration setup
- Document all changes that affect existing functionality
- Update related files and dependencies when making architectural changes
- Maintain backward compatibility unless explicitly refactoring
- Use context providers and hooks for global state management
- Add ARIA and accessibility features to all UI components
- Use CSS variables and utility classes for consistent styling

---

## 📋 Application Feature Reference

### Core Features Available for Development

#### 🧭 Navigation & Layout
- Header with sidebar toggle, search (Ctrl+K), theme toggle, user avatar
- Sidebar navigation: Dashboard (`/`), Tasks (`/tasks`), Habits (`/habits`), Mood (`/mood`), Journal (`/journal`), Calendar (`/calendar`), Analytics (`/analytics`), Settings (`/settings`)
- Accessibility features: keyboard navigation, skip links, ARIA labels, high contrast, reduced motion

#### 📊 Dashboard Interface
- **Tabbed Layout**: Overview (metrics), Today (focus items), Insights (AI recommendations), Quick Add (fast creation)
- **Widgets**: Productivity overview, today's focus, quick stats, upcoming events, weekly progress, mood check-in, habit tracker

#### ✅ Task Management
- **CRUD Operations**: Create, read, update, delete with full form validation
- **Advanced Features**: Categories, tags, subtasks, time tracking, recurrence patterns, bulk operations
- **Views**: List view, Kanban board, calendar integration, saved searches
- **Analytics**: Completion rates, time analysis, productivity insights

#### 🎯 Habit Tracking
- **Management**: Basic habits, target settings, completion types (boolean/count/duration), scheduling patterns
- **Templates**: Pre-built templates, custom templates, template application
- **Tracking**: Single/multi-completions, values, notes, historical data
- **Analytics**: Streaks, completion rates, consistency scores, recommendations
- **Reminders**: Settings, upcoming queue, bulk completion

#### 😊 Mood Tracking
- **Entry Creation**: 1-5 mood score, categories, secondary mood, energy/stress levels, location, weather
- **Context & Triggers**: Activity tags, people, locations, custom triggers, trigger analytics
- **Analytics**: Trends, weekly/hourly patterns, correlations, location impacts, weather correlations
- **Insights**: Pattern recognition, recommendations, best/worst day analysis

#### 📓 Journal Features
- **Entry Management**: Rich text, privacy levels, tagging, cross-domain linking, productivity scoring
- **Templates**: Categories (reflection, planning, gratitude, productivity), prompts, management
- **Search**: Full-text, tag-based, date range, privacy filtering, cross-reference
- **Analytics**: Writing statistics, temporal patterns, mood/productivity correlations, word tracking

#### 📅 Calendar Functionality
- **Event Management**: Creation, all-day events, colors, location, task integration
- **Recurring Events**: RRULE patterns, exceptions, series management
- **Views**: Month, week, day, agenda, 3-day views
- **Integration**: Task deadlines, habit scheduling, mood context, conflict detection

#### ⚙️ Settings & Preferences
- **Theme**: Light/dark/system switching, auto-switching, custom themes, font settings, accessibility
- **Time Display**: Format options, timezone, seconds, date visibility
- **Profile**: Display name, avatar management, user preferences
- **Data Management**: Export/import, backup/restore, validation

#### 📈 Analytics & Insights
- **Cross-Domain**: Productivity correlations, habit impact, temporal patterns, goal tracking
- **Insights**: AI patterns, trend analysis, anomaly detection, recommendations
- **Reporting**: Dashboard charts, progress tracking, comparative analysis, export reports

#### 🔧 Technical Features
- **Data Operations**: Export (JSON/CSV/Markdown), import with validation, backup/restore
- **Integration**: API access, webhooks, cross-domain linking, real-time updates

---

## 🎯 Development Workflow Guidelines

### Feature Implementation Process
1. **Analysis**: Review existing patterns and similar implementations in codebase
2. **Design**: Plan integration with existing architecture and state management
3. **Implementation**: 
   - Create or update TypeScript interfaces and types first
   - Implement backend endpoints if needed
   - Create frontend components following established patterns
   - Add proper error handling and loading states
   - Include accessibility features (ARIA, keyboard navigation)
4. **Integration**: Verify seamless integration with existing features
5. **Documentation**: Update relevant documentation and type definitions

### Code Organization Standards
```typescript
// Example component structure
interface ComponentProps {
  // Clear prop interfaces with JSDoc
  /** Description of the prop's purpose */
  title: string;
  /** Optional callback for user actions */
  onAction?: () => void;
}

export const Component: React.FC<ComponentProps> = ({ 
  title, 
  onAction 
}) => {
  // State management with Zustand/TanStack Query
  const { data, isLoading } = useQuery({
    queryKey: ['component-data'],
    queryFn: fetchComponentData,
  });

  // Event handlers
  const handleUserAction = () => {
    onAction?.();
  };

  // Helper functions
  const formatDisplayData = (rawData: any) => {
    // Business logic here
    return processedData;
  };

  // Render with accessibility
  return (
    <div role="main" aria-label="Component description">
      <h1>{title}</h1>
      {isLoading ? (
        <div aria-live="polite">Loading...</div>
      ) : (
        <button 
          onClick={handleUserAction}
          aria-describedby="action-description"
        >
          Action
        </button>
      )}
    </div>
  );
};
```

### State Management Patterns
```typescript
// Zustand store example
interface AppState {
  data: DataType[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchData: () => Promise<void>;
  updateItem: (id: string, updates: Partial<DataType>) => void;
  clearError: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  data: [],
  isLoading: false,
  error: null,
  
  fetchData: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.getData();
      set({ data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  updateItem: (id, updates) => {
    const data = get().data.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    set({ data });
  },
  
  clearError: () => set({ error: null }),
}));
```

---

## 🛠️ Implementation Templates

### Adding New Features
```
When adding [FEATURE_NAME]:
1. Reference FEATURE_DOCUMENTATION_PROMPT.md for existing functionality
2. Update TypeScript types in appropriate service/types.ts files
3. Implement backend API endpoints following existing patterns
4. Create frontend components using established UI patterns
5. Update navigation/routing if needed
6. Document integration points and dependencies
7. Verify accessibility compliance
8. Test mobile responsiveness
9. Update this documentation if new patterns emerge
```

### Modifying Existing Features
```
When modifying [EXISTING_FEATURE]:
1. Analyze impact on related features and integrations
2. Update type definitions to reflect changes
3. Modify backend APIs while maintaining backward compatibility
4. Update frontend components and state management
5. Test all integration points thoroughly
6. Verify no regression in other features
7. Update documentation to reflect changes
```

### Bug Fixes and Refactoring
```
When fixing bugs or refactoring:
1. Identify root cause and affected components
2. Review similar patterns in codebase for consistency
3. Implement fix following established conventions
4. Update related documentation
5. Verify fix doesn't introduce new issues
6. Consider if fix reveals larger architectural improvements needed
```

---

## 📚 Development Guidelines

### Creating New Components
- Always check existing implementations first
- Follow TypeScript best practices with strict typing
- Use established component patterns and state management
- Implement proper error boundaries and loading states
- Add comprehensive accessibility features
- Document complex business logic clearly
- Use semantic HTML and proper ARIA attributes

### API Integration
- Use TanStack Query for data fetching and caching
- Implement proper error handling with user-friendly messages
- Add loading states for all async operations
- Follow existing API service patterns
- Handle edge cases (network errors, empty responses)
- Implement optimistic updates where appropriate

### Styling & Theming
- Use Tailwind CSS utility classes consistently
- Leverage CSS custom properties for theming
- Follow established color and spacing patterns
- Ensure responsive design across screen sizes
- Test in both light and dark themes
- Maintain accessibility contrast ratios

### Performance Considerations
- Implement code splitting for large components
- Use React.memo for expensive components
- Optimize bundle size with dynamic imports
- Monitor and optimize rendering performance
- Implement virtual scrolling for large lists
- Cache API responses appropriately

---

## 🎯 Quality Assurance Checklist

### Before Submitting Code
- [ ] TypeScript compiles without errors or warnings
- [ ] All eslint rules pass without violations
- [ ] Component renders correctly in both themes
- [ ] Accessibility features are implemented and functional
- [ ] Mobile responsiveness is verified
- [ ] Integration with existing features works correctly
- [ ] Error handling covers edge cases appropriately
- [ ] Documentation is updated to reflect changes
- [ ] Performance impact is considered and measured
- [ ] Security implications are reviewed
- [ ] Code follows established patterns and conventions

### Code Review Checklist
- [ ] Component structure follows established patterns
- [ ] TypeScript types are properly defined
- [ ] Error boundaries are implemented where needed
- [ ] Loading states provide good user experience
- [ ] Accessibility attributes are present and correct
- [ ] State management follows established patterns
- [ ] API integration handles errors gracefully
- [ ] Styling is consistent with design system
- [ ] Performance optimizations are applied appropriately

---

## 🔧 Development Tools & Setup

### Required Dependencies
- **React 19**: Latest React features and patterns
- **TypeScript**: Strict type checking and interfaces
- **Zustand**: Lightweight state management
- **TanStack Query**: Server state management
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible component primitives
- **Framer Motion**: Animation and transitions

### Development Environment
- **Node.js**: Version 18+ recommended
- **Package Manager**: npm or yarn
- **IDE**: VS Code with TypeScript extensions
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier with consistent configuration

### Build & Deployment
- **Build Tool**: Vite or Next.js build system
- **Environment Variables**: Proper configuration management
- **Asset Optimization**: Image and bundle optimization
- **Production Builds**: Minification and code splitting

---

This development guide ensures consistent, high-quality code across the Executive Dysfunction Center application. Use this as your primary reference for all development activities and feature implementations. 