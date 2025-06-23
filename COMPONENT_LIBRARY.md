# Executive Dysfunction Center Component Library & Style Guide

## 🎨 Design System Foundation

### Color System
```css
/* CSS Custom Properties for Theme System */
:root {
  /* Primary Brand Colors */
  --color-primary-50: #eef2ff;
  --color-primary-100: #e0e7ff;
  --color-primary-500: #6366f1;
  --color-primary-600: #5855eb;
  --color-primary-700: #4338ca;
  --color-primary-900: #312e81;

  /* Secondary Colors */
  --color-secondary-50: #faf5ff;
  --color-secondary-500: #8b5cf6;
  --color-secondary-600: #7c3aed;

  /* Semantic Colors */
  --color-success-50: #ecfdf5;
  --color-success-500: #10b981;
  --color-success-600: #059669;
  
  --color-warning-50: #fffbeb;
  --color-warning-500: #f59e0b;
  --color-warning-600: #d97706;
  
  --color-error-50: #fef2f2;
  --color-error-500: #ef4444;
  --color-error-600: #dc2626;

  /* Neutral Colors */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;

  /* Dark Theme Overrides */
  --color-bg-primary: var(--color-gray-50);
  --color-bg-secondary: #ffffff;
  --color-text-primary: var(--color-gray-900);
  --color-text-secondary: var(--color-gray-700);
  --color-text-muted: var(--color-gray-500);
  --color-border: var(--color-gray-200);
  --color-border-focus: var(--color-primary-500);
}

[data-theme="dark"] {
  --color-bg-primary: #0f172a;
  --color-bg-secondary: #1e293b;
  --color-text-primary: #f1f5f9;
  --color-text-secondary: #cbd5e1;
  --color-text-muted: #64748b;
  --color-border: #334155;
}
```

### Typography Scale
```css
/* Font Family */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

:root {
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', Consolas, 'Courier New', monospace;

  /* Font Sizes */
  --text-xs: 0.75rem;      /* 12px */
  --text-sm: 0.875rem;     /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg: 1.125rem;     /* 18px */
  --text-xl: 1.25rem;      /* 20px */
  --text-2xl: 1.5rem;      /* 24px */
  --text-3xl: 1.875rem;    /* 30px */
  --text-4xl: 2.25rem;     /* 36px */

  /* Line Heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;

  /* Font Weights */
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

### Spacing System
```css
:root {
  /* Spacing Scale (based on 4px grid) */
  --space-0: 0;
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  --space-24: 6rem;     /* 96px */

  /* Border Radius */
  --radius-none: 0;
  --radius-sm: 0.25rem;   /* 4px */
  --radius-md: 0.375rem;  /* 6px */
  --radius-lg: 0.5rem;    /* 8px */
  --radius-xl: 0.75rem;   /* 12px */
  --radius-2xl: 1rem;     /* 16px */
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
}
```

## 🧩 Base Components

### Button Component
```typescript
// components/ui/Button.tsx
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from '@radix-ui/react-slot';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary-500 text-white hover:bg-primary-600",
        destructive: "bg-error-500 text-white hover:bg-error-600",
        outline: "border border-gray-300 bg-transparent hover:bg-gray-50",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
        ghost: "hover:bg-gray-100 hover:text-gray-900",
        link: "text-primary-500 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

### Input Component
```typescript
// components/ui/Input.tsx
import React from 'react';
import { cn } from '@/utils/cn';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error && "border-error-500 focus:ring-error-500",
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-error-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
```

### Card Component
```typescript
// components/ui/Card.tsx
import React from 'react';
import { cn } from '@/utils/cn';

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border border-gray-200 bg-white shadow-sm",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  >
    {children}
  </h3>
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-500", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
```

## 🎯 Feature Components

### Task Card Component
```typescript
// components/features/tasks/TaskCard.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/Checkbox';
import { Clock, Calendar, Tag, Play, Pause } from 'lucide-react';
import { Task } from '@/types/task';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onStartTimer: (taskId: string) => void;
  onStopTimer: (taskId: string) => void;
  isTimerActive?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onStartTimer,
  onStopTimer,
  isTimerActive = false,
}) => {
  const priorityColors = {
    high: 'bg-error-100 text-error-800 border-error-200',
    medium: 'bg-warning-100 text-warning-800 border-warning-200',
    low: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const formatTimeEstimate = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      task.completed ? 'opacity-75 bg-gray-50' : ''
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={task.completed}
            onCheckedChange={() => onToggleComplete(task.id)}
            className="mt-1"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                variant="outline" 
                className={priorityColors[task.priority]}
              >
                {task.priority}
              </Badge>
              
              {task.category && (
                <Badge variant="secondary">
                  {task.category.name}
                </Badge>
              )}
            </div>
            
            <h3 className={`font-medium mb-1 ${
              task.completed ? 'line-through text-gray-500' : 'text-gray-900'
            }`}>
              {task.title}
            </h3>
            
            {task.description && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {task.description}
              </p>
            )}
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              {task.due_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(task.due_date).toLocaleDateString()}</span>
                </div>
              )}
              
              {task.estimated_minutes && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatTimeEstimate(task.estimated_minutes)}</span>
                </div>
              )}
              
              {task.tags && task.tags.length > 0 && (
                <div className="flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  <span>{task.tags.length} tags</span>
                </div>
              )}
            </div>
            
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {task.tags.map((tag) => (
                  <Badge key={tag.id} variant="outline" className="text-xs">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          {!task.completed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => isTimerActive ? onStopTimer(task.id) : onStartTimer(task.id)}
              className={isTimerActive ? 'text-error-600' : 'text-gray-400'}
            >
              {isTimerActive ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
```

### Habit Card Component
```typescript
// components/features/habits/HabitCard.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Flame, Target, Calendar } from 'lucide-react';
import { Habit, HabitCompletion } from '@/types/habit';

interface HabitCardProps {
  habit: Habit;
  todayCompletion?: HabitCompletion;
  streak: number;
  onLogCompletion: (habitId: string, value?: number) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  todayCompletion,
  streak,
  onLogCompletion,
}) => {
  const categoryColors = {
    health: 'bg-success-100 text-success-800',
    productivity: 'bg-primary-100 text-primary-800',
    personal: 'bg-secondary-100 text-secondary-800',
  };

  const getCompletionProgress = () => {
    if (!todayCompletion) return 0;
    
    switch (habit.completion_type) {
      case 'boolean':
        return todayCompletion.completed ? 100 : 0;
      case 'count':
        return Math.min((todayCompletion.completion_value || 0) / habit.target_value * 100, 100);
      case 'duration':
        return Math.min((todayCompletion.completion_value || 0) / habit.target_value * 100, 100);
      default:
        return 0;
    }
  };

  const getTargetText = () => {
    switch (habit.completion_type) {
      case 'boolean':
        return 'Complete';
      case 'count':
        return `${habit.target_value} ${habit.target_unit || 'times'}`;
      case 'duration':
        return `${habit.target_value} ${habit.target_unit || 'minutes'}`;
      default:
        return 'Complete';
    }
  };

  const getCurrentText = () => {
    if (!todayCompletion) return '0';
    
    switch (habit.completion_type) {
      case 'boolean':
        return todayCompletion.completed ? 'Done' : 'Not done';
      case 'count':
      case 'duration':
        return `${todayCompletion.completion_value || 0}`;
      default:
        return '0';
    }
  };

  const progress = getCompletionProgress();
  const isCompleted = progress >= 100;

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      isCompleted ? 'ring-2 ring-success-200 bg-success-50' : ''
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{habit.icon || '🎯'}</span>
            <div>
              <h3 className="font-medium text-gray-900">{habit.name}</h3>
              <Badge className={categoryColors[habit.category]}>
                {habit.category}
              </Badge>
            </div>
          </div>
          
          {streak > 0 && (
            <div className="flex items-center gap-1 text-orange-600">
              <Flame className="h-4 w-4" />
              <span className="font-semibold">{streak}</span>
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-gray-600">
              <Target className="h-4 w-4" />
              <span>Target: {getTargetText()}</span>
            </div>
            <span className="font-medium text-gray-900">
              {getCurrentText()}
            </span>
          </div>
          
          <Progress value={progress} className="h-2" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              <span>{habit.frequency_type} • {habit.target_frequency}x</span>
            </div>
            
            {!isCompleted && (
              <Button
                size="sm"
                onClick={() => onLogCompletion(habit.id)}
                className="h-7 px-3 text-xs"
              >
                {habit.completion_type === 'boolean' ? 'Mark Done' : 'Log'}
              </Button>
            )}
            
            {isCompleted && (
              <Badge variant="default" className="bg-success-500">
                ✓ Complete
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
```

### Mood Selector Component
```typescript
// components/features/mood/MoodSelector.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/Slider';
import { Badge } from '@/components/ui/Badge';

interface MoodSelectorProps {
  primaryMood: number;
  secondaryMood?: number;
  energyLevel: number;
  stressLevel: number;
  selectedTriggers: string[];
  onPrimaryMoodChange: (value: number) => void;
  onSecondaryMoodChange: (value: number) => void;
  onEnergyLevelChange: (value: number) => void;
  onStressLevelChange: (value: number) => void;
  onTriggerToggle: (trigger: string) => void;
}

const moodEmojis = ['😢', '😔', '😐', '🙂', '😊'];
const moodLabels = ['Very Low', 'Low', 'Neutral', 'Good', 'Excellent'];

const secondaryMoodEmojis = ['😰', '😴', '😤', '😎', '🤗'];
const secondaryMoodLabels = ['Anxious', 'Tired', 'Frustrated', 'Confident', 'Excited'];

const moodTriggers = [
  { id: 'work', label: 'Work', icon: '🏢' },
  { id: 'social', label: 'Social', icon: '👥' },
  { id: 'health', label: 'Health', icon: '💪' },
  { id: 'personal', label: 'Personal', icon: '🏠' },
  { id: 'weather', label: 'Weather', icon: '☀️' },
  { id: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
  { id: 'finance', label: 'Finance', icon: '💰' },
  { id: 'exercise', label: 'Exercise', icon: '🏃‍♂️' },
];

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  primaryMood,
  secondaryMood = 3,
  energyLevel,
  stressLevel,
  selectedTriggers,
  onPrimaryMoodChange,
  onSecondaryMoodChange,
  onEnergyLevelChange,
  onStressLevelChange,
  onTriggerToggle,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">😊</span>
          How are you feeling today?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Primary Mood */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">
            Primary Mood
          </label>
          <div className="flex items-center justify-between px-2">
            {moodEmojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => onPrimaryMoodChange(index + 1)}
                className={`text-3xl transition-transform hover:scale-110 ${
                  primaryMood === index + 1 ? 'scale-125' : 'opacity-60'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
          <Slider
            value={[primaryMood]}
            onValueChange={([value]) => onPrimaryMoodChange(value)}
            max={5}
            min={1}
            step={1}
            className="w-full"
          />
          <p className="text-center text-sm text-gray-600">
            {moodLabels[primaryMood - 1]} ({primaryMood}/5)
          </p>
        </div>

        {/* Secondary Mood */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">
            Secondary Mood (Optional)
          </label>
          <div className="flex items-center justify-between px-2">
            {secondaryMoodEmojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => onSecondaryMoodChange(index + 1)}
                className={`text-2xl transition-transform hover:scale-110 ${
                  secondaryMood === index + 1 ? 'scale-125' : 'opacity-60'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
          <p className="text-center text-sm text-gray-600">
            {secondaryMoodLabels[secondaryMood - 1]} ({secondaryMood}/5)
          </p>
        </div>

        {/* Energy Level */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">
            Energy Level
          </label>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 w-8">Low</span>
            <Slider
              value={[energyLevel]}
              onValueChange={([value]) => onEnergyLevelChange(value)}
              max={10}
              min={1}
              step={1}
              className="flex-1"
            />
            <span className="text-sm text-gray-500 w-8">High</span>
          </div>
          <p className="text-center text-sm text-gray-600">
            Energy Level: {energyLevel}/10
          </p>
        </div>

        {/* Stress Level */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">
            Stress Level
          </label>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 w-8">Low</span>
            <Slider
              value={[stressLevel]}
              onValueChange={([value]) => onStressLevelChange(value)}
              max={10}
              min={1}
              step={1}
              className="flex-1"
            />
            <span className="text-sm text-gray-500 w-8">High</span>
          </div>
          <p className="text-center text-sm text-gray-600">
            Stress Level: {stressLevel}/10
          </p>
        </div>

        {/* Mood Triggers */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">
            What triggered this mood? (Optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {moodTriggers.map((trigger) => (
              <Badge
                key={trigger.id}
                variant={selectedTriggers.includes(trigger.id) ? "default" : "outline"}
                className="cursor-pointer transition-colors hover:bg-primary-100"
                onClick={() => onTriggerToggle(trigger.id)}
              >
                <span className="mr-1">{trigger.icon}</span>
                {trigger.label}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
```

## 📊 Data Visualization Components

### Progress Ring Component
```typescript
// components/ui/ProgressRing.tsx
import React from 'react';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showText?: boolean;
  children?: React.ReactNode;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  color = '#6366f1',
  backgroundColor = '#e5e7eb',
  showText = true,
  children,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (showText && (
          <span className="text-lg font-semibold text-gray-900">
            {Math.round(progress)}%
          </span>
        ))}
      </div>
    </div>
  );
};
```

### Streak Calendar Component
```typescript
// components/features/habits/StreakCalendar.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface StreakCalendarProps {
  data: Array<{
    date: string;
    completed: boolean;
    value?: number;
  }>;
  title?: string;
}

export const StreakCalendar: React.FC<StreakCalendarProps> = ({
  data,
  title = "Activity Calendar"
}) => {
  const getDayColor = (completed: boolean, value?: number) => {
    if (!completed) return 'bg-gray-100';
    
    if (value !== undefined) {
      // Color intensity based on value
      if (value >= 100) return 'bg-success-600';
      if (value >= 75) return 'bg-success-500';
      if (value >= 50) return 'bg-success-400';
      if (value >= 25) return 'bg-success-300';
      return 'bg-success-200';
    }
    
    return 'bg-success-500';
  };

  // Generate calendar grid for last 12 weeks
  const generateCalendarData = () => {
    const weeks = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 83); // 12 weeks ago

    for (let week = 0; week < 12; week++) {
      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + (week * 7) + day);
        
        const dateString = currentDate.toISOString().split('T')[0];
        const dayData = data.find(d => d.date === dateString);
        
        weekDays.push({
          date: currentDate,
          dateString,
          completed: dayData?.completed || false,
          value: dayData?.value,
        });
      }
      weeks.push(weekDays);
    }
    
    return weeks;
  };

  const weeks = generateCalendarData();
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Day labels */}
          <div className="grid grid-cols-7 gap-1 text-xs text-gray-500 mb-2">
            {dayLabels.map(label => (
              <div key={label} className="text-center font-medium">
                {label}
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="space-y-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-1">
                {week.map((day, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`
                      w-4 h-4 rounded-sm cursor-pointer transition-colors
                      ${getDayColor(day.completed, day.value)}
                      hover:ring-2 hover:ring-gray-300
                    `}
                    title={`${day.date.toLocaleDateString()}: ${
                      day.completed 
                        ? `Completed${day.value ? ` (${day.value})` : ''}`
                        : 'Not completed'
                    }`}
                  />
                ))}
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-between text-xs text-gray-500 mt-4">
            <span>Less</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-gray-100" />
              <div className="w-3 h-3 rounded-sm bg-success-200" />
              <div className="w-3 h-3 rounded-sm bg-success-300" />
              <div className="w-3 h-3 rounded-sm bg-success-400" />
              <div className="w-3 h-3 rounded-sm bg-success-500" />
              <div className="w-3 h-3 rounded-sm bg-success-600" />
            </div>
            <span>More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
```

## 🎨 Layout Components

### Dashboard Grid Component
```typescript
// components/layout/DashboardGrid.tsx
import React from 'react';
import { cn } from '@/utils/cn';

interface DashboardGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: number;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  children,
  className,
  columns = 3,
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return (
    <div className={cn(
      'grid gap-6',
      gridCols[columns as keyof typeof gridCols] || gridCols[3],
      className
    )}>
      {children}
    </div>
  );
};

// Dashboard widget wrapper
interface DashboardWidgetProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  title,
  subtitle,
  action,
  children,
  className,
}) => {
  return (
    <Card className={cn('h-fit', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          {action}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  );
};
```

## 🎭 Animation & Transition Components

### Fade In Animation
```typescript
// components/ui/FadeIn.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  duration = 0.5,
  direction = 'up',
}) => {
  const directions = {
    up: { y: 20, x: 0 },
    down: { y: -20, x: 0 },
    left: { y: 0, x: 20 },
    right: { y: 0, x: -20 },
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        ...directions[direction],
      }}
      animate={{
        opacity: 1,
        y: 0,
        x: 0,
      }}
      transition={{
        duration,
        delay,
        ease: 'easeOut',
      }}
    >
      {children}
    </motion.div>
  );
};
```

This component library provides a comprehensive foundation for building the Executive Dysfunction Center frontend with consistent design patterns, reusable components, and smooth animations. Each component is built with accessibility, performance, and maintainability in mind.