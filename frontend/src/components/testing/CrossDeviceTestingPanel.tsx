// Cross-device testing and validation component
// Used to verify Executive Dysfunction Center functionality across devices

import React, { useState, useEffect } from 'react';
import { useDeviceCapabilities, getAdaptiveLoadingStrategy, featureSupport, getDeviceInfo } from '../../utils/deviceCapabilities';
import { cn } from '../../utils/cn';

interface TestResult {
  test: string;
  passed: boolean;
  message: string;
  severity: 'info' | 'warning' | 'error';
}

interface DeviceTestSuite {
  name: string;
  tests: TestResult[];
  overallStatus: 'pass' | 'warning' | 'fail';
}

export const CrossDeviceTestingPanel: React.FC = () => {
  const capabilities = useDeviceCapabilities();
  const strategy = getAdaptiveLoadingStrategy(capabilities);
  const [testSuites, setTestSuites] = useState<DeviceTestSuite[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const runDeviceTests = async () => {
    setIsRunning(true);
    const suites: DeviceTestSuite[] = [];

    // Test Suite 1: Basic Device Detection
    const basicTests: TestResult[] = [
      {
        test: 'Device Type Detection',
        passed: capabilities.isMobile || capabilities.isTablet || capabilities.isDesktop,
        message: `Detected as ${capabilities.isMobile ? 'Mobile' : capabilities.isTablet ? 'Tablet' : 'Desktop'}`,
        severity: 'info'
      },
      {
        test: 'Screen Size Classification',
        passed: ['small', 'medium', 'large', 'xlarge'].includes(capabilities.screenSize),
        message: `Screen size: ${capabilities.screenSize}`,
        severity: 'info'
      },
      {
        test: 'Touch Support Detection',
        passed: capabilities.isMobile ? capabilities.hasTouch : true,
        message: `Touch support: ${capabilities.hasTouch ? 'Available' : 'Not available'}`,
        severity: capabilities.isMobile && !capabilities.hasTouch ? 'warning' : 'info'
      }
    ];

    // Test Suite 2: Browser Feature Support
    const featureTests: TestResult[] = [
      {
        test: 'Container Queries Support',
        passed: capabilities.supportsContainerQueries,
        message: capabilities.supportsContainerQueries ? 'Native support' : 'Requires polyfill',
        severity: capabilities.supportsContainerQueries ? 'info' : 'warning'
      },
      {
        test: 'Service Worker Support',
        passed: capabilities.supportsServiceWorker,
        message: capabilities.supportsServiceWorker ? 'Available' : 'Not supported',
        severity: capabilities.supportsServiceWorker ? 'info' : 'warning'
      },
      {
        test: 'WebP Image Support',
        passed: capabilities.supportsWebP,
        message: capabilities.supportsWebP ? 'Supported' : 'Fallback to JPEG/PNG',
        severity: capabilities.supportsWebP ? 'info' : 'warning'
      },
      {
        test: 'Intersection Observer',
        passed: capabilities.supportsIntersectionObserver,
        message: capabilities.supportsIntersectionObserver ? 'Available' : 'Requires polyfill',
        severity: capabilities.supportsIntersectionObserver ? 'info' : 'warning'
      }
    ];

    // Test Suite 3: Accessibility Features
    const accessibilityTests: TestResult[] = [
      {
        test: 'Reduced Motion Preference',
        passed: true, // Always passes, just reports status
        message: capabilities.prefersReducedMotion ? 'Reduced motion enabled' : 'Animations enabled',
        severity: 'info'
      },
      {
        test: 'High Contrast Support',
        passed: true,
        message: capabilities.prefersHighContrast ? 'High contrast enabled' : 'Standard contrast',
        severity: 'info'
      },
      {
        test: 'Color Scheme Support',
        passed: capabilities.supportsColorScheme,
        message: capabilities.supportsColorScheme ? 'System theme detection available' : 'Manual theme only',
        severity: capabilities.supportsColorScheme ? 'info' : 'warning'
      }
    ];

    // Test Suite 4: Performance Indicators
    const performanceTests: TestResult[] = [
      {
        test: 'Device Memory',
        passed: capabilities.deviceMemory >= 4,
        message: `${capabilities.deviceMemory}GB available`,
        severity: capabilities.deviceMemory < 4 ? 'warning' : 'info'
      },
      {
        test: 'CPU Cores',
        passed: capabilities.hardwareConcurrency >= 4,
        message: `${capabilities.hardwareConcurrency} cores available`,
        severity: capabilities.hardwareConcurrency < 4 ? 'warning' : 'info'
      },
      {
        test: 'Network Connection',
        passed: capabilities.connectionSpeed !== 'slow',
        message: `Connection speed: ${capabilities.connectionSpeed}`,
        severity: capabilities.connectionSpeed === 'slow' ? 'warning' : 'info'
      }
    ];

    // Test Suite 5: Executive Dysfunction Optimizations
    const executiveDysfunctionTests: TestResult[] = [
      {
        test: 'Cognitive Load Capacity',
        passed: true,
        message: `Estimated capacity: ${capabilities.cognitiveLoadCapacity}`,
        severity: capabilities.cognitiveLoadCapacity === 'low' ? 'warning' : 'info'
      },
      {
        test: 'Attention Span Indicator',
        passed: true,
        message: `Estimated span: ${capabilities.attentionSpanIndicator}`,
        severity: capabilities.attentionSpanIndicator === 'short' ? 'warning' : 'info'
      },
      {
        test: 'Adaptive Features Enabled',
        passed: strategy.reduceCognitiveLoad || strategy.enableFocusMode || strategy.simplifyInteractions,
        message: `${[
          strategy.reduceCognitiveLoad && 'Cognitive load reduction',
          strategy.enableFocusMode && 'Focus mode',
          strategy.simplifyInteractions && 'Simplified interactions'
        ].filter(Boolean).join(', ') || 'Standard experience'}`,
        severity: 'info'
      }
    ];

    // Test Suite 6: Touch and Gesture Support
    const touchTests: TestResult[] = [
      {
        test: 'Touch Events',
        passed: !capabilities.isMobile || capabilities.hasTouch,
        message: capabilities.hasTouch ? 'Touch events available' : 'Mouse/keyboard only',
        severity: capabilities.isMobile && !capabilities.hasTouch ? 'error' : 'info'
      },
      {
        test: 'Gesture Recognition',
        passed: !capabilities.hasTouch || strategy.enableGestures,
        message: strategy.enableGestures ? 'Gestures enabled' : 'Gestures disabled',
        severity: 'info'
      },
      {
        test: 'Haptic Feedback',
        passed: !capabilities.isMobile || 'vibrate' in navigator,
        message: 'vibrate' in navigator ? 'Haptic feedback available' : 'No haptic feedback',
        severity: capabilities.isMobile && !('vibrate' in navigator) ? 'warning' : 'info'
      }
    ];

    // Compile test suites
    suites.push(
      { name: 'Basic Device Detection', tests: basicTests, overallStatus: 'pass' },
      { name: 'Browser Feature Support', tests: featureTests, overallStatus: 'pass' },
      { name: 'Accessibility Features', tests: accessibilityTests, overallStatus: 'pass' },
      { name: 'Performance Indicators', tests: performanceTests, overallStatus: 'pass' },
      { name: 'Executive Dysfunction Optimizations', tests: executiveDysfunctionTests, overallStatus: 'pass' },
      { name: 'Touch and Gesture Support', tests: touchTests, overallStatus: 'pass' }
    );

    // Determine overall status for each suite
    suites.forEach(suite => {
      const hasErrors = suite.tests.some(test => !test.passed && test.severity === 'error');
      const hasWarnings = suite.tests.some(test => !test.passed && test.severity === 'warning');
      
      if (hasErrors) {
        suite.overallStatus = 'fail';
      } else if (hasWarnings) {
        suite.overallStatus = 'warning';
      } else {
        suite.overallStatus = 'pass';
      }
    });

    setTestSuites(suites);
    setIsRunning(false);
  };

  useEffect(() => {
    runDeviceTests();
  }, [capabilities]);

  const exportResults = () => {
    const deviceInfo = getDeviceInfo();
    const results = {
      timestamp: new Date().toISOString(),
      deviceInfo,
      testSuites,
      recommendations: generateRecommendations()
    };

    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `device-test-results-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const generateRecommendations = () => {
    const recommendations = [];

    if (!capabilities.supportsContainerQueries) {
      recommendations.push('Install container-query-polyfill for better responsive design support');
    }

    if (capabilities.connectionSpeed === 'slow') {
      recommendations.push('Consider additional image optimization and lazy loading');
    }

    if (capabilities.deviceMemory < 4) {
      recommendations.push('Enable virtualization for large lists and reduce memory usage');
    }

    if (capabilities.cognitiveLoadCapacity === 'low') {
      recommendations.push('Enable focus mode and reduce visual complexity');
    }

    if (capabilities.prefersReducedMotion) {
      recommendations.push('Ensure all animations have reduced-motion alternatives');
    }

    return recommendations;
  };

  const getStatusColor = (status: 'pass' | 'warning' | 'fail') => {
    switch (status) {
      case 'pass': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'fail': return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const getSeverityColor = (severity: 'info' | 'warning' | 'error') => {
    switch (severity) {
      case 'info': return 'text-blue-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Cross-Device Compatibility Test</h2>
        <div className="flex gap-2">
          <button
            onClick={runDeviceTests}
            disabled={isRunning}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isRunning ? 'Running Tests...' : 'Run Tests'}
          </button>
          <button
            onClick={exportResults}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Export Results
          </button>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
      </div>

      {/* Device Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Device Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium">Type:</span> {capabilities.isMobile ? 'Mobile' : capabilities.isTablet ? 'Tablet' : 'Desktop'}
          </div>
          <div>
            <span className="font-medium">Screen:</span> {capabilities.screenSize}
          </div>
          <div>
            <span className="font-medium">Connection:</span> {capabilities.connectionSpeed}
          </div>
          <div>
            <span className="font-medium">Memory:</span> {capabilities.deviceMemory}GB
          </div>
          <div>
            <span className="font-medium">Touch:</span> {capabilities.hasTouch ? 'Yes' : 'No'}
          </div>
          <div>
            <span className="font-medium">Reduced Motion:</span> {capabilities.prefersReducedMotion ? 'Yes' : 'No'}
          </div>
        </div>
      </div>

      {/* Test Results */}
      <div className="space-y-4">
        {testSuites.map((suite, index) => (
          <div key={index} className={cn('border rounded-lg p-4', getStatusColor(suite.overallStatus))}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">{suite.name}</h3>
              <span className={cn('px-2 py-1 rounded text-sm font-medium', getStatusColor(suite.overallStatus))}>
                {suite.overallStatus.toUpperCase()}
              </span>
            </div>
            
            {showDetails && (
              <div className="space-y-2">
                {suite.tests.map((test, testIndex) => (
                  <div key={testIndex} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{test.test}</span>
                    <div className="flex items-center gap-2">
                      <span className={getSeverityColor(test.severity)}>{test.message}</span>
                      <span className={cn('px-2 py-1 rounded text-xs', 
                        test.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                        {test.passed ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Recommendations</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          {generateRecommendations().map((rec, index) => (
            <li key={index}>{rec}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CrossDeviceTestingPanel;
