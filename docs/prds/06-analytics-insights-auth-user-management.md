# PRD: Cross-Service Analytics, Insights, Authentication & User Management

**Version:** 1.0
**Status:** Draft
**Last Updated:** 2025-11-15
**Owner:** Product Team

---

## Executive Summary

This PRD covers three foundational cross-cutting concerns:

1. **Cross-Service Analytics & Insights** - Unified analytics combining data from all services (tasks, habits, mood, journal, calendar) to provide holistic productivity insights
2. **Authentication & User Management** - Proper user authentication, registration, and profile management (currently using 'default_user' placeholder)
3. **AI-Powered Insights Engine** - Centralized AI service for generating personalized recommendations across all features

---

# Part 1: Cross-Service Analytics & Insights

## Current State

### ✅ Individual Service Analytics
- **Tasks:** Mock analytics (frontend only)
- **Habits:** Client-side analytics
- **Mood:** Basic stats, missing correlations
- **Journal:** Comprehensive analytics
- **Calendar:** Types defined, not implemented

### ❌ Missing
- No cross-service correlation analysis
- No unified dashboard
- No AI-powered insights spanning multiple features
- No predictive analytics
- No goal tracking system
- Frontend has analytics route but shows "Coming Soon"

---

## Goals & Success Metrics

### Primary Goals
1. Create unified analytics service combining all data sources
2. Implement cross-service correlation analysis (e.g., task completion vs mood)
3. Build AI-powered insight generation spanning multiple features
4. Create comprehensive analytics dashboard
5. Implement predictive analytics (forecasting mood, productivity)

### Success Metrics
| Metric | Target |
|--------|--------|
| Insight Relevance | 80% user satisfaction |
| Correlation Accuracy | R² ≥ 0.7 for strong correlations |
| Prediction Accuracy | Within 15% of actual values |
| Dashboard Load Time | < 2 seconds for 1 year data |
| User Engagement | 60% of users visit analytics weekly |

---

## Detailed Requirements

### 1.1 Unified Analytics Service
**Priority:** P0
**Effort:** 10 days

**New Service:** `/analytics`

**Endpoint:**
```typescript
GET /analytics/overview?start_date=<date>&end_date=<date>
Response: {
  summary: {
    productivity_score: number        // 0-100, weighted composite
    wellness_score: number            // 0-100, based on mood, habits
    consistency_score: number         // 0-100, logging frequency
    trend: 'improving' | 'stable' | 'declining'
    trend_percentage: number
  }

  // Task metrics
  tasks: {
    total_completed: number
    completion_rate: number
    avg_time_per_task: number
    overdue_count: number
    by_category: Record<string, number>
    by_priority: Record<string, number>
  }

  // Habit metrics
  habits: {
    total_completions: number
    avg_completion_rate: number
    longest_streak: number
    active_streaks: number
    by_category: Record<string, number>
  }

  // Mood metrics
  mood: {
    avg_mood: number
    avg_energy: number
    avg_stress: number
    mood_variance: number
    best_day: { date: string, mood: number }
    worst_day: { date: string, mood: number }
  }

  // Journal metrics
  journal: {
    total_entries: number
    avg_word_count: number
    writing_streak: number
    most_common_tags: string[]
  }

  // Calendar metrics
  calendar: {
    total_events: number
    hours_scheduled: number
    event_completion_rate: number
    busiest_day: string
  }

  // Cross-service insights
  insights: Array<{
    id: string
    category: 'productivity' | 'wellness' | 'consistency' | 'correlation'
    priority: 'high' | 'medium' | 'low'
    title: string
    description: string
    supporting_data: any
    recommendations: string[]
    confidence: number
  }>
}
```

---

### 1.2 Cross-Service Correlation Analysis
**Priority:** P0
**Effort:** 7 days

**Endpoint:**
```typescript
GET /analytics/correlations?start_date=<date>&end_date=<date>
Response: {
  correlations: [
    {
      factor_a: { type: 'task_completion', label: 'Tasks Completed' }
      factor_b: { type: 'mood_score', label: 'Mood Score' }
      correlation: number              // -1 to 1 (Pearson)
      strength: 'strong' | 'moderate' | 'weak' | 'none'
      direction: 'positive' | 'negative'
      p_value: number                  // Statistical significance
      sample_size: number
      interpretation: string
      chart_data: Array<{ x: number, y: number }>
    },
    // More correlations...
  ]

  top_correlations: Array<Correlation>  // Top 5 strongest

  insights: Array<{
    title: string
    description: string
    recommendations: string[]
  }>
}
```

**Correlation Pairs to Analyze:**
1. Task completion count ↔ Mood score
2. Habit completion rate ↔ Mood score
3. Exercise habit ↔ Energy level
4. Sleep habit ↔ Mood + Energy
5. Meditation habit ↔ Stress level
6. Journal writing ↔ Mood (same day & next day)
7. Calendar busy-ness ↔ Stress level
8. Task overdue count ↔ Stress level
9. Time of day ↔ Productivity (tasks completed)
10. Day of week ↔ All metrics

**Statistical Methods:**
- Pearson correlation coefficient
- Spearman rank correlation (for non-linear)
- Time-lagged correlation (X today → Y tomorrow)
- Multi-variate regression
- Confidence intervals

---

### 1.3 AI-Powered Insight Generation
**Priority:** P1
**Effort:** 8 days

**Endpoint:**
```typescript
POST /analytics/insights/generate
Request: {
  focus_areas?: string[]  // tasks, habits, mood, wellness, productivity
  time_range?: string     // week, month, quarter, year
  depth?: 'summary' | 'detailed' | 'comprehensive'
}
Response: {
  insights: Array<{
    id: string
    category: string
    priority: 'high' | 'medium' | 'low'
    title: string
    headline: string                    // One-liner summary
    description: string                 // Detailed explanation
    supporting_data: {
      metrics: Record<string, any>
      charts?: Array<ChartConfig>
      comparisons?: Array<Comparison>
    }
    recommendations: Array<{
      action: string
      impact: 'high' | 'medium' | 'low'
      effort: 'easy' | 'moderate' | 'hard'
      timeframe: string
    }>
    confidence: number                  // 0-1
    expires_at: string                  // Cache invalidation
  }>

  summary: string                       // Overall wellness/productivity summary

  action_plan: Array<{
    goal: string
    steps: string[]
    timeline: string
    success_metrics: string[]
  }>
}
```

**Insight Categories:**

**1. Productivity Insights:**
- "Your task completion rate dropped 25% this week - consider reducing commitments"
- "You complete 3x more tasks in mornings - schedule important work before noon"
- "Tasks with time estimates get completed 40% more often"

**2. Wellness Insights:**
- "Your mood improves by 1.5 points on days when you exercise"
- "Journaling 3x/week correlates with 20% better mood"
- "Your energy is lowest on Mondays - plan lighter schedules"

**3. Consistency Insights:**
- "You've maintained 5 habit streaks for 30+ days - excellent consistency!"
- "Mood logging dropped off last week - regular tracking helps identify patterns"
- "You complete habits 60% more on weekdays - adjust weekend expectations"

**4. Pattern Insights:**
- "Your stress spikes every Monday - plan Sunday evening wind-down routine"
- "Calendar events with tasks linked have 85% completion vs 60% without"
- "You're most productive between 9am-11am - protect this time"

**5. Predictive Insights:**
- "Based on patterns, your mood may dip next week - plan self-care activities"
- "You're on track to complete 85% of monthly goals - adjust 3 tasks to hit 100%"
- "Weather forecast shows rain next 3 days - expect 15% lower energy"

**AI Implementation:**
- OpenAI GPT-4 or Anthropic Claude
- Context: Last 90 days of user data
- Prompt engineering for insight generation
- Few-shot learning with examples
- Temperature 0.7 for creative but accurate insights
- Cost optimization: Cache insights for 24 hours

---

### 1.4 Predictive Analytics
**Priority:** P2
**Effort:** 10 days

**Endpoints:**
```typescript
// Mood forecasting
GET /analytics/predictions/mood?days_ahead=7
Response: {
  predictions: Array<{
    date: string
    predicted_mood: number
    predicted_energy: number
    predicted_stress: number
    confidence_interval: { low: number, high: number }
    confidence: number
    factors: Array<{ factor: string, influence: number }>
  }>
  model_accuracy: number  // R² score
  recommendations: string[]
}

// Productivity forecasting
GET /analytics/predictions/productivity?days_ahead=7
Response: {
  predictions: Array<{
    date: string
    predicted_tasks_completed: number
    predicted_habit_completion_rate: number
    predicted_focus_hours: number
    confidence_interval: { low: number, high: number }
  }>
}

// Goal achievement probability
POST /analytics/predictions/goal-achievement
Request: {
  goal_type: 'task' | 'habit' | 'mood'
  goal_target: any
  deadline: string
}
Response: {
  probability: number           // 0-1
  current_trajectory: string    // ahead | on_track | behind
  gap_analysis: {
    current: number
    target: number
    days_remaining: number
    required_daily_rate: number
  }
  recommendations: string[]
}
```

**ML Models:**
- Time series forecasting (ARIMA, Prophet)
- Regression models for correlations
- Classification for pattern recognition
- Feature engineering from multi-dimensional data

**Implementation:**
- Python microservice or TensorFlow.js
- Model training on user's historical data (minimum 30 days)
- Retraining weekly with new data
- Model versioning and A/B testing

---

### 1.5 Analytics Dashboard UI
**Priority:** P0
**Effort:** 12 days

**Route:** `/analytics` (currently "Coming Soon")

**Layout:**

**Section 1: Overview Cards (Top)**
- Productivity Score (0-100) with trend
- Wellness Score (0-100) with trend
- Consistency Score (0-100) with trend
- Total Focus Time (hours this week)

**Section 2: Key Insights (Prominent)**
- AI-generated insights (top 3-5)
- Action items
- Expandable for full details
- Priority badges (high/medium/low)

**Section 3: Charts & Visualizations**
- **Productivity Trends:** Line chart (tasks, habits, mood over time)
- **Correlations Heatmap:** Visual correlation matrix
- **Weekly Patterns:** Bar chart (metrics by day of week)
- **Category Breakdown:** Pie charts (tasks by category, habits by type)
- **Mood Journey:** Combined line chart (mood, energy, stress)

**Section 4: Predictions (Optional Toggle)**
- 7-day mood forecast
- 7-day productivity forecast
- Goal achievement probability bars

**Section 5: Detailed Tables**
- Top performing habits
- Most completed task categories
- Strongest correlations
- Improvement opportunities

**Features:**
- Date range selector (week, month, quarter, year, custom)
- Export analytics report (PDF)
- Share insights (optional social feature)
- Drill-down into specific metrics

---

### 1.6 Goal Tracking System
**Priority:** P2
**Effort:** 7 days

**Use Case:** Set cross-service goals and track progress

**Database:**
```sql
CREATE TABLE user_goals (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  goal_type VARCHAR(50) NOT NULL,  -- productivity, wellness, consistency, custom
  title VARCHAR(200) NOT NULL,
  description TEXT,

  -- Target metrics
  metrics JSONB NOT NULL,  -- Flexible goal definitions
  -- Example: {
  --   "tasks_completed": { "operator": ">=", "value": 50, "period": "month" },
  --   "avg_mood": { "operator": ">=", "value": 4, "period": "week" }
  -- }

  start_date DATE NOT NULL,
  end_date DATE,
  status VARCHAR(20) DEFAULT 'active',  -- active, achieved, failed, abandoned

  achieved_at TIMESTAMP,
  progress_percentage NUMBER GENERATED ALWAYS AS (calculate_progress(metrics, status)),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Endpoints:**
```typescript
POST /analytics/goals
GET /analytics/goals
GET /analytics/goals/:id/progress
PUT /analytics/goals/:id
DELETE /analytics/goals/:id
```

**Goal Templates:**
- "Complete 100 tasks this month"
- "Maintain 90% habit completion for 30 days"
- "Increase average mood to ≥ 4.5 for 2 weeks"
- "Write 10 journal entries this month"
- "Exercise 5 days/week for 4 weeks"

---

## Technical Architecture

### New Service: `/analytics`
- Cross-service data aggregation
- Statistical analysis engine
- AI integration
- Caching layer (Redis)
- ML model serving (optional Python microservice)

### Database
- Materialized views for performance (pre-computed aggregations)
- `user_goals` table
- Analytics cache table (optional)

### API
- 10+ new analytics endpoints
- GraphQL consideration for flexible querying

### Frontend
- Complete analytics dashboard
- Chart library (Recharts already in use)
- Interactive visualizations
- Export functionality

---

# Part 2: Authentication & User Management

## Current State

### ✅ Placeholder Implementation
- All services use `'default_user'` as user_id
- No actual authentication
- No registration flow
- No login flow
- No user profiles

### ❌ Missing
- User registration
- Email/password authentication
- Social login (Google, Apple)
- Password reset
- Email verification
- User profiles
- Multi-tenancy support
- Session management
- API key authentication (for API access)

---

## Goals & Success Metrics

### Primary Goals
1. Implement secure user authentication (email/password + social)
2. Build registration and login flows
3. Create user profile management
4. Add multi-tenancy support (isolate user data)
5. Implement secure session management

### Success Metrics
| Metric | Target |
|--------|--------|
| Registration Completion Rate | ≥ 70% |
| Login Success Rate | ≥ 95% |
| Password Reset Success | ≥ 90% |
| Social Login Adoption | ≥ 30% of users |
| Session Security | Zero auth vulnerabilities |

---

## Detailed Requirements

### 2.1 User Registration
**Priority:** P0
**Effort:** 5 days

**Database:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT false,
  password_hash VARCHAR(255),  -- NULL if social login only

  -- Profile
  display_name VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,

  -- Authentication
  auth_provider VARCHAR(20) DEFAULT 'email',  -- email, google, apple
  auth_provider_id VARCHAR(255),              -- External ID from provider

  -- Security
  email_verification_token VARCHAR(255),
  email_verification_expires TIMESTAMP,
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP,

  -- Metadata
  timezone VARCHAR(50) DEFAULT 'UTC',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,

  INDEX idx_email (email),
  INDEX idx_auth_provider (auth_provider, auth_provider_id)
);

CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  refresh_token VARCHAR(255) UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  device_info JSONB,  -- User agent, IP, device type
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Registration Endpoint:**
```typescript
POST /auth/register
Request: {
  email: string
  password: string  // Min 8 chars, 1 uppercase, 1 number, 1 special
  display_name: string
  timezone?: string
  consent: {
    terms: boolean
    privacy: boolean
  }
}
Response: {
  user: {
    id: string
    email: string
    display_name: string
    email_verified: false
  }
  message: "Verification email sent to {email}"
}
```

**Flow:**
1. Validate email format and uniqueness
2. Hash password (bcrypt, 12 rounds)
3. Generate verification token
4. Send verification email
5. Create user record (email_verified = false)
6. Return success (don't auto-login until verified)

**Email Verification:**
```typescript
POST /auth/verify-email
Request: { token: string }
Response: {
  user: User
  access_token: string
  refresh_token: string
}
```

**Verification Email Template:**
```
Subject: Verify your Executive Dysfunction Center account

Hi {display_name},

Welcome to Executive Dysfunction Center! Click below to verify your email:

[Verify Email] (button)

Link expires in 24 hours.
```

---

### 2.2 User Login
**Priority:** P0
**Effort:** 3 days

**Endpoints:**
```typescript
// Email/Password login
POST /auth/login
Request: {
  email: string
  password: string
  remember_me?: boolean
}
Response: {
  user: User
  access_token: string      // JWT, expires in 15 min
  refresh_token: string     // Expires in 7 days (or 30 if remember_me)
}

// Refresh access token
POST /auth/refresh
Request: { refresh_token: string }
Response: { access_token: string, refresh_token: string }

// Logout
POST /auth/logout
Request: { refresh_token: string }
Response: { success: true }
```

**JWT Payload:**
```typescript
{
  user_id: string
  email: string
  iat: number
  exp: number
}
```

**Security:**
- Rate limiting (5 failed attempts → 15 min lockout)
- Log failed login attempts
- Refresh token rotation (new refresh token on each refresh)
- Invalidate all sessions on password change

---

### 2.3 Password Reset
**Priority:** P0
**Effort:** 2 days

**Endpoints:**
```typescript
// Request password reset
POST /auth/forgot-password
Request: { email: string }
Response: { message: "If account exists, reset email sent" }  // Don't reveal if email exists

// Reset password
POST /auth/reset-password
Request: {
  token: string
  new_password: string
}
Response: { message: "Password reset successful" }
```

**Flow:**
1. Generate reset token (random, 32 chars)
2. Set expiration (1 hour)
3. Send email with reset link
4. User clicks link, enters new password
5. Validate token and expiration
6. Hash new password, save, invalidate token
7. Invalidate all sessions (force re-login)

---

### 2.4 Social Login (OAuth)
**Priority:** P1
**Effort:** 7 days

**Providers:** Google, Apple (others: GitHub, Microsoft)

**Endpoints:**
```typescript
// Initiate OAuth flow
GET /auth/{provider}/login  // Redirects to provider
// Callback from provider
GET /auth/{provider}/callback?code=<code>
// Response: Redirect to app with tokens in URL or set as cookies
```

**Flow:**
1. User clicks "Sign in with Google"
2. Redirect to Google OAuth consent
3. User approves
4. Google redirects to callback with code
5. Exchange code for tokens
6. Get user info from provider
7. Check if user exists (by email or provider_id)
8. If not, create user record
9. Generate app access/refresh tokens
10. Redirect to app with tokens

**User Linking:**
- If email matches existing account, link provider to account (with confirmation)
- Allow unlinking providers
- Require at least one auth method (email+password or social)

---

### 2.5 User Profile Management
**Priority:** P1
**Effort:** 3 days

**Endpoints:**
```typescript
GET /auth/me  // Get current user
Response: {
  user: {
    id, email, email_verified, display_name, avatar_url, bio,
    timezone, auth_provider, created_at, last_login_at
  }
  preferences: UserPreferences
  stats: {
    total_tasks, total_habits, days_active, join_days_ago
  }
}

PUT /auth/me
Request: {
  display_name?: string
  avatar_url?: string
  bio?: string
  timezone?: string
}

PUT /auth/me/password
Request: {
  current_password: string
  new_password: string
}

DELETE /auth/me  // Delete account
Request: { password: string, confirmation: string }
Response: { message: "Account deleted" }
```

**Profile UI:** `/settings/profile`
- Display name
- Email (read-only, or change with verification)
- Avatar upload (S3 integration)
- Bio (200 chars max)
- Timezone
- Connected auth providers
- Delete account (confirmation dialog with password)

---

### 2.6 Multi-Tenancy Data Isolation
**Priority:** P0
**Effort:** 8 days

**Current Issue:** All data uses `'default_user'`

**Migration Required:**
- Update all tables to use actual user IDs
- Add user_id WHERE clauses to all queries
- Encore.ts context for current user
- Middleware to extract user from JWT

**Encore Auth Integration:**
```typescript
import { authHandler } from "encore.dev/auth";

interface AuthParams {
  authorization: string;  // "Bearer <token>"
}

export const auth = authHandler<AuthParams, { userID: string }>(
  async (params) => {
    const token = params.authorization.replace("Bearer ", "");
    const payload = verifyJWT(token);
    return { userID: payload.user_id };
  }
);

// Use in endpoints
export const getTasks = api(
  { method: "GET", path: "/tasks", auth: true },
  async (): Promise<GetTasksResponse> => {
    const userID = auth.data().userID;  // Current user
    // Query tasks WHERE user_id = userID
  }
);
```

**Data Migration:**
```sql
-- Backup current data
-- Add user_id columns to all tables
ALTER TABLE tasks ADD COLUMN user_id VARCHAR(255) NOT NULL DEFAULT 'default_user';
ALTER TABLE habits ADD COLUMN user_id VARCHAR(255) NOT NULL DEFAULT 'default_user';
-- (Repeat for all tables)

-- Update queries to filter by user_id
-- Add row-level security (PostgreSQL RLS)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_tasks ON tasks USING (user_id = current_setting('app.current_user'));
```

---

### 2.7 API Keys (Optional)
**Priority:** P3
**Effort:** 3 days

**Use Case:** Third-party integrations, automation scripts

**Endpoints:**
```typescript
POST /auth/api-keys  // Generate new API key
GET /auth/api-keys   // List user's API keys
DELETE /auth/api-keys/:id  // Revoke API key
```

**Usage:**
```bash
curl -H "Authorization: ApiKey <key>" https://api.com/tasks
```

---

## Technical Architecture

### Authentication
- JWT for stateless auth
- Bcrypt for password hashing
- OAuth 2.0 for social login
- Refresh token rotation
- HTTPS only (enforce)

### Database
- `users` table
- `user_sessions` table
- User ID foreign keys in all tables
- Row-level security (RLS)

### API
- Auth service endpoints (15+)
- Middleware for JWT validation
- Rate limiting on auth endpoints
- CORS configuration

### Frontend
- Login/Register pages
- Password reset flow
- Profile management UI
- Protected routes (redirect to login)
- Token refresh logic
- Logout functionality

---

## Implementation Plan

### Analytics (Sprints 1-3)
**Sprint 1:** Unified analytics service + correlations (2 weeks)
**Sprint 2:** AI insights + predictive analytics (2 weeks)
**Sprint 3:** Analytics dashboard UI (2 weeks)

### Authentication (Sprints 4-5)
**Sprint 4:** Core auth (register, login, profile) (2 weeks)
**Sprint 5:** Social login + multi-tenancy (2 weeks)

---

## Success Criteria

**Analytics:**
- [ ] Unified analytics endpoint operational
- [ ] Cross-service correlations calculated
- [ ] AI insights generating quality recommendations
- [ ] Analytics dashboard complete and performant
- [ ] Predictive models achieving target accuracy

**Authentication:**
- [ ] User registration and login working
- [ ] Email verification functional
- [ ] Password reset working
- [ ] Social login (Google) integrated
- [ ] All data isolated by user_id
- [ ] Security audit passed

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| AI insight costs | Medium | High | Rate limiting, caching, user quotas |
| Statistical significance with low data | Medium | Medium | Minimum data thresholds, confidence scores |
| Data migration breaking existing users | High | Medium | Thorough testing, rollback plan, gradual rollout |
| OAuth provider outages | Medium | Low | Fallback to email/password, provider diversity |
| JWT security vulnerabilities | High | Low | Use proven libraries, short expiration, regular audits |

---

## Open Questions

1. Should analytics be real-time or batch-processed nightly?
2. What's the minimum data requirement for AI insights (30 days? 60?)?
3. Should we support custom analytics dashboards (user-configurable)?
4. Email only or also support phone number auth?
5. Should we implement 2FA (two-factor authentication)?
6. What analytics data should be visible to users vs kept internal?

---

## Appendix

### Related Documents
- All service PRDs (Tasks, Habits, Mood, Journal, Calendar)
- Notifications PRD
- Security best practices
- GDPR compliance guide

### References
- JWT Best Practices (RFC 8725)
- OAuth 2.0 Specification (RFC 6749)
- OWASP Authentication Cheat Sheet
- Statistical correlation analysis methods
- Machine learning for time series forecasting
