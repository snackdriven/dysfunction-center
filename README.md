# Executive Dysfunction Center

A modern, fullstack productivity and mental health platform for managing tasks, habits, mood, and calendar events, built with a focus on context, persistence, and advanced analytics.

## Overview

The Executive Dysfunction Center is designed to help users track and improve productivity, habits, and well-being. It features a modern, minimal UI, advanced data visualization, and seamless integration between productivity domains.

## Technology Stack

- **Frontend:** React 18 (TypeScript), Zustand, React Query (TanStack Query), Tailwind CSS, Radix UI, Recharts, D3.js, FullCalendar, date-fns, Lucide React, Framer Motion
- **Backend/API:** Encore (TypeScript), modular microservices (tasks, habits, mood, calendar, preferences)
- **Testing:** Vitest, React Testing Library
- **State Persistence:** Encore SQL storage, persistent state and feature flags

## Project Structure

```
api/                # Core API endpoints and Encore services
calendar/           # Calendar service, types, and migrations
habits/             # Habit tracking service, templates, and migrations
mood/               # Mood tracking service and migrations
preferences/        # User preferences service and migrations
tasks/              # Task management service, categories, tags, and migrations
shared/             # Shared types and utilities
frontend/           # React app (components, hooks, services, stores, etc.)
_docs/              # Internal documentation
```

## Modern UI/UX Design

- **Minimal, progressive interfaces** with contextual interactions
- **Sophisticated data visualization** (Recharts, D3.js)
- **Responsive layouts**: Desktop sidebar, mobile tab bar, adaptive grids
- **Micro-interactions**: Animations for task completion, habit streaks, mood selection
- **Accessibility and performance**: Virtual scrolling, code splitting, keyboard navigation

See [`MODERN_UI_DESIGN.md`](./MODERN_UI_DESIGN.md) for detailed UI/UX specs, color palette, and layout diagrams.

## State Management & Persistence

- **Global state** via Zustand, feature-specific stores
- **Persistent storage** using Encore's SQLDatabase for app state, feature flags, and progress tracking
- **Optimistic updates** and caching with React Query

## Development Workflow

1. Create a feature branch
2. Document requirements and acceptance criteria
3. Implement database migrations first
4. Add TypeScript interfaces and types
5. Implement backend endpoints
6. Create frontend components
7. Add tests
8. Document the implementation

See [`PROMPT_GUIDE.md`](./PROMPT_GUIDE.md) for architectural and persistence guidelines.

## Getting Started

### Prerequisites

- **Install Encore:**
  - **Windows:** `iwr https://encore.dev/install.ps1 | iex`
  - **macOS:** `brew install encoredev/tap/encore`
  - **Linux:** `curl -L https://encore.dev/install.sh | bash`

### Run the Backend

From the project root:

```bash
encore run
```

- API runs at `http://localhost:4000/`
- Encore Dev Dashboard: [http://localhost:9400/](http://localhost:9400/)

### Run the Frontend

From `frontend/`:

```bash
npm install
npm start
```

- Frontend runs at `http://localhost:3000/`

### Using the API

Test the API with:

```bash
curl http://localhost:4000/hello/World
```

## Documentation

- [`MODERN_UI_DESIGN.md`](./MODERN_UI_DESIGN.md): UI/UX, design system, and layout
- [`PROMPT_GUIDE.md`](./PROMPT_GUIDE.md): Persistence, state, and workflow
- [`_docs/`](./_docs/): API and implementation notes

## Contributing

- Follow the documented workflow for new features
- Document all architectural decisions and environment variables
- Keep a changelog of implemented features

---

For more, see the [Encore docs](https://encore.dev/docs/ts/primitives/services) and internal documentation in `_docs/`.
