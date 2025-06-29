import React, { useEffect, useState, useRef } from 'react';
import axeCore from 'axe-core';
import { Button } from '../ui/Button';

interface AccessibilityReport {
  violations: any[];
  passes: any[];
  incomplete: any[];
  inapplicable: any[];
  timestamp: Date;
  url: string;
}

interface AccessibilityTestSuiteProps {
  autoRun?: boolean;
  showReport?: boolean;
  onReportGenerated?: (report: AccessibilityReport) => void;
}

// Initialize axe-core in development
if (process.env.NODE_ENV === 'development') {
  // axe-core is initialized when running tests
  console.log('Accessibility testing enabled');
}

export const AccessibilityTestSuite: React.FC<AccessibilityTestSuiteProps> = ({
  autoRun = false,
  showReport = true,
  onReportGenerated
}) => {
  const [report, setReport] = useState<AccessibilityReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const runAccessibilityTest = async () => {
    setIsRunning(true);
    
    try {
      // Run axe-core accessibility audit
      const results = await axeCore.run(document);
      
      const newReport: AccessibilityReport = {
        violations: results.violations,
        passes: results.passes,
        incomplete: results.incomplete,
        inapplicable: results.inapplicable,
        timestamp: new Date(),
        url: window.location.href
      };
      
      setReport(newReport);
      onReportGenerated?.(newReport);
      
      // Log results to console for debugging
      if (results.violations.length > 0) {
        console.warn('Accessibility violations found:', results.violations);
      } else {
        console.log('No accessibility violations found!');
      }
      
    } catch (error) {
      console.error('Error running accessibility test:', error);
    } finally {
      setIsRunning(false);
    }
  };

  // Auto-run test when component mounts or route changes
  useEffect(() => {
    if (autoRun) {
      const timer = setTimeout(runAccessibilityTest, 1000); // Delay to allow page to fully render
      return () => clearTimeout(timer);
    }
  }, [autoRun, window.location.pathname]);

  // Add global shortcut to toggle accessibility report
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.key === 'a') {
        event.preventDefault();
        setIsVisible(!isVisible);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  const getSeverityColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'text-red-700 bg-red-100';
      case 'serious': return 'text-red-600 bg-red-50';
      case 'moderate': return 'text-yellow-600 bg-yellow-50';
      case 'minor': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getComplianceScore = () => {
    if (!report) return 0;
    const totalTests = report.violations.length + report.passes.length;
    if (totalTests === 0) return 100;
    return Math.round((report.passes.length / totalTests) * 100);
  };

  if (!showReport && !isVisible) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${isVisible ? 'block' : 'hidden'}`}>
      <div 
        ref={reportRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-w-md w-80 max-h-96 overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Accessibility Report
            </h3>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={runAccessibilityTest}
                disabled={isRunning}
                aria-label="Run accessibility test"
              >
                {isRunning ? '⏳' : '🔍'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsVisible(false)}
                aria-label="Close accessibility report"
              >
                ✕
              </Button>
            </div>
          </div>
          
          {report && (
            <div className="mt-2">
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                getComplianceScore() >= 90 ? 'bg-green-100 text-green-800' :
                getComplianceScore() >= 70 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {getComplianceScore()}% Compliant
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Last tested: {report.timestamp.toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 max-h-64 overflow-y-auto">
          {!report && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No accessibility report available
              </p>
              <Button onClick={runAccessibilityTest} disabled={isRunning}>
                {isRunning ? 'Running Test...' : 'Run Accessibility Test'}
              </Button>
            </div>
          )}

          {report && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                  <div className="font-semibold text-red-700 dark:text-red-400">
                    {report.violations.length}
                  </div>
                  <div className="text-red-600 dark:text-red-500">Violations</div>
                </div>
                <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                  <div className="font-semibold text-green-700 dark:text-green-400">
                    {report.passes.length}
                  </div>
                  <div className="text-green-600 dark:text-green-500">Passed</div>
                </div>
              </div>

              {/* Violations */}
              {report.violations.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Issues Found
                  </h4>
                  <div className="space-y-2">
                    {report.violations.map((violation, index) => (
                      <div 
                        key={index}
                        className="p-2 border border-gray-200 dark:border-gray-600 rounded text-sm"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h5 className="font-medium text-gray-900 dark:text-white text-xs">
                            {violation.help}
                          </h5>
                          <span className={`px-1 py-0.5 rounded text-xs ${getSeverityColor(violation.impact)}`}>
                            {violation.impact}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">
                          {violation.description}
                        </p>
                        <div className="text-xs text-blue-600 dark:text-blue-400">
                          {violation.nodes.length} element(s) affected
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {report.violations.length === 0 && (
                <div className="text-center py-4">
                  <div className="text-green-600 dark:text-green-400 text-2xl mb-2">✅</div>
                  <p className="text-green-700 dark:text-green-400 font-medium">
                    No accessibility violations found!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Press Alt + A to toggle this report
          </p>
        </div>
      </div>
    </div>
  );
};

// Higher-order component to wrap pages with accessibility testing
export const withAccessibilityTesting = <P extends object>(
  Component: React.ComponentType<P>,
  options: AccessibilityTestSuiteProps = {}
) => {
  return function AccessibilityWrappedComponent(props: P) {
    return (
      <>
        <Component {...props} />
        <AccessibilityTestSuite 
          autoRun={process.env.NODE_ENV === 'development'}
          {...options}
        />
      </>
    );
  };
};

// Hook for programmatic accessibility testing
export const useAccessibilityTesting = () => {
  const [report, setReport] = useState<AccessibilityReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runTest = async () => {
    setIsRunning(true);
    try {
      const results = await axeCore.run(document);
      const newReport: AccessibilityReport = {
        violations: results.violations,
        passes: results.passes,
        incomplete: results.incomplete,
        inapplicable: results.inapplicable,
        timestamp: new Date(),
        url: window.location.href
      };
      setReport(newReport);
      return newReport;
    } catch (error) {
      console.error('Error running accessibility test:', error);
      throw error;
    } finally {
      setIsRunning(false);
    }
  };

  return { report, isRunning, runTest };
};
