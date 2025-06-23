# Frontend Phase 4: Analytics, Polish & Production Readiness Prompt

## 🎯 Phase 4 Objective

Transform Meh-trics into a production-ready, polished productivity platform with comprehensive analytics, AI-driven insights, performance optimization, accessibility compliance, and enterprise-grade features. This phase focuses on refinement, optimization, and preparing for real-world deployment.

## 📋 Phase 4 Implementation Checklist

### 4.1 Advanced Analytics & AI Insights
- [ ] Build comprehensive analytics dashboard with customizable widgets
- [ ] Implement AI-powered productivity insights and recommendations
- [ ] Create predictive analytics for habit success and task completion
- [ ] Build cross-metric correlation analysis (mood vs productivity)
- [ ] Implement goal setting with SMART goal framework
- [ ] Create personal productivity scoring algorithm
- [ ] Build trend forecasting and pattern prediction
- [ ] Add benchmarking against personal and anonymized data
- [ ] Implement automated coaching suggestions
- [ ] Create productivity report generation (daily/weekly/monthly)

### 4.2 Performance Optimization & Scalability
- [ ] Implement code splitting and lazy loading for all routes
- [ ] Add virtual scrolling for large data sets
- [ ] Implement service worker for offline functionality
- [ ] Build intelligent caching strategies with cache invalidation
- [ ] Add image optimization and lazy loading
- [ ] Implement bundle size optimization and tree shaking
- [ ] Add memory leak detection and prevention
- [ ] Build performance monitoring and metrics collection
- [ ] Implement error boundary optimization
- [ ] Add progressive web app features

### 4.3 Accessibility & Internationalization
- [ ] Implement WCAG 2.1 AA compliance across all components
- [ ] Add comprehensive keyboard navigation
- [ ] Build screen reader optimization with ARIA labels
- [ ] Implement focus management and skip links
- [ ] Add high contrast mode and visual accessibility features
- [ ] Build internationalization (i18n) framework
- [ ] Add support for multiple languages (English, Spanish, French, German)
- [ ] Implement RTL (right-to-left) language support
- [ ] Add cultural date/time format adaptation
- [ ] Build accessibility testing automation

### 4.4 Advanced User Experience
- [ ] Implement advanced onboarding with progressive disclosure
- [ ] Build contextual help system with interactive tours
- [ ] Add personalization engine for dashboard customization
- [ ] Implement command palette for power users
- [ ] Build advanced search with natural language processing
- [ ] Add undo/redo functionality for all actions
- [ ] Implement drag-and-drop interfaces
- [ ] Build collaborative features and data sharing
- [ ] Add export/import functionality for data portability
- [ ] Create advanced notification system

### 4.5 Security & Privacy
- [ ] Implement comprehensive input validation and sanitization
- [ ] Add XSS and CSRF protection
- [ ] Build data encryption for sensitive information
- [ ] Implement secure session management
- [ ] Add privacy controls and data export
- [ ] Build GDPR compliance features
- [ ] Implement audit logging for data access
- [ ] Add two-factor authentication support
- [ ] Build secure API communication
- [ ] Create privacy-first analytics

### 4.6 Testing & Quality Assurance
- [ ] Build comprehensive end-to-end test suite
- [ ] Implement visual regression testing
- [ ] Add performance testing and benchmarking
- [ ] Build accessibility testing automation
- [ ] Implement cross-browser testing
- [ ] Add mobile device testing
- [ ] Build load testing for scalability
- [ ] Implement security testing automation
- [ ] Add test data generation and management
- [ ] Create comprehensive test documentation

## 🚀 Detailed Implementation Instructions

### Advanced Analytics Dashboard

```typescript
// src/components/analytics/AdvancedAnalyticsDashboard.tsx
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { DatePickerWithRange } from '@/components/ui/DatePickerWithRange';
import { Badge } from '@/components/ui/Badge';
import { 
  TrendingUp, TrendingDown, Target, Brain, Calendar, 
  BarChart3, PieChart, Activity, Zap, Award 
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/services/analytics';
import { ProductivityScore } from './ProductivityScore';
import { CorrelationMatrix } from './CorrelationMatrix';
import { TrendForecast } from './TrendForecast';
import { InsightsPanel } from './InsightsPanel';
import { GoalTracker } from './GoalTracker';

export const AdvancedAnalyticsDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [comparisonPeriod, setComparisonPeriod] = useState('previous');

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['advanced-analytics', dateRange, selectedMetric],
    queryFn: () => analyticsApi.getAdvancedAnalytics({
      startDate: dateRange.from.toISOString(),
      endDate: dateRange.to.toISOString(),
      metric: selectedMetric,
      comparison: comparisonPeriod,
    }),
  });

  const { data: aiInsights } = useQuery({
    queryKey: ['ai-insights', dateRange],
    queryFn: () => analyticsApi.getAIInsights({
      startDate: dateRange.from.toISOString(),
      endDate: dateRange.to.toISOString(),
    }),
  });

  const { data: productivityScore } = useQuery({
    queryKey: ['productivity-score', dateRange],
    queryFn: () => analyticsApi.getProductivityScore({
      startDate: dateRange.from.toISOString(),
      endDate: dateRange.to.toISOString(),
    }),
  });

  const kpiCards = useMemo(() => [
    {
      title: 'Productivity Score',
      value: productivityScore?.current || 0,
      change: productivityScore?.change || 0,
      icon: Award,
      color: 'primary',
      suffix: '/100',
    },
    {
      title: 'Task Completion Rate',
      value: analyticsData?.taskCompletionRate || 0,
      change: analyticsData?.taskCompletionRateChange || 0,
      icon: Target,
      color: 'success',
      suffix: '%',
    },
    {
      title: 'Habit Consistency',
      value: analyticsData?.habitConsistency || 0,
      change: analyticsData?.habitConsistencyChange || 0,
      icon: Activity,
      color: 'primary',
      suffix: '%',
    },
    {
      title: 'Average Mood',
      value: analyticsData?.averageMood || 0,
      change: analyticsData?.averageMoodChange || 0,
      icon: TrendingUp,
      color: 'secondary',
      suffix: '/5',
    },
  ], [analyticsData, productivityScore]);

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advanced Analytics</h1>
          <p className="text-muted-foreground">
            Deep insights into your productivity patterns and trends
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <DatePickerWithRange
            value={dateRange}
            onChange={setDateRange}
          />
          
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Metrics</SelectItem>
              <SelectItem value="tasks">Tasks Only</SelectItem>
              <SelectItem value="habits">Habits Only</SelectItem>
              <SelectItem value="mood">Mood Only</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline">
            Export Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {kpi.title}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">
                      {typeof kpi.value === 'number' ? kpi.value.toFixed(1) : kpi.value}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {kpi.suffix}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    {kpi.change > 0 ? (
                      <TrendingUp className="h-3 w-3 text-success-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-error-500" />
                    )}
                    <span className={kpi.change > 0 ? 'text-success-500' : 'text-error-500'}>
                      {Math.abs(kpi.change).toFixed(1)}%
                    </span>
                    <span className="text-muted-foreground">vs last period</span>
                  </div>
                </div>
                <div className={`p-2 rounded-lg bg-${kpi.color}/10`}>
                  <kpi.icon className={`h-6 w-6 text-${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="correlations">Correlations</TabsTrigger>
          <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProductivityScore 
              data={productivityScore}
              dateRange={dateRange}
            />
            <InsightsPanel 
              insights={aiInsights}
              isLoading={isLoading}
            />
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <PatternAnalysis 
            data={analyticsData?.patterns}
            dateRange={dateRange}
          />
        </TabsContent>

        <TabsContent value="correlations" className="space-y-6">
          <CorrelationMatrix 
            data={analyticsData?.correlations}
            dateRange={dateRange}
          />
        </TabsContent>

        <TabsContent value="forecasts" className="space-y-6">
          <TrendForecast 
            data={analyticsData?.forecasts}
            dateRange={dateRange}
          />
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <GoalTracker 
            goals={analyticsData?.goals}
            dateRange={dateRange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
```

### AI-Powered Insights System

```typescript
// src/components/analytics/InsightsPanel.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/Collapsible';
import { 
  Brain, Lightbulb, TrendingUp, AlertTriangle, 
  CheckCircle, Target, Calendar, ChevronDown 
} from 'lucide-react';

interface InsightsPanelProps {
  insights: AIInsight[];
  isLoading: boolean;
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({ 
  insights, 
  isLoading 
}) => {
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set());

  const toggleInsight = (insightId: string) => {
    const newExpanded = new Set(expandedInsights);
    if (newExpanded.has(insightId)) {
      newExpanded.delete(insightId);
    } else {
      newExpanded.add(insightId);
    }
    setExpandedInsights(newExpanded);
  };

  const insightIcons = {
    opportunity: Lightbulb,
    warning: AlertTriangle,
    achievement: CheckCircle,
    trend: TrendingUp,
    recommendation: Target,
    pattern: Calendar,
  };

  const insightColors = {
    opportunity: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    warning: 'bg-red-100 text-red-800 border-red-200',
    achievement: 'bg-green-100 text-green-800 border-green-200',
    trend: 'bg-blue-100 text-blue-800 border-blue-200',
    recommendation: 'bg-purple-100 text-purple-800 border-purple-200',
    pattern: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Insights
          <Badge variant="secondary" className="ml-auto">
            {insights?.length || 0} insights
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No insights available yet</p>
              <p className="text-sm">Keep tracking your productivity to get personalized insights</p>
            </div>
          ) : (
            insights?.map((insight) => {
              const IconComponent = insightIcons[insight.type] || Lightbulb;
              const isExpanded = expandedInsights.has(insight.id);
              
              return (
                <Collapsible key={insight.id}>
                  <div className={`p-3 rounded-lg border ${insightColors[insight.type]}`}>
                    <CollapsibleTrigger 
                      className="w-full"
                      onClick={() => toggleInsight(insight.id)}
                    >
                      <div className="flex items-start gap-3">
                        <IconComponent className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 text-left">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{insight.title}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {insight.confidence}% confidence
                              </Badge>
                              <ChevronDown 
                                className={`h-4 w-4 transition-transform ${
                                  isExpanded ? 'rotate-180' : ''
                                }`} 
                              />
                            </div>
                          </div>
                          <p className="text-sm mt-1 text-left">{insight.summary}</p>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="mt-3 pt-3 border-t border-current/20 space-y-3">
                        <div>
                          <h5 className="font-medium text-sm mb-1">Analysis</h5>
                          <p className="text-sm">{insight.analysis}</p>
                        </div>
                        
                        {insight.recommendations && insight.recommendations.length > 0 && (
                          <div>
                            <h5 className="font-medium text-sm mb-2">Recommendations</h5>
                            <ul className="space-y-1">
                              {insight.recommendations.map((rec, index) => (
                                <li key={index} className="text-sm flex items-start gap-2">
                                  <span className="text-xs mt-1">•</span>
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {insight.actions && insight.actions.length > 0 && (
                          <div className="flex gap-2 pt-2">
                            {insight.actions.map((action, index) => (
                              <Button 
                                key={index}
                                size="sm" 
                                variant="outline"
                                onClick={() => {/* Handle action */}}
                              >
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
```

### Advanced Performance Optimization

```typescript
// src/utils/performance.ts
import { lazy, ComponentType } from 'react';

// Lazy loading with error boundaries
export const createLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: ComponentType
) => {
  const LazyComponent = lazy(importFn);
  
  return (props: any) => (
    <Suspense fallback={fallback ? <fallback /> : <div>Loading...</div>}>
      <ErrorBoundary>
        <LazyComponent {...props} />
      </ErrorBoundary>
    </Suspense>
  );
};

// Virtual scrolling hook
export const useVirtualScrolling = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    return { start, end };
  }, [scrollTop, itemHeight, containerHeight, items.length]);

  const visibleItems = useMemo(() => 
    items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      item,
      index: visibleRange.start + index,
    })),
    [items, visibleRange]
  );

  return {
    visibleItems,
    totalHeight: items.length * itemHeight,
    offsetY: visibleRange.start * itemHeight,
    setScrollTop,
  };
};

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMeasure(name: string): void {
    performance.mark(`${name}-start`);
  }

  endMeasure(name: string): number {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const entries = performance.getEntriesByName(name);
    const latestEntry = entries[entries.length - 1];
    const duration = latestEntry.duration;

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(duration);

    // Clean up
    performance.clearMarks(`${name}-start`);
    performance.clearMarks(`${name}-end`);
    performance.clearMeasures(name);

    return duration;
  }

  getMetrics(name: string): { avg: number; min: number; max: number; count: number } {
    const values = this.metrics.get(name) || [];
    if (values.length === 0) {
      return { avg: 0, min: 0, max: 0, count: 0 };
    }

    return {
      avg: values.reduce((sum, val) => sum + val, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length,
    };
  }
}

// React hook for performance monitoring
export const usePerformanceMonitor = (name: string) => {
  const monitor = PerformanceMonitor.getInstance();

  const start = useCallback(() => {
    monitor.startMeasure(name);
  }, [monitor, name]);

  const end = useCallback(() => {
    return monitor.endMeasure(name);
  }, [monitor, name]);

  const getMetrics = useCallback(() => {
    return monitor.getMetrics(name);
  }, [monitor, name]);

  return { start, end, getMetrics };
};
```

### Accessibility Implementation

```typescript
// src/hooks/useAccessibility.ts
import { useEffect, useRef, useState } from 'react';

// Focus management hook
export const useFocusManagement = () => {
  const focusHistory = useRef<HTMLElement[]>([]);

  const pushFocus = (element: HTMLElement) => {
    focusHistory.current.push(document.activeElement as HTMLElement);
    element.focus();
  };

  const popFocus = () => {
    const previousElement = focusHistory.current.pop();
    if (previousElement && previousElement.focus) {
      previousElement.focus();
    }
  };

  const trapFocus = (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  };

  return { pushFocus, popFocus, trapFocus };
};

// Keyboard navigation hook
export const useKeyboardNavigation = (
  items: any[],
  onSelect: (item: any) => void
) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < items.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev > 0 ? prev - 1 : items.length - 1
        );
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (selectedIndex >= 0) {
          onSelect(items[selectedIndex]);
        }
        break;
      case 'Escape':
        setSelectedIndex(-1);
        break;
    }
  }, [items, selectedIndex, onSelect]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { selectedIndex, setSelectedIndex };
};

// Screen reader announcements
export const useScreenReader = () => {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  return { announce };
};

// Skip links component
export const SkipLinks: React.FC = () => {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <a 
        href="#main-content" 
        className="fixed top-4 left-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
      >
        Skip to main content
      </a>
      <a 
        href="#navigation" 
        className="fixed top-4 left-32 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
      >
        Skip to navigation
      </a>
    </div>
  );
};
```

### Internationalization Setup

```typescript
// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './locales/en/common.json';
import esTranslations from './locales/es/common.json';
import frTranslations from './locales/fr/common.json';
import deTranslations from './locales/de/common.json';

const resources = {
  en: { common: enTranslations },
  es: { common: esTranslations },
  fr: { common: frTranslations },
  de: { common: deTranslations },
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    ns: ['common'],
    defaultNS: 'common',
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;

// Translation hook with type safety
export const useTypedTranslation = () => {
  const { t, i18n } = useTranslation();
  
  return {
    t: t as (key: string, options?: any) => string,
    i18n,
    changeLanguage: i18n.changeLanguage,
    language: i18n.language,
  };
};

// Date formatting with localization
export const useLocalizedDate = () => {
  const { language } = useTypedTranslation();
  
  const formatDate = useCallback((date: Date, options?: Intl.DateTimeFormatOptions) => {
    return new Intl.DateTimeFormat(language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options,
    }).format(date);
  }, [language]);

  const formatTime = useCallback((date: Date, options?: Intl.DateTimeFormatOptions) => {
    return new Intl.DateTimeFormat(language, {
      hour: 'numeric',
      minute: 'numeric',
      ...options,
    }).format(date);
  }, [language]);

  return { formatDate, formatTime };
};
```

### Command Palette Implementation

```typescript
// src/components/ui/CommandPalette.tsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { 
  Search, Plus, Calendar, Target, Smile, Settings, 
  Keyboard, FileText, Download, Upload 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useKeyboardNavigation } from '@/hooks/useAccessibility';

interface Command {
  id: string;
  title: string;
  description?: string;
  icon: React.ComponentType<any>;
  keywords: string[];
  action: () => void;
  category: string;
}

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const commands: Command[] = [
    {
      id: 'new-task',
      title: 'New Task',
      description: 'Create a new task',
      icon: Plus,
      keywords: ['new', 'task', 'create', 'add'],
      action: () => navigate('/tasks?new=true'),
      category: 'Actions',
    },
    {
      id: 'new-habit',
      title: 'New Habit',
      description: 'Create a new habit',
      icon: Target,
      keywords: ['new', 'habit', 'create', 'add'],
      action: () => navigate('/habits?new=true'),
      category: 'Actions',
    },
    {
      id: 'log-mood',
      title: 'Log Mood',
      description: 'Record your current mood',
      icon: Smile,
      keywords: ['mood', 'log', 'feeling', 'emotion'],
      action: () => navigate('/mood?new=true'),
      category: 'Actions',
    },
    {
      id: 'go-dashboard',
      title: 'Dashboard',
      description: 'Go to dashboard',
      icon: Calendar,
      keywords: ['dashboard', 'home', 'overview'],
      action: () => navigate('/'),
      category: 'Navigation',
    },
    {
      id: 'go-analytics',
      title: 'Analytics',
      description: 'View productivity analytics',
      icon: FileText,
      keywords: ['analytics', 'stats', 'data', 'insights'],
      action: () => navigate('/analytics'),
      category: 'Navigation',
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Open settings',
      icon: Settings,
      keywords: ['settings', 'preferences', 'config'],
      action: () => navigate('/settings'),
      category: 'Navigation',
    },
    {
      id: 'export-data',
      title: 'Export Data',
      description: 'Export your data',
      icon: Download,
      keywords: ['export', 'download', 'backup'],
      action: () => {/* Handle export */},
      category: 'Tools',
    },
    {
      id: 'import-data',
      title: 'Import Data',
      description: 'Import data from file',
      icon: Upload,
      keywords: ['import', 'upload', 'restore'],
      action: () => {/* Handle import */},
      category: 'Tools',
    },
  ];

  const filteredCommands = commands.filter(command => {
    if (!query) return true;
    
    const searchTerms = query.toLowerCase().split(' ');
    return searchTerms.every(term =>
      command.title.toLowerCase().includes(term) ||
      command.description?.toLowerCase().includes(term) ||
      command.keywords.some(keyword => keyword.includes(term))
    );
  });

  const { selectedIndex } = useKeyboardNavigation(
    filteredCommands,
    (command) => {
      command.action();
      setIsOpen(false);
    }
  );

  // Open with Cmd+K or Ctrl+K
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-lg p-0">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="border-0 focus:ring-0 focus:ring-offset-0"
            autoFocus
          />
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Keyboard className="h-3 w-3" />
            <span>⌘K</span>
          </div>
        </div>
        
        <div className="max-h-80 overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No commands found</p>
            </div>
          ) : (
            <div className="p-2">
              {Object.entries(
                filteredCommands.reduce((acc, command) => {
                  if (!acc[command.category]) {
                    acc[command.category] = [];
                  }
                  acc[command.category].push(command);
                  return acc;
                }, {} as Record<string, Command[]>)
              ).map(([category, categoryCommands]) => (
                <div key={category} className="mb-2">
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                    {category}
                  </div>
                  {categoryCommands.map((command, index) => {
                    const globalIndex = filteredCommands.indexOf(command);
                    const isSelected = globalIndex === selectedIndex;
                    
                    return (
                      <button
                        key={command.id}
                        className={`w-full flex items-center gap-3 px-2 py-2 text-left rounded-md transition-colors ${
                          isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
                        }`}
                        onClick={() => {
                          command.action();
                          setIsOpen(false);
                        }}
                      >
                        <command.icon className="h-4 w-4 opacity-70" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{command.title}</div>
                          {command.description && (
                            <div className="text-xs text-muted-foreground">
                              {command.description}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

## 🧪 Comprehensive Testing Strategy

### E2E Testing with Playwright

```typescript
// tests/e2e/productivity-workflow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Complete Productivity Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Login or setup test data
  });

  test('should complete full productivity tracking workflow', async ({ page }) => {
    // Create a task
    await page.click('[data-testid="add-task-button"]');
    await page.fill('[data-testid="task-title-input"]', 'Complete project proposal');
    await page.selectOption('[data-testid="task-priority-select"]', 'high');
    await page.click('[data-testid="save-task-button"]');
    
    // Verify task appears in list
    await expect(page.locator('[data-testid="task-list"]')).toContainText('Complete project proposal');
    
    // Start time tracking
    await page.click('[data-testid="start-timer-button"]');
    await expect(page.locator('[data-testid="active-timer"]')).toBeVisible();
    
    // Log a habit
    await page.goto('/habits');
    await page.click('[data-testid="log-habit-exercise"]');
    await expect(page.locator('[data-testid="habit-exercise"]')).toHaveClass(/completed/);
    
    // Log mood
    await page.goto('/mood');
    await page.click('[data-testid="mood-score-4"]');
    await page.fill('[data-testid="mood-notes"]', 'Feeling productive today');
    await page.click('[data-testid="save-mood-button"]');
    
    // Check analytics
    await page.goto('/analytics');
    await expect(page.locator('[data-testid="productivity-score"]')).toBeVisible();
    
    // Verify data integration
    await page.goto('/');
    await expect(page.locator('[data-testid="todays-summary"]')).toContainText('1 task');
    await expect(page.locator('[data-testid="todays-summary"]')).toContainText('1 habit');
  });

  test('should handle offline functionality', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true);
    
    // Try to create a task offline
    await page.click('[data-testid="add-task-button"]');
    await page.fill('[data-testid="task-title-input"]', 'Offline task');
    await page.click('[data-testid="save-task-button"]');
    
    // Verify offline indicator
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
    
    // Go back online
    await context.setOffline(false);
    
    // Verify sync happens
    await expect(page.locator('[data-testid="sync-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="task-list"]')).toContainText('Offline task');
  });
});

// Accessibility testing
test.describe('Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
    
    // Test skip links
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="skip-to-main"]')).toBeFocused();
    
    // Test command palette
    await page.keyboard.press('Meta+k');
    await expect(page.locator('[data-testid="command-palette"]')).toBeVisible();
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');
    
    // Check main landmarks
    await expect(page.locator('main')).toHaveAttribute('aria-label');
    await expect(page.locator('nav')).toHaveAttribute('aria-label');
    
    // Check interactive elements
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const hasLabel = await button.getAttribute('aria-label');
      const hasText = await button.textContent();
      
      expect(hasLabel || hasText).toBeTruthy();
    }
  });
});
```

## ✅ Phase 4 Success Criteria

### Analytics & Intelligence
- [ ] Comprehensive analytics dashboard with customizable widgets
- [ ] AI-powered insights with actionable recommendations
- [ ] Predictive analytics and trend forecasting
- [ ] Cross-metric correlation analysis
- [ ] Automated coaching and goal suggestions
- [ ] Productivity scoring algorithm
- [ ] Benchmarking and comparison features

### Performance & Scalability
- [ ] Sub-3-second initial load time
- [ ] Smooth 60fps animations
- [ ] Efficient memory usage (< 100MB)
- [ ] Bundle size optimization (< 500KB gzipped)
- [ ] Progressive web app functionality
- [ ] Offline capability with sync
- [ ] Virtual scrolling for large datasets

### Accessibility & Internationalization
- [ ] WCAG 2.1 AA compliance
- [ ] Complete keyboard navigation
- [ ] Screen reader optimization
- [ ] High contrast mode support
- [ ] Multi-language support (4+ languages)
- [ ] RTL language support
- [ ] Cultural adaptation features

### User Experience & Polish
- [ ] Advanced onboarding with progressive disclosure
- [ ] Command palette for power users
- [ ] Contextual help system
- [ ] Drag-and-drop interfaces
- [ ] Undo/redo functionality
- [ ] Advanced search with NLP
- [ ] Customizable dashboards

### Security & Privacy
- [ ] Input validation and sanitization
- [ ] XSS and CSRF protection
- [ ] Data encryption implementation
- [ ] Privacy controls and data export
- [ ] GDPR compliance features
- [ ] Secure API communication
- [ ] Audit logging system

### Testing & Quality
- [ ] 90%+ code coverage
- [ ] Comprehensive E2E test suite
- [ ] Visual regression testing
- [ ] Performance benchmarking
- [ ] Accessibility testing automation
- [ ] Cross-browser compatibility
- [ ] Mobile device testing

## 🚀 Phase 4 Deliverables

1. **Advanced Analytics Platform**: AI insights, predictive analytics, custom dashboards
2. **Performance-Optimized Application**: Fast loading, smooth interactions, efficient resource usage
3. **Accessible & International**: WCAG compliant, multi-language support, inclusive design
4. **Professional User Experience**: Advanced features, intuitive workflows, premium polish
5. **Enterprise-Grade Security**: Comprehensive protection, privacy controls, audit trails
6. **Production-Ready Codebase**: Tested, documented, maintainable, scalable
7. **Deployment Infrastructure**: CI/CD, monitoring, analytics, error tracking
8. **Comprehensive Documentation**: User guides, API docs, development documentation

Upon completion of Phase 4, Meh-trics will be a production-ready, enterprise-grade productivity platform suitable for personal use, team collaboration, and commercial deployment.