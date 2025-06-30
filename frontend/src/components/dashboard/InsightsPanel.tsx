import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Star, ArrowRight, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { integrationService } from '../../services/integration';
import { cn } from '../../utils/cn';
import { DASHBOARD_CONSTANTS } from '../../utils/dashboardHelpers';

/**
 * Simplified insights panel showing only actionable recommendations
 * Reduces information overload by focusing on 3 key insights maximum
 */
export const InsightsPanel: React.FC = () => {
  const { data: insights, isLoading } = useQuery({
    queryKey: ['productivity-insights'],
    queryFn: () => integrationService.getInsights(7), // Last 7 days
  });

  /**
   * Get semantic styling for insight types
   */
  const getInsightSemantics = (type: string, priority: string) => {
    if (type === 'positive') {
      return {
        bg: 'bg-green-50',
        border: 'border-green-500',
        icon: TrendingUp,
        iconColor: 'text-green-600'
      };
    }
    if (type === 'warning' || priority === 'high') {
      return {
        bg: 'bg-amber-50',
        border: 'border-amber-500',
        icon: AlertTriangle,
        iconColor: 'text-amber-600'
      };
    }
    return {
      bg: 'bg-blue-50',
      border: 'border-blue-500',
      icon: Lightbulb,
      iconColor: 'text-blue-600'
    };
  };

  /**
   * Get priority badge variant
   */
  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive' as const;
      case 'medium':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (!insights || insights.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold mb-2">Building Your Insights</h3>
          <p className="text-muted-foreground">
            Use the app for a few days to get personalized productivity insights and recommendations.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Limit to top insights to prevent cognitive overload
  const topInsights = insights.slice(0, DASHBOARD_CONSTANTS.INSIGHTS_DISPLAY_LIMIT);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Star className="h-6 w-6 text-purple-600" />
            <div>
              <h2 className="text-lg font-semibold">AI Insights & Recommendations</h2>
              <p className="text-sm text-muted-foreground">
                Personalized suggestions based on your productivity patterns
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights List */}
      <div className="space-y-4">
        {topInsights.map((insight) => {
          const semantics = getInsightSemantics(insight.type, insight.priority);
          const IconComponent = semantics.icon;

          return (
            <Card 
              key={insight.id} 
              className={cn("border-l-4", semantics.bg)} 
              style={{ borderLeftColor: semantics.border.replace('border-', '') }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <IconComponent className={cn("h-5 w-5 mt-0.5", semantics.iconColor)} />
                    <div>
                      <CardTitle className="text-base font-semibold">
                        {insight.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getPriorityVariant(insight.priority)}>
                    {insight.priority}
                  </Badge>
                </div>
              </CardHeader>
              
              {insight.action_items && insight.action_items.length > 0 && (
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Recommended Actions:</h4>
                    <ul className="space-y-2">
                      {insight.action_items.slice(0, DASHBOARD_CONSTANTS.INSIGHTS_DISPLAY_LIMIT).map((action, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <ArrowRight className="h-3 w-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Weekly Summary */}
      <WeeklySummaryCard />
    </div>
  );
};

/**
 * Simple weekly summary to provide context without overwhelming data
 */
const WeeklySummaryCard: React.FC = () => {
  const { data: weeklyData } = useQuery({
    queryKey: ['weekly-summary'],
    queryFn: () => integrationService.getWeeklyProductivitySummary(),
  });

  if (!weeklyData) return null;

  return (
    <Card className="bg-gray-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">This Week at a Glance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {weeklyData.tasks_completed || 0}
            </div>
            <div className="text-xs text-muted-foreground">Tasks Completed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {weeklyData.habits_maintained || 0}
            </div>
            <div className="text-xs text-muted-foreground">Habits Maintained</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {weeklyData.avg_mood_score ? weeklyData.avg_mood_score.toFixed(1) : 'N/A'}
            </div>
            <div className="text-xs text-muted-foreground">Avg Mood Score</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};