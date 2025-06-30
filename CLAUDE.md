# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Executive Dysfunction Center is a productivity tracking application built with Encore.ts featuring task management, habit tracking, mood logging, journaling, calendar integration, and theme customization. The project uses a microservices architecture with separate services for each feature area and is currently in Phase 2.

## Development Commands

### Running the Application
- `encore run` or `npm run dev` - Start development server with hot reload (serves both backend and frontend)
- `encore db migrate` - Run database migrations (required after schema changes)

### Testing
- `npm test` or `encore test` - Run all backend tests using Vitest
- `npm run test:watch` - Run backend tests in watch mode
- `npm run test:coverage` - Run backend tests with coverage report
- `cd frontend && npm test` - Run frontend tests only
- `cd frontend && npm run lint` - Run ESLint on frontend code

### Frontend Development
- `cd frontend && npm start` - Start React development server (frontend only, for development without backend)
- `cd frontend && npm run build` - Build frontend for production
- `cd frontend && npm install` - Install frontend dependencies after checkout

### Building and Deployment
- `npm run build` or `encore build` - Build for production
- `npm run deploy` or `encore deploy` - Deploy to Encore Cloud

### Development Dashboard
- While `encore run` is running, access the local developer dashboard at http://localhost:9400/
- API testing available at http://localhost:4000/
- Frontend runs at http://localhost:3000/ when started separately

## Architecture

### Service Structure (Phase 2)
The application follows Encore.ts microservices patterns with these services:

1. **API Service** (`/api`) - General API endpoints including health checks and information endpoints
2. **Tasks Service** (`/tasks`) - Task management with categories, tags, time tracking, subtasks, and bulk operations
3. **Habits Service** (`/habits`) - Habit tracking with templates, configurable targets, streak analytics, and reminders
4. **Mood Service** (`/mood`) - Detailed mood logging with triggers, context tracking, and pattern analysis
5. **Journal Service** (`/journal`) - Journaling with entries, templates, and search functionality
6. **Calendar Service** (`/calendar`) - Full calendar integration with event management, recurrence, and task linking
7. **Preferences Service** (`/preferences`) - User preferences and theme management

### Database Architecture
- **PostgreSQL** with migration system
- **Each service manages its own database** with independent schemas
- **Migration execution order** is critical - see `MIGRATION_ORDER.md` for proper deployment sequence
- **Foreign key relationships** between services (e.g., calendar events can link to tasks)
- **Indexing** for query performance across all tables

### Phase 2 Features
- **Task Management**: Categories, tags, time tracking, subtasks, recurrence patterns, bulk operations
- **Habit Tracking**: Templates (10+ pre-built), configurable completion types (boolean/count/duration), analytics
- **Mood Tracking**: Multi-dimensional tracking (primary/secondary mood, energy, stress), trigger system, context awareness
- **Journal Service**: Entry creation, templates, search functionality, markdown support
- **Calendar Integration**: Full calendar with day/week/month views, recurrence support, task deadline integration

### Key Files Per Service
- `encore.service.ts` - Service configuration and database connection
- `types.ts` - Service-specific TypeScript interfaces (heavily enhanced in Phase 2)
- `migrations/` - Database schema files with both up and down migrations
- Additional Phase 2 files:
  - `tasks/categories.ts`, `tasks/tags.ts`, `tasks/time-tracking.ts` - Task features
  - `habits/templates.ts` - Habit template management
  - `journal/journal.ts` - Journal entry management
  - `calendar/events.ts`, `calendar/views.ts` - Calendar functionality

### Shared Architecture
- `shared/types.ts` - Common types used across all services
- `shared/utils.ts` - Utility functions for validation, sanitization, and common operations

### Frontend Architecture
- **React 18** with **TypeScript** and **Tailwind CSS**
- **React Router** for navigation between pages
- **TanStack Query** for server state management and caching
- **Zustand** for client-side state management
- **Radix UI** components for accessible UI primitives
- **React Hook Form** with **Zod** validation for forms
- **React Testing Library** for frontend testing
- **React Big Calendar** for calendar views
- **Recharts** for data visualization

#### Frontend Structure
- `frontend/src/components/` - Reusable UI components organized by feature
  - `ui/` - Design system components (Button, Input, Layout, etc.)
  - `layout/` - App shell components (AppShell, Header, Sidebar)
  - `tasks/`, `habits/`, `mood/`, `journal/`, `calendar/` - Feature-specific components
- `frontend/src/pages/` - Page-level components (Dashboard, Tasks, Habits, Mood, Journal, Calendar, Settings)
- `frontend/src/services/` - API client functions that match backend services
- `frontend/src/hooks/` - Custom React hooks
- `frontend/src/stores/` - Zustand stores for global state
- `frontend/src/types/` - TypeScript type definitions including simplified component interfaces

## Development Patterns

### Database Migration Management
- **Critical**: Always run migrations in the order specified in `MIGRATION_ORDER.md`
- **Core tables first**: tasks, habits, mood, calendar base tables
- **Enhancements second**: categories, tags, templates, detailed tracking
- **Foreign keys last**: Cross-service relationships after all tables exist

### Service Communication
- Import clients: `import { serviceName } from "~encore/clients"`
- Example: `await tasks.getTasks()` to call tasks service from another service
- Calendar service integrates with tasks service for deadline management

### Error Handling
- Consistent error responses using `APIError` interface from `shared/types.ts`
- Validation using TypeScript interfaces
- Database transaction support for complex operations

### Database Query Patterns
- All services use async generator pattern with `collectResults` helper function
- Parameterized queries for security
- Proper indexing on frequently queried columns
- In-memory filtering for complex criteria when needed

### Type Safety
- Strict TypeScript configuration with interfaces for Phase 2
- Service-specific types in each `types.ts` file
- Shared types for common data structures
- Interfaces support optional Phase 2 fields for backward compatibility

### Component System (Simplified)
- **Simplified interfaces**: 4 core interfaces (BaseComponentProps, FormProps, LayoutProps, InteractiveProps)
- **Input/Form components**: Use FormProps interface with essential props only
- **Layout components**: Single Layout component replaces Grid/Stack/Container system
- **See COMPONENT_SIMPLIFICATION_MIGRATION.md** for migration guide from previous over-engineered system

### Frontend Development Patterns
- **API Integration**: Frontend services in `frontend/src/services/` mirror backend service structure
- **Component Structure**: Use Radix UI primitives with custom styling via Tailwind
- **Form Handling**: React Hook Form with Zod schemas for validation
- **State Management**: TanStack Query for server state, Zustand for client state
- **Testing**: Component tests with React Testing Library, API mocking with MSW patterns

## API Documentation

- **Phase 1 API**: `API_DOCUMENTATION.md` - Original MVP endpoints
- **Phase 2 API**: `API_PHASE_2_DOCUMENTATION.md` - Complete enhanced API documentation
- **100% Backward Compatible**: All Phase 1 endpoints continue to work unchanged

## Testing Strategy

- Test files for all services (`*.test.ts`)
- Tests cover both Phase 1 core functionality and Phase 2 features
- Vitest framework with support for async database operations
- Test database isolation and proper cleanup
- Frontend tests use React Testing Library with Jest DOM matchers

## Development Workflow

1. **For new features**: Check if migrations are needed and add them following the established patterns
2. **For database changes**: Always create both up and down migration files
3. **Run migrations**: `encore db migrate` after schema changes
4. **Test changes**: `npm test` to ensure no regressions
5. **Start development**: `npm run dev` and use dashboard at http://localhost:9400/

### Full Stack Development
- **Backend + Frontend**: `encore run` serves both backend APIs and frontend (recommended)
- **Frontend Only**: `cd frontend && npm start` for frontend-only development
- **API Testing**: Use the Encore dashboard at http://localhost:9400/ or direct API calls to http://localhost:4000/

## Common Implementation Patterns

### Database Service Setup
```ts
import { SQLDatabase } from "encore.dev/storage/sqldb";
export const serviceDB = new SQLDatabase("service_name", {
  migrations: "./migrations",
});
```

### API Endpoint Pattern
```ts
import { api } from "encore.dev/api";
export const endpointName = api(
  { method: "GET", path: "/endpoint", expose: true },
  async (req: RequestType): Promise<ResponseType> => {
    // Implementation with proper error handling
  }
);
```

### Query Result Collection
```ts
async function collectResults<T>(generator: AsyncGenerator<T>): Promise<T[]> {
  const results: T[] = [];
  for await (const result of generator) {
    results.push(result);
  }
  return results;
}
```

## Phase 2 Implementation Status

✅ **Completed**: All Phase 2 features implemented including task management, habit tracking, detailed mood logging, journaling, and full calendar integration.

**Key Phase 2 Features:**
- Task categories, tags, time tracking, and subtasks
- Habit templates and configurable target system
- Multi-dimensional mood tracking with triggers
- Journal entries with templates and search
- Complete calendar system with task integration
- Analytics and pattern recognition across all services
- Component system simplification (see COMPONENT_SIMPLIFICATION_MIGRATION.md)