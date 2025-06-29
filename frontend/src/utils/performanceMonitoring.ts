/**
 * Performance Monitoring and Core Web Vitals Tracking
 * Designed for desktop executive dysfunction optimization
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url: string;
  rating: 'good' | 'needs-improvement' | 'poor';
}

interface CoreWebVitals {
  LCP: number | null; // Largest Contentful Paint
  FID: number | null; // First Input Delay
  CLS: number | null; // Cumulative Layout Shift
  FCP: number | null; // First Contentful Paint
  TTFB: number | null; // Time to First Byte
}

interface CustomMetrics {
  taskCompletionTime: number | null;
  formFillTime: number | null;
  navigationTime: number | null;
  searchTime: number | null;
  cognitiveLoadScore: number | null;
}

interface PerformanceReport {
  coreWebVitals: CoreWebVitals;
  customMetrics: CustomMetrics;
  timestamp: number;
  url: string;
  userAgent: string;
  connectionType: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observer: PerformanceObserver | null = null;
  private customMetrics: CustomMetrics = {
    taskCompletionTime: null,
    formFillTime: null,
    navigationTime: null,
    searchTime: null,
    cognitiveLoadScore: null,
  };

  constructor() {
    this.initializeObserver();
    this.measureCoreWebVitals();
    this.trackCustomMetrics();
  }

  private initializeObserver() {
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.processPerformanceEntry(entry);
        }
      });

      // Observe various performance entry types
      try {
        this.observer.observe({ 
          entryTypes: ['navigation', 'paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] 
        });
      } catch (e) {
        // Fallback for older browsers
        this.observer.observe({ entryTypes: ['navigation', 'paint'] });
      }
    }
  }

  private processPerformanceEntry(entry: PerformanceEntry) {
    const timestamp = Date.now();
    const url = window.location.href;

    switch (entry.entryType) {
      case 'largest-contentful-paint':
        this.addMetric('LCP', entry.startTime, timestamp, url);
        break;
      
      case 'first-input':
        const fidEntry = entry as PerformanceEventTiming;
        this.addMetric('FID', fidEntry.processingStart - fidEntry.startTime, timestamp, url);
        break;
      
      case 'layout-shift':
        const clsEntry = entry as any; // LayoutShift entry type
        if (!clsEntry.hadRecentInput) {
          this.addMetric('CLS', clsEntry.value, timestamp, url);
        }
        break;
      
      case 'paint':
        if (entry.name === 'first-contentful-paint') {
          this.addMetric('FCP', entry.startTime, timestamp, url);
        }
        break;
      
      case 'navigation':
        const navEntry = entry as PerformanceNavigationTiming;
        this.addMetric('TTFB', navEntry.responseStart - navEntry.requestStart, timestamp, url);
        break;
    }
  }

  private addMetric(name: string, value: number, timestamp: number, url: string) {
    const rating = this.getRating(name, value);
    
    this.metrics.push({
      name,
      value,
      timestamp,
      url,
      rating
    });

    // Executive dysfunction specific logging
    if (rating === 'poor') {
      console.warn(`Poor ${name} performance detected:`, {
        value,
        threshold: this.getThreshold(name),
        url,
        recommendations: this.getRecommendations(name)
      });
    }
  }

  private getRating(metricName: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 }
    };

    const threshold = thresholds[metricName as keyof typeof thresholds];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  private getThreshold(metricName: string) {
    const thresholds = {
      LCP: '2.5s (good), 4s (poor)',
      FID: '100ms (good), 300ms (poor)',
      CLS: '0.1 (good), 0.25 (poor)',
      FCP: '1.8s (good), 3s (poor)',
      TTFB: '800ms (good), 1.8s (poor)'
    };
    
    return thresholds[metricName as keyof typeof thresholds] || 'Unknown';
  }

  private getRecommendations(metricName: string): string[] {
    const recommendations = {
      LCP: [
        'Optimize images and use modern formats (WebP, AVIF)',
        'Remove render-blocking resources',
        'Improve server response times',
        'Use a CDN for static assets'
      ],
      FID: [
        'Reduce JavaScript execution time',
        'Split long tasks into smaller chunks',
        'Use web workers for heavy computations',
        'Optimize third-party scripts'
      ],
      CLS: [
        'Set size attributes on images and videos',
        'Reserve space for dynamic content',
        'Avoid inserting content above existing content',
        'Use CSS aspect-ratio for responsive media'
      ],
      FCP: [
        'Eliminate render-blocking resources',
        'Minify CSS and JavaScript',
        'Remove unused code',
        'Use efficient caching policies'
      ],
      TTFB: [
        'Optimize database queries',
        'Use CDN for static content',
        'Enable server-side caching',
        'Upgrade hosting infrastructure'
      ]
    };

    return recommendations[metricName as keyof typeof recommendations] || [];
  }

  private measureCoreWebVitals() {
    // Measure FCP and LCP using Performance API
    if ('performance' in window && 'getEntriesByType' in performance) {
      // Check for paint entries
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      
      if (fcpEntry) {
        this.addMetric('FCP', fcpEntry.startTime, Date.now(), window.location.href);
      }
    }

    // Use web-vitals library if available
    if (typeof window !== 'undefined') {
      this.loadWebVitalsLibrary();
    }
  }

  private loadWebVitalsLibrary() {
    // This would typically be imported, but for demonstration:
    // import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
    
    // Simplified version using PerformanceObserver
    if ('PerformanceObserver' in window) {
      // CLS measurement
      let clsValue = 0;
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          const layoutShiftEntry = entry as any;
          if (!layoutShiftEntry.hadRecentInput) {
            clsValue += layoutShiftEntry.value;
          }
        }
        this.customMetrics.cognitiveLoadScore = this.calculateCognitiveLoadScore();
      }).observe({ type: 'layout-shift', buffered: true });
    }
  }

  private trackCustomMetrics() {
    // Track task completion time
    this.trackTaskCompletion();
    
    // Track form fill time
    this.trackFormFillTime();
    
    // Track navigation time
    this.trackNavigationTime();
    
    // Track search time
    this.trackSearchTime();
  }

  private trackTaskCompletion() {
    const taskStartTimes = new Map<string, number>();
    
    // Listen for task start events
    document.addEventListener('task-start', (event: any) => {
      const taskId = event.detail.taskId;
      taskStartTimes.set(taskId, Date.now());
    });
    
    // Listen for task completion events
    document.addEventListener('task-complete', (event: any) => {
      const taskId = event.detail.taskId;
      const startTime = taskStartTimes.get(taskId);
      
      if (startTime) {
        const completionTime = Date.now() - startTime;
        this.customMetrics.taskCompletionTime = completionTime;
        this.addMetric('TaskCompletion', completionTime, Date.now(), window.location.href);
        taskStartTimes.delete(taskId);
      }
    });
  }

  private trackFormFillTime() {
    const formStartTimes = new Map<HTMLFormElement, number>();
    
    // Track form focus
    document.addEventListener('focusin', (event) => {
      const target = event.target as HTMLElement;
      const form = target.closest('form');
      
      if (form && !formStartTimes.has(form)) {
        formStartTimes.set(form, Date.now());
      }
    });
    
    // Track form submission
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      const startTime = formStartTimes.get(form);
      
      if (startTime) {
        const fillTime = Date.now() - startTime;
        this.customMetrics.formFillTime = fillTime;
        this.addMetric('FormFill', fillTime, Date.now(), window.location.href);
        formStartTimes.delete(form);
      }
    });
  }

  private trackNavigationTime() {
    let navigationStart = Date.now();
    
    // Track route changes (for SPAs)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      const navTime = Date.now() - navigationStart;
      this.addMetric('Navigation', navTime, Date.now(), window.location.href);
      navigationStart = Date.now();
      return originalPushState.apply(this, args);
    }.bind(this);
    
    history.replaceState = function(...args) {
      const navTime = Date.now() - navigationStart;
      this.addMetric('Navigation', navTime, Date.now(), window.location.href);
      navigationStart = Date.now();
      return originalReplaceState.apply(this, args);
    }.bind(this);
  }

  private trackSearchTime() {
    const searchStartTimes = new Map<HTMLInputElement, number>();
    
    // Track search input focus
    document.addEventListener('focusin', (event) => {
      const target = event.target as HTMLInputElement;
      
      if (target.type === 'search' || target.getAttribute('data-search-input')) {
        searchStartTimes.set(target, Date.now());
      }
    });
    
    // Track search submission
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        const target = event.target as HTMLInputElement;
        const startTime = searchStartTimes.get(target);
        
        if (startTime && (target.type === 'search' || target.getAttribute('data-search-input'))) {
          const searchTime = Date.now() - startTime;
          this.customMetrics.searchTime = searchTime;
          this.addMetric('Search', searchTime, Date.now(), window.location.href);
          searchStartTimes.delete(target);
        }
      }
    });
  }

  private calculateCognitiveLoadScore(): number {
    // Calculate cognitive load based on various factors
    const factors = {
      layoutShifts: this.metrics.filter(m => m.name === 'CLS').length,
      slowInteractions: this.metrics.filter(m => m.name === 'FID' && m.value > 100).length,
      longLoadTimes: this.metrics.filter(m => m.name === 'LCP' && m.value > 2500).length,
      formErrors: document.querySelectorAll('[aria-invalid="true"]').length,
      visibleElements: document.querySelectorAll(':visible').length
    };
    
    // Simple scoring algorithm (0-100, higher = more cognitive load)
    let score = 0;
    score += factors.layoutShifts * 10;
    score += factors.slowInteractions * 15;
    score += factors.longLoadTimes * 20;
    score += factors.formErrors * 25;
    score += Math.min(factors.visibleElements / 10, 30);
    
    return Math.min(score, 100);
  }

  public getPerformanceReport(): PerformanceReport {
    const coreWebVitals: CoreWebVitals = {
      LCP: this.getLatestMetric('LCP'),
      FID: this.getLatestMetric('FID'),
      CLS: this.getLatestMetric('CLS'),
      FCP: this.getLatestMetric('FCP'),
      TTFB: this.getLatestMetric('TTFB')
    };

    return {
      coreWebVitals,
      customMetrics: this.customMetrics,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      connectionType: this.getConnectionType()
    };
  }

  private getLatestMetric(name: string): number | null {
    const metric = this.metrics.filter(m => m.name === name).pop();
    return metric ? metric.value : null;
  }

  private getConnectionType(): string {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    return connection ? connection.effectiveType || connection.type || 'unknown' : 'unknown';
  }

  public exportMetrics(): string {
    const report = this.getPerformanceReport();
    return JSON.stringify(report, null, 2);
  }

  public logPerformanceSummary() {
    const report = this.getPerformanceReport();
    
    console.group('🚀 Performance Report');
    console.log('Core Web Vitals:', report.coreWebVitals);
    console.log('Custom Metrics:', report.customMetrics);
    console.log('Connection:', report.connectionType);
    console.log('Timestamp:', new Date(report.timestamp).toISOString());
    
    // Executive dysfunction specific insights
    const cognitiveLoad = report.customMetrics.cognitiveLoadScore;
    if (cognitiveLoad !== null) {
      console.log(`🧠 Cognitive Load Score: ${cognitiveLoad}/100`);
      if (cognitiveLoad > 70) {
        console.warn('High cognitive load detected! Consider simplifying the interface.');
      }
    }
    
    console.groupEnd();
  }

  public destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Global performance monitor instance
let performanceMonitor: PerformanceMonitor | null = null;

export const initializePerformanceMonitoring = () => {
  if (typeof window !== 'undefined' && !performanceMonitor) {
    performanceMonitor = new PerformanceMonitor();
    
    // Log performance summary every 30 seconds in development
    if (process.env.NODE_ENV === 'development') {
      setInterval(() => {
        performanceMonitor?.logPerformanceSummary();
      }, 30000);
    }
  }
  
  return performanceMonitor;
};

export const getPerformanceMonitor = () => performanceMonitor;

export const trackTaskStart = (taskId: string) => {
  document.dispatchEvent(new CustomEvent('task-start', { detail: { taskId } }));
};

export const trackTaskComplete = (taskId: string) => {
  document.dispatchEvent(new CustomEvent('task-complete', { detail: { taskId } }));
};

// Executive dysfunction specific performance helpers
export const assessCognitiveLoad = (): 'low' | 'medium' | 'high' => {
  const monitor = getPerformanceMonitor();
  if (!monitor) return 'medium';
  
  const report = monitor.getPerformanceReport();
  const score = report.customMetrics.cognitiveLoadScore || 50;
  
  if (score < 30) return 'low';
  if (score < 70) return 'medium';
  return 'high';
};

export const getPerformanceRecommendations = (): string[] => {
  const monitor = getPerformanceMonitor();
  if (!monitor) return [];
  
  const report = monitor.getPerformanceReport();
  const recommendations: string[] = [];
  
  // Core Web Vitals recommendations
  if (report.coreWebVitals.LCP && report.coreWebVitals.LCP > 2500) {
    recommendations.push('Optimize largest contentful paint for better perceived loading speed');
  }
  
  if (report.coreWebVitals.FID && report.coreWebVitals.FID > 100) {
    recommendations.push('Reduce first input delay to improve interactivity');
  }
  
  if (report.coreWebVitals.CLS && report.coreWebVitals.CLS > 0.1) {
    recommendations.push('Minimize cumulative layout shift for better visual stability');
  }
  
  // Executive dysfunction specific recommendations
  const cognitiveLoad = report.customMetrics.cognitiveLoadScore;
  if (cognitiveLoad && cognitiveLoad > 70) {
    recommendations.push('Reduce visual complexity to lower cognitive load');
    recommendations.push('Consider implementing progressive disclosure patterns');
    recommendations.push('Add more white space and clearer visual hierarchy');
  }
  
  return recommendations;
};

export default {
  initializePerformanceMonitoring,
  getPerformanceMonitor,
  trackTaskStart,
  trackTaskComplete,
  assessCognitiveLoad,
  getPerformanceRecommendations
};