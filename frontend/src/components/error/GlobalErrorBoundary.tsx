import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  Bug, 
  Download,
  ExternalLink,
  Copy,
  CheckCircle
} from 'lucide-react';
import { ApiError, errorLogger, parseApiError, getUserFriendlyMessage } from '../../utils/errorHandling';
import { cn } from '../../utils/cn';

interface ErrorBoundaryState {
  hasError: boolean;
  error: ApiError | null;
  errorId: string | null;
  showDetails: boolean;
  copied: boolean;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: ApiError, errorInfo: ErrorInfo) => void;
  showErrorDetails?: boolean;
}

export class GlobalErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: null,
      showDetails: false,
      copied: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const apiError = parseApiError(error);
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error: apiError,
      errorId,
      showDetails: false,
      copied: false,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const apiError = parseApiError(error);
    
    // Log the error
    errorLogger.log(apiError, {
      action: 'component_error_boundary',
      page: window.location.pathname,
      userAgent: navigator.userAgent,
    });

    // Call the onError prop if provided
    this.props.onError?.(apiError, errorInfo);

    // Auto-reset after 10 seconds for certain error types
    if (apiError.type === 'network' || apiError.type === 'server') {
      this.resetTimeoutId = window.setTimeout(() => {
        this.handleReset();
      }, 10000);
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  handleReset = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
      this.resetTimeoutId = null;
    }
    
    this.setState({
      hasError: false,
      error: null,
      errorId: null,
      showDetails: false,
      copied: false,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleToggleDetails = () => {
    this.setState(prev => ({
      showDetails: !prev.showDetails,
    }));
  };

  handleDownloadLogs = () => {
    const logs = errorLogger.exportLogs();
    const blob = new Blob([logs], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  handleCopyError = async () => {
    if (!this.state.error || !this.state.errorId) return;

    const errorReport = {
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      error: this.state.error,
      userAgent: navigator.userAgent,
      url: window.location.href,
      logs: errorLogger.getLogs().slice(0, 5), // Last 5 logs
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2));
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch (err) {
      console.error('Failed to copy error report:', err);
    }
  };

  handleReportBug = () => {
    const error = this.state.error;
    if (!error) return;

    const title = encodeURIComponent(`Bug Report: ${error.type} error - ${error.message}`);
    const body = encodeURIComponent(`
**Error ID:** ${this.state.errorId}
**Error Type:** ${error.type}
**Message:** ${error.message}
**Code:** ${error.code || 'N/A'}
**Status Code:** ${error.statusCode || 'N/A'}
**URL:** ${window.location.href}
**User Agent:** ${navigator.userAgent}
**Timestamp:** ${new Date().toISOString()}

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**


**Actual Behavior:**


**Additional Context:**

    `.trim());

    window.open(
      `https://github.com/your-org/executive-dysfunction-center/issues/new?title=${title}&body=${body}`,
      '_blank'
    );
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const error = this.state.error;
      const userMessage = getUserFriendlyMessage(error);

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-xl font-semibold">
                Something went wrong
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                {userMessage}
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Error Type Badge */}
              <div className="flex justify-center">
                <Badge 
                  variant={
                    error.type === 'network' ? 'secondary' :
                    error.type === 'unauthorized' ? 'destructive' :
                    error.type === 'validation' ? 'default' :
                    'outline'
                  }
                  className="text-sm"
                >
                  {error.type.replace('_', ' ').toUpperCase()} ERROR
                </Badge>
              </div>

              {/* Error ID */}
              {this.state.errorId && (
                <div className="text-center text-sm text-muted-foreground">
                  Error ID: <code className="bg-muted px-1 rounded">{this.state.errorId}</code>
                </div>
              )}

              {/* Recovery Actions */}
              <div className="flex flex-wrap justify-center gap-2">
                <Button onClick={this.handleReset} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
                <Button onClick={this.handleReload} variant="outline" className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Reload Page
                </Button>
                <Button onClick={this.handleGoHome} variant="outline" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
              </div>

              {/* Additional Actions */}
              <div className="border-t pt-4">
                <div className="flex flex-wrap justify-center gap-2 text-sm">
                  <Button
                    onClick={this.handleToggleDetails}
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Bug className="h-3 w-3" />
                    {this.state.showDetails ? 'Hide' : 'Show'} Details
                  </Button>
                  <Button
                    onClick={this.handleCopyError}
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {this.state.copied ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    {this.state.copied ? 'Copied!' : 'Copy Error'}
                  </Button>
                  <Button
                    onClick={this.handleDownloadLogs}
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-3 w-3" />
                    Download Logs
                  </Button>
                  <Button
                    onClick={this.handleReportBug}
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Report Bug
                  </Button>
                </div>
              </div>

              {/* Error Details */}
              {this.state.showDetails && (
                <div className="border-t pt-4">
                  <details className="space-y-2">
                    <summary className="cursor-pointer font-medium">Technical Details</summary>
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <div className="space-y-2 text-sm font-mono">
                        <div>
                          <span className="font-semibold">Type:</span> {error.type}
                        </div>
                        <div>
                          <span className="font-semibold">Message:</span> {error.message}
                        </div>
                        {error.code && (
                          <div>
                            <span className="font-semibold">Code:</span> {error.code}
                          </div>
                        )}
                        {error.statusCode && (
                          <div>
                            <span className="font-semibold">Status:</span> {error.statusCode}
                          </div>
                        )}
                        {error.details && (
                          <div>
                            <span className="font-semibold">Details:</span>
                            <pre className="mt-1 p-2 bg-background rounded text-xs overflow-auto">
                              {JSON.stringify(error.details, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </details>
                </div>
              )}

              {/* Help Text */}
              <div className="text-center text-xs text-muted-foreground">
                If this problem persists, please{' '}
                <button
                  onClick={this.handleReportBug}
                  className="underline hover:text-foreground transition-colors"
                >
                  report it as a bug
                </button>
                {' '}or contact support with the error ID above.
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for using error boundary in functional components
export const useErrorHandler = () => {
  return (error: any, context?: string) => {
    const apiError = parseApiError(error);
    errorLogger.log(apiError, { action: context || 'error_handler' });
    throw apiError;
  };
};

// Higher-order component for wrapping components with error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<ErrorBoundaryProps>
) => {
  const WrappedComponent = (props: P) => (
    <GlobalErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </GlobalErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};