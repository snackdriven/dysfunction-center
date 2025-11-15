# PRD: Mood Service Enhancements

**Version:** 1.0
**Status:** Draft
**Last Updated:** 2025-11-15
**Owner:** Product Team

---

## Executive Summary

The Mood Service has an exceptional frontend implementation with sophisticated multi-dimensional tracking, correlation analysis, and pattern recognition. However, the backend only implements Phase 1 features (basic CRUD), while the database schema and frontend are fully Phase 2 ready. This PRD focuses on completing the backend to match the frontend's capabilities and adding AI-powered insights.

---

## Current State Analysis

### ✅ Implemented Features (Backend)
- Basic mood entry CRUD (1-5 scale)
- Mood category support
- Notes field
- One entry per day enforcement
- Simple analytics (stats, daily averages, category breakdown)
- Well-tested backend (315 lines of tests)

### ✅ Implemented Features (Frontend)
- **Multi-dimensional tracking UI** - Primary mood, secondary mood, energy, stress, weather
- **Trigger selection** - 16 pre-populated triggers across 4 categories
- **Context tags** - Activities, people, locations
- **Sophisticated analytics** - Trends, patterns, correlations
- **Cross-service correlations** - Mood vs tasks, habits, time, weather, activities
- **Pattern analysis** - Day of week, best/worst days, common triggers
- **Beautiful visualizations** - Charts, cards, trend analysis

### ❌ Critical Gaps (Backend Missing Features)

**Schema exists but not implemented:**
1. **Phase 2 mood fields not saved/retrieved:**
   - `secondary_mood`
   - `energy_level` (1-10)
   - `stress_level` (1-10)
   - `location`
   - `weather`
   - `context_tags` (JSONB)

2. **Trigger system incomplete:**
   - Triggers table pre-populated (16 default triggers)
   - `mood_entry_triggers` junction table exists
   - **No endpoints** for trigger management (CRUD)
   - **No association** between entries and triggers
   - Frontend TriggerManager has non-functional update button

3. **Analytics incomplete:**
   - `trigger_analysis` field in response not populated
   - `pattern_insights` field not populated
   - No pattern detection endpoint
   - No insights endpoint

4. **Custom moods:**
   - Table exists but no endpoints
   - Frontend has placeholder UI

### 📊 Frontend-Backend Gap
- **Frontend completeness:** 95%
- **Backend completeness:** 40% (Phase 1 only)
- **Schema readiness:** 100% (Phase 2 migrations complete)

---

## Goals & Success Metrics

### Primary Goals
1. **Complete Phase 2 backend implementation** - Save/retrieve all mood dimensions
2. **Implement trigger management** - Full CRUD + associations
3. **Add pattern detection** - Server-side pattern analysis
4. **AI-powered insights** - Personalized mood insights and recommendations
5. **Advanced analytics** - Trigger impact analysis, mood predictions

### Success Metrics
| Metric | Current | Target |
|--------|---------|--------|
| Phase 2 Field Support | 0% | 100% |
| Trigger Endpoints | 0/5 | 5/5 |
| Analytics Completeness | 40% | 100% |
| Insight Quality | N/A | 80% user satisfaction |
| Correlation Accuracy | Client-side | Server-validated |
| Response Time | ~100ms | < 200ms with full data |

---

## Detailed Requirements

### Phase 1: Complete Phase 2 Backend (P0 - Critical)

#### 1.1 Multi-Dimensional Mood Entry Support
**Priority:** P0
**Effort:** 3 days

**Required Changes:**

**Update `createMoodEntry` and `updateMoodEntry`:**
```typescript
interface CreateMoodEntryRequest {
  // Phase 1 (existing)
  mood_score: number         // 1-5, required
  mood_category?: string
  notes?: string
  entry_date?: string

  // Phase 2 (new)
  secondary_mood?: string    // happy, sad, anxious, calm, energetic, tired,
                             // stressed, relaxed, focused, distracted, motivated, overwhelmed
  energy_level?: number      // 1-10
  stress_level?: number      // 1-10
  location?: string          // home, work, outdoors, gym, etc.
  weather?: string           // sunny, cloudy, rainy, snowy, windy, foggy
  context_tags?: {
    activities?: string[]    // exercise, work, socializing, reading, etc.
    people?: string[]        // alone, with family, with friends, etc.
    locations?: string[]     // specific places
  }
  trigger_ids?: number[]     // Associate with triggers
}
```

**Database Updates:**
- Modify `createMoodEntry` to insert Phase 2 fields
- Modify `updateMoodEntry` to update Phase 2 fields
- Modify `getMoodEntries` to return Phase 2 fields
- Modify `getMoodEntry` to return Phase 2 fields
- Handle `trigger_ids` by inserting into `mood_entry_triggers` junction table

**Validation:**
- `secondary_mood`: Enum validation (12 values)
- `energy_level`, `stress_level`: Range 1-10
- `weather`: Enum validation (6 values)
- `context_tags`: Array validation, max 10 per category
- `trigger_ids`: Foreign key validation

**Acceptance Criteria:**
- [ ] All Phase 2 fields saved correctly
- [ ] All Phase 2 fields retrieved correctly
- [ ] Trigger associations created
- [ ] Backward compatibility maintained (Phase 1 requests still work)
- [ ] Validation prevents invalid data
- [ ] Tests updated for Phase 2 fields
- [ ] Frontend connected and working

---

#### 1.2 Trigger Management Endpoints
**Priority:** P0
**Effort:** 2 days

**New Endpoints:**

```typescript
// Get all triggers (with optional filtering)
GET /mood/triggers?category=<category>
Response: {
  triggers: Array<{
    id: number
    name: string
    category: string  // work, health, social, personal
    created_at: string
    usage_count?: number  // How many entries use this trigger
  }>
}

// Create custom trigger
POST /mood/triggers
Request: { name: string, category: string }
Response: { trigger: Trigger }

// Update trigger (name or category)
PUT /mood/triggers/:id
Request: { name?: string, category?: string }
Response: { trigger: Trigger }

// Delete trigger
DELETE /mood/triggers/:id
Response: { success: boolean }
// Note: Should only allow deleting unused triggers or custom triggers
```

**Business Rules:**
- Default triggers (id 1-16) cannot be deleted
- Custom triggers can be edited/deleted by creator
- Deleting trigger removes from junction table (cascade)

**Acceptance Criteria:**
- [ ] All CRUD operations work
- [ ] Category filtering works
- [ ] Usage count calculated correctly
- [ ] Default triggers protected from deletion
- [ ] Frontend TriggerManager fully functional
- [ ] Tests cover all operations

---

#### 1.3 Enhanced Analytics with Trigger Analysis
**Priority:** P0
**Effort:** 4 days

**Update `/mood/analytics` endpoint:**

**Add to response:**
```typescript
{
  // Existing fields...

  // New: Trigger Analysis
  trigger_analysis: {
    most_common_triggers: Array<{
      trigger_id: number
      trigger_name: string
      count: number
      avg_mood_score: number
      avg_energy: number
      avg_stress: number
    }>
    trigger_impact: Array<{
      trigger_id: number
      trigger_name: string
      mood_with_trigger: number      // Avg mood when trigger present
      mood_without_trigger: number   // Avg mood when trigger absent
      impact: number                  // Difference
      significance: 'high' | 'medium' | 'low'
    }>
  }

  // New: Pattern Insights
  pattern_insights: {
    best_day_of_week: { day: string, avg_mood: number }
    worst_day_of_week: { day: string, avg_mood: number }
    best_weather: { weather: string, avg_mood: number }
    best_activities: string[]
    energy_patterns: {
      peak_energy_time: string       // Morning, afternoon, evening
      low_energy_time: string
    }
    stress_patterns: {
      high_stress_days: string[]     // Days of week
      low_stress_days: string[]
    }
  }

  // New: Correlations
  correlations: {
    energy_mood_correlation: number  // -1 to 1
    stress_mood_correlation: number
    weather_impact: Record<string, number>  // weather -> avg mood
  }
}
```

**Statistical Calculations:**
- Trigger impact: Compare mean mood with/without trigger (t-test for significance)
- Correlations: Pearson correlation coefficient
- Patterns: Group by day/weather/activity and calculate means
- Energy/stress patterns: Identify peaks and troughs

**Acceptance Criteria:**
- [ ] All new analytics fields calculated
- [ ] Statistical significance indicated
- [ ] Performance: < 500ms for 1 year of data
- [ ] Tests cover all calculations
- [ ] Frontend uses real data instead of mock

---

### Phase 2: Pattern Detection & Insights (P1 - High Priority)

#### 2.1 Pattern Detection Endpoint
**Priority:** P1
**Effort:** 4 days

**New Endpoint:**
```typescript
GET /mood/patterns?start_date=<date>&end_date=<date>&pattern_type=<type>
Response: {
  patterns: Array<{
    type: 'recurring_low' | 'improving_trend' | 'declining_trend' |
          'trigger_correlation' | 'activity_correlation' | 'weather_sensitivity'
    confidence: number        // 0-1
    description: string
    data_points: Array<any>
    recommendations: string[]
  }>
}
```

**Pattern Types:**

**1. Recurring Low Moods:**
- Detect if mood consistently drops on specific days (e.g., "Sunday evenings")
- Threshold: Mood < 3 on same day/time 3+ times in 4 weeks
- Recommendation: "Consider planning enjoyable activities for Sunday evenings"

**2. Improving/Declining Trends:**
- Linear regression on mood scores over time
- Slope significance test
- Recommendation: Positive → "Keep up the great progress!"; Negative → "Consider reaching out to support"

**3. Trigger Correlations:**
- Strong negative triggers (always associated with low mood)
- Strong positive triggers (always associated with high mood)
- Recommendation: "Avoid 'work deadline' stress by planning ahead"

**4. Activity Correlations:**
- Activities consistently linked to mood changes
- Recommendation: "Exercise is strongly correlated with better mood - try to maintain it"

**5. Weather Sensitivity:**
- Detect if weather significantly impacts mood
- Recommendation: "Rainy days affect your mood - consider light therapy"

**Implementation:**
- Statistical analysis (regression, correlation)
- Pattern matching algorithms
- Confidence scoring (based on data volume and consistency)
- Minimum data threshold (e.g., 30 entries required)

**Acceptance Criteria:**
- [ ] All pattern types detected
- [ ] Confidence scores accurate
- [ ] Recommendations actionable
- [ ] Handles insufficient data gracefully
- [ ] Performance: < 1s for pattern detection
- [ ] Tests cover all pattern types

---

#### 2.2 AI-Powered Insights
**Priority:** P1
**Effort:** 5 days

**Use Case:** Generate personalized insights and recommendations using AI

**New Endpoint:**
```typescript
POST /mood/insights/generate
Request: {
  date_range?: { start: string, end: string }
  focus_areas?: Array<'mood' | 'energy' | 'stress' | 'triggers' | 'activities'>
}
Response: {
  insights: Array<{
    category: string
    priority: 'high' | 'medium' | 'low'
    title: string
    description: string
    supporting_data: any
    action_items: string[]
    confidence: number
  }>
  summary: string  // Overall wellness summary
  mood_forecast: Array<{  // Next 7 days prediction
    date: string
    predicted_mood: number
    confidence: number
  }>
}
```

**AI Integration:**
- OpenAI/Anthropic Claude API
- Prompt engineering for mood analysis
- Context: User's mood history, patterns, triggers, activities
- Generate: Insights, recommendations, predictions

**Example Insights:**
- "Your energy levels are 40% higher on days when you exercise - consider morning workouts"
- "Stress levels spike on Mondays - plan lighter schedules or stress-reduction activities"
- "You haven't logged mood in 5 days - regular tracking helps identify patterns"

**Insight Categories:**
- **Behavioral:** Actions that improve mood
- **Environmental:** External factors affecting mood
- **Temporal:** Time-based patterns
- **Social:** People/activities impact
- **Predictive:** Forecasts and warnings

**Acceptance Criteria:**
- [ ] AI generates relevant, personalized insights
- [ ] Insights backed by data
- [ ] Action items are specific and actionable
- [ ] Mood forecast reasonably accurate (within 1 point)
- [ ] Cost-effective (rate limiting, caching)
- [ ] Tests use mock AI responses

---

### Phase 3: Advanced Features (P2 - Medium Priority)

#### 3.1 Mood Reminders
**Priority:** P2
**Effort:** 2 days

**Use Case:** Remind users to log mood at consistent time(s)

**Implementation:**
- User sets preferred reminder time(s) in preferences
- Daily notification at reminder time
- Skip if already logged today
- Streak tracking for consecutive logging days

**Preferences:**
```typescript
{
  mood_reminder_enabled: boolean
  mood_reminder_times: string[]  // e.g., ["09:00", "21:00"]
  mood_reminder_days: string[]   // days of week, or "all"
}
```

**Integration:** Uses notification system (see Notifications PRD)

---

#### 3.2 Custom Moods
**Priority:** P2
**Effort:** 3 days

**Use Case:** Users can define custom mood descriptors beyond the 12 defaults

**Implementation:**
```typescript
POST /mood/custom-moods
Request: { name: string, category?: string, emoji?: string }

GET /mood/custom-moods
PUT /mood/custom-moods/:id
DELETE /mood/custom-moods/:id
```

**Database:** `custom_moods` table already exists (currently unused)

**UI:** Dropdown in MoodEntryForm shows default + custom moods

---

#### 3.3 Mood Journaling Integration
**Priority:** P2
**Effort:** 2 days

**Use Case:** Link mood entries to journal entries for deeper context

**Current:** Journal has `mood_reference` (soft link)
**Enhancement:** Bi-directional linking

**Implementation:**
- `GET /mood/:id/journal-entries` - Get journal entries mentioning this mood
- Mood entry detail shows linked journal entries
- Journal entry detail shows linked mood

---

#### 3.4 Mood Goals & Targets
**Priority:** P2
**Effort:** 3 days

**Use Case:** Set mood improvement goals and track progress

**Features:**
- Set target: "Maintain average mood ≥ 4 for 30 days"
- Set target: "Reduce stress level to ≤ 5 for 2 weeks"
- Set target: "Energy level ≥ 7 for 5 days/week"
- Progress tracking
- Celebration when goals achieved

**Database:**
```sql
CREATE TABLE mood_goals (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  goal_type VARCHAR(50) NOT NULL,  -- avg_mood, max_stress, min_energy
  target_value NUMERIC NOT NULL,
  duration_days INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  achieved BOOLEAN DEFAULT false,
  achieved_at TIMESTAMP
);
```

---

### Phase 4: Visualization & Export (P2 - Medium Priority)

#### 4.1 Mood Calendar Heatmap
**Priority:** P2
**Effort:** 3 days

**Use Case:** Year-at-a-glance mood visualization

**Implementation:**
- Backend endpoint: `GET /mood/heatmap?year=<year>`
- Returns: Array of { date, mood_score, energy, stress, intensity }
- Frontend: Calendar grid colored by mood (green = good, red = bad)
- Hover shows details
- Click opens mood entry

---

#### 4.2 Export Functionality
**Priority:** P2
**Effort:** 2 days

**Formats:**
- CSV: Date, Mood, Energy, Stress, Weather, Notes, Triggers, Activities
- JSON: Complete data structure
- PDF: Report with charts and summary

**Endpoint:**
```typescript
POST /mood/export
Request: { format: 'csv' | 'json' | 'pdf', start_date: string, end_date: string }
Response: { download_url: string, expires_at: string }
```

---

### Phase 5: Social & Community (P3 - Low Priority)

#### 5.1 Anonymous Mood Sharing
**Priority:** P3
**Effort:** 4 days

**Use Case:** Compare mood with community averages (anonymized)

**Features:**
- Opt-in to anonymous data sharing
- See aggregate mood trends (all users, by location, by age group)
- "You're not alone" - Show % of users with similar mood patterns
- Privacy-preserving (no individual data shared)

---

#### 5.2 Mood Check-in Streaks
**Priority:** P3
**Effort:** 2 days

**Use Case:** Gamify consistent mood logging

**Features:**
- Track consecutive days logged
- Achievements for 7, 14, 30, 100, 365 day streaks
- Streak freeze (allow 1 missed day per month)
- Leaderboard (optional, opt-in)

---

## Technical Architecture

### Database Changes
1. Modify mood entry endpoints to handle Phase 2 fields
2. Create trigger management endpoints
3. Populate `custom_moods` table
4. Add `mood_goals` table
5. Add indexes for analytics performance

### API Changes
- Update 6 existing endpoints for Phase 2 fields
- Add 4 trigger management endpoints
- Add pattern detection endpoint
- Add AI insights endpoint
- Add export endpoint
- Add mood goals endpoints

### Frontend Changes
- Connect Phase 2 fields to backend (remove localStorage fallbacks)
- Enable TriggerManager update functionality
- Remove mock data from analytics
- Add pattern insights display
- Add AI insights display

### Infrastructure
- AI provider integration (OpenAI/Anthropic)
- Rate limiting for AI calls
- Caching for analytics calculations
- Background jobs for pattern detection

---

## Implementation Plan

### Sprint 1 (2 weeks) - Phase 2 Backend
- Week 1: Multi-dimensional mood fields + trigger management
- Week 2: Enhanced analytics + frontend integration

### Sprint 2 (2 weeks) - Patterns & Insights
- Week 1: Pattern detection algorithm
- Week 2: AI insights integration

### Sprint 3 (1 week) - Advanced Features
- Mood reminders, custom moods, journaling integration

### Sprint 4 (1 week) - Visualization & Export
- Heatmap, export functionality

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| AI insights hallucination | High | Medium | Validate insights against actual data, human review |
| AI API costs | Medium | High | Rate limiting, caching, budget alerts |
| Privacy concerns with mood data | High | Low | Strong encryption, HIPAA compliance review, clear privacy policy |
| Pattern detection false positives | Medium | Medium | Confidence thresholds, statistical significance tests |
| Performance with large datasets | Medium | Medium | Database optimization, caching, pagination |

---

## Success Criteria

**Definition of Done:**
- [ ] All Phase 2 fields saved and retrieved
- [ ] Trigger management fully functional
- [ ] Analytics shows real data (no mocks)
- [ ] Pattern detection working
- [ ] AI insights generating useful recommendations
- [ ] Test coverage ≥ 80%
- [ ] Frontend fully connected to backend
- [ ] Performance benchmarks met

**Quality Gates:**
- All tests passing
- No P0/P1 bugs
- AI insight quality > 80% user satisfaction
- Privacy audit completed
- Accessibility audit passed

---

## Open Questions

1. Should mood entries be editable after creation? (Currently yes, but should we track edit history?)
2. What's the minimum data requirement for AI insights (30 entries? 60?)?
3. Should we allow multiple mood entries per day? (Currently one per day)
4. How to handle sensitive triggers (e.g., "suicidal thoughts") - should we provide crisis resources?
5. Should mood predictions be shown to users or kept internal for insights?

---

## Appendix

### Related Documents
- `API_PHASE_2_DOCUMENTATION.md` - API spec
- `/mood/types.ts` - Type definitions
- `/mood/migrations/` - Database schema

### References
- PHQ-9 (Patient Health Questionnaire) - Depression screening
- GAD-7 (Generalized Anxiety Disorder) - Anxiety screening
- Mood tracking research papers
- Mental health data privacy regulations (HIPAA, GDPR)
