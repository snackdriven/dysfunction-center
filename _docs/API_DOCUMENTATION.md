# 🎯 Executive Dysfunction Center API Documentation

**Version:** 0.1.0  
**Status:** ✅ Healthy  
**Description:** A productivity tracking application with task management, habit tracking, mood logging, and theme preferences

---

## 📋 Tasks Service

Manage your daily tasks with priorities, due dates, and completion tracking.

- `GET /tasks` - List all tasks with optional filtering
- `POST /tasks` - Create a new task
- `GET /tasks/:id` - Get a specific task
- `PUT /tasks/:id` - Update a task
- `DELETE /tasks/:id` - Delete a task

---

## 🎯 Habits Service

Track your habits with completion logging, streaks, and analytics.

- `GET /habits` - List all habits with analytics
- `POST /habits` - Create a new habit
- `GET /habits/:id` - Get a specific habit
- `PUT /habits/:id` - Update a habit
- `DELETE /habits/:id` - Delete a habit
- `POST /habits/:habit_id/completions` - Log habit completion
- `GET /habits/:habit_id/history` - Get habit completion history

---

## 😊 Mood Service

Log your daily mood with analytics and trend tracking.

- `GET /mood` - List mood entries
- `POST /mood` - Create a mood entry
- `GET /mood/:id` - Get a specific mood entry
- `PUT /mood/:id` - Update a mood entry
- `DELETE /mood/:id` - Delete a mood entry
- `GET /mood/analytics` - Get mood analytics

---

## ⚙️ Preferences Service

Manage user preferences and theme settings.

- `GET /preferences/:key` - Get a user preference
- `POST /preferences` - Set a user preference
- `DELETE /preferences/:key` - Delete a user preference
- `GET /theme` - Get theme preferences
- `POST /theme` - Set theme preferences
- `GET /theme/system` - Get system theme info

---

## 🔍 Additional Endpoints

- `GET /` - API information and documentation (this endpoint)
- `GET /health` - Health check endpoint

---

## 🚀 Quick Start Examples

### Create a Task
```bash
curl -X POST http://localhost:4000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "My Task", "priority": "high", "due_date": "2025-06-25"}'
```

### Create a Habit
```bash
curl -X POST http://localhost:4000/habits \
  -H "Content-Type: application/json" \
  -d '{"name": "Daily Exercise", "category": "health", "target_frequency": 1}'
```

### Log Mood Entry
```bash
curl -X POST http://localhost:4000/mood \
  -H "Content-Type: application/json" \
  -d '{"mood_score": 4, "mood_category": "happy", "entry_date": "2025-06-23"}'
```

### Set Theme Preference
```bash
curl -X POST http://localhost:4000/preferences \
  -H "Content-Type: application/json" \
  -d '{"key": "theme", "value": "dark", "user_id": "user123"}'
```

---

**Built with Encore.ts** | **Database: PostgreSQL** | **Runtime: Node.js**
