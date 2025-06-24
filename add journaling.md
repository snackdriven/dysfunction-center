# Journal System Integration Prompt for Executive Dysfunction Center

Integrate a complete journal system into the existing Executive Dysfunction Center application following the established Encore.ts backend + React frontend architecture and design patterns.

## 🎯 Integration Objective

Add journaling capabilities as a fourth pillar alongside tasks, habits, and mood tracking, with cross-domain integration for holistic productivity insights and maintaining the existing application's architectural patterns.

## 📋 Implementation Checklist

### 1. Backend Service Implementation (Encore.ts Architecture)

#### Database Schema & Migrations
- [ ] Create `journal/` service directory following existing pattern
- [ ] Create `journal/types.ts` with comprehensive TypeScript interfaces:
  ```typescript
  export interface JournalEntry {
    id: number;
    title: string;
    content: string;
    mood_reference?: number; // Link to mood entries
    tags: string[];
    privacy_level: 'private' | 'shared' | 'public';
    created_at: TimestampString;
    updated_at: TimestampString;
    // Cross-domain integration
    related_tasks?: number[];
    related_habits?: number[];
    productivity_score?: number; // 1-10 based on day's achievements
  }
  
  export interface JournalTemplate {
    id: number;
    name: string;
    prompts: string[];
    category: 'reflection' | 'planning' | 'gratitude' | 'productivity';
    created_at: TimestampString;
  }
  ```

- [ ] Create database migrations in `journal/migrations/`:
  ```sql
  -- 001_create_journal_entries.up.sql
  CREATE TABLE journal_entries (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    mood_reference INTEGER REFERENCES mood_entries(id),
    tags JSONB DEFAULT '[]',
    privacy_level VARCHAR(20) DEFAULT 'private',
    related_tasks JSONB DEFAULT '[]',
    related_habits JSONB DEFAULT '[]',
    productivity_score INTEGER CHECK (productivity_score >= 1 AND productivity_score <= 10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  ```

#### API Endpoints (journal/journal.ts)
- [ ] **Core CRUD Operations**
  ```typescript
  export const createJournalEntry = api(
    { method: "POST", path: "/journal", expose: true },
    async (req: CreateJournalEntryRequest): Promise<CreateJournalEntryResponse>
  );
  
  export const getJournalEntries = api(
    { method: "GET", path: "/journal", expose: true },
    async (params: GetJournalEntriesParams): Promise<GetJournalEntriesResponse>
  );
  
  export const getJournalEntry = api(
    { method: "GET", path: "/journal/:id", expose: true },
    async ({ id }: { id: string }): Promise<JournalEntry>
  );
  
  export const updateJournalEntry = api(
    { method: "PUT", path: "/journal/:id", expose: true },
    async (req: UpdateJournalEntryRequest): Promise<UpdateJournalEntryResponse>
  );
  
  export const deleteJournalEntry = api(
    { method: "DELETE", path: "/journal/:id", expose: true },
    async ({ id }: { id: string }): Promise<{ success: boolean }>
  );
  ```

- [ ] **Advanced Features**
  ```typescript
  export const searchJournalEntries = api(
    { method: "GET", path: "/journal/search", expose: true },
    async (params: SearchJournalParams): Promise<SearchJournalResponse>
  );
  
  export const getJournalAnalytics = api(
    { method: "GET", path: "/journal/analytics", expose: true },
    async (params: AnalyticsParams): Promise<JournalAnalyticsResponse>
  );
  
  export const exportJournalEntries = api(
    { method: "GET", path: "/journal/export", expose: true },
    async (params: ExportParams): Promise<ExportResponse>
  );
  ```

#### Service Integration
- [ ] Update `api/api.ts` to include journal endpoints in API info
- [ ] Add journal service to `shared/types.ts` for cross-domain integration
- [ ] Implement journal-mood linking in mood service
- [ ] Add journal references to task completion celebrations

### 2. Frontend Implementation (React + TypeScript)

#### Service Layer (frontend/src/services/journal.ts)
- [ ] **API Client with React Query Integration**
  ```typescript
  export const journalApi = {
    getJournalEntries: async (params?: GetJournalEntriesParams): Promise<JournalEntry[]> => {
      const { data } = await api.get(apiEndpoints.journal.list, { params });
      return data.journal_entries || [];
    },
    
    createJournalEntry: async (entry: CreateJournalEntryRequest): Promise<JournalEntry> => {
      const { data } = await api.post(apiEndpoints.journal.create, entry);
      return data.journal_entry;
    },
    
    // ... other CRUD operations
  };
  
  // React Query Hooks
  export const useJournalEntries = (params?: GetJournalEntriesParams) => {
    return useQuery({
      queryKey: ['journal-entries', params],
      queryFn: () => journalApi.getJournalEntries(params),
    });
  };
  
  export const useCreateJournalEntry = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: journalApi.createJournalEntry,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      },
    });
  };
  ```

#### Core Components (frontend/src/components/journal/)
- [ ] **JournalEntryForm.tsx** - Rich text editor with templates and cross-references
  ```typescript
  interface JournalEntryFormProps {
    entry?: JournalEntry;
    template?: JournalTemplate;
    onSuccess?: () => void;
    defaultMoodReference?: number;
    defaultRelatedTasks?: number[];
  }
  ```

- [ ] **JournalEntryCard.tsx** - Entry display with privacy indicators and quick actions
- [ ] **JournalEntriesList.tsx** - Infinite scroll list with filtering and search
- [ ] **JournalCalendarView.tsx** - Calendar integration showing entry indicators
- [ ] **JournalSearchFilter.tsx** - Advanced search with tag, date, and mood filters
- [ ] **JournalAnalytics.tsx** - Writing patterns and productivity correlations
- [ ] **JournalTemplateSelector.tsx** - Template-based entry creation
- [ ] **TagManager.tsx** - Tag creation and organization

#### Page Implementation (frontend/src/pages/journal/)
- [ ] **Journal.tsx** - Main journal page with entry list and quick actions
- [ ] **JournalEntry.tsx** - Individual entry view with editing capabilities
- [ ] **JournalCalendar.tsx** - Calendar view for journal navigation
- [ ] **JournalAnalytics.tsx** - Analytics dashboard for writing insights

#### Dashboard Integration
- [ ] **JournalWidget.tsx** - Dashboard widget showing recent entries and quick compose
- [ ] **TodaysFocusWidget.tsx** enhancement - Add journal reflection prompts
- [ ] **ProductivitySummary.tsx** - Include journaling streaks and insights

### 3. Cross-Domain Integration Features

#### Mood-Journal Connection
- [ ] Add "Reflect on this mood" button to mood entries that opens journal with mood context
- [ ] Display mood trends in journal analytics
- [ ] Suggest journal templates based on mood patterns

#### Task-Journal Integration
- [ ] Add "Reflect on completion" option to task completion
- [ ] Show related journal entries in task detail view
- [ ] Include task achievements in daily journal templates

#### Habit-Journal Integration
- [ ] Add reflection prompts to habit completion celebrations
- [ ] Include habit streaks in journal analytics
- [ ] Suggest journaling as a meta-habit for self-reflection

#### Calendar Integration
- [ ] Show journal entry indicators on calendar days
- [ ] Add "Daily Reflection" recurring event template
- [ ] Include journal writing time in calendar time blocking

### 4. Advanced Features

#### Journal Templates & Prompts
- [ ] **Reflection Templates**
  - Daily reflection (gratitude, lessons learned, tomorrow's goals)
  - Weekly review (achievements, challenges, focus areas)
  - Project completion retrospectives
  - Mood pattern analysis reflections

- [ ] **Planning Templates**
  - Morning intention setting
  - Evening review and planning
  - Goal-setting and progress check-ins
  - Problem-solving and decision making

#### Smart Features
- [ ] **AI-Powered Suggestions** (Future Enhancement)
  - Writing prompt suggestions based on mood and activity patterns
  - Tag suggestions based on content analysis
  - Template recommendations based on user preferences

- [ ] **Analytics & Insights**
  - Writing consistency tracking
  - Word count trends and goals
  - Mood-journal correlation analysis
  - Productivity score correlation with reflection frequency

#### Privacy & Security
- [ ] **Privacy Controls**
  - Entry-level privacy settings (private/shared/public)
  - Encrypted storage for sensitive entries
  - Privacy indicator throughout UI
  - Bulk privacy updates

- [ ] **Data Export & Backup**
  - Full journal export (JSON/CSV/Markdown)
  - Selective export by date range or tags
  - Import functionality for migration
  - Automated backup integration

### 5. UI/UX Integration

#### Design System Compliance
- [ ] Use existing Card, Button, Input, and Modal components
- [ ] Follow established color scheme and typography
- [ ] Maintain responsive design patterns
- [ ] Implement dark/light theme support

#### Accessibility Requirements
- [ ] WCAG 2.1 AA compliance for all components
- [ ] Keyboard navigation for rich text editor
- [ ] Screen reader support for journal content
- [ ] Focus management for modal interactions

#### Performance Optimization
- [ ] Lazy loading for large journal entries
- [ ] Virtual scrolling for long entry lists
- [ ] Debounced search and filtering
- [ ] Image optimization for entry attachments
- [ ] Offline support for reading entries

### 6. Testing & Quality Assurance

#### Backend Testing
- [ ] Unit tests for all journal API endpoints
- [ ] Integration tests for cross-service functionality
- [ ] Database migration testing
- [ ] Performance testing with large datasets

#### Frontend Testing
- [ ] Component unit tests with React Testing Library
- [ ] Integration tests for journal workflows
- [ ] Accessibility testing with axe-core
- [ ] Cross-browser compatibility testing
- [ ] Mobile responsiveness testing

#### User Testing
- [ ] Usability testing for journal creation workflow
- [ ] A/B testing for template effectiveness
- [ ] Performance testing with real user data
- [ ] Accessibility testing with actual users

## 🛠️ Implementation Timeline

### Phase 1: Foundation (Week 1-2)
- Backend service setup and basic CRUD operations
- Core frontend components and basic UI
- Database schema and migrations
- API integration and testing

### Phase 2: Core Features (Week 3-4)
- Rich text editor implementation
- Template system development
- Search and filtering functionality
- Basic analytics dashboard

### Phase 3: Integration (Week 5-6)
- Cross-domain integration with mood, tasks, and habits
- Calendar view implementation
- Advanced analytics and insights
- Privacy controls and security features

### Phase 4: Enhancement (Week 7-8)
- Performance optimization
- Advanced templates and prompts
- Export/import functionality
- Mobile optimization and offline support

## 🎯 Success Criteria

**Functional Requirements**
- [ ] Complete CRUD operations for journal entries
- [ ] Rich text editing with formatting support
- [ ] Template-based entry creation
- [ ] Cross-domain integration with existing features
- [ ] Advanced search and filtering capabilities
- [ ] Privacy controls and security measures

**Technical Requirements**
- [ ] TypeScript type safety throughout
- [ ] Responsive design across all devices
- [ ] WCAG 2.1 AA accessibility compliance
- [ ] Performance optimization for large datasets
- [ ] Comprehensive test coverage (>90%)
- [ ] Error handling and user feedback

**User Experience Requirements**
- [ ] Intuitive and consistent with existing app design
- [ ] Quick entry creation (under 30 seconds)
- [ ] Efficient search and discovery
- [ ] Meaningful analytics and insights
- [ ] Seamless integration with existing workflows

## 📚 Documentation Requirements

- [ ] API documentation for all journal endpoints
- [ ] Component documentation and Storybook stories
- [ ] User guide for journal features
- [ ] Developer guide for extending functionality
- [ ] Migration guide for existing users
- [ ] Troubleshooting and FAQ documentation

## 🔧 Technical Implementation Notes

**Architecture Alignment**
- Follow existing Encore.ts service patterns
- Use established React Query patterns for state management
- Maintain consistent error handling and loading states
- Follow existing component composition patterns

**Data Consistency**
- Implement proper foreign key relationships
- Use database transactions for complex operations
- Add data validation at both frontend and backend
- Implement optimistic UI updates with rollback capability

**Performance Considerations**
- Implement pagination for large journal collections
- Use virtual scrolling for performance with many entries
- Optimize database queries with proper indexing
- Implement caching strategies for frequently accessed data

This implementation will add comprehensive journaling capabilities to the Executive Dysfunction Center while maintaining architectural consistency and providing meaningful integration with existing productivity tracking features.