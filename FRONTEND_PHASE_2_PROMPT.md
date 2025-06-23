# Frontend Phase 2: Core Features Implementation Prompt

## 🎯 Phase 2 Objective

Implement the core productivity features of Meh-trics with basic CRUD operations, essential user interactions, and data visualization. This phase creates the minimum viable product with all essential functionality working end-to-end.

## 📋 Phase 2 Implementation Checklist

### 2.1 Dashboard Implementation
- [ ] Create dashboard layout with widget grid system
- [ ] Implement today's focus widget with task summary
- [ ] Build habit tracker overview widget
- [ ] Create mood check-in quick entry widget
- [ ] Implement weekly progress overview
- [ ] Build upcoming events widget
- [ ] Add contextual greeting with time-based messages
- [ ] Implement quick action buttons for common tasks

### 2.2 Basic Task Management
- [ ] Create task list view with filtering
- [ ] Implement task creation form with validation
- [ ] Build task card component with priority indicators
- [ ] Add task completion toggle functionality
- [ ] Implement task editing with inline forms
- [ ] Create task deletion with confirmation
- [ ] Build basic search and filter functionality
- [ ] Add due date management with calendar picker

### 2.3 Essential Habit Tracking
- [ ] Create habit overview grid layout
- [ ] Implement habit creation form
- [ ] Build habit card with completion tracking
- [ ] Add daily completion logging functionality
- [ ] Create basic streak visualization
- [ ] Implement habit editing and deletion
- [ ] Build habit category management
- [ ] Add simple habit analytics (completion rates)

### 2.4 Mood Logging System
- [ ] Create mood entry form with slider controls
- [ ] Implement primary mood selection (1-5 scale)
- [ ] Build mood history list view
- [ ] Add today's mood quick entry
- [ ] Create basic mood pattern visualization
- [ ] Implement mood notes and context
- [ ] Build mood analytics dashboard
- [ ] Add mood trend indicators

### 2.5 Basic Calendar Integration
- [ ] Create calendar month view layout
- [ ] Implement event creation and editing
- [ ] Build task deadline overlay on calendar
- [ ] Add basic event management (CRUD)
- [ ] Create calendar navigation (prev/next month)
- [ ] Implement event detail modal
- [ ] Build agenda view for daily events
- [ ] Add conflict detection for overlapping events

### 2.6 Data Integration & State Management
- [ ] Implement React Query hooks for all API endpoints
- [ ] Create optimistic updates for common actions
- [ ] Build error handling and retry logic
- [ ] Implement loading states for all operations
- [ ] Add success notifications for user actions
- [ ] Create data synchronization between views
- [ ] Implement local storage for offline capability
- [ ] Build real-time updates for shared data

## 🚀 Detailed Implementation Instructions

### Dashboard Widget System

```typescript
// src/components/dashboard/DashboardPage.tsx
import React from 'react';
import { DashboardGrid, DashboardWidget } from '@/components/layout/DashboardGrid';
import { TodaysFocusWidget } from './widgets/TodaysFocusWidget';
import { HabitTrackerWidget } from './widgets/HabitTrackerWidget';
import { MoodCheckinWidget } from './widgets/MoodCheckinWidget';
import { WeeklyProgressWidget } from './widgets/WeeklyProgressWidget';
import { UpcomingEventsWidget } from './widgets/UpcomingEventsWidget';
import { QuickActionsWidget } from './widgets/QuickActionsWidget';

export const DashboardPage: React.FC = () => {
  const currentHour = new Date().getHours();
  const greeting = 
    currentHour < 12 ? 'Good morning' :
    currentHour < 17 ? 'Good afternoon' :
    'Good evening';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {greeting}! 👋
          </h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <QuickActionsWidget />
      </div>

      {/* Main Dashboard Grid */}
      <DashboardGrid columns={3}>
        <TodaysFocusWidget />
        <HabitTrackerWidget />
        <MoodCheckinWidget />
      </DashboardGrid>

      {/* Secondary Widgets */}
      <DashboardGrid columns={2}>
        <WeeklyProgressWidget />
        <UpcomingEventsWidget />
      </DashboardGrid>
    </div>
  );
};
```

### Today's Focus Widget

```typescript
// src/components/dashboard/widgets/TodaysFocusWidget.tsx
import React from 'react';
import { DashboardWidget } from '@/components/layout/DashboardGrid';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle, Circle, Clock, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { tasksApi } from '@/services/tasks';

export const TodaysFocusWidget: React.FC = () => {
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', 'today'],
    queryFn: () => tasksApi.getTodaysTasks(),
  });

  const taskSummary = React.useMemo(() => {
    if (!tasks) return { total: 0, completed: 0, overdue: 0, inProgress: 0 };
    
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.completed).length,
      overdue: tasks.filter(t => !t.completed && new Date(t.due_date) < new Date()).length,
      inProgress: tasks.filter(t => !t.completed && t.status === 'in_progress').length,
    };
  }, [tasks]);

  return (
    <DashboardWidget
      title="Today's Focus"
      subtitle="Your priority tasks for today"
      action={
        <Button size="sm" variant="outline">
          View All
        </Button>
      }
    >
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success-500" />
              <span>{taskSummary.completed} completed</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4 text-muted-foreground" />
              <span>{taskSummary.total - taskSummary.completed} remaining</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-error-500" />
              <span>{taskSummary.overdue} overdue</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-warning-500" />
              <span>{taskSummary.inProgress} in progress</span>
            </div>
          </div>

          {/* Top Tasks */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Priority Tasks</h4>
            {tasks?.slice(0, 3).map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg border bg-card">
                <button
                  onClick={() => {/* Handle completion */}}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {task.completed ? (
                    <CheckCircle className="h-4 w-4 text-success-500" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </p>
                  {task.due_date && (
                    <p className="text-xs text-muted-foreground">
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'}>
                  {task.priority}
                </Badge>
              </div>
            ))}
          </div>

          {/* Quick Add */}
          <Button className="w-full" variant="outline">
            + Add Task
          </Button>
        </div>
      )}
    </DashboardWidget>
  );
};
```

### Task Management Implementation

```typescript
// src/components/tasks/TasksPage.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { TaskList } from './TaskList';
import { TaskForm } from './TaskForm';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/Dialog';
import { Plus, Search, Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { tasksApi } from '@/services/tasks';

export const TasksPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks', { search: searchQuery, status: statusFilter, priority: priorityFilter }],
    queryFn: () => tasksApi.getTasks({
      search: searchQuery || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      priority: priorityFilter !== 'all' ? priorityFilter : undefined,
    }),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            Manage your tasks and stay productive
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <TaskForm onSuccess={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-card rounded-lg border">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tasks</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Task List */}
      <TaskList 
        tasks={tasks || []}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};
```

### Habit Tracking Implementation

```typescript
// src/components/habits/HabitsPage.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { HabitGrid } from './HabitGrid';
import { HabitForm } from './HabitForm';
import { HabitAnalytics } from './HabitAnalytics';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/Dialog';
import { Plus, Target, BarChart3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { habitsApi } from '@/services/habits';

export const HabitsPage: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: habits, isLoading } = useQuery({
    queryKey: ['habits'],
    queryFn: habitsApi.getHabits,
  });

  const { data: todayCompletions } = useQuery({
    queryKey: ['habit-completions', 'today'],
    queryFn: () => habitsApi.getTodayCompletions(),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Habits</h1>
          <p className="text-muted-foreground">
            Build positive routines and track your progress
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Habit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <HabitForm onSuccess={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Daily Summary */}
          <div className="p-4 bg-card rounded-lg border">
            <h3 className="font-semibold mb-2">Today's Progress</h3>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">
                {todayCompletions?.filter(c => c.completed).length || 0} of {habits?.length || 0} completed
              </span>
              <div className="flex-1 bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ 
                    width: `${habits ? (todayCompletions?.filter(c => c.completed).length || 0) / habits.length * 100 : 0}%` 
                  }}
                />
              </div>
            </div>
          </div>

          {/* Habit Grid */}
          <HabitGrid 
            habits={habits || []}
            completions={todayCompletions || []}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <HabitAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};
```

### Mood Logging Implementation

```typescript
// src/components/mood/MoodPage.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { MoodEntryForm } from './MoodEntryForm';
import { MoodHistory } from './MoodHistory';
import { MoodPatterns } from './MoodPatterns';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/Dialog';
import { Smile, History, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { moodApi } from '@/services/mood';

export const MoodPage: React.FC = () => {
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);

  const { data: todayMood } = useQuery({
    queryKey: ['mood', 'today'],
    queryFn: moodApi.getTodayMood,
    retry: false,
  });

  const { data: recentMoods } = useQuery({
    queryKey: ['mood', 'recent'],
    queryFn: () => moodApi.getMoodEntries({ limit: 7 }),
  });

  const averageMood = React.useMemo(() => {
    if (!recentMoods?.length) return 0;
    return recentMoods.reduce((sum, mood) => sum + mood.mood_score, 0) / recentMoods.length;
  }, [recentMoods]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mood Tracking</h1>
          <p className="text-muted-foreground">
            Monitor your emotional wellbeing and identify patterns
          </p>
        </div>
        {!todayMood && (
          <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Smile className="mr-2 h-4 w-4" />
                Log Today's Mood
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <MoodEntryForm onSuccess={() => setIsEntryDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Today's Mood Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-card rounded-lg border">
          <h3 className="font-semibold mb-2">Today's Mood</h3>
          {todayMood ? (
            <div className="flex items-center gap-2">
              <span className="text-2xl">
                {['😢', '😔', '😐', '🙂', '😊'][todayMood.mood_score - 1]}
              </span>
              <div>
                <p className="font-medium">{todayMood.mood_score}/5</p>
                <p className="text-sm text-muted-foreground">
                  {['Very Low', 'Low', 'Neutral', 'Good', 'Excellent'][todayMood.mood_score - 1]}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Not logged yet</p>
          )}
        </div>

        <div className="p-4 bg-card rounded-lg border">
          <h3 className="font-semibold mb-2">7-Day Average</h3>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <div>
              <p className="font-medium">{averageMood.toFixed(1)}/5</p>
              <p className="text-sm text-muted-foreground">
                {averageMood >= 4 ? 'Great week!' : averageMood >= 3 ? 'Good week' : 'Challenging week'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-card rounded-lg border">
          <h3 className="font-semibold mb-2">Streak</h3>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="font-medium">{recentMoods?.length || 0} days</p>
              <p className="text-sm text-muted-foreground">Consecutive logs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="patterns" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Patterns
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <MoodHistory />
        </TabsContent>

        <TabsContent value="patterns">
          <MoodPatterns />
        </TabsContent>
      </Tabs>
    </div>
  );
};
```

### API Service Hooks

```typescript
// src/services/tasks.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiEndpoints } from './api';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '@/types/task';

export const tasksApi = {
  getTasks: async (filters?: any): Promise<Task[]> => {
    const { data } = await api.get(apiEndpoints.tasks.list, { params: filters });
    return data;
  },

  getTask: async (id: string): Promise<Task> => {
    const { data } = await api.get(apiEndpoints.tasks.get(id));
    return data;
  },

  createTask: async (task: CreateTaskRequest): Promise<Task> => {
    const { data } = await api.post(apiEndpoints.tasks.create, task);
    return data;
  },

  updateTask: async ({ id, ...task }: UpdateTaskRequest & { id: string }): Promise<Task> => {
    const { data } = await api.put(apiEndpoints.tasks.update(id), task);
    return data;
  },

  deleteTask: async (id: string): Promise<void> => {
    await api.delete(apiEndpoints.tasks.delete(id));
  },

  getTodaysTasks: async (): Promise<Task[]> => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await api.get(apiEndpoints.tasks.list, {
      params: { due_date: today }
    });
    return data;
  },
};

// Custom hooks
export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.updateTask,
    onSuccess: (data) => {
      queryClient.setQueryData(['tasks', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};
```

### Form Components

```typescript
// src/components/tasks/TaskForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { useCreateTask } from '@/services/tasks';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  due_date: z.date().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  onSuccess?: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onSuccess }) => {
  const createTask = useCreateTask();

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
    },
  });

  const onSubmit = async (data: TaskFormData) => {
    try {
      await createTask.mutateAsync({
        ...data,
        due_date: data.due_date?.toISOString(),
      });
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Create New Task</h2>
        <p className="text-sm text-muted-foreground">
          Add a new task to your productivity tracker
        </p>
      </div>

      <div className="space-y-4">
        <Input
          label="Title"
          placeholder="Enter task title..."
          {...form.register('title')}
          error={form.formState.errors.title?.message}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <Textarea
            placeholder="Add task description (optional)..."
            {...form.register('description')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <Select
              value={form.watch('priority')}
              onValueChange={(value: 'low' | 'medium' | 'high') => 
                form.setValue('priority', value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Due Date</label>
            <DatePicker
              value={form.watch('due_date')}
              onChange={(date) => form.setValue('due_date', date)}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => form.reset()}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={createTask.isPending}
        >
          {createTask.isPending ? 'Creating...' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};
```

## 🧪 Testing Strategy for Phase 2

### Feature Testing Template

```typescript
// src/components/tasks/__tests__/TasksPage.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { TasksPage } from '../TasksPage';
import { tasksApi } from '@/services/tasks';

// Mock the API
vi.mock('@/services/tasks', () => ({
  tasksApi: {
    getTasks: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
  },
}));

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        {component}
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('TasksPage', () => {
  beforeEach(() => {
    vi.mocked(tasksApi.getTasks).mockResolvedValue([
      {
        id: '1',
        title: 'Test Task',
        description: 'Test Description',
        priority: 'medium',
        completed: false,
        created_at: new Date().toISOString(),
      },
    ]);
  });

  it('renders tasks page correctly', async () => {
    renderWithProviders(<TasksPage />);
    
    expect(screen.getByText('Tasks')).toBeInTheDocument();
    expect(screen.getByText('Add Task')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });
  });

  it('opens create task dialog when add button is clicked', async () => {
    renderWithProviders(<TasksPage />);
    
    fireEvent.click(screen.getByText('Add Task'));
    
    await waitFor(() => {
      expect(screen.getByText('Create New Task')).toBeInTheDocument();
    });
  });

  it('filters tasks by search query', async () => {
    renderWithProviders(<TasksPage />);
    
    const searchInput = screen.getByPlaceholderText('Search tasks...');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    await waitFor(() => {
      expect(tasksApi.getTasks).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'test' })
      );
    });
  });
});
```

## ✅ Phase 2 Success Criteria

### Functional Requirements
- [ ] Dashboard displays real-time data from all services
- [ ] Tasks can be created, edited, completed, and deleted
- [ ] Habits can be tracked with daily completion logging
- [ ] Mood entries can be recorded with basic analytics
- [ ] Calendar shows events and task deadlines
- [ ] All forms validate input and handle errors gracefully
- [ ] Data synchronizes across different views
- [ ] Loading states provide clear user feedback

### User Experience Requirements
- [ ] Intuitive navigation between all sections
- [ ] Responsive design works on mobile and desktop
- [ ] Smooth animations and transitions
- [ ] Clear visual feedback for user actions
- [ ] Accessible interfaces (keyboard navigation, screen readers)
- [ ] Error messages are helpful and actionable
- [ ] Success notifications confirm completed actions

### Technical Requirements
- [ ] All API endpoints integrated with proper error handling
- [ ] Optimistic updates provide immediate feedback
- [ ] Data caching reduces unnecessary API calls
- [ ] Form validation prevents invalid submissions
- [ ] TypeScript types ensure data integrity
- [ ] React Query manages all server state
- [ ] Component tests cover critical user flows

## 🚀 Phase 2 Deliverables

1. **Complete Dashboard**: Working overview with all widgets
2. **Task Management**: Full CRUD operations with filtering
3. **Habit Tracking**: Daily logging with basic analytics
4. **Mood Logging**: Entry forms with pattern visualization
5. **Calendar Integration**: Event management with task overlay
6. **Data Integration**: All services connected to backend APIs
7. **Form System**: Validated forms for all data entry
8. **Testing Suite**: Comprehensive tests for core functionality

Upon completion of Phase 2, users will have a fully functional productivity tracking application with all core features working end-to-end.