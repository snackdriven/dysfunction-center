# Executive Dysfunction Center - Phase 1 MVP

A productivity tracking application built with Encore.ts, featuring task management, habit tracking, mood logging, and theme customization.

## 🚀 Features (Phase 1 MVP)

### ✅ Task Management
- Create, edit, delete tasks with priorities (high, medium, low)
- Mark tasks as complete/incomplete with timestamps
- Set due dates with validation
- Filter and search tasks by completion status, priority, and dates
- Full CRUD API with comprehensive validation

### 📊 Habit Tracking
- Create daily habits with categories (health, productivity, personal)
- Track daily completions with streak counting
- View habit statistics and completion rates
- Deactivate/reactivate habits
- Comprehensive history tracking with analytics

### 😊 Mood Logging
- Quick mood selection (1-5 scale)
- Add optional notes and categories to mood entries
- View daily mood history and trends
- Mood analytics with statistics and pattern recognition
- One entry per day with update capability

### 🎨 Theme System
- Light/dark mode toggle with instant switching
- System theme preference detection
- Automatic theme switching based on time
- Theme preference persistence
- Customizable dark hours (e.g., 18:00-06:00)

## 🏗️ Architecture

### Backend Services
- **Tasks Service**: Complete task management with CRUD operations
- **Habits Service**: Habit tracking with streak calculation and analytics
- **Mood Service**: Mood logging with statistics and trend analysis
- **Preferences Service**: User preferences and theme management

### Database Schema
- **PostgreSQL** with proper migrations
- **Indexed tables** for optimal query performance
- **Referential integrity** with foreign key constraints
- **Unique constraints** where appropriate (e.g., one mood entry per day)

### API Design
- **RESTful endpoints** with proper HTTP methods
- **TypeScript interfaces** for all request/response types
- **Comprehensive validation** with meaningful error messages
- **Consistent error handling** across all services

## 📁 Project Structure

```
/
├── migrations/                 # Database migrations
│   ├── 001_create_tasks.up.sql
│   ├── 002_create_habits.up.sql
│   ├── 003_create_mood_entries.up.sql
│   └── 004_create_user_preferences.up.sql
├── shared/                     # Shared utilities and types
│   ├── types.ts               # Common TypeScript types
│   └── utils.ts               # Utility functions
├── tasks/                      # Task management service
│   ├── encore.service.ts      # Service configuration
│   ├── tasks.ts               # API endpoints
│   ├── tasks.test.ts          # Comprehensive tests
│   └── types.ts               # Task-specific types
├── habits/                     # Habit tracking service
│   ├── encore.service.ts      # Service configuration
│   ├── habits.ts              # API endpoints with streak logic
│   ├── habits.test.ts         # Comprehensive tests
│   └── types.ts               # Habit-specific types
├── mood/                       # Mood logging service
│   ├── encore.service.ts      # Service configuration
│   ├── mood.ts                # API endpoints with analytics
│   ├── mood.test.ts           # Comprehensive tests
│   └── types.ts               # Mood-specific types
├── preferences/                # Preferences and theme service
│   ├── encore.service.ts      # Service configuration
│   ├── preferences.ts         # Theme and preference endpoints
│   ├── preferences.test.ts    # Comprehensive tests
│   └── types.ts               # Preference-specific types
├── package.json               # Project dependencies
└── tsconfig.json              # TypeScript configuration
```

## 🛠️ Setup & Development

### Prerequisites
- Node.js 18+ 
- Encore CLI installed (`npm install -g @encore.dev/cli`)
- PostgreSQL (managed by Encore.ts)

### Installation

1. **Clone and setup**:
   ```bash
   git clone <repository>
   cd executive-dysfunction-center
   npm install
   ```

2. **Run database migrations**:
   ```bash
   encore db migrate
   ```

3. **Start development server**:
   ```bash
   npm run dev
   # or
   encore run
   ```

4. **Run tests**:
   ```bash
   npm test
   # or for watch mode
   npm run test:watch
   ```

### API Endpoints

#### Tasks (`/tasks`)
- `POST /tasks` - Create task
- `GET /tasks` - List tasks (with filtering)
- `GET /tasks/:id` - Get specific task
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task

#### Habits (`/habits`)
- `POST /habits` - Create habit
- `GET /habits` - List habits (with completion data)
- `GET /habits/:id` - Get specific habit
- `PUT /habits/:id` - Update habit
- `DELETE /habits/:id` - Delete habit
- `POST /habits/:habit_id/completions` - Log completion
- `GET /habits/:habit_id/history` - Get completion history

#### Mood (`/mood`)
- `POST /mood` - Create mood entry
- `GET /mood` - List mood entries (with filtering)
- `GET /mood/:id` - Get specific mood entry
- `GET /mood/today` - Get today's mood
- `PUT /mood/:id` - Update mood entry
- `DELETE /mood/:id` - Delete mood entry
- `GET /mood/analytics` - Get mood analytics

#### Preferences (`/preferences`, `/theme`)
- `GET /preferences` - Get all preferences
- `GET /preferences/:key` - Get specific preference
- `POST /preferences` - Set preference
- `GET /theme` - Get theme settings
- `POST /theme` - Update theme settings
- `GET /theme/system` - Get system theme info

## 🧪 Testing

The project includes comprehensive test coverage for all services:

- **Unit tests** for all API endpoints
- **Integration tests** for database operations
- **Validation tests** for input sanitization
- **Error handling tests** for edge cases

Run tests with:
```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

## 📊 Database Schema

### Tasks Table
- Primary key, title, description, priority
- Due dates, completion status with timestamps
- Proper indexing for queries

### Habits Table + Completions
- Habit metadata with categories
- Separate completions table for daily tracking
- Unique constraints for one completion per day

### Mood Entries Table
- Mood score (1-5), optional category and notes
- One entry per day constraint
- Date indexing for efficient queries

### User Preferences Table
- Key-value store for all user preferences
- Theme settings with auto-switching logic
- Multi-user support ready

## 🎯 Success Criteria ✅

Phase 1 MVP is **COMPLETE** with:

1. ✅ **Task Management**: Full CRUD with priorities, due dates, and filtering
2. ✅ **Habit Tracking**: Daily completions with streak calculation and analytics  
3. ✅ **Mood Logging**: Daily mood entries with statistics and trends
4. ✅ **Theme System**: Light/dark mode with system detection and auto-switching
5. ✅ **Database**: All tables created with proper migrations and indexes
6. ✅ **API**: All endpoints implemented with validation and error handling
7. ✅ **Types**: Complete TypeScript coverage with proper interfaces
8. ✅ **Tests**: Comprehensive test suite for all functionality

## 🚀 Next Steps (Phase 2)

Ready for Phase 2 development:
- Advanced task features (categories, tags, subtasks)
- Enhanced habit analytics and templates
- Detailed mood tracking with triggers
- Calendar integration foundation

## 📝 Development Notes

- All database queries use proper parameterization for security
- Input validation and sanitization on all endpoints
- Consistent error handling with meaningful messages
- TypeScript strict mode enabled for type safety
- Comprehensive logging for debugging
- Ready for horizontal scaling with multiple service instances
