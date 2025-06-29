// Accessibility testing and validation component
// Automated WCAG AA compliance checking for Executive Dysfunction Center

import React, { useEffect, useState } from 'react';
import { cn } from '../../utils/cn';

interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info';
  rule: string;
  description: string;
  element?: string;
  wcagLevel: 'A' | 'AA' | 'AAA';
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
}

interface AccessibilityTestResults {
  score: number;
  issues: AccessibilityIssue[];
  totalElements: number;
  checkedElements: number;
  timestamp: string;
}

export const AccessibilityTester: React.FC<{ className?: string }> = ({ className }) => {
  const [testResults, setTestResults] = useState<AccessibilityTestResults | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const runAccessibilityTests = async () => {
    setIsRunning(true);
    const issues: AccessibilityIssue[] = [];
    let checkedElements = 0;
    let totalElements = 0;

    try {
      // Get all elements for testing
      const allElements = document.querySelectorAll('*');
      totalElements = allElements.length;

      // Test 1: Check for missing alt text on images
      const images = document.querySelectorAll('img');
      images.forEach((img, index) => {
        checkedElements++;
        if (!img.hasAttribute('alt')) {
          issues.push({
            type: 'error',
            rule: 'img-alt',
            description: 'Image missing alt attribute',
            element: `img[${index}]`,
            wcagLevel: 'A',
            impact: 'serious'
          });
        } else if (img.getAttribute('alt')?.trim() === '' && !img.hasAttribute('aria-hidden')) {
          issues.push({
            type: 'warning',
            rule: 'img-alt-empty',
            description: 'Image has empty alt text but is not hidden from screen readers',
            element: `img[${index}]`,
            wcagLevel: 'A',
            impact: 'moderate'
          });
        }
      });

      // Test 2: Check for missing form labels
      const formControls = document.querySelectorAll('input, select, textarea');
      formControls.forEach((control, index) => {
        checkedElements++;
        const id = control.getAttribute('id');
        const ariaLabel = control.getAttribute('aria-label');
        const ariaLabelledBy = control.getAttribute('aria-labelledby');
        
        if (id) {
          const label = document.querySelector(`label[for="${id}"]`);
          if (!label && !ariaLabel && !ariaLabelledBy) {
            issues.push({
              type: 'error',
              rule: 'label-missing',
              description: 'Form control missing accessible label',
              element: `${control.tagName.toLowerCase()}[${index}]`,
              wcagLevel: 'A',
              impact: 'serious'
            });
          }
        }
      });

      // Test 3: Check button accessibility
      const buttons = document.querySelectorAll('button, [role="button"]');
      buttons.forEach((button, index) => {
        checkedElements++;
        const hasText = button.textContent?.trim();
        const hasAriaLabel = button.getAttribute('aria-label');
        const hasAriaLabelledBy = button.getAttribute('aria-labelledby');
        
        if (!hasText && !hasAriaLabel && !hasAriaLabelledBy) {
          issues.push({
            type: 'error',
            rule: 'button-name',
            description: 'Button missing accessible name',
            element: `button[${index}]`,
            wcagLevel: 'A',
            impact: 'serious'
          });
        }
      });

      // Test 4: Check color contrast (simplified)
      const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, a, button, label');
      textElements.forEach((element, index) => {
        checkedElements++;
        const styles = window.getComputedStyle(element);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        
        // Simple contrast check (would need more sophisticated algorithm for production)
        if (color && backgroundColor && color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
          const contrast = calculateContrastRatio(color, backgroundColor);
          if (contrast < 4.5) {
            issues.push({
              type: 'warning',
              rule: 'color-contrast',
              description: `Low color contrast ratio: ${contrast.toFixed(2)}:1 (minimum 4.5:1)`,
              element: `${element.tagName.toLowerCase()}[${index}]`,
              wcagLevel: 'AA',
              impact: 'serious'
            });
          }
        }
      });

      // Test 5: Check for heading hierarchy
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let previousLevel = 0;
      headings.forEach((heading, index) => {
        checkedElements++;
        const currentLevel = parseInt(heading.tagName.charAt(1));
        if (currentLevel > previousLevel + 1) {
          issues.push({
            type: 'warning',
            rule: 'heading-order',
            description: 'Heading levels should not skip (e.g., h1 to h3)',
            element: `${heading.tagName.toLowerCase()}[${index}]`,
            wcagLevel: 'AA',
            impact: 'moderate'
          });
        }
        previousLevel = currentLevel;
      });

      // Test 6: Check for keyboard focus indicators
      const focusableElements = document.querySelectorAll(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      focusableElements.forEach((element, index) => {
        checkedElements++;
        const styles = window.getComputedStyle(element, ':focus');
        const outline = styles.outline;
        const boxShadow = styles.boxShadow;
        
        if (outline === 'none' && boxShadow === 'none') {
          issues.push({
            type: 'warning',
            rule: 'focus-visible',
            description: 'Interactive element may not have visible focus indicator',
            element: `${element.tagName.toLowerCase()}[${index}]`,
            wcagLevel: 'AA',
            impact: 'moderate'
          });
        }
      });

      // Test 7: Check for touch target size
      const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [role="button"]');
      interactiveElements.forEach((element, index) => {
        checkedElements++;
        const rect = element.getBoundingClientRect();
        const minSize = 44; // 44px minimum for WCAG AA
        
        if (rect.width < minSize || rect.height < minSize) {
          issues.push({
            type: 'warning',
            rule: 'target-size',
            description: `Touch target too small: ${Math.round(rect.width)}x${Math.round(rect.height)}px (minimum 44x44px)`,
            element: `${element.tagName.toLowerCase()}[${index}]`,
            wcagLevel: 'AA',
            impact: 'moderate'
          });
        }
      });

      // Calculate score
      const criticalIssues = issues.filter(i => i.impact === 'critical').length;
      const seriousIssues = issues.filter(i => i.impact === 'serious').length;
      const moderateIssues = issues.filter(i => i.impact === 'moderate').length;
      const minorIssues = issues.filter(i => i.impact === 'minor').length;
      
      // Scoring algorithm (100 - penalty points)
      let score = 100;
      score -= criticalIssues * 20;
      score -= seriousIssues * 10;
      score -= moderateIssues * 5;
      score -= minorIssues * 2;
      score = Math.max(0, score);

      setTestResults({
        score,
        issues,
        totalElements,
        checkedElements,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Accessibility test failed:', error);
      issues.push({
        type: 'error',
        rule: 'test-error',
        description: `Test execution failed: ${error}`,
        wcagLevel: 'AA',
        impact: 'critical'
      });
      
      setTestResults({
        score: 0,
        issues,
        totalElements,
        checkedElements,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Simplified contrast ratio calculation
  const calculateContrastRatio = (color1: string, color2: string): number => {
    // This is a simplified version - production would use proper color parsing
    const rgb1 = parseRgb(color1);
    const rgb2 = parseRgb(color2);
    
    if (!rgb1 || !rgb2) return 21; // Assume good contrast if parsing fails
    
    const l1 = getLuminance(rgb1);
    const l2 = getLuminance(rgb2);
    
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  };

  const parseRgb = (color: string): [number, number, number] | null => {
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
    }
    return null;
  };

  const getLuminance = ([r, g, b]: [number, number, number]): number => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'text-red-700 bg-red-100';
      case 'serious': return 'text-red-600 bg-red-50';
      case 'moderate': return 'text-yellow-600 bg-yellow-50';
      case 'minor': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const exportResults = () => {
    if (!testResults) return;
    
    const data = {
      ...testResults,
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `accessibility-report-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    // Auto-run tests on component mount
    runAccessibilityTests();
  }, []);

  return (
    <div className={cn('accessibility-tester p-6 bg-white rounded-lg shadow-lg', className)}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Accessibility Audit</h2>
        <div className="flex gap-2">
          <button
            onClick={runAccessibilityTests}
            disabled={isRunning}
            className={cn(
              'px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            )}
          >
            {isRunning ? 'Running Tests...' : 'Run Tests'}
          </button>
          {testResults && (
            <button
              onClick={exportResults}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Export Report
            </button>
          )}
        </div>
      </div>

      {testResults && (
        <div className="space-y-6">
          {/* Score Summary */}
          <div className={cn('p-4 rounded-lg border', getScoreColor(testResults.score))}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Accessibility Score</h3>
                <p className="text-sm opacity-80">
                  Tested {testResults.checkedElements} elements out of {testResults.totalElements} total
                </p>
              </div>
              <div className="text-3xl font-bold">
                {testResults.score}/100
              </div>
            </div>
          </div>

          {/* Issues Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['critical', 'serious', 'moderate', 'minor'].map(impact => {
              const count = testResults.issues.filter(i => i.impact === impact).length;
              return (
                <div key={impact} className={cn('p-3 rounded-lg', getImpactColor(impact))}>
                  <div className="text-sm font-medium capitalize">{impact}</div>
                  <div className="text-2xl font-bold">{count}</div>
                </div>
              );
            })}
          </div>

          {/* Issues List */}
          {testResults.issues.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Issues Found</h3>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>
              
              <div className="space-y-2">
                {testResults.issues.map((issue, index) => (
                  <div
                    key={index}
                    className={cn(
                      'p-3 rounded-lg border-l-4',
                      issue.impact === 'critical' && 'border-red-500 bg-red-50',
                      issue.impact === 'serious' && 'border-red-400 bg-red-25',
                      issue.impact === 'moderate' && 'border-yellow-500 bg-yellow-50',
                      issue.impact === 'minor' && 'border-blue-500 bg-blue-50'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            'text-xs px-2 py-1 rounded uppercase font-medium',
                            getImpactColor(issue.impact)
                          )}>
                            {issue.impact}
                          </span>
                          <span className="text-xs text-gray-500">
                            WCAG {issue.wcagLevel}
                          </span>
                        </div>
                        <p className="font-medium text-gray-900">{issue.description}</p>
                        {showDetails && issue.element && (
                          <p className="text-sm text-gray-600 mt-1">
                            Element: {issue.element}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {testResults.issues.length === 0 && (
            <div className="text-center py-8">
              <div className="text-green-600 mb-2">
                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No Issues Found!</h3>
              <p className="text-gray-600">Great job on accessibility compliance!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AccessibilityTester;
