# Frontend Phase 3: Advanced Features Implementation Prompt

## 🎯 Phase 3 Objective

Implement advanced productivity features including sophisticated task management (categories, tags, time tracking, subtasks), enhanced habit tracking (templates, analytics), detailed mood tracking (triggers, patterns), and full calendar integration. This phase transforms the basic app into a comprehensive productivity platform.

## 📋 Phase 3 Implementation Checklist

### 3.1 Advanced Task Management
- [ ] Implement task categories system with color coding
- [ ] Build tag management with autocomplete and suggestions
- [ ] Create time tracking with start/stop timers
- [ ] Implement subtask creation and hierarchy management
- [ ] Build recurrence pattern system for recurring tasks
- [ ] Add bulk operations (select multiple, batch actions)
- [ ] Implement task templates for common workflows
- [ ] Create advanced filtering and sorting options
- [ ] Add task dependencies and blocking relationships
- [ ] Build task notes and file attachment system

### 3.2 Enhanced Habit Tracking
- [ ] Implement habit template library with pre-built habits
- [ ] Create flexible target system (daily, weekly, custom)
- [ ] Build completion type system (boolean, count, duration)
- [ ] Implement advanced streak analytics and visualizations
- [ ] Add habit reminders and notification system
- [ ] Create habit categories and grouping
- [ ] Build habit sharing and community features
- [ ] Implement habit insights and recommendations
- [ ] Add habit archiving and restoration
- [ ] Create habit import/export functionality

### 3.3 Detailed Mood Tracking
- [ ] Implement multi-dimensional mood tracking (energy, stress)
- [ ] Create mood trigger system with custom triggers
- [ ] Build context tracking (location, weather, activities)
- [ ] Implement mood pattern analysis and insights
- [ ] Add correlation analysis between mood and other metrics
- [ ] Create mood journaling with rich text editor
- [ ] Build mood photo capture and attachment
- [ ] Implement mood sharing and privacy controls
- [ ] Add mood goals and improvement tracking
- [ ] Create mood export for healthcare providers

### 3.4 Full Calendar Integration
- [ ] Implement multiple calendar views (day, week, month, agenda)
- [ ] Create recurring events with RRULE support
- [ ] Build event conflict detection and resolution
- [ ] Implement calendar task integration and deadline overlay
- [ ] Add calendar sharing and collaboration features
- [ ] Create time blocking and scheduling assistance
- [ ] Build calendar sync with external calendars
- [ ] Implement meeting scheduling and availability
- [ ] Add calendar notifications and reminders
- [ ] Create calendar analytics and time insights

### 3.5 Data Visualization & Analytics
- [ ] Build comprehensive analytics dashboard
- [ ] Implement interactive charts and graphs
- [ ] Create custom date range selection
- [ ] Build correlation analysis between different metrics
- [ ] Implement trend analysis and forecasting
- [ ] Add data export in multiple formats
- [ ] Create automated insights and recommendations
- [ ] Build performance comparison and benchmarking
- [ ] Implement goal setting and progress tracking
- [ ] Add data visualization customization

### 3.6 Advanced User Experience
- [ ] Implement keyboard shortcuts and power user features
- [ ] Create customizable dashboard layouts
- [ ] Build dark mode with multiple theme options
- [ ] Implement progressive web app features
- [ ] Add offline functionality with sync
- [ ] Create advanced search with natural language
- [ ] Build accessibility improvements (WCAG 2.1 AA)
- [ ] Implement internationalization (i18n) support
- [ ] Add user onboarding and guided tours
- [ ] Create help system and documentation

## 🚀 Detailed Implementation Instructions

### Advanced Task Categories System

```typescript
// src/components/tasks/categories/CategoryManager.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { IconPicker } from '@/components/ui/IconPicker';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/Dialog';
import { Plus, Edit, Trash2, Palette, Hash } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '@/services/tasks';

export const CategoryManager: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['task-categories'],
    queryFn: tasksApi.getCategories,
  });

  const createCategoryMutation = useMutation({
    mutationFn: tasksApi.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-categories'] });
      setIsCreateDialogOpen(false);
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: tasksApi.updateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-categories'] });
      setEditingCategory(null);
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: tasksApi.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-categories'] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Task Categories</h2>
          <p className="text-muted-foreground">
            Organize your tasks with custom categories
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <CategoryForm 
              onSuccess={() => setIsCreateDialogOpen(false)}
              mutation={createCategoryMutation}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories?.map((category) => (
          <Card key={category.id} className="relative group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <CardTitle className="text-base">{category.name}</CardTitle>
                  {category.icon && (
                    <span className="text-lg">{category.icon}</span>
                  )}
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setEditingCategory(category)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteCategoryMutation.mutate(category.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tasks</span>
                  <Badge variant="secondary">{category.task_count || 0}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="font-medium">
                    {category.completed_tasks || 0}/{category.task_count || 0}
                  </span>
                </div>
                {category.task_count > 0 && (
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all"
                      style={{ 
                        backgroundColor: category.color,
                        width: `${((category.completed_tasks || 0) / (category.task_count || 1)) * 100}%`
                      }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Category Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
        <DialogContent>
          <CategoryForm 
            category={editingCategory}
            onSuccess={() => setEditingCategory(null)}
            mutation={updateCategoryMutation}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface CategoryFormProps {
  category?: Category | null;
  onSuccess: () => void;
  mutation: any;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ category, onSuccess, mutation }) => {
  const [name, setName] = useState(category?.name || '');
  const [color, setColor] = useState(category?.color || '#6366f1');
  const [icon, setIcon] = useState(category?.icon || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const categoryData = {
      name: name.trim(),
      color,
      icon: icon.trim() || null,
    };

    if (category) {
      mutation.mutate({ id: category.id, ...categoryData });
    } else {
      mutation.mutate(categoryData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">
          {category ? 'Edit Category' : 'Create Category'}
        </h3>
        <p className="text-sm text-muted-foreground">
          Categories help organize and prioritize your tasks
        </p>
      </div>

      <div className="space-y-4">
        <Input
          label="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter category name..."
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Color</label>
            <ColorPicker value={color} onChange={setColor} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Icon (Optional)</label>
            <IconPicker value={icon} onChange={setIcon} />
          </div>
        </div>

        {/* Preview */}
        <div className="p-3 border rounded-lg bg-muted/50">
          <p className="text-sm font-medium mb-2">Preview</p>
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="font-medium">{name || 'Category Name'}</span>
            {icon && <span className="text-lg">{icon}</span>}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={!name.trim() || mutation.isPending}>
          {mutation.isPending ? 'Saving...' : category ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};
```

### Time Tracking System

```typescript
// src/components/tasks/time-tracking/TimeTracker.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Play, Pause, Square, Clock, Calendar } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '@/services/tasks';
import { formatDuration, formatTime } from '@/utils/time';

export const TimeTracker: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const queryClient = useQueryClient();

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: activeTimer } = useQuery({
    queryKey: ['time-entries', 'active'],
    queryFn: tasksApi.getActiveTimeEntry,
    refetchInterval: 1000, // Refetch every second for live updates
  });

  const { data: todayEntries } = useQuery({
    queryKey: ['time-entries', 'today'],
    queryFn: () => tasksApi.getTimeEntries({ 
      date: new Date().toISOString().split('T')[0] 
    }),
  });

  const startTimerMutation = useMutation({
    mutationFn: tasksApi.startTimeEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
    },
  });

  const stopTimerMutation = useMutation({
    mutationFn: tasksApi.stopTimeEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const getElapsedTime = () => {
    if (!activeTimer) return 0;
    return Math.floor((currentTime.getTime() - new Date(activeTimer.start_time).getTime()) / 1000);
  };

  const todayTotal = todayEntries?.reduce((total, entry) => {
    const duration = entry.end_time 
      ? Math.floor((new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime()) / 1000)
      : 0;
    return total + duration;
  }, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Active Timer */}
      {activeTimer && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Active Timer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{activeTimer.task.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Started at {formatTime(activeTimer.start_time)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-mono font-bold text-primary">
                    {formatDuration(getElapsedTime())}
                  </div>
                  <p className="text-sm text-muted-foreground">Elapsed time</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => stopTimerMutation.mutate(activeTimer.id)}
                  disabled={stopTimerMutation.isPending}
                  className="flex-1"
                >
                  <Square className="mr-2 h-4 w-4" />
                  Stop Timer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{formatDuration(todayTotal)}</div>
              <p className="text-sm text-muted-foreground">Total time</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{todayEntries?.length || 0}</div>
              <p className="text-sm text-muted-foreground">Sessions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Entries */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Today's Time Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {todayEntries?.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No time entries for today
              </p>
            ) : (
              todayEntries?.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{entry.task.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(entry.start_time)} - {entry.end_time ? formatTime(entry.end_time) : 'Active'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-semibold">
                      {entry.end_time 
                        ? formatDuration(Math.floor((new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime()) / 1000))
                        : formatDuration(getElapsedTime())
                      }
                    </div>
                    {entry.task.category && (
                      <Badge variant="outline" className="text-xs">
                        {entry.task.category.name}
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            );
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
```

### Habit Template System

```typescript
// src/components/habits/templates/HabitTemplateLibrary.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/Dialog';
import { Search, Filter, Star, Clock, Target, Zap } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { habitsApi } from '@/services/habits';

export const HabitTemplateLibrary: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<HabitTemplate | null>(null);
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ['habit-templates', { search: searchQuery, category: selectedCategory }],
    queryFn: () => habitsApi.getTemplates({
      search: searchQuery || undefined,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
    }),
  });

  const createFromTemplateMutation = useMutation({
    mutationFn: habitsApi.createFromTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      setSelectedTemplate(null);
    },
  });

  const categories = [
    { id: 'all', name: 'All Templates', icon: '📚' },
    { id: 'health', name: 'Health & Fitness', icon: '💪' },
    { id: 'productivity', name: 'Productivity', icon: '🧠' },
    { id: 'personal', name: 'Personal Development', icon: '🌱' },
    { id: 'social', name: 'Social & Relationships', icon: '🤝' },
    { id: 'creative', name: 'Creative', icon: '🎨' },
    { id: 'mindfulness', name: 'Mindfulness', icon: '🧘' },
  ];

  const filteredTemplates = templates?.filter(template => {
    const matchesSearch = !searchQuery || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Habit Templates</h2>
          <p className="text-muted-foreground">
            Start with proven habit patterns from our library
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-7">
          {categories.map((category) => (
            <TabsTrigger 
              key={category.id} 
              value={category.id}
              className="flex items-center gap-1 text-xs"
            >
              <span>{category.icon}</span>
              <span className="hidden sm:inline">{category.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {filteredTemplates?.map((template) => (
            <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{template.icon}</span>
                    <div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {template.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3" />
                    <span>{template.popularity_score}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {template.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      <span>{template.target_value} {template.target_unit}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{template.frequency_type}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      <span>{template.difficulty_level}</span>
                    </div>
                  </div>

                  {template.tags && template.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {template.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setSelectedTemplate(template)}
                      >
                        Use Template
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <HabitTemplatePreview 
                        template={template}
                        onUse={(customizedHabit) => {
                          createFromTemplateMutation.mutate({
                            templateId: template.id,
                            customization: customizedHabit,
                          });
                        }}
                        onCancel={() => setSelectedTemplate(null)}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Tabs>
    </div>
  );
};

interface HabitTemplatePreviewProps {
  template: HabitTemplate;
  onUse: (customization: any) => void;
  onCancel: () => void;
}

const HabitTemplatePreview: React.FC<HabitTemplatePreviewProps> = ({
  template,
  onUse,
  onCancel,
}) => {
  const [name, setName] = useState(template.name);
  const [targetValue, setTargetValue] = useState(template.target_value);
  const [reminderTime, setReminderTime] = useState('');

  const handleUse = () => {
    onUse({
      name,
      target_value: targetValue,
      reminder_time: reminderTime || null,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span className="text-2xl">{template.icon}</span>
          Create Habit from Template
        </h3>
        <p className="text-sm text-muted-foreground">{template.description}</p>
      </div>

      <div className="space-y-4">
        <Input
          label="Habit Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter habit name..."
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label={`Target (${template.target_unit})`}
            type="number"
            value={targetValue}
            onChange={(e) => setTargetValue(Number(e.target.value))}
            min="1"
          />

          <Input
            label="Reminder Time (Optional)"
            type="time"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
          />
        </div>

        <div className="p-3 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Template Details</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Category:</span>
              <span className="ml-2 capitalize">{template.category}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Frequency:</span>
              <span className="ml-2 capitalize">{template.frequency_type}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Type:</span>
              <span className="ml-2 capitalize">{template.completion_type}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Difficulty:</span>
              <span className="ml-2 capitalize">{template.difficulty_level}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleUse} disabled={!name.trim()}>
          Create Habit
        </Button>
      </div>
    </div>
  );
};
```

### Mood Pattern Analysis

```typescript
// src/components/mood/patterns/MoodPatternAnalysis.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TrendingUp, TrendingDown, Calendar, Clock, MapPin, Cloud } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { moodApi } from '@/services/mood';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, HeatMap } from 'recharts';

export const MoodPatternAnalysis: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30');
  const [analysisType, setAnalysisType] = useState('trends');

  const { data: patterns } = useQuery({
    queryKey: ['mood-patterns', timeRange],
    queryFn: () => moodApi.getPatterns({ days: parseInt(timeRange) }),
  });

  const { data: correlations } = useQuery({
    queryKey: ['mood-correlations', timeRange],
    queryFn: () => moodApi.getCorrelations({ days: parseInt(timeRange) }),
  });

  const { data: insights } = useQuery({
    queryKey: ['mood-insights', timeRange],
    queryFn: () => moodApi.getInsights({ days: parseInt(timeRange) }),
  });

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center gap-4">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>

        <Select value={analysisType} onValueChange={setAnalysisType}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="trends">Trends</SelectItem>
            <SelectItem value="correlations">Correlations</SelectItem>
            <SelectItem value="patterns">Patterns</SelectItem>
            <SelectItem value="insights">Insights</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Analysis Content */}
      {analysisType === 'trends' && (
        <div className="space-y-6">
          {/* Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Mood Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={patterns?.daily_trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[1, 5]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="mood_score" 
                      stroke="#6366f1" 
                      strokeWidth={2}
                      dot={{ fill: '#6366f1' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="energy_level" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ fill: '#10b981' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="stress_level" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      dot={{ fill: '#ef4444' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded-full" />
                  <span>Mood Score</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-success-500 rounded-full" />
                  <span>Energy Level</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-error-500 rounded-full" />
                  <span>Stress Level</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trend Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-success-500" />
                  <span className="font-medium">Overall Mood</span>
                </div>
                <div className="text-2xl font-bold">{patterns?.overall_trend?.mood || 0}%</div>
                <p className="text-sm text-muted-foreground">
                  {patterns?.overall_trend?.mood > 0 ? 'Improving' : 'Declining'} trend
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="font-medium">Energy Level</span>
                </div>
                <div className="text-2xl font-bold">{patterns?.overall_trend?.energy || 0}%</div>
                <p className="text-sm text-muted-foreground">
                  {patterns?.overall_trend?.energy > 0 ? 'Increasing' : 'Decreasing'} trend
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-error-500" />
                  <span className="font-medium">Stress Level</span>
                </div>
                <div className="text-2xl font-bold">{patterns?.overall_trend?.stress || 0}%</div>
                <p className="text-sm text-muted-foreground">
                  {patterns?.overall_trend?.stress > 0 ? 'Increasing' : 'Decreasing'} trend
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {analysisType === 'correlations' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mood Correlations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {correlations?.map((correlation, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {correlation.type === 'weather' && <Cloud className="h-6 w-6" />}
                        {correlation.type === 'time' && <Clock className="h-6 w-6" />}
                        {correlation.type === 'location' && <MapPin className="h-6 w-6" />}
                        {correlation.type === 'activity' && <Calendar className="h-6 w-6" />}
                      </div>
                      <div>
                        <h4 className="font-medium">{correlation.factor}</h4>
                        <p className="text-sm text-muted-foreground">
                          {correlation.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={Math.abs(correlation.strength) > 0.7 ? 'default' : 'secondary'}
                      >
                        {correlation.strength > 0 ? '+' : ''}{(correlation.strength * 100).toFixed(0)}%
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {Math.abs(correlation.strength) > 0.7 ? 'Strong' : 
                         Math.abs(correlation.strength) > 0.4 ? 'Moderate' : 'Weak'} correlation
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {analysisType === 'insights' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights?.map((insight, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{insight.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{insight.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {insight.description}
                        </p>
                        {insight.recommendations && (
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Recommendations:</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {insight.recommendations.map((rec, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span>•</span>
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <Badge variant={insight.priority === 'high' ? 'destructive' : 'secondary'}>
                        {insight.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
```

## 🧪 Advanced Testing Strategy

### Integration Testing

```typescript
// src/__tests__/integration/task-management.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { TasksPage } from '@/components/tasks/TasksPage';
import { server } from '@/mocks/server';
import { rest } from 'msw';

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

describe('Task Management Integration', () => {
  beforeEach(() => {
    server.use(
      rest.get('/tasks', (req, res, ctx) => {
        return res(ctx.json([
          {
            id: '1',
            title: 'Test Task',
            description: 'Test Description',
            priority: 'medium',
            completed: false,
            category: { id: '1', name: 'Work', color: '#6366f1' },
            tags: [{ id: '1', name: 'urgent' }],
            created_at: new Date().toISOString(),
          },
        ]));
      }),
      rest.get('/tasks/categories', (req, res, ctx) => {
        return res(ctx.json([
          { id: '1', name: 'Work', color: '#6366f1', task_count: 5 },
          { id: '2', name: 'Personal', color: '#10b981', task_count: 3 },
        ]));
      })
    );
  });

  it('should complete full task workflow', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TasksPage />);

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });

    // Filter by category
    const categoryFilter = screen.getByDisplayValue('All Tasks');
    await user.click(categoryFilter);
    await user.click(screen.getByText('Work'));

    // Search for task
    const searchInput = screen.getByPlaceholderText('Search tasks...');
    await user.type(searchInput, 'Test');

    // Create new task
    await user.click(screen.getByText('Add Task'));
    
    const titleInput = screen.getByLabelText('Title');
    await user.type(titleInput, 'New Test Task');
    
    const prioritySelect = screen.getByDisplayValue('Medium');
    await user.click(prioritySelect);
    await user.click(screen.getByText('High'));
    
    await user.click(screen.getByText('Create Task'));

    // Verify task was created
    await waitFor(() => {
      expect(screen.getByText('New Test Task')).toBeInTheDocument();
    });
  });
});
```

## ✅ Phase 3 Success Criteria

### Advanced Feature Requirements
- [ ] Complete task category system with visual organization
- [ ] Sophisticated time tracking with detailed analytics
- [ ] Comprehensive habit template library with customization
- [ ] Multi-dimensional mood tracking with pattern analysis
- [ ] Full calendar integration with task synchronization
- [ ] Advanced data visualization with interactive charts
- [ ] Robust search and filtering across all features
- [ ] Bulk operations for efficient task management

### User Experience Requirements
- [ ] Intuitive workflows for complex operations
- [ ] Keyboard shortcuts for power users
- [ ] Contextual help and guided tours
- [ ] Smooth animations and micro-interactions
- [ ] Responsive design optimization
- [ ] Accessibility compliance (WCAG 2.1 AA)
- [ ] Progressive web app capabilities
- [ ] Offline functionality with sync

### Performance Requirements
- [ ] Fast initial page load (< 3 seconds)
- [ ] Smooth interactions (< 100ms response)
- [ ] Efficient data loading with caching
- [ ] Optimized bundle sizes
- [ ] Memory usage optimization
- [ ] Battery usage consideration (mobile)

## 🚀 Phase 3 Deliverables

1. **Advanced Task Management**: Categories, tags, time tracking, subtasks
2. **Enhanced Habit System**: Templates, analytics, flexible tracking
3. **Sophisticated Mood Analysis**: Patterns, correlations, insights
4. **Complete Calendar Integration**: Multi-view, scheduling, conflicts
5. **Data Visualization Suite**: Charts, graphs, analytics dashboards
6. **Advanced UI Components**: Complex forms, interactive elements
7. **Performance Optimization**: Caching, lazy loading, bundle optimization
8. **Comprehensive Testing**: Unit, integration, and e2e tests

Upon completion of Phase 3, Executive Dysfunction Center will be a sophisticated productivity platform with advanced features rivaling commercial productivity applications.