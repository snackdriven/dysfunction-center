# Executive Dysfunction Center

A fullstack productivity and mental health platform for managing tasks, habits, mood, journaling, and calendar events, built with a focus on context, persistence, and analytics.

## Overview

Executive Dysfunction Center helps users track and improve productivity, habits, journaling, and well-being. It features a minimal UI, data visualization, and integration between productivity domains.

## Technology Stack

- **Frontend:** React 19 (TypeScript), Zustand, TanStack Query, Tailwind CSS, Radix UI, Recharts, D3.js, FullCalendar, date-fns, Lucide React, Framer Motion
- **Backend/API:** Encore (TypeScript), modular microservices (tasks, habits, mood, journaling, calendar, preferences)
- **Testing:** Vitest, React Testing Library
- **State Persistence:** Encore SQL storage, persistent state and feature flags

## Project Structure

```
api/                # Encore API endpoints and core services
calendar/           # Calendar service, types, and migrations
habits/             # Habit tracking service, templates, and migrations
journal/            # Journaling service and migrations
mood/               # Mood tracking service and migrations
preferences/        # User preferences service and migrations
tasks/              # Task management service, categories, tags, and migrations
shared/             # Shared types and utilities
frontend/
  ├── src/
  │   ├── components/
  │   │   ├── layout/         # AppShell, Header, Sidebar, MobileNavigation, etc.
  │   │   ├── ui/             # Design system components (Button, Card, etc.)
  │   │   ├── [features]/     # Feature-specific components (tasks, habits, mood, journaling, etc.)
  │   ├── hooks/              # Custom React hooks
  │   ├── stores/             # Zustand state stores
  │   ├── services/           # API and data services
  │   ├── pages/              # Route-level pages
  │   ├── utils/              # Utility functions
  │   ├── styles/             # Global and theme styles
  │   ├── types/              # TypeScript type definitions
  │   └── App.tsx, index.tsx  # App entry points
  ├── public/                 # Static assets
  ├── package.json            # Frontend dependencies and scripts
  └── ...
_docs/              # Internal documentation and API notes
```

## UI/UX Design

- **Minimal interfaces** with contextual interactions
- **Data visualization** (Recharts, D3.js)
- **Layouts**: Desktop sidebar, mobile tab bar, adaptive grids
- **Micro-interactions**: Animations for task completion, habit streaks, mood selection, journaling
- **Accessibility and performance**: Virtual scrolling, code splitting, keyboard navigation

See [`MODERN_UI_DESIGN.md`](./MODERN_UI_DESIGN.md) for detailed UI/UX specs, color palette, and layout diagrams.

## State Management & Persistence

- **Global state** via Zustand, feature-specific stores
- **Persistent storage** using Encore's SQLDatabase for app state, feature flags, and progress tracking
- **Optimistic updates** and caching with TanStack Query

## Development Workflow

1. Create a feature branch
2. Document requirements and acceptance criteria
3. Implement database migrations first (if needed)
4. Add TypeScript interfaces and types
5. Implement backend endpoints
6. Create frontend components
7. Add tests (unit and integration)
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
- Encore Dev Dashboard: [http://localhost:9400/`](http://localhost:9400/)

### Run the Frontend

From `frontend/`:

```bash
npm install
npm start
```

- Frontend runs at `http://localhost:3000/`

## Documentation

- [`MODERN_UI_DESIGN.md`](./MODERN_UI_DESIGN.md): UI/UX, design system, and layout
- [`PROMPT_GUIDE.md`](./PROMPT_GUIDE.md): Persistence, state, and workflow
- [`_docs/`](./_docs/): API and implementation notes

## Data Portability

- See `DATA_PORTABILITY.md` for full details on data model, import/export, and backup.
- To backup your data, simply copy the `northstar-data/` directory to a safe location (external drive, cloud storage, etc.).
- To restore, copy your backup files back into the `northstar-data/` directory.

## Contributing

- Follow the documented workflow for new features
- Document all architectural decisions and environment variables
- Keep a changelog of implemented features

---

For more, see the [Encore docs](https://encore.dev/docs/ts/primitives/services) and internal documentation in `_docs/`.
