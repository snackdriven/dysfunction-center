import React from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ErrorStateProps {
  error?: Error | any;
  onRetry?: () => void;
  title?: string;
  description?: string;
  className?: string;
  compact?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  title = "Something went wrong",
  description = "Unable to load data. Please try again.",
  className,
  compact = false
}) => {
  const errorMessage = error?.message || error?.toString() || description;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2 p-4 text-sm", className)}>
        <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
        <span className="text-muted-foreground flex-1">{errorMessage}</span>
        {onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry}>
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-sm">
          {errorMessage}
        </p>
        {onRetry && (
          <Button onClick={onRetry} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
};