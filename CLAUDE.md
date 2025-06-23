# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Executive Dysfunction Center is a comprehensive productivity tracking application built with Encore.ts featuring advanced task management, habit tracking, mood logging, calendar integration, and theme customization. The project uses a microservices architecture with separate services for each feature area and is currently in Phase 2 with enhanced functionality.

## Development Commands

### Running the Application
- `npm run dev` or `encore run` - Start development server with hot reload
- `encore db migrate` - Run database migrations (required after schema changes)

### Testing
- `npm test` or `encore test` - Run all tests using Vitest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

### Building and Deployment
- `npm run build` or `encore build` - Build for production
- `npm run deploy` or `encore deploy` - Deploy to Encore Cloud

### Development Dashboard
- While `encore run` is running, access the local developer dashboard at http://localhost:9400/
- API testing available at http://localhost:4000/

## Architecture

### Service Structure (Phase 2)
The application follows Encore.ts microservices patterns with these services:

1. **API Service** (`/api`) - General API endpoints including health checks and information endpoints
2. **Tasks Service** (`/tasks`) - Advanced task management with categories, tags, time tracking, subtasks, and bulk operations
3. **Habits Service** (`/habits`) - Enhanced habit tracking with templates, flexible targets, streak analytics, and reminders
4. **Mood Service** (`/mood`) - Detailed mood logging with triggers, context tracking, and pattern analysis
5. **Calendar Service** (`/calendar`) - Full calendar integration with event management, recurrence, and task linking
6. **Preferences Service** (`/preferences`) - User preferences and theme management

### Database Architecture
- **PostgreSQL** with comprehensive migration system
- **Each service manages its own database** with independent schemas
- **Migration execution order** is critical - see `MIGRATION_ORDER.md` for proper deployment sequence
- **Foreign key relationships** between services (e.g., calendar events can link to tasks)
- **Advanced indexing** for optimal query performance across all tables

### Phase 2 Enhanced Features
- **Task Management**: Categories, tags, time tracking, subtasks, recurrence patterns, bulk operations
- **Habit Tracking**: Templates (10+ pre-built), flexible completion types (boolean/count/duration), advanced analytics
- **Mood Tracking**: Multi-dimensional tracking (primary/secondary mood, energy, stress), trigger system, context awareness
- **Calendar Integration**: Full calendar with day/week/month views, recurrence support, task deadline integration

### Key Files Per Service
- `encore.service.ts` - Service configuration and database connection
- `types.ts` - Service-specific TypeScript interfaces (heavily enhanced in Phase 2)
- `migrations/` - Database schema files with both up and down migrations
- Additional Phase 2 files:
  - `tasks/categories.ts`, `tasks/tags.ts`, `tasks/time-tracking.ts` - Enhanced task features
  - `habits/templates.ts` - Habit template management
  - `calendar/events.ts`, `calendar/views.ts` - Calendar functionality

### Shared Architecture
- `shared/types.ts` - Common types used across all services
- `shared/utils.ts` - Utility functions for validation, sanitization, and common operations

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
- Comprehensive validation using TypeScript interfaces
- Database transaction support for complex operations

### Database Query Patterns
- All services use async generator pattern with `collectResults` helper function
- Parameterized queries for security
- Proper indexing on frequently queried columns
- In-memory filtering for complex criteria when needed

### Type Safety
- Strict TypeScript configuration with enhanced interfaces for Phase 2
- Service-specific types in each `types.ts` file
- Shared types for common data structures
- Enhanced interfaces support optional Phase 2 fields for backward compatibility

## API Documentation

- **Phase 1 API**: `API_DOCUMENTATION.md` - Original MVP endpoints
- **Phase 2 API**: `API_PHASE_2_DOCUMENTATION.md` - Complete enhanced API documentation
- **100% Backward Compatible**: All Phase 1 endpoints continue to work unchanged

## Testing Strategy

- Comprehensive test files for all services (`*.test.ts`)
- Tests cover both Phase 1 core functionality and Phase 2 enhancements
- Vitest framework with support for async database operations
- Test database isolation and proper cleanup

## Development Workflow

1. **For new features**: Check if migrations are needed and add them following the established patterns
2. **For database changes**: Always create both up and down migration files
3. **Run migrations**: `encore db migrate` after schema changes
4. **Test changes**: `npm test` to ensure no regressions
5. **Start development**: `npm run dev` and use dashboard at http://localhost:9400/

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

✅ **Completed**: All Phase 2 features implemented including advanced task management, enhanced habit tracking, detailed mood logging, and full calendar integration.

**Key Phase 2 Enhancements:**
- Task categories, tags, time tracking, and subtasks
- Habit templates and flexible target system
- Multi-dimensional mood tracking with triggers
- Complete calendar system with task integration
- Advanced analytics and pattern recognition across all services