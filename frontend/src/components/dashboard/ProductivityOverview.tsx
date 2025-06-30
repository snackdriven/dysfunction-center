import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { BarChart3, TrendingUp, Target, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { integrationService } from '../../services/integration';
import { useAppStore } from '../../stores/appStore';
import { cn } from '../../utils/cn';

/**
 * Focused productivity overview showing only essential metrics
 * Replaces the overwhelming data display from UnifiedDashboard
 */
export const ProductivityOverview: React.FC = () => {
  const { selectedDate } = useAppStore();

  const { data: productivityData, isLoading } = useQuery({
    queryKey: ['productivity-data', selectedDate],
    queryFn: () => integrationService.getDailyProductivityData(selectedDate.toISOString().split('T')[0]),
  });

  /**
   * Semantic score evaluation for consistent color coding
   */
  const getScoreSemantics = (score: number) => {
    if (score >= 80) return {
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-500',
      label: 'Excellent'
    };
    if (score >= 60) return {
      color: 'text-blue-700',
      bg: 'bg-blue-50',
      border: 'border-blue-500',
      label: 'Good'
    };
    if (score >= 40) return {
      color: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-500',
      label: 'Fair'
    };
    return {
      color: 'text-red-700',
      bg: 'bg-red-50',
      border: 'border-red-500',
      label: 'Needs Attention'
    };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-48 bg-muted animate-pulse rounded-lg" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!productivityData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No productivity data available</p>
        </CardContent>
      </Card>
    );
  }

  const scoreSemantics = getScoreSemantics(productivityData.productivity_score);

  return (
    <div className="space-y-6">
      {/* Primary Productivity Score */}
      <Card className={cn("border-l-4", scoreSemantics.bg)} style={{ borderLeftColor: scoreSemantics.border.replace('border-', '') }}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Daily Productivity Score
            </CardTitle>
            <Badge variant="outline" className={scoreSemantics.color}>
              {scoreSemantics.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: scoreSemantics.color.replace('text-', '') }}>
                {productivityData.productivity_score}
                <span className="text-xl text-muted-foreground">/100</span>
              </div>
              <Progress 
                value={productivityData.productivity_score} 
                className="h-3" 
                aria-label={`Productivity score: ${productivityData.productivity_score} out of 100`}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon={Target}
          label="Tasks"
          value={`${productivityData.tasks.completed}/${productivityData.tasks.total}`}
          progress={productivityData.tasks.total > 0 ? (productivityData.tasks.completed / productivityData.tasks.total) * 100 : 0}
          color="blue"
        />
        
        <MetricCard
          icon={TrendingUp}
          label="Habits"
          value={`${productivityData.habits.completed}/${productivityData.habits.total}`}
          progress={productivityData.habits.total > 0 ? (productivityData.habits.completed / productivityData.habits.total) * 100 : 0}
          color="green"
        />
        
        <MetricCard
          icon={BarChart3}
          label="Mood Score"
          value={productivityData.mood.score ? productivityData.mood.score.toFixed(1) : 'N/A'}
          progress={productivityData.mood.score ? (productivityData.mood.score / 5) * 100 : 0}
          color="purple"
        />
        
        <MetricCard
          icon={Calendar}
          label="Scheduled"
          value={`${Math.round(productivityData.events.duration_minutes / 60)}h`}
          progress={Math.min((productivityData.events.duration_minutes / 480) * 100, 100)} // Cap at 8 hours
          color="orange"
        />
      </div>
    </div>
  );
};

/**
 * Reusable metric card component for consistent display
 */
interface MetricCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  progress: number;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const MetricCard: React.FC<MetricCardProps> = ({ icon: Icon, label, value, progress, color }) => {
  const colorClasses = {
    blue: { text: 'text-blue-600', bg: 'bg-blue-50', progress: 'bg-blue-500' },
    green: { text: 'text-green-600', bg: 'bg-green-50', progress: 'bg-green-500' },
    purple: { text: 'text-purple-600', bg: 'bg-purple-50', progress: 'bg-purple-500' },
    orange: { text: 'text-orange-600', bg: 'bg-orange-50', progress: 'bg-orange-500' }
  };

  const colorClass = colorClasses[color];

  return (
    <Card className={colorClass.bg}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon className={cn("h-4 w-4", colorClass.text)} />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="space-y-2">
          <p className={cn("text-2xl font-bold", colorClass.text)}>{value}</p>
          <Progress 
            value={progress} 
            className="h-2" 
            aria-label={`${label} progress: ${Math.round(progress)}%`}
          />
        </div>
      </CardContent>
    </Card>
  );
};