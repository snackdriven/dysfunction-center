import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export interface TimeDisplayFormat {
  timeFormat: '12h' | '24h';
  dateFormat: 'short' | 'long' | 'iso';
  showSeconds: boolean;
  showDate: boolean;
  showTimeZone: boolean;
}

interface CurrentTimeDisplayProps {
  format?: Partial<TimeDisplayFormat>;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const DEFAULT_FORMAT: TimeDisplayFormat = {
  timeFormat: '12h',
  dateFormat: 'short',
  showSeconds: false,
  showDate: true,
  showTimeZone: false,
};

export const CurrentTimeDisplay: React.FC<CurrentTimeDisplayProps> = ({
  format = {},
  className = '',
  showIcon = true,
  size = 'md'
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const finalFormat = { ...DEFAULT_FORMAT, ...format };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, finalFormat.showSeconds ? 1000 : 60000);

    return () => clearInterval(interval);
  }, [finalFormat.showSeconds]);

  const formatTime = (date: Date): string => {
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: finalFormat.timeFormat === '12h',
    };

    if (finalFormat.showSeconds) {
      timeOptions.second = '2-digit';
    }

    if (finalFormat.showTimeZone) {
      timeOptions.timeZoneName = 'short';
    }

    return date.toLocaleTimeString([], timeOptions);
  };

  const formatDate = (date: Date): string => {
    switch (finalFormat.dateFormat) {
      case 'short':
        return date.toLocaleDateString([], { 
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        });
      case 'long':
        return date.toLocaleDateString([], { 
          weekday: 'long',
          month: 'long', 
          day: 'numeric',
          year: 'numeric'
        });
      case 'iso':
        return date.toISOString().split('T')[0];
      default:
        return date.toLocaleDateString();
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-sm';
      case 'lg':
        return 'text-lg font-medium';
      default:
        return 'text-base';
    }
  };

  return (
    <div className={`flex items-center gap-2 ${getSizeClasses()} ${className}`}>
      {showIcon && <Clock className={`${size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'}`} />}
      <div className="flex flex-col">
        <span className="font-mono">
          {formatTime(currentTime)}
        </span>
        {finalFormat.showDate && (
          <span className={`text-muted-foreground ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
            {formatDate(currentTime)}
          </span>
        )}
      </div>
    </div>
  );
};
