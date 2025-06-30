# 🎯 Executive Dysfunction Center - Complete Development & Feature Guide

## 📖 **THE DEFINITIVE APPLICATION REFERENCE**

**This is the authoritative reference for all Executive Dysfunction Center functionality and development.** Use this document as your primary source for understanding features, implementation requirements, and development standards. All development should reference this document first.

---

## 🏆 Feature Priority Matrix

### **TIER 1: Core Productivity Features** (Essential Daily Use)
1. **✅ Task Management** - Primary productivity workflow
2. **📅 Calendar** - Time management and scheduling foundation
3. **📊 Dashboard** - Central command interface
4. **🧭 Navigation & Layout** - Application structure

### **TIER 2: Data & Insights** (Enhanced Experience)  
5. **🎯 Habit Tracking** - Behavioral change and routine building
6. **😊 Mood Tracking** - Mental health monitoring
7. **📓 Journal** - Reflection and documentation
8. **📈 Analytics & Insights** - Pattern recognition and optimization

### **TIER 3: System Features** (Configuration & Management)
9. **⚙️ Settings & Preferences** - Customization and data management
10. **🔧 Technical Features** - Export, import, API access

---

## 🚀 Core Development Principles

### TypeScript & React Excellence
- **Strict TypeScript**: Use strict mode, proper type guards, and avoid `any` types
- **Type Safety**: Define comprehensive interfaces with proper optional/required fields
- **React Performance**: Use `React.memo`, `useMemo`, `useCallback` for expensive operations
- **Component Architecture**: Single-purpose components with clear prop interfaces and forwardRef support
- **Error Boundaries**: Implement typed error boundaries for graceful error handling
- **Custom Hooks**: Extract reusable logic into well-typed custom hooks
- **State Management**: Use Zustand with TypeScript, selectors, and immer for complex updates
- **Form Handling**: Implement React Hook Form with TypeScript validation schemas
- **Accessibility First**: Complete ARIA support, semantic HTML, keyboard navigation
- **Code Organization**: Logical grouping, consistent naming, minimal but clear comments

### Code Quality & Maintainability
- Remove AI-sounding language from comments, function names, and console logs
- Avoid marketing terms like 'safe', 'improved', 'optimized', 'enhanced', 'updated'
- Use straightforward, natural naming without unnecessary descriptors
- Write code that looks human-authored, not generated
- When auditing files, align all code with recent architectural changes
- Ensure consistency across related files and methods
- Remove outdated patterns that no longer match current implementation
- Update any legacy approaches to match established conventions

### Integration & Architecture
- **TanStack Query**: Use for server state with proper cache invalidation and optimistic updates
- **Error Boundaries**: Implement typed error boundaries with fallback UI components
- **Context Providers**: Use for theme, auth, and global UI state (not data fetching)
- **Performance**: Implement code splitting, lazy loading, and bundle optimization
- **Type Guards**: Use runtime type validation for API responses and user input
- **Form Validation**: Implement Zod schemas with React Hook Form for type-safe forms
- **Accessibility**: WCAG 2.1 AA compliance with semantic HTML and proper ARIA
- **CSS Architecture**: Use Tailwind with CSS custom properties for consistent theming
- **Testing Integration**: Design components with testability in mind (data-testid, clear props)
- **Documentation**: Use TypeScript JSDoc for complex business logic and API contracts

---

## 🎯 **TIER 1: CORE PRODUCTIVITY FEATURES**

## ✅ Task Management (Primary Feature)

### **Essential Task Operations**
- **Create Tasks**: Title (required), description, priority (high/medium/low), due date
- **Edit Tasks**: Inline editing, modal forms, bulk editing capabilities
- **Complete Tasks**: Single click completion with timestamp recording
- **Delete Tasks**: Individual deletion, bulk deletion with confirmation
- **Task Status Workflow**: Pending → In Progress → Completed

### **Advanced Task Capabilities**
- **Categories**: Color-coded organization with custom icons and names
- **Tags**: Multi-tag system with autocomplete and tag management
- **Subtasks**: Nested task hierarchy with progress tracking
- **Time Tracking**: Integrated start/stop timers with session logging
- **Time Estimation**: Estimated vs actual time analysis and learning
- **Notes**: Rich text notes with formatting and attachment support
- **Recurrence Patterns**: Complex scheduling (daily, weekly, monthly, custom)

### **Implementation Patterns for Task Management**

```typescript
// Task Interface Definition
interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  dueDate?: Date;
  category?: Category;
  tags: Tag[];
  subtasks: Subtask[];
  timeTracking: TimeEntry[];
  estimatedDuration?: number;
  notes?: string;
  recurrence?: RecurrencePattern;
  createdAt: Date;
  updatedAt: Date;
}

// Task Store with Zustand
interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchTasks: () => Promise<void>;
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  bulkUpdateTasks: (ids: string[], updates: Partial<Task>) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,
  
  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const tasks = await api.tasks.getAll();
      set({ tasks, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tasks';
      set({ error: errorMessage, isLoading: false });
    }
  },
  
  createTask: async (taskData) => {
    try {
      const newTask = await api.tasks.create(taskData);
      set(state => ({ 
        tasks: [...state.tasks, newTask] 
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create task';
      set({ error: errorMessage });
    }
  },
  
  completeTask: async (id) => {
    // Optimistic update
    set(state => ({
      tasks: state.tasks.map(task => 
        task.id === id 
          ? { ...task, status: 'completed', updatedAt: new Date() }
          : task
      )
    }));
    
    try {
      await api.tasks.complete(id);
    } catch (error) {
      // Rollback on error
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete task';
      set(state => ({
        tasks: state.tasks.map(task => 
          task.id === id 
            ? { ...task, status: 'pending' }
            : task
        ),
        error: errorMessage
      }));
    }
  }
}));

// Alternative: TanStack Query Pattern for Server State
export const useTasksQuery = () => {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async (): Promise<Task[]> => {
      const response = await api.tasks.getAll();
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
      return await api.tasks.create(taskData);
    },
    onSuccess: (newTask) => {
      // Optimistic update
      queryClient.setQueryData(['tasks'], (old: Task[] = []) => [...old, newTask]);
    },
    onError: (error) => {
      // Handle error, show toast, etc.
      console.error('Failed to create task:', error);
    },
  });
};
```

### **Task Component Implementation**
```typescript
interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const TaskCard = React.memo<TaskCardProps>(({ 
  task, 
  onComplete, 
  onEdit, 
  onDelete 
}) => {
  const handleKeyPress = useCallback((e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  }, []);

  const handleComplete = useCallback(() => {
    onComplete(task.id);
  }, [onComplete, task.id]);

  const handleEdit = useCallback(() => {
    onEdit(task);
  }, [onEdit, task]);

  const handleDelete = useCallback(() => {
    onDelete(task.id);
  }, [onDelete, task.id]);

  return (
    <div 
      className={cn(
        "p-4 border rounded-lg shadow-sm",
        "hover:shadow-md transition-shadow",
        task.status === 'completed' && "opacity-60 bg-gray-50"
      )}
      role="article"
      aria-label={`Task: ${task.title}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleComplete}
            onKeyDown={(e) => handleKeyPress(e, handleComplete)}
            className={cn(
              "w-5 h-5 rounded border-2 flex items-center justify-center",
              "focus:ring-2 focus:ring-blue-500 focus:outline-none",
              task.status === 'completed' 
                ? "bg-green-500 border-green-500" 
                : "border-gray-300 hover:border-gray-400"
            )}
            aria-label={
              task.status === 'completed' 
                ? `Mark ${task.title} as incomplete` 
                : `Mark ${task.title} as complete`
            }
          >
            {task.status === 'completed' && (
              <Check className="w-3 h-3 text-white" aria-hidden="true" />
            )}
          </button>
          
          <div>
            <h3 className={cn(
              "font-medium",
              task.status === 'completed' && "line-through text-gray-500"
            )}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-gray-600 mt-1">
                {task.description}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant={task.priority}>
            {task.priority}
          </Badge>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                aria-label={`Task options for ${task.title}`}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={handleEdit}
                className="cursor-pointer"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDelete}
                className="cursor-pointer text-red-600"
              >
                <Trash className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {task.dueDate && (
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <Calendar className="w-4 h-4 mr-1" />
          <time dateTime={task.dueDate.toISOString()}>
            {format(task.dueDate, 'PPP')}
          </time>
        </div>
      )}
    </div>
  );
});
```

### **Critical Task Workflows**
1. **Quick Task Creation**: Dashboard → Quick Add → Save
2. **Task Completion Flow**: Task List → Click Complete → Automatic timestamp
3. **Time Tracking Session**: Task → Start Timer → Work → Stop Timer → Log duration
4. **Bulk Task Management**: Select Multiple → Bulk Action → Confirm
5. **Task Planning**: Calendar View → Drag tasks to dates → Auto-update due dates

---

## 📅 Calendar (Time Management & Scheduling Foundation)

### **Calendar Event Management**
- **Event Creation**: Title, description, start/end times, location specification
- **All-Day Events**: Full-day scheduling without specific times
- **Event Categorization**: Color coding and visual categorization
- **Location Integration**: Physical and virtual location specification
- **Task Integration**: Direct linking between calendar events and tasks

### **Calendar Implementation Patterns**

```typescript
// Calendar Types
type CalendarView = 'month' | 'week' | 'day' | 'agenda' | '3day' | '2week';

interface EventCategory {
  id: string;
  name: string;
  color: string;
}

interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: Date;
  count?: number;
}

interface Reminder {
  id: string;
  minutesBefore: number;
  type: 'notification' | 'email';
}

// Calendar Event Interface
interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  isAllDay: boolean;
  location?: string;
  category: EventCategory;
  linkedTaskId?: string;
  recurrence?: RecurrenceRule;
  reminders: Reminder[];
  createdAt: Date;
  updatedAt: Date;
}

// Calendar Store
interface CalendarState {
  events: CalendarEvent[];
  currentView: CalendarView;
  selectedDate: Date;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setView: (view: CalendarView) => void;
  setSelectedDate: (date: Date) => void;
  fetchEvents: (startDate: Date, endDate: Date) => Promise<void>;
  createEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  
  // Selectors
  getEventsForDate: (date: Date) => CalendarEvent[];
  getEventsForRange: (start: Date, end: Date) => CalendarEvent[];
}

// Calendar Component
export const CalendarView = React.memo(() => {
  const { 
    events, 
    currentView, 
    selectedDate, 
    setView, 
    setSelectedDate,
    fetchEvents,
    getEventsForRange 
  } = useCalendarStore();
  
  const navigateDate = useCallback((direction: 'prev' | 'next') => {
    const increment = getDateIncrement(currentView);
    const newDate = direction === 'next' 
      ? addDays(selectedDate, increment)
      : subDays(selectedDate, increment);
    setSelectedDate(newDate);
  }, [currentView, selectedDate, setSelectedDate]);

  const handleEventClick = useCallback((event: CalendarEvent) => {
    // Handle event click
  }, []);

  const handleTimeSlotClick = useCallback((date: Date, time?: string) => {
    // Handle time slot click for event creation
  }, []);

  const handleEventDrop = useCallback((eventId: string, newDate: Date) => {
    // Handle drag and drop event move
  }, []);

  // Memoize visible events for performance
  const visibleEvents = useMemo(() => {
    const { start, end } = getDateRange(currentView, selectedDate);
    return getEventsForRange(start, end);
  }, [currentView, selectedDate, getEventsForRange]);

  return (
    <div className="calendar-container" role="main" aria-label="Calendar">
      <CalendarHeader 
        currentView={currentView}
        selectedDate={selectedDate}
        onViewChange={setView}
        onNavigate={navigateDate}
        onDateSelect={setSelectedDate}
      />
      
      <CalendarGrid
        view={currentView}
        selectedDate={selectedDate}
        events={visibleEvents}
        onEventClick={handleEventClick}
        onTimeSlotClick={handleTimeSlotClick}
        onEventDrop={handleEventDrop}
      />
    </div>
  );
});
```

### **Calendar View Options** (Complete Implementation)
- **Day View**: Single day detailed schedule with hourly time slots
- **3-Day View**: Three-day overview with cross-domain integration (tasks, habits, mood)
- **Week View**: Weekly grid view with time slots and drag-and-drop functionality
- **2-Week View**: Two-week compact view with productivity scoring and habit tracking
- **Month View**: Traditional calendar grid with events and task deadlines
- **Agenda View**: Linear list of upcoming events with timeline progression
- **Enhanced Agenda View**: Advanced agenda with cross-domain data (events, tasks, habits, mood)
- **Integrated Calendar View**: Unified view combining all productivity domains

### **Critical Calendar Workflows**
1. **Daily Planning**: Calendar → Day View → Review schedule → Add time blocks → Set priorities
2. **Event Creation**: Calendar → Click time slot → Add event details → Save → Auto-conflict detection
3. **Cross-Domain Planning**: Calendar → 3-Day View → Review tasks/habits/mood → Plan integrated schedule
4. **Weekly Review**: Calendar → Week/2-Week View → Analyze patterns → Identify optimization opportunities
5. **Agenda Management**: Calendar → Agenda View → Review upcoming items → Reschedule conflicts
6. **Quick Task Scheduling**: Calendar → Task integration → Drag tasks to dates → Auto-update due dates

---

## 📊 Dashboard (Central Command Interface)

### **Progressive Disclosure Tabbed Interface**
1. **Overview Tab**: Productivity metrics with semantic color coding
2. **Today Tab**: Current day focus with immediate actions
3. **Insights Tab**: AI-generated productivity intelligence
4. **Quick Actions Tab**: Rapid data entry with full form support

### **Dashboard Implementation Patterns**

```typescript
// Dashboard State Management
interface DashboardState {
  activeTab: 'overview' | 'today' | 'insights' | 'quickActions';
  metrics: ProductivityMetrics;
  todayData: TodayFocusData;
  insights: InsightData[];
  isLoading: boolean;
  
  setActiveTab: (tab: string) => void;
  refreshMetrics: () => Promise<void>;
  refreshTodayData: () => Promise<void>;
}

// Dashboard Component
export const Dashboard: React.FC = () => {
  const { 
    activeTab, 
    metrics, 
    todayData, 
    insights,
    setActiveTab,
    refreshMetrics 
  } = useDashboardStore();

  return (
    <div className="dashboard-container">
      <DashboardTabs 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <OverviewTab metrics={metrics} />
        )}
        {activeTab === 'today' && (
          <TodayTab data={todayData} />
        )}
        {activeTab === 'insights' && (
          <InsightsTab insights={insights} />
        )}
        {activeTab === 'quickActions' && (
          <QuickActionsTab />
        )}
      </div>
    </div>
  );
};

// Widget Implementation Pattern
interface WidgetProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export const Widget: React.FC<WidgetProps> = ({ 
  title, 
  children, 
  className,
  actions 
}) => {
  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {actions && (
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        )}
      </div>
      {children}
    </Card>
  );
};
```

---

## 🧭 Navigation & Layout (Application Foundation)

### **Header Navigation Components**
- **Sidebar Toggle**: Desktop sidebar expand/collapse with keyboard shortcut (Cmd/Ctrl+\\)
- **Global Search**: Universal search with keyboard shortcut (Ctrl+K) across all data types
- **Theme Toggle**: Light/dark theme switching with system preference detection
- **User Avatar**: Profile access, settings shortcut, personalized greeting
- **Current Time Display**: Configurable time/date format with timezone support

### **Navigation Implementation Patterns**

```typescript
// Navigation Types
type ThemeOption = 'light' | 'dark' | 'system';

interface SearchResult {
  id: string;
  type: 'task' | 'habit' | 'journal' | 'event';
  title: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  createdAt: Date;
}

// Navigation State
interface NavigationState {
  sidebarOpen: boolean;
  currentRoute: string;
  searchOpen: boolean;
  theme: ThemeOption;
  
  toggleSidebar: () => void;
  setRoute: (route: string) => void;
  toggleSearch: () => void;
  setTheme: (theme: ThemeOption) => void;
}

// Global Search Component
export const GlobalSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Type-safe search with debouncing
  const debouncedQuery = useDebounce(query, 300);
  
  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: async (): Promise<SearchResult[]> => {
      if (!debouncedQuery.trim()) return [];
      return await api.search.global(debouncedQuery);
    },
    enabled: debouncedQuery.length > 2,
    staleTime: 30 * 1000, // 30 seconds
  });

  const navigateToResult = useCallback((result: SearchResult) => {
    // Type-safe navigation
    router.push(`/${result.type}/${result.id}`);
    setIsOpen(false);
  }, [router]);

  return (
    <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
      <CommandInput 
        placeholder="Search tasks, habits, journal entries..."
        value={query}
        onValueChange={setQuery}
        aria-label="Global search"
      />
      <CommandList>
        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <LoadingSpinner size="sm" />
          </div>
        )}
        {!isLoading && searchResults.length === 0 && debouncedQuery && (
          <CommandEmpty>No results found for "{debouncedQuery}"</CommandEmpty>
        )}
        {searchResults.map((result) => (
          <CommandItem
            key={`${result.type}-${result.id}`}
            onSelect={() => navigateToResult(result)}
            className="cursor-pointer"
          >
            <result.icon className="mr-2 h-4 w-4" aria-hidden="true" />
            <span>{result.title}</span>
            <CommandShortcut>{result.type}</CommandShortcut>
          </CommandItem>
        ))}
      </CommandList>
    </CommandDialog>
  );
});

// Form Handling Best Practices with React Hook Form + Zod
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Type-safe form schema
const TaskFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().optional(),
  priority: z.enum(['high', 'medium', 'low']),
  dueDate: z.date().optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).default([]),
  estimatedDuration: z.number().min(0).optional(),
});

type TaskFormData = z.infer<typeof TaskFormSchema>;

interface TaskFormProps {
  initialData?: Partial<TaskFormData>;
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel: () => void;
}

export const TaskForm = React.memo<TaskFormProps>(({ 
  initialData, 
  onSubmit, 
  onCancel 
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    watch,
  } = useForm<TaskFormData>({
    resolver: zodResolver(TaskFormSchema),
    defaultValues: {
      priority: 'medium',
      tags: [],
      ...initialData,
    },
  });

  const handleFormSubmit = useCallback(async (data: TaskFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      // Error handling is done by the parent component
      console.error('Form submission error:', error);
    }
  }, [onSubmit]);

  return (
    <form 
      onSubmit={handleSubmit(handleFormSubmit)} 
      className="space-y-4"
      noValidate
    >
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Title *
        </label>
        <input
          {...register('title')}
          id="title"
          type="text"
          className={cn(
            "w-full px-3 py-2 border rounded-md",
            errors.title ? "border-red-500" : "border-gray-300"
          )}
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? "title-error" : undefined}
        />
        {errors.title && (
          <p id="title-error" className="text-red-500 text-sm mt-1">
            {errors.title.message}
          </p>
        )}
      </div>

      <div className="flex gap-2 justify-end">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          aria-describedby="submit-status"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Saving...
            </>
          ) : (
            'Save Task'
          )}
        </Button>
      </div>
    </form>
  );
});
```

---

## 🎯 **TIER 2: DATA & INSIGHTS FEATURES**

## 🎯 Habit Tracking (Behavioral Change & Routine Building)

### **Multi-Completion System Implementation**

```typescript
// Habit Interfaces
interface Habit {
  id: string;
  name: string;
  description?: string;
  category: 'health' | 'productivity' | 'personal';
  targetType: 'boolean' | 'count' | 'duration';
  targetValue?: number;
  unit?: string;
  scheduledDays: number[]; // 0-6 for Sunday-Saturday
  reminders: Reminder[];
  createdAt: Date;
}

interface HabitCompletion {
  id: string;
  habitId: string;
  date: Date;
  value?: number;
  notes?: string;
  completedAt: Date;
}

// Habit Store
interface HabitState {
  habits: Habit[];
  completions: HabitCompletion[];
  todayCompletions: Record<string, HabitCompletion[]>;
  
  createHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => Promise<void>;
  completeHabit: (habitId: string, value?: number, notes?: string) => Promise<void>;
  getTodayProgress: (habitId: string) => number;
  getHabitStreak: (habitId: string) => number;
}

// Habit Completion Component
export const HabitCard: React.FC<{ habit: Habit }> = ({ habit }) => {
  const { completeHabit, getTodayProgress } = useHabitStore();
  const progress = getTodayProgress(habit.id);
  const isComplete = habit.targetType === 'boolean' 
    ? progress > 0 
    : progress >= (habit.targetValue || 1);

  const handleComplete = async () => {
    if (habit.targetType === 'boolean') {
      await completeHabit(habit.id);
    } else {
      // Show value input modal for count/duration habits
      // Implementation would open a modal for value entry
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">{habit.name}</h3>
          {habit.targetType !== 'boolean' && (
            <div className="mt-2">
              <Progress 
                value={(progress / (habit.targetValue || 1)) * 100} 
                className="w-full"
              />
              <p className="text-sm text-gray-600 mt-1">
                {progress} / {habit.targetValue} {habit.unit}
              </p>
            </div>
          )}
        </div>
        
        <Button
          onClick={handleComplete}
          variant={isComplete ? "default" : "outline"}
          size="sm"
          disabled={isComplete && habit.targetType === 'boolean'}
        >
          {isComplete ? (
            <Check className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </Button>
      </div>
    </Card>
  );
};
```

---

## 🎯 Implementation Priority Guidelines

### **Phase 1: Foundation (Immediate Priority)**
1. Navigation & Layout infrastructure
2. Task Management core functionality (CRUD, basic views)
3. Calendar core functionality (event management, basic views)
4. Basic Dashboard with Today tab
5. Essential Settings (theme, basic preferences)

### **Phase 2: Productivity Core (High Priority)**  
1. Calendar advanced features (all view types, cross-domain integration)
2. Dashboard Overview and Insights tabs
3. Task advanced features (categories, tags, time tracking)
4. Calendar-task integration and scheduling

### **Phase 3: Enhancement & Integration (Medium Priority)**
1. Habit Tracking with basic templates
2. Mood tracking core functionality
3. Journal functionality with templates
4. Analytics and cross-domain correlations

### **Phase 4: Advanced Features (Lower Priority)**
1. Data export/import functionality
2. Advanced analytics and AI insights
3. API access and webhook integrations
4. Advanced customization and theming options

---

## ✅ Development Standards Checklist

### **Code Quality Requirements**
- [ ] TypeScript compiles without errors or warnings
- [ ] All eslint rules pass without violations
- [ ] Code follows established patterns and conventions
- [ ] Documentation is updated to reflect changes
- [ ] Performance impact is considered and measured
- [ ] Security implications are reviewed

### **Data & Context Preservation**
- [ ] All TypeScript types and interfaces updated
- [ ] Database migrations created if schema changes
- [ ] API changes reflected in client code
- [ ] Optimistic updates with rollback implemented
- [ ] Error boundaries added for critical components
- [ ] State management follows established patterns
- [ ] Cross-domain integrations maintained

---

**This comprehensive guide serves as the authoritative reference for all Executive Dysfunction Center development. Use this document for both feature understanding and implementation guidance. Always reference this document first for accurate, complete specifications and development standards.** 