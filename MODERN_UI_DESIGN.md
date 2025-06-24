# Executive Dysfunction Center Modern UI/UX Design

> **Note:** The frontend is built with React 19 and TypeScript, bootstrapped with Create React App and heavily customized. It integrates with a modular Encore (TypeScript) backend, where each domain (tasks, habits, mood, calendar) is a separate service.

## 🎨 Design Philosophy

**Modern Minimalism with Purposeful Complexity**
- Clean, uncluttered interfaces that reveal functionality progressively
- Sophisticated data visualization without overwhelming the user
- Contextual interactions that adapt to user behavior patterns
- Seamless integration between productivity tracking domains

## 🏗️ Frontend Architecture

### Technology Stack
```
Frontend Framework: React 19 with TypeScript (Create React App, customized)
State Management: Zustand + TanStack Query
Styling: Tailwind CSS + Radix UI primitives
Charts: Recharts + D3.js for advanced visualizations  
Calendar: FullCalendar with custom React wrapper
Time Management: date-fns for date manipulation
Icons: Lucide React + custom icon system
Animations: Framer Motion
Testing: Vitest + React Testing Library
```

### Component Architecture
```
src/
├── components/
│   ├── ui/              # Base UI components (buttons, inputs, etc.)
│   ├── layout/          # Layout components (sidebar, header, etc.)
│   ├── features/        # Feature-specific components
│   │   ├── tasks/       # Task management components
│   │   ├── habits/      # Habit tracking components
│   │   ├── mood/        # Mood logging components
│   │   └── calendar/    # Calendar components
│   └── shared/          # Shared components across features
├── hooks/               # Custom React hooks
├── services/            # API service layer
├── stores/              # Zustand stores
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── styles/              # Global styles and themes
```

## 🎯 Core Design System

### Color Palette
```css
/* Light Theme */
--primary: #6366f1    /* Indigo - primary actions */
--secondary: #8b5cf6  /* Violet - secondary actions */
--success: #10b981    /* Emerald - completions, positive */
--warning: #f59e0b    /* Amber - alerts, pending */
--error: #ef4444      /* Red - errors, destructive */
--info: #3b82f6       /* Blue - information, neutral */

/* Semantic Colors */
--task-high: #ef4444       /* High priority tasks */
--task-medium: #f59e0b     /* Medium priority tasks */
--task-low: #6b7280       /* Low priority tasks */
--habit-streak: #10b981    /* Habit streaks */
--mood-positive: #10b981   /* Positive moods */
--mood-negative: #ef4444   /* Negative moods */
--calendar-event: #6366f1  /* Calendar events */

/* Neutral Palette */
--gray-50: #f9fafb
--gray-100: #f3f4f6
--gray-200: #e5e7eb
--gray-300: #d1d5db
--gray-400: #9ca3af
--gray-500: #6b7280
--gray-600: #4b5563
--gray-700: #374151
--gray-800: #1f2937
--gray-900: #111827

/* Dark Theme */
--bg-primary: #0f172a      /* Slate 900 */
--bg-secondary: #1e293b    /* Slate 800 */
--bg-tertiary: #334155     /* Slate 700 */
--text-primary: #f1f5f9    /* Slate 100 */
--text-secondary: #cbd5e1  /* Slate 300 */
--text-muted: #64748b      /* Slate 500 */
```

### Typography Scale
```css
/* Font Stack */
--font-sans: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', Consolas, monospace;

/* Type Scale */
--text-xs: 0.75rem    /* 12px */
--text-sm: 0.875rem   /* 14px */
--text-base: 1rem     /* 16px */
--text-lg: 1.125rem   /* 18px */
--text-xl: 1.25rem    /* 20px */
--text-2xl: 1.5rem    /* 24px */
--text-3xl: 1.875rem  /* 30px */
--text-4xl: 2.25rem   /* 36px */
```

### Spacing & Layout
```css
/* Spacing Scale */
--space-1: 0.25rem    /* 4px */
--space-2: 0.5rem     /* 8px */
--space-3: 0.75rem    /* 12px */
--space-4: 1rem       /* 16px */
--space-5: 1.25rem    /* 20px */
--space-6: 1.5rem     /* 24px */
--space-8: 2rem       /* 32px */
--space-10: 2.5rem    /* 40px */
--space-12: 3rem      /* 48px */
--space-16: 4rem      /* 64px */

/* Border Radius */
--radius-sm: 0.25rem  /* 4px */
--radius-md: 0.375rem /* 6px */
--radius-lg: 0.5rem   /* 8px */
--radius-xl: 0.75rem  /* 12px */
--radius-2xl: 1rem    /* 16px */
```

## 📱 Layout & Navigation

### App Shell Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Header: Logo, Global Search, Theme Toggle, User Menu       │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────────────────────────────────┐ │
│ │             │ │                                         │ │
│ │   Sidebar   │ │           Main Content Area             │ │
│ │             │ │                                         │ │
│ │ • Dashboard │ │  ┌─────────────────────────────────────┐ │ │
│ │ • Tasks     │ │  │                                     │ │ │
│ │ • Habits    │ │  │        Feature Content              │ │ │
│ │ • Mood      │ │  │                                     │ │ │
│ │ • Calendar  │ │  │                                     │ │ │
│ │ • Analytics │ │  └─────────────────────────────────────┘ │ │
│ │ • Settings  │ │                                         │ │
│ │             │ │                                         │ │
│ └─────────────┘ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Responsive Navigation
- **Desktop**: Persistent sidebar with icons and labels
- **Tablet**: Collapsible sidebar with icon-only mode
- **Mobile**: Bottom tab bar with key sections, slide-out menu for additional options

### Sidebar Navigation Structure
```
📊 Dashboard
  ↳ Today's Overview
  ↳ Weekly Summary
  ↳ Quick Actions

✅ Tasks
  ↳ All Tasks
  ↳ Categories
  ↳ Time Tracking
  ↳ Bulk Actions

🎯 Habits
  ↳ Active Habits
  ↳ Templates
  ↳ Analytics
  ↳ Reminders

😊 Mood
  ↳ Today's Mood
  ↳ Mood History
  ↳ Patterns
  ↳ Triggers

📅 Calendar
  ↳ Month View
  ↳ Week View
  ↳ Day View
  ↳ Agenda

📈 Analytics
  ↳ Productivity
  ↳ Habit Insights
  ↳ Mood Patterns
  ↳ Time Analysis

⚙️ Settings
  ↳ Preferences
  ↳ Themes
  ↳ Notifications
  ↳ Account
```

## 🏠 Dashboard Design

### Primary Dashboard Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Good morning, [Name]! 🌅                 [Date] [Weather]  │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│ │   Today's Focus │ │  Habit Tracker  │ │  Mood Check-in  │ │
│ │                 │ │                 │ │                 │ │
│ │ • 3 tasks due   │ │ ⚡ 4/7 complete │ │ How are you     │ │
│ │ • 2 overdue     │ │ 🔥 12 day streak│ │ feeling today?  │ │
│ │ • 1 in progress │ │ 💪 Exercise ✓   │ │                 │ │
│ │                 │ │ 📖 Reading ✓    │ │ [Mood Selector] │ │
│ │ [View All]      │ │ 🧘 Meditation ✗ │ │ [Quick Log]     │ │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │              Weekly Progress Overview                   │ │
│ │                                                         │ │
│ │ Tasks: ████████░░ 80% complete                         │ │
│ │ Habits: ██████░░░░ 60% consistency                     │ │
│ │ Mood: 📈 Trending positive                             │ │
│ │                                                         │ │
│ │ [View Detailed Analytics]                               │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                   Upcoming Events                       │ │
│ │                                                         │ │
│ │ 📅 Team Meeting - 2:00 PM                             │ │
│ │ ✅ Project Deadline - Tomorrow                         │ │
│ │ 🎯 Weekly Review - Friday                              │ │
│ │                                                         │ │
│ │ [View Calendar]                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Dashboard Features
- **Contextual Greeting**: Time-based greetings with weather integration
- **Smart Prioritization**: AI-suggested focus areas based on patterns
- **Quick Actions**: One-click task creation, habit logging, mood entry
- **Progress Visualization**: Subtle progress indicators with meaningful metrics
- **Adaptive Content**: Dashboard adapts based on user activity patterns

## ✅ Task Management Interface

### Task List View
```
┌─────────────────────────────────────────────────────────────┐
│ Tasks                                        [+ New Task]   │
├─────────────────────────────────────────────────────────────┤
│ [🔍 Search] [📁 Categories] [🏷️ Tags] [📊 View] [⚙️ Bulk]  │
├─────────────────────────────────────────────────────────────┤
│ Today • 3 tasks                                             │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ◯ High │ Complete project proposal      │ 📁 Work │ ⏱️ │ │
│ │        │ Due: Today 5:00 PM            │ 2h est  │ ▶️ │ │
│ │        │ 🏷️ urgent 🏷️ client           │         │    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ◯ Med  │ Review quarterly metrics      │ 📁 Work │ ⏱️ │ │
│ │        │ Due: Tomorrow                 │ 1h est  │ ▶️ │ │
│ │        │ 🏷️ analysis                   │         │    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ✅ Completed • 2 tasks                                      │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ✓ Low  │ Update project documentation  │ 📁 Dev  │ 1h  │ │
│ │        │ Completed: 2 hours ago        │         │ ✓   │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Advanced Task Features
- **Smart Filtering**: Saved filters, natural language queries
- **Time Tracking**: Integrated pomodoro timer with productivity insights
- **Bulk Operations**: Multi-select with batch actions (categorize, schedule, complete)
- **Quick Add**: Keyboard shortcuts and smart parsing of natural language
- **Subtask Management**: Expandable subtask trees with progress indicators
- **Recurrence Patterns**: Visual recurrence builder with preview

### Task Detail Panel
```
┌─────────────────────────────────────────────┐
│ Complete project proposal              [×]  │
├─────────────────────────────────────────────┤
│ Priority: ● High                            │
│ Category: 📁 Work                           │
│ Due: Today, 5:00 PM                        │
│ Tags: 🏷️ urgent 🏷️ client                 │
│                                             │
│ Description:                                │
│ ┌─────────────────────────────────────────┐ │
│ │ Need to finalize the Q4 proposal for   │ │
│ │ the Anderson client. Include budget    │ │
│ │ breakdown and timeline.                │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Time Tracking:                              │
│ Estimated: 2 hours                          │
│ Actual: 1h 23m                             │
│ [⏱️ Start Timer] [📊 View History]          │
│                                             │
│ Subtasks: (2/3 complete)                   │
│ ✓ Research client requirements              │
│ ✓ Create budget breakdown                   │
│ ◯ Write executive summary                   │
│                                             │
│ [💾 Save] [🗑️ Delete] [📅 Reschedule]      │
└─────────────────────────────────────────────┘
```

## 🎯 Habit Tracking Interface

### Habit Overview Grid
```
┌─────────────────────────────────────────────────────────────┐
│ Habits                                      [+ Add Habit]   │
├─────────────────────────────────────────────────────────────┤
│ [📚 Templates] [📊 Analytics] [⏰ Reminders] [⚙️ Settings] │
├─────────────────────────────────────────────────────────────┤
│ Today's Habits • 7 active                                  │
│                                                             │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│ │ 💪 Exercise     │ │ 📖 Reading      │ │ 🧘 Meditation   │ │
│ │                 │ │                 │ │                 │ │
│ │ Target: 30 min  │ │ Target: 20 min  │ │ Target: 10 min  │ │
│ │ Status: ✅ Done │ │ Status: ⏳ 12/20│ │ Status: ❌ Skip │ │
│ │ Streak: 🔥 12   │ │ Streak: 🔥 8    │ │ Streak: 🔥 0    │ │
│ │                 │ │                 │ │                 │ │
│ │ [✓] [Edit]      │ │ [▶️] [Edit]      │ │ [▶️] [Edit]      │ │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘ │
│                                                             │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│ │ 💧 Water        │ │ 🛌 Sleep        │ │ 📱 Screen Time  │ │
│ │                 │ │                 │ │                 │ │
│ │ Target: 8 cups  │ │ Target: 8 hours │ │ Target: < 3h    │ │
│ │ Status: 🟡 6/8  │ │ Status: ✅ 8h   │ │ Status: 🔴 4.5h │ │
│ │ Streak: 🔥 3    │ │ Streak: 🔥 15   │ │ Streak: 🔥 0    │ │
│ │                 │ │                 │ │                 │ │
│ │ [+] [Edit]      │ │ [✓] [Edit]      │ │ [📊] [Edit]     │ │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Habit Templates Library
```
┌─────────────────────────────────────────────────────────────┐
│ Habit Templates                                  [← Back]   │
├─────────────────────────────────────────────────────────────┤
│ [🏃 Health] [🧠 Productivity] [🎨 Personal] [🤝 Social]     │
├─────────────────────────────────────────────────────────────┤
│ Health & Fitness                                            │
│                                                             │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│ │ 🏃‍♂️ Morning Run   │ │ 💪 Strength     │ │ 🧘‍♀️ Meditation   │ │
│ │                 │ │ Training        │ │                 │ │
│ │ • 30 min daily  │ │ • 3x per week   │ │ • 10 min daily  │ │
│ │ • Track distance│ │ • Track reps    │ │ • Track minutes │ │
│ │ • 🔥 Popular    │ │ • 💪 Challenging│ │ • 🧘 Mindful    │ │
│ │                 │ │                 │ │                 │ │
│ │ [Use Template]  │ │ [Use Template]  │ │ [Use Template]  │ │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘ │
│                                                             │
│ Productivity                                                │
│                                                             │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│ │ 📚 Daily        │ │ 🌅 Early        │ │ 📝 Journaling   │ │
│ │ Learning        │ │ Morning         │ │                 │ │
│ │                 │ │                 │ │ • 5 min daily   │ │
│ │ • 20 min daily  │ │ • Wake at 6 AM  │ │ • Gratitude     │ │
│ │ • Track pages   │ │ • Track success │ │ • Track entries │ │
│ │ • 🧠 Growth     │ │ • ⏰ Consistent │ │ • 💭 Reflective │ │
│ │                 │ │                 │ │                 │ │
│ │ [Use Template]  │ │ [Use Template]  │ │ [Use Template]  │ │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Habit Analytics Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│ Habit Analytics                                 [Export]    │
├─────────────────────────────────────────────────────────────┤
│ Time Period: [Last 30 Days ▼] [Custom Range]              │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                 Overall Performance                     │ │
│ │                                                         │ │
│ │ Consistency Score: 78% 📈 (+5% from last month)       │ │
│ │ Active Habits: 7                                       │ │
│ │ Total Completions: 156                                 │ │
│ │ Perfect Days: 12                                       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │              Habit Performance Breakdown                │ │
│ │                                                         │ │
│ │ 💪 Exercise    ████████████████████░ 95% (🔥 28 days) │ │
│ │ 🛌 Sleep       ████████████████░░░░ 80% (🔥 12 days)  │ │
│ │ 📖 Reading     ████████████░░░░░░░░ 65% (🔥 5 days)   │ │
│ │ 🧘 Meditation  ████████░░░░░░░░░░░░ 45% (🔥 3 days)   │ │
│ │ 💧 Water       ████████████████████ 98% (🔥 25 days)  │ │
│ │                                                         │ │
│ │ [View Details] [Set Goals] [Adjust Reminders]          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                    Streak Calendar                      │ │
│ │                                                         │ │
│ │    S  M  T  W  T  F  S                                 │ │
│ │ 1  🔥 🔥 ⚪ 🔥 🔥 🔥 🔥                                 │ │
│ │ 8  🔥 🔥 🔥 ⚪ 🔥 🔥 ⚪                                 │ │
│ │15  🔥 🔥 🔥 🔥 🔥 ⚪ 🔥                                 │ │
│ │22  🔥 ⚪ 🔥 🔥 🔥 🔥 🔥                                 │ │
│ │                                                         │ │
│ │ 🔥 Perfect Day  ⚪ Missed Day  📅 Today                │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 😊 Mood Tracking Interface

### Quick Mood Entry
```
┌─────────────────────────────────────────────────────────────┐
│ How are you feeling today? 😊                              │
├─────────────────────────────────────────────────────────────┤
│ Primary Mood                                                │
│ 😢 😔 😐 🙂 😊                                              │
│ └─────●─────────────────────────────────────────────────┘   │
│ Feeling Good (4/5)                                          │
│                                                             │
│ Secondary Mood (Optional)                                   │
│ 😰 😴 😤 😎 🤗                                              │
│ └─────────────●─────────────────────────────────────────┘   │
│ Relaxed (3/5)                                               │
│                                                             │
│ Energy Level                                                │
│ Low ●────────────────────────────────────────────── High   │
│     1   2   3   4   5   6   7   8   9   10                │
│                      ●                                      │
│ Moderate Energy (6/10)                                      │
│                                                             │
│ Stress Level                                                │
│ Low ────────────────●────────────────────────────── High   │
│     1   2   3   4   5   6   7   8   9   10                │
│                        ●                                    │
│ Low Stress (4/10)                                           │
│                                                             │
│ What triggered this mood? (Optional)                        │
│ 🏢 Work  👥 Social  💪 Health  🏠 Personal  ☀️ Weather     │
│         ●                                                   │
│                                                             │
│ Location: [📍 Auto-detect] [🏠 Home] [🏢 Office] [📍 Other] │
│                                                             │
│ Notes (Optional):                                           │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Had a productive morning, feeling optimistic about      │ │
│ │ the new project launch...                               │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [💾 Save Entry] [📊 View Patterns] [⚙️ Settings]           │
└─────────────────────────────────────────────────────────────┘
```

### Mood Pattern Analysis
```
┌─────────────────────────────────────────────────────────────┐
│ Mood Patterns & Insights                        [Export]    │
├─────────────────────────────────────────────────────────────┤
│ [📅 7 Days] [📅 30 Days] [📅 90 Days] [📅 Custom]         │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                   Mood Trends (30 Days)                │ │
│ │                                                         │ │
│ │ Overall Mood: 📈 Trending Positive (+0.5 avg)         │ │
│ │ Energy Level: 📈 Increasing (+1.2 avg)                │ │
│ │ Stress Level: 📉 Decreasing (-0.8 avg)                │ │
│ │                                                         │ │
│ │        5 ┌─────────────────────────────────────────┐   │ │
│ │        4 │     ●─●─●   ●─●─●─●─●                   │   │ │
│ │        3 │   ●─●     ●─●         ●─●─●             │   │ │
│ │        2 │ ●─●                         ●─●─●       │   │ │
│ │        1 │                                     ●─● │   │ │
│ │        0 └─────────────────────────────────────────┘   │ │
│ │          Week 1   Week 2   Week 3   Week 4            │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                   Pattern Insights                      │ │
│ │                                                         │ │
│ │ 🌅 Best Times: Mornings (8-10 AM) - Avg 4.2/5        │ │
│ │ 🌆 Challenging Times: Evenings (6-8 PM) - Avg 2.8/5  │ │
│ │                                                         │ │
│ │ 📊 Mood Triggers:                                      │ │
│ │ • 🏢 Work: 45% negative correlation                    │ │
│ │ • ☀️ Weather: 78% positive correlation                 │ │
│ │ • 💪 Exercise: 85% positive correlation                │ │
│ │ • 👥 Social: 62% positive correlation                  │ │
│ │                                                         │ │
│ │ 💡 Recommendations:                                     │ │
│ │ • Schedule important tasks in the morning             │ │
│ │ • Consider evening relaxation routine                 │ │
│ │ • Continue regular exercise habits                    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                 Weekly Mood Calendar                    │ │
│ │                                                         │ │
│ │    M    T    W    T    F    S    S                     │ │
│ │ 1  😊   😐   🙂   😊   😔   😊   🙂                     │ │
│ │ 8  🙂   😊   😊   😐   🙂   😊   😊                     │ │
│ │15  😊   🙂   😊   😊   😐   🙂   😊                     │ │
│ │22  😊   😊   🙂   😊   😊   😐   😊                     │ │
│ │                                                         │ │
│ │ Average: 😊 4.1/5  Best: 😊 Mondays  Worst: 😐 Fridays │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 📅 Calendar Integration

### Calendar Main View
```
┌─────────────────────────────────────────────────────────────┐
│ Calendar                                    [+ Add Event]   │
├─────────────────────────────────────────────────────────────┤
│ [📅 Month] [📅 Week] [📅 Day] [📋 Agenda]    June 2024 ◀▶  │
├─────────────────────────────────────────────────────────────┤
│ │ Sun │ Mon │ Tue │ Wed │ Thu │ Fri │ Sat │                 │
│ ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤                 │
│ │  2  │  3  │  4  │  5  │  6  │  7  │  8  │                 │
│ │     │     │     │     │     │     │     │                 │
│ ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤                 │
│ │  9  │ 10  │ 11  │ 12  │ 13  │ 14  │ 15  │                 │
│ │     │ 📅  │     │ 📅  │ ⚠️  │     │     │                 │
│ │     │ 2pm │     │ 9am │Task │     │     │                 │
│ │     │Team │     │Doc  │Due  │     │     │                 │
│ ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤                 │
│ │ 16  │ 17  │ 18  │ 19  │ 20  │ 21  │ 22  │                 │
│ │     │ 📅  │     │     │ 📅  │     │     │                 │
│ │     │1pm  │     │     │All  │     │     │                 │
│ │     │Meet │     │     │Day  │     │     │                 │
│ ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤                 │
│ │ 23  │ 24  │ 25  │ 26  │ 27  │ 28  │ 29  │                 │
│ │     │●    │     │     │     │     │     │                 │
│ │     │Today│     │     │     │     │     │                 │
│ └─────┴─────┴─────┴─────┴─────┴─────┴─────┘                 │
├─────────────────────────────────────────────────────────────┤
│ Legend: 📅 Events  ⚠️ Task Deadlines  🎯 Habits  📊 Mood   │
└─────────────────────────────────────────────────────────────┘
```

### Calendar Week View with Task Integration
```
┌─────────────────────────────────────────────────────────────┐
│ Week of June 24-30, 2024                   [+ Add Event]   │
├─────────────────────────────────────────────────────────────┤
│ Time │ Mon │ Tue │ Wed │ Thu │ Fri │ Sat │ Sun │             │
│ ─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┤             │
│ 8 AM │     │     │     │     │     │     │     │             │
│ ─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┤             │
│ 9 AM │     │ 📅  │     │     │     │     │     │             │
│      │     │Team │     │     │     │     │     │             │
│ ─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┤             │
│10 AM │     │Standup│   │     │     │     │     │             │
│      │     │ 30m │     │     │     │     │     │             │
│ ─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┤             │
│11 AM │     │     │     │     │     │     │     │             │
│ ─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┤             │
│12 PM │     │     │     │     │     │     │     │             │
│ ─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┤             │
│ 1 PM │     │     │     │ 📅  │     │     │     │             │
│      │     │     │     │Client│    │     │     │             │
│ ─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┤             │
│ 2 PM │     │     │     │Review│    │     │     │             │
│      │     │     │     │ 1h  │     │     │     │             │
│ ─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┤             │
│ 3 PM │     │     │     │     │     │     │     │             │
│ ─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┤             │
│ 4 PM │     │     │     │     │ ⚠️  │     │     │             │
│      │     │     │     │     │Task │     │     │             │
│ ─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┤             │
│ 5 PM │     │     │     │     │Due  │     │     │             │
│      │     │     │     │     │     │     │     │             │
│ ─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┤             │
│                                                             │
│ Task Deadlines This Week:                                   │
│ • Friday 4PM: Complete project proposal (High Priority)    │
│ • Wednesday: Review quarterly metrics (Medium Priority)    │
│                                                             │
│ Recurring Events:                                           │
│ • Daily 9AM: Team Standup (Mon-Fri)                       │
│ • Tuesday 2PM: One-on-One with Manager (Weekly)           │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Analytics & Insights

### Productivity Analytics Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│ Productivity Analytics                          [Export]    │
├─────────────────────────────────────────────────────────────┤
│ Time Period: [Last 30 Days ▼] [Compare to Previous Period] │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                    Key Metrics                          │ │
│ │                                                         │ │
│ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────┐ │ │
│ │ │ Tasks Done  │ │ Time Logged │ │ Habit Score │ │Mood │ │ │
│ │ │     47      │ │   156h 23m  │ │    78%      │ │4.2/5│ │ │
│ │ │ ↗️ +12% │ │ │ ↗️ +8%   │ │ │ ↗️ +5%   │ │ │📈  │ │ │
│ │ └─────────────┘ └─────────────┘ └─────────────┘ └─────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │              Weekly Performance Trends                   │ │
│ │                                                         │ │
│ │ Tasks │ ████████████████████████████████ 32 completed  │ │
│ │       │ ████████████████████████████████ 8 per day avg │ │
│ │                                                         │ │
│ │ Time  │ ████████████████████████████████ 40h logged    │ │
│ │       │ ████████████████████████████████ 8h per day avg│ │
│ │                                                         │ │
│ │ Habits│ ████████████████████████████████ 85% consistency│ │
│ │       │ ████████████████████████████████ 6.8/7 avg     │ │
│ │                                                         │ │
│ │ Mood  │ ████████████████████████████████ 4.3/5 avg     │ │
│ │       │ ████████████████████████████████ Mostly positive│ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                    AI Insights                          │ │
│ │                                                         │ │
│ │ 🎯 Your most productive days are Tuesdays and          │ │
│ │    Wednesdays, averaging 6.2 tasks completed           │ │
│ │                                                         │ │
│ │ ⏰ Peak productivity hours: 9-11 AM (87% task          │ │
│ │    completion rate)                                     │ │
│ │                                                         │ │
│ │ 🔄 Tasks tagged with "urgent" take 23% longer than     │ │
│ │    estimated - consider improving time estimates        │ │
│ │                                                         │ │
│ │ 📈 Habit consistency has improved 15% this month.      │ │
│ │    Your morning routine is your strongest driver.      │ │
│ │                                                         │ │
│ │ 😊 Mood correlates strongly with exercise completion   │ │
│ │    (r=0.78). Keep prioritizing physical activity!      │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🎨 Interactive Elements & Animations

### Micro-Interactions
- **Task Completion**: Satisfying checkmark animation with subtle confetti
- **Habit Streaks**: Fire emoji grows and pulses with streak length
- **Mood Selection**: Smooth emoji transitions with haptic feedback (mobile)
- **Time Tracking**: Pulsing timer indicator with smooth start/stop transitions
- **Progress Bars**: Animated fills with easing functions
- **Calendar Navigation**: Smooth slide transitions between months/weeks

### Loading States
- **Skeleton Screens**: Context-aware loading placeholders
- **Progressive Loading**: Load critical content first, enhance progressively
- **Smart Preloading**: Preload likely next actions based on user patterns

### Responsive Behavior
- **Mobile-First**: Touch-friendly interfaces with appropriate sizing
- **Adaptive Layouts**: Grid systems that collapse intelligently
- **Gesture Support**: Swipe to complete tasks, pinch to zoom calendar
- **Keyboard Navigation**: Full keyboard accessibility for power users

## 🔧 Technical Implementation Notes

### State Management Strategy
```typescript
// Global State (Zustand)
interface AppState {
  user: UserState;
  tasks: TaskState;
  habits: HabitState;
  mood: MoodState;
  calendar: CalendarState;
  preferences: PreferencesState;
  ui: UIState;
}

// Feature-specific stores
interface TaskState {
  tasks: Task[];
  categories: TaskCategory[];
  tags: TaskTag[];
  activeTimer: TimeEntry | null;
  filters: TaskFilters;
  selectedTasks: string[];
}
```

### API Integration
```typescript
// React Query with optimistic updates
const useCompleteTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (taskId: string) => tasksApi.complete(taskId),
    onMutate: async (taskId) => {
      // Optimistic update
      await queryClient.cancelQueries(['tasks']);
      const previous = queryClient.getQueryData(['tasks']);
      queryClient.setQueryData(['tasks'], (old: Task[]) =>
        old.map(task => 
          task.id === taskId 
            ? { ...task, completed: true, completed_at: new Date() }
            : task
        )
      );
      return { previous };
    },
    onError: (err, taskId, context) => {
      // Rollback on error
      queryClient.setQueryData(['tasks'], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['tasks']);
    }
  });
};
```

### Performance Optimizations
- **Virtual Scrolling**: For large task lists and habit histories
- **Memoization**: React.memo and useMemo for expensive calculations
- **Code Splitting**: Route-based and feature-based splitting
- **Image Optimization**: Lazy loading with intersection observer
- **Caching Strategy**: Aggressive caching with smart invalidation

## 🚀 Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Set up project structure and build system
- [ ] Implement design system and base components
- [ ] Create layout shell and navigation
- [ ] Set up state management and API layer

### Phase 2: Core Features (Week 3-4)
- [ ] Task management interface with basic CRUD
- [ ] Habit tracking with streak visualization
- [ ] Mood logging with quick entry
- [ ] Basic calendar integration

### Phase 3: Advanced Features (Week 5-6)
- [ ] Advanced task features (categories, tags, time tracking)
- [ ] Habit templates and analytics
- [ ] Detailed mood tracking and patterns
- [ ] Full calendar functionality

### Phase 4: Analytics & Polish (Week 7-8)
- [ ] Analytics dashboards and insights
- [ ] Performance optimizations
- [ ] Accessibility improvements
- [ ] Mobile responsiveness refinement

This modern UI/UX design leverages the comprehensive Phase 2 backend implementation to create a sophisticated, user-friendly productivity tracking application that scales from simple daily use to advanced analytics and insights.