# Executive Dysfunction Center

A comprehensive productivity and mental health platform for managing tasks, habits, mood, journaling, and calendar events. Built with a focus on executive dysfunction support, accessibility, and data-driven insights.

## 🎯 Overview

Executive Dysfunction Center helps users track and improve productivity, habits, journaling, and well-being through:
- **Task Management** with categories, tags, time tracking, and subtasks
- **Habit Tracking** with multi-completion support, streaks, and analytics
- **Mood Tracking** with multi-dimensional logging and pattern detection
- **Journaling** with templates, search, and analytics
- **Calendar Integration** with events, recurrence, and task deadline tracking
- **Cross-Service Analytics** with correlations and AI-powered insights

## 📚 Documentation

### Product & Technical Specifications

This project includes comprehensive documentation for all features:

#### 📋 [Product Requirements Documents (PRDs)](./docs/prds/)
**Business-focused specifications** defining what to build, why, and success metrics:
- **[README](./docs/prds/README.md)** - Overview, roadmap, priority matrix (10-month plan)
- **[Tasks Service](./docs/prds/01-tasks-service-enhancements.md)** - Search, bulk ops, analytics, recurring tasks
- **[Habits Service](./docs/prds/02-habits-service-enhancements.md)** - Analytics, gamification, notifications
- **[Mood Service](./docs/prds/03-mood-service-enhancements.md)** - Phase 2 backend, triggers, pattern detection
- **[Journal & Calendar](./docs/prds/04-journal-calendar-service-enhancements.md)** - Export, AI assistance, reminders, recurrence
- **[Notifications System](./docs/prds/05-notifications-and-reminders-system.md)** - Multi-channel delivery, preferences
- **[Analytics & Authentication](./docs/prds/06-analytics-insights-auth-user-management.md)** - Cross-service insights, user management

**Total:** 7 documents, 4,645 lines, comprehensive roadmap

#### 🔧 [Functional Specifications](./docs/functional-specs/)
**Implementation-ready technical blueprints** with exact database schemas, API contracts, and algorithms:
- **[README](./docs/functional-specs/README.md)** - Master index, design principles, quick reference
- **[FS-001: Authentication & User Management](./docs/functional-specs/FS-001-authentication-user-management.md)** - Complete implementation spec (30KB)
  - Database schemas (users, sessions, OAuth)
  - 11 API endpoints with full contracts
  - JWT + refresh token rotation
  - Email verification & password reset
  - Multi-tenancy migration plan
  - 50+ test specifications
  - Frontend integration examples
  - 6-week implementation checklist

**More functional specs in progress:** Notifications, Tasks Backend, Habits Analytics, Mood Phase 2

**Total:** Implementation-ready specs with SQL migrations, TypeScript interfaces, algorithms, and test cases

#### 📖 Additional Documentation
- **[API Documentation](./API_PHASE_2_DOCUMENTATION.md)** - Complete API reference for all services
- **[Migration Guide](./MIGRATION_ORDER.md)** - Database migration execution order
- **[Modern UI Design](./MODERN_UI_DESIGN.md)** - UI/UX specs, design system, accessibility
- **[Component Simplification](./COMPONENT_SIMPLIFICATION_MIGRATION.md)** - Component architecture guide
- **[Data Portability](./DATA_PORTABILITY.md)** - Import/export, backup/restore
- **[Prompt Guide](./PROMPT_GUIDE.md)** - Architecture and persistence guidelines

---

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- React 18 (TypeScript), TanStack Query, Zustand
- Tailwind CSS, Radix UI, Recharts, React Big Calendar
- React Hook Form + Zod validation
- Lucide React icons, Framer Motion

**Backend:**
- Encore.ts (TypeScript microservices)
- PostgreSQL with migrations
- JWT authentication
- RESTful APIs

**Testing:**
- Vitest (backend), React Testing Library (frontend)
- Integration and E2E testing (planned)

### Service Architecture

```
├── api/               # Core API endpoints and health checks
├── tasks/             # Task management with categories, tags, time tracking
├── habits/            # Habit tracking with templates and multi-completion
├── mood/              # Mood tracking with triggers and context
├── journal/           # Journaling with templates and search
├── calendar/          # Calendar events with recurrence and reminders
├── preferences/       # User preferences and theme management
└── shared/            # Shared types and utilities
```

Each service includes:
- `encore.service.ts` - Service configuration
- `types.ts` - TypeScript interfaces
- `migrations/` - Database schema with up/down migrations
- `*.test.ts` - Test suites

### Frontend Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/          # AppShell, Header, Sidebar, Navigation
│   │   ├── ui/              # Design system (Button, Card, Input, etc.)
│   │   ├── tasks/           # Task components (List, Card, Form, Kanban)
│   │   ├── habits/          # Habit components (Grid, Card, Analytics)
│   │   ├── mood/            # Mood components (History, Patterns, Correlations)
│   │   ├── journal/         # Journal components (Entry, Form, Analytics)
│   │   ├── calendar/        # Calendar components (Views, Events, Agenda)
│   │   ├── dashboard/       # Dashboard widgets and stats
│   │   └── settings/        # Settings and preferences
│   ├── pages/               # Dashboard, Tasks, Habits, Mood, Journal, Calendar, Settings
│   ├── services/            # API clients (mirror backend services)
│   ├── hooks/               # Custom React hooks
│   ├── stores/              # Zustand state management
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Utility functions
├── public/                  # Static assets
└── package.json             # Dependencies and scripts
```

### Database Architecture

- **PostgreSQL** with migration system
- **Each service manages its own database** with independent schemas
- **Migration execution order** is critical (see `MIGRATION_ORDER.md`)
- **Foreign key relationships** between services (e.g., calendar ↔ tasks)
- **Comprehensive indexing** for query performance

### Current Implementation Status

**Phase 1 (MVP):** ✅ Complete
- Basic CRUD operations for all services
- Core frontend UI
- Database schema foundation

**Phase 2 (Enhanced Features):** 🔄 In Progress
- ✅ **Database schemas:** Complete for all Phase 2 features
- ✅ **Frontend UI:** Complete with advanced features
- ⚠️ **Backend APIs:** Partial - some features use mock data
  - Tasks: Search, bulk ops, analytics need implementation
  - Habits: Analytics backend needs server-side implementation
  - Mood: Phase 2 fields need backend support
  - Journal: Export endpoint needs implementation
  - Calendar: Reminders and recurrence processing needed

**Phase 3 (Authentication & Multi-User):** 📋 Planned
- User registration, login, OAuth
- Multi-tenancy data isolation
- See FS-001 for complete specification

**Phase 4 (Advanced Features):** 📋 Planned
- Notifications system
- Cross-service analytics
- AI-powered insights
- Gamification

---

## 🚀 Getting Started

### Prerequisites

**Install Encore:**
- **Windows:** `iwr https://encore.dev/install.ps1 | iex`
- **macOS:** `brew install encoredev/tap/encore`
- **Linux:** `curl -L https://encore.dev/install.sh | bash`

### Quick Start

**1. Clone and install:**
```bash
git clone <repository-url>
cd dysfunction-center
```

**2. Run backend (serves both API and frontend):**
```bash
encore run
```
- Backend API: `http://localhost:4000/`
- Frontend: `http://localhost:3000/`
- Encore Dev Dashboard: `http://localhost:9400/`

**3. Run frontend separately (optional):**
```bash
cd frontend
npm install
npm start
```

### Development Commands

**Backend:**
```bash
encore run                 # Start development server with hot reload
encore db migrate          # Run database migrations (required after schema changes)
encore test                # Run backend tests (Vitest)
encore build               # Build for production
```

**Frontend:**
```bash
cd frontend
npm start                  # Start React development server
npm test                   # Run frontend tests
npm run build              # Build for production
npm run lint               # Run ESLint
```

**Database:**
```bash
encore db migrate          # Apply migrations
encore db reset            # Reset database (dev only)
```

### Accessing the App

Once running, you can access:
- **Frontend:** http://localhost:3000/
- **API:** http://localhost:4000/
- **Encore Dashboard:** http://localhost:9400/ (API testing, service graph, traces)

---

## 🧭 Development Workflow

### For New Features

1. **Review Documentation**
   - Check relevant PRD in `docs/prds/`
   - Review functional spec in `docs/functional-specs/` (if available)
   - Understand requirements and acceptance criteria

2. **Database First**
   - Create migration files (`migrations/XXX_description.up.sql` and `.down.sql`)
   - Follow patterns in `MIGRATION_ORDER.md`
   - Test migrations locally

3. **Backend Implementation**
   - Update `types.ts` with TypeScript interfaces
   - Implement API endpoints in service files
   - Add validation and error handling
   - Write unit tests (`*.test.ts`)

4. **Frontend Integration**
   - Update API client in `frontend/src/services/`
   - Create/update components
   - Add TanStack Query hooks for data fetching
   - Update Zustand stores if needed
   - Write component tests

5. **Testing**
   - Run all tests: `encore test` and `cd frontend && npm test`
   - Manual testing in development
   - Check accessibility and responsiveness

6. **Documentation**
   - Update API documentation
   - Add code comments for complex logic
   - Update user-facing docs if needed

### Code Quality Standards

- **Type Safety:** Strict TypeScript throughout
- **Testing:** 80% coverage target
- **Accessibility:** WCAG AA compliance
- **Performance:** < 2s page load, < 500ms API responses
- **Security:** Input validation, parameterized queries, auth checks

---

## 🎨 UI/UX Design

### Design Principles

- **Executive Dysfunction Support:** Clear visual hierarchy, progress indicators, undo/redo
- **Minimal Interfaces:** Contextual interactions, progressive disclosure
- **Accessibility First:** Keyboard navigation, screen reader support, high contrast mode
- **Responsive Design:** Desktop sidebar, mobile tab bar, adaptive grids
- **Data Visualization:** Charts (Recharts), heatmaps, trend analysis

### Key Features

- **Task Management:** List view, Kanban board, calendar view, analytics
- **Habit Tracking:** Grid layout, streak indicators, completion heatmaps
- **Mood Tracking:** Multi-dimensional logging, pattern analysis, correlations
- **Journaling:** Markdown editor, templates, search, analytics
- **Calendar:** Day/week/month views, agenda view, integrated task deadlines
- **Dashboard:** Unified productivity score, quick actions, AI insights

See [`MODERN_UI_DESIGN.md`](./MODERN_UI_DESIGN.md) for detailed specs, color palette, and layout diagrams.

---

## 📊 State Management

### Architecture

- **Server State:** TanStack Query (React Query)
  - API data caching
  - Automatic background refetching
  - Optimistic updates
  - 5-minute stale time

- **Client State:** Zustand
  - UI state (sidebar, modals, filters)
  - User preferences
  - Theme management
  - Undo/redo history
  - Persisted to localStorage

- **Form State:** React Hook Form + Zod
  - Type-safe validation
  - Error handling
  - Optimized re-renders

### Key Stores

- **`appStore.ts`** - Global app state, filters, preferences, undo/redo
- **`uiStore.ts`** - UI-specific state (sidebar, search, theme)
- Theme context, Auth context (planned)

---

## 🧪 Testing Strategy

### Backend Tests (Vitest)

```bash
encore test                # Run all tests
encore test --watch        # Watch mode
```

**Coverage:**
- Unit tests for all services
- Integration tests for cross-service features
- Database transaction tests
- Validation and error handling tests

### Frontend Tests (React Testing Library)

```bash
cd frontend
npm test                   # Run tests
npm run test:coverage      # Coverage report
```

**Coverage:**
- Component tests with user interactions
- Hook tests for custom hooks
- Integration tests for page flows
- Accessibility tests

### Current Test Status

- ✅ Tasks: Basic CRUD tests
- ✅ Habits: Multi-completion tests
- ✅ Mood: Basic tests
- ✅ Journal: Comprehensive tests (334 lines)
- ✅ Calendar: Basic tests
- ⚠️ Frontend: Limited coverage (needs expansion)

**Target:** 80% coverage across all services

---

## 🔐 Security

### Current Implementation

- Input sanitization on all user inputs
- Parameterized SQL queries (prevents SQL injection)
- CORS configuration
- Rate limiting (planned)

### Planned (Phase 3)

- JWT authentication with refresh token rotation
- Bcrypt password hashing (12 rounds)
- Account lockout (5 failed attempts)
- Email verification
- OAuth 2.0 (Google, Apple)
- Row-level security (PostgreSQL RLS)

See [FS-001](./docs/functional-specs/FS-001-authentication-user-management.md) for complete security specification.

---

## 📦 Data Portability

### Backup

```bash
# Backup all data (if using local SQLite)
cp -r northstar-data/ /path/to/backup/

# With PostgreSQL (production)
pg_dump dbname > backup.sql
```

### Export

- **Tasks:** CSV, JSON (planned)
- **Habits:** CSV, JSON, PDF (planned - see PRD)
- **Mood:** CSV, JSON (planned)
- **Journal:** Markdown, JSON, PDF (in progress - see FS-006)
- **Calendar:** iCal format (planned)

See [`DATA_PORTABILITY.md`](./DATA_PORTABILITY.md) for full details.

---

## 🗺️ Roadmap

### Current Sprint (Phase 2 Completion)
- ⏳ Complete missing backend endpoints (search, bulk ops, analytics)
- ⏳ Move habit analytics to server-side
- ⏳ Implement mood Phase 2 backend
- ⏳ Complete journal export functionality

### Next Phase (Authentication - 6 weeks)
- 📋 User registration and login
- 📋 Email verification
- 📋 OAuth 2.0 (Google, Apple)
- 📋 Multi-tenancy data migration
- 📋 Session management

### Future Phases
- 📋 Notifications system (4 weeks)
- 📋 Cross-service analytics (4 weeks)
- 📋 AI-powered insights (4 weeks)
- 📋 Gamification (achievements, levels) (2 weeks)
- 📋 Mobile app (PWA or native) (TBD)

**Full roadmap:** See [PRD README](./docs/prds/README.md) for 10-month implementation plan

---

## 🤝 Contributing

### Development Process

1. **Create feature branch:** `git checkout -b feature/description`
2. **Follow documentation:** Review PRD and functional spec
3. **Implement with tests:** Backend + frontend + tests
4. **Code review:** Ensure quality and test coverage
5. **Merge and deploy:** Via pull request

### Coding Standards

- **TypeScript:** Strict mode, comprehensive interfaces
- **Testing:** Write tests alongside implementation
- **Documentation:** Update docs for new features
- **Commits:** Conventional commits format
  - `feat:` New features
  - `fix:` Bug fixes
  - `docs:` Documentation updates
  - `refactor:` Code refactoring
  - `test:` Test updates

### Architecture Decisions

- Document major architectural decisions
- Update relevant PRDs and functional specs
- Maintain backward compatibility when possible

---

## 📖 Resources

### Internal Documentation
- [Product Requirements Documents](./docs/prds/) - What to build and why
- [Functional Specifications](./docs/functional-specs/) - How to build it
- [API Documentation](./API_PHASE_2_DOCUMENTATION.md) - Complete API reference
- [Migration Guide](./MIGRATION_ORDER.md) - Database migration order

### External Resources
- [Encore.ts Documentation](https://encore.dev/docs/ts) - Backend framework
- [React Documentation](https://react.dev/) - Frontend framework
- [TanStack Query](https://tanstack.com/query/latest) - Server state management
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [Radix UI](https://www.radix-ui.com/) - UI primitives

### Support
- **Issues:** Create GitHub issue with relevant labels
- **Questions:** Check documentation first, then create discussion
- **Feature Requests:** Review PRDs, suggest in issues

---

## 📄 License

[Add your license here]

---

## 🙏 Acknowledgments

Built with focus on executive dysfunction support, drawing from research in ADHD productivity tools, habit formation science (Atomic Habits, Hooked), and mental health best practices.

**Key Influences:**
- Atomic Habits (James Clear) - Habit formation
- Getting Things Done (David Allen) - Task management
- Bullet Journal Method - Journaling structure
- Evidence-based mental health tracking

---

**Status:** Phase 2 in progress | [View Documentation](./docs/) | [Report Issue](https://github.com/your-repo/issues)
