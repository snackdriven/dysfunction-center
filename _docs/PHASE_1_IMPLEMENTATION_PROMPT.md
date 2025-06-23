# Phase 1 MVP Implementation Prompt

You are an expert Encore.ts/TypeScript developer building "Executive Dysfunction Center", a productivity tracking application. 

## Project Context
- **Framework**: Encore.ts backend with TypeScript
- **Database**: SQL database with migrations
- **Architecture**: API-first design with proper TypeScript types
- **Current State**: Basic Encore.ts starter project

## Phase 1 MVP Requirements

Implement the core foundation features for daily productivity tracking, focusing on:

### 1.1 Basic Task Management
**Priority: CRITICAL** | **Effort: MEDIUM**

Implement a complete task management system with:
- Create, edit, delete tasks with title and basic details
- Mark tasks as complete/incomplete with timestamps
- Priority levels (high, medium, low) with enum types
- Simple due date assignment with date validation
- Task list view with status indicators and filtering

**Technical Requirements:**
- Create `tasks` database table with proper schema
- Implement CRUD API endpoints with validation
- Add TypeScript interfaces for all task data
- Include created_at, updated_at, completed_at timestamps
- Add proper error handling and response types

### 1.2 Basic Habit Tracking
**Priority: CRITICAL** | **Effort: MEDIUM**

Build a habit tracking system with:
- Create daily habits with simple completion tracking
- Mark habits as complete/incomplete for each day
- Basic habit categories (health, productivity, personal)
- Simple streak counting with automatic calculation
- Daily habit checklist view with progress indicators

**Technical Requirements:**
- Create `habits` and `habit_completions` database tables
- Implement habit CRUD endpoints
- Add streak calculation logic in the backend
- Create daily completion tracking with date indexing
- Add proper relationship between habits and completions

### 1.3 Basic Mood Logging
**Priority: HIGH** | **Effort: LOW**

Implement mood tracking with:
- Quick mood selection from predefined options (1-5 scale or emoji-based)
- Add basic notes to mood entries (optional text field)
- View daily mood history with chronological listing
- Simple mood categories or tags

**Technical Requirements:**
- Create `mood_entries` database table
- Implement mood logging and retrieval endpoints
- Add mood scale validation (ensure valid range)
- Include timestamp and optional notes fields
- Add daily mood history retrieval with date filtering

### 1.4 Theme System Foundation
**Priority: HIGH** | **Effort: MEDIUM**

Create a theme system supporting:
- Light/dark mode toggle with instant switching
- System theme preference detection
- Theme preference persistence in database
- Smooth theme transitions with CSS variables

**Technical Requirements:**
- Create `user_preferences` database table
- Implement theme preference endpoints
- Add CSS custom properties for theme variables
- Create theme context/state management
- Add system preference detection logic

## Implementation Guidelines

When implementing these features, always:

### Database Design
```sql
-- Example table structure for tasks
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(10) CHECK (priority IN ('high', 'medium', 'low')),
  due_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### API Endpoint Structure
```typescript
// Example API endpoint pattern
import { api, APIEndpoint } from "encore.dev/api";
import { SQLDatabase } from "encore.dev/storage/sqldb";

// Create proper TypeScript interfaces
interface Task {
  id: number;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  due_date?: string;
  completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: 'high' | 'medium' | 'low';
  due_date?: string;
}

interface CreateTaskResponse {
  task: Task;
}

export const createTask = api(
  { method: "POST", path: "/tasks", expose: true },
  async (req: CreateTaskRequest): Promise<CreateTaskResponse> => {
    // Implementation with proper validation and error handling
  }
);
```

### Database Integration
- Use Encore.ts SQLDatabase with proper migrations
- Create migration files for all table changes
- Add proper indexes for performance
- Use prepared statements for security

### Error Handling
- Add comprehensive error handling for all endpoints
- Return proper HTTP status codes
- Include meaningful error messages
- Log errors for debugging

### Data Validation
- Validate all input data at the API level
- Use TypeScript types for compile-time safety
- Add runtime validation for user inputs
- Sanitize data before database operations

## Success Criteria

Phase 1 is complete when:

1. **Task Management**: Users can create, edit, delete, and complete tasks with proper persistence
2. **Habit Tracking**: Users can create habits and track daily completions with streak counting
3. **Mood Logging**: Users can log daily moods with notes and view history
4. **Theme System**: Users can toggle between light/dark themes with persistence
5. **Database**: All data is properly stored with migrations and relationships
6. **API**: All endpoints work with proper validation and error handling
7. **Types**: Complete TypeScript coverage with no any types

## File Structure Expected

After implementation, the project should have:

```
/
├── migrations/
│   ├── 001_create_tasks.up.sql
│   ├── 002_create_habits.up.sql
│   ├── 003_create_mood_entries.up.sql
│   └── 004_create_user_preferences.up.sql
├── tasks/
│   ├── encore.service.ts
│   ├── tasks.ts (API endpoints)
│   ├── tasks.test.ts
│   └── types.ts
├── habits/
│   ├── encore.service.ts
│   ├── habits.ts (API endpoints)
│   ├── habits.test.ts
│   └── types.ts
├── mood/
│   ├── encore.service.ts
│   ├── mood.ts (API endpoints)
│   ├── mood.test.ts
│   └── types.ts
├── preferences/
│   ├── encore.service.ts
│   ├── preferences.ts (API endpoints)
│   ├── preferences.test.ts
│   └── types.ts
└── shared/
    ├── types.ts (common types)
    └── utils.ts (shared utilities)
```

## Implementation Order

1. **Database Setup**: Create all migration files first
2. **Task Management**: Implement complete CRUD for tasks
3. **Habit Tracking**: Build habit system with completion tracking
4. **Mood Logging**: Add simple mood logging functionality
5. **Theme System**: Implement theme preferences and switching
6. **Testing**: Add comprehensive tests for all endpoints
7. **Documentation**: Update API documentation and types

## Quality Requirements

- All code must be properly typed with TypeScript
- All endpoints must have comprehensive tests
- Database operations must use transactions where appropriate
- Error handling must be consistent across all services
- All user inputs must be validated and sanitized
- Performance should support hundreds of tasks/habits per user

Start with the database migrations and task management system, then proceed through each feature systematically. Ensure each feature is fully complete before moving to the next one.
