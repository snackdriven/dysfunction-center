import React from 'react';
import { cn } from '../../utils/cn';

interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  bundleSize?: number;
  memoryUsage?: number;
}

interface PerformanceMonitorProps {
  className?: string;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
  enableRealTimeMonitoring?: boolean;
  enableMemoryMonitoring?: boolean;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  className,
  onMetricsUpdate,
  enableRealTimeMonitoring = true,
  enableMemoryMonitoring = true
}) => {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics>({});
  const [isVisible, setIsVisible] = React.useState(false);

  const collectWebVitals = React.useCallback(() => {
    if (typeof window === 'undefined' || !window.performance) return;

    const perfEntries = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const newMetrics: PerformanceMetrics = {};

    // Time to First Byte
    if (perfEntries.responseStart) {
      newMetrics.ttfb = perfEntries.responseStart;
    }

    // First Contentful Paint
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
    if (fcpEntry) {
      newMetrics.fcp = fcpEntry.startTime;
    }

    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            newMetrics.lcp = lastEntry.startTime;
            setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
            onMetricsUpdate?.({ ...metrics, lcp: lastEntry.startTime });
          }
        });
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (e) {
        console.warn('LCP monitoring not supported');
      }
    }

    // Memory usage (if available)
    if (enableMemoryMonitoring && 'memory' in performance) {
      const memInfo = (performance as any).memory;
      newMetrics.memoryUsage = memInfo.usedJSHeapSize / 1024 / 1024; // MB
    }

    setMetrics(prev => ({ ...prev, ...newMetrics }));
    onMetricsUpdate?.({ ...metrics, ...newMetrics });
  }, [metrics, onMetricsUpdate, enableMemoryMonitoring]);

  React.useEffect(() => {
    if (!enableRealTimeMonitoring) return;

    // Initial collection
    setTimeout(collectWebVitals, 1000);

    // Periodic collection
    const interval = setInterval(collectWebVitals, 5000);

    return () => clearInterval(interval);
  }, [collectWebVitals, enableRealTimeMonitoring]);

  const getScoreColor = (metric: string, value: number) => {
    const thresholds = {
      fcp: { good: 1800, poor: 3000 },
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      ttfb: { good: 800, poor: 1800 }
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return 'text-muted-foreground';

    if (value <= threshold.good) return 'text-green-600';
    if (value <= threshold.poor) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatMetric = (value: number, unit: string) => {
    if (unit === 'ms') {
      return `${Math.round(value)}ms`;
    }
    if (unit === 'MB') {
      return `${value.toFixed(1)}MB`;
    }
    return value.toFixed(3);
  };

  if (!isVisible && process.env.NODE_ENV === 'production') {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 p-2 bg-background border rounded-full shadow-lg z-50 opacity-50 hover:opacity-100"
        title="Show Performance Metrics"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
        </svg>
      </button>
    );
  }

  return (
    <div className={cn(
      'performance-monitor',
      'fixed bottom-4 right-4 z-50',
      'bg-background border rounded-lg shadow-lg',
      'p-4 min-w-[280px]',
      className
    )}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Performance Metrics</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-muted-foreground hover:text-foreground"
          title="Hide Performance Metrics"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>

      <div className="space-y-2 text-xs">
        {metrics.fcp && (
          <div className="flex justify-between">
            <span>First Contentful Paint:</span>
            <span className={getScoreColor('fcp', metrics.fcp)}>
              {formatMetric(metrics.fcp, 'ms')}
            </span>
          </div>
        )}

        {metrics.lcp && (
          <div className="flex justify-between">
            <span>Largest Contentful Paint:</span>
            <span className={getScoreColor('lcp', metrics.lcp)}>
              {formatMetric(metrics.lcp, 'ms')}
            </span>
          </div>
        )}

        {metrics.ttfb && (
          <div className="flex justify-between">
            <span>Time to First Byte:</span>
            <span className={getScoreColor('ttfb', metrics.ttfb)}>
              {formatMetric(metrics.ttfb, 'ms')}
            </span>
          </div>
        )}

        {metrics.memoryUsage && (
          <div className="flex justify-between">
            <span>Memory Usage:</span>
            <span className="text-blue-600">
              {formatMetric(metrics.memoryUsage, 'MB')}
            </span>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t">
        <button
          onClick={collectWebVitals}
          className="w-full py-1 px-2 bg-primary text-primary-foreground rounded text-xs hover:bg-primary/90"
        >
          Refresh Metrics
        </button>
      </div>
    </div>
  );
};

interface PerformanceBudgetProps {
  budgets: {
    [key: string]: {
      current: number;
      budget: number;
      unit: string;
    };
  };
  className?: string;
}

export const PerformanceBudget: React.FC<PerformanceBudgetProps> = ({
  budgets,
  className
}) => {
  const getBudgetStatus = (current: number, budget: number) => {
    const percentage = (current / budget) * 100;
    if (percentage <= 80) return { status: 'good', color: 'text-green-600 bg-green-100' };
    if (percentage <= 100) return { status: 'warning', color: 'text-orange-600 bg-orange-100' };
    return { status: 'danger', color: 'text-red-600 bg-red-100' };
  };

  return (
    <div className={cn(
      'performance-budget',
      'bg-card border rounded-lg p-4',
      className
    )}>
      <h3 className="font-semibold mb-4">Performance Budget</h3>
      
      <div className="space-y-3">
        {Object.entries(budgets).map(([key, { current, budget, unit }]) => {
          const { status, color } = getBudgetStatus(current, budget);
          const percentage = Math.min((current / budget) * 100, 100);
          
          return (
            <div key={key} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{key}</span>
                <span className={color.split(' ')[0]}>
                  {current.toFixed(1)}{unit} / {budget}{unit}
                </span>
              </div>
              
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    status === 'good' && 'bg-green-600',
                    status === 'warning' && 'bg-orange-600',
                    status === 'danger' && 'bg-red-600'
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface CognitiveLoadTrackerProps {
  className?: string;
  onLoadChange?: (load: number) => void;
}

export const CognitiveLoadTracker: React.FC<CognitiveLoadTrackerProps> = ({
  className,
  onLoadChange
}) => {
  const [cognitiveLoad, setCognitiveLoad] = React.useState(0);
  const [factors, setFactors] = React.useState({
    elementsCount: 0,
    interactiveElements: 0,
    animationsCount: 0,
    colorComplexity: 0,
    textDensity: 0
  });

  const calculateCognitiveLoad = React.useCallback(() => {
    if (typeof document === 'undefined') return;

    const newFactors = {
      elementsCount: document.querySelectorAll('*').length,
      interactiveElements: document.querySelectorAll('button, input, select, textarea, a').length,
      animationsCount: document.querySelectorAll('[class*="animate"]').length,
      colorComplexity: new Set(
        Array.from(document.querySelectorAll('*')).map(el => 
          window.getComputedStyle(el).color
        )
      ).size,
      textDensity: document.body.textContent?.length || 0
    };

    // Calculate cognitive load score (0-100)
    const load = Math.min(
      (newFactors.elementsCount / 10) +
      (newFactors.interactiveElements * 2) +
      (newFactors.animationsCount * 5) +
      (newFactors.colorComplexity / 2) +
      (newFactors.textDensity / 1000),
      100
    );

    setFactors(newFactors);
    setCognitiveLoad(load);
    onLoadChange?.(load);
  }, [onLoadChange]);

  React.useEffect(() => {
    // Calculate initial load
    setTimeout(calculateCognitiveLoad, 1000);

    // Recalculate on mutations
    const observer = new MutationObserver(() => {
      clearTimeout(window.cognitiveLoadTimer);
      window.cognitiveLoadTimer = setTimeout(calculateCognitiveLoad, 500);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });

    return () => {
      observer.disconnect();
      clearTimeout(window.cognitiveLoadTimer);
    };
  }, [calculateCognitiveLoad]);

  const getLoadColor = (load: number) => {
    if (load <= 30) return 'text-green-600';
    if (load <= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getLoadLabel = (load: number) => {
    if (load <= 30) return 'Low';
    if (load <= 60) return 'Medium';
    return 'High';
  };

  return (
    <div className={cn(
      'cognitive-load-tracker',
      'bg-card border rounded-lg p-4',
      className
    )}>
      <h3 className="font-semibold mb-4">Cognitive Load</h3>
      
      <div className="text-center mb-4">
        <div className={cn(
          'text-3xl font-bold mb-1',
          getLoadColor(cognitiveLoad)
        )}>
          {Math.round(cognitiveLoad)}
        </div>
        <div className={cn(
          'text-sm font-medium',
          getLoadColor(cognitiveLoad)
        )}>
          {getLoadLabel(cognitiveLoad)} Complexity
        </div>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span>DOM Elements:</span>
          <span>{factors.elementsCount}</span>
        </div>
        <div className="flex justify-between">
          <span>Interactive Elements:</span>
          <span>{factors.interactiveElements}</span>
        </div>
        <div className="flex justify-between">
          <span>Animations:</span>
          <span>{factors.animationsCount}</span>
        </div>
        <div className="flex justify-between">
          <span>Color Variety:</span>
          <span>{factors.colorComplexity}</span>
        </div>
        <div className="flex justify-between">
          <span>Text Density:</span>
          <span>{Math.round(factors.textDensity / 100)}%</span>
        </div>
      </div>

      {cognitiveLoad > 70 && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
          ⚠️ High cognitive load detected. Consider simplifying the interface.
        </div>
      )}
    </div>
  );
};

// Global timer for cognitive load calculation
declare global {
  interface Window {
    cognitiveLoadTimer: NodeJS.Timeout;
  }
}
