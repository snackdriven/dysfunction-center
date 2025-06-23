import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { TrendingUp, TrendingDown, Calendar, AlertTriangle, Smile, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { moodApi } from '../../services/mood';

const moodEmojis = ['😢', '😔', '😐', '🙂', '😊'];
const moodLabels = ['Very Low', 'Low', 'Neutral', 'Good', 'Excellent'];

export const MoodPatterns: React.FC = () => {
  const { data: recentEntries, isLoading } = useQuery({
    queryKey: ['mood', 'recent-patterns'],
    queryFn: () => moodApi.getMoodEntries({ limit: 30 }),
  });

  const patterns = React.useMemo(() => {
    if (!recentEntries?.length) return null;

    // Calculate averages
    const avgMood = recentEntries.reduce((sum, entry) => sum + entry.mood_score, 0) / recentEntries.length;
    const avgEnergy = recentEntries
      .filter(e => e.energy_level)
      .reduce((sum, entry) => sum + (entry.energy_level || 0), 0) / 
      recentEntries.filter(e => e.energy_level).length || 0;
    const avgStress = recentEntries
      .filter(e => e.stress_level)
      .reduce((sum, entry) => sum + (entry.stress_level || 0), 0) / 
      recentEntries.filter(e => e.stress_level).length || 0;

    // Calculate trends (comparing first half vs second half)
    const midpoint = Math.floor(recentEntries.length / 2);
    const firstHalf = recentEntries.slice(0, midpoint);
    const secondHalf = recentEntries.slice(midpoint);
    
    const firstHalfAvg = firstHalf.reduce((sum, entry) => sum + entry.mood_score, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, entry) => sum + entry.mood_score, 0) / secondHalf.length;
    const trend = secondHalfAvg - firstHalfAvg;    // TODO: Re-enable Phase 2 features when backend support is ready
    // Most common triggers
    // const triggerCounts = recentEntries
    //   .flatMap(entry => entry.triggers || [])
    //   .reduce((acc, trigger) => {
    //     acc[trigger.name] = (acc[trigger.name] || 0) + 1;
    //     return acc;
    //   }, {} as Record<string, number>);

    // const topTriggers = Object.entries(triggerCounts)
    //   .sort(([,a], [,b]) => b - a)
    //   .slice(0, 5)
    //   .map(([trigger, count]) => ({ trigger, count }));

    // Most common contexts
    // const contextCounts = recentEntries
    //   .filter(entry => entry.context_tags)
    //   .reduce((acc, entry) => {
    //     const contexts = entry.context_tags!;
    //     // Handle context_tags properly
    //     return acc;
    //   }, {} as Record<string, number>);    // const topContexts = Object.entries(contextCounts)
    //   .sort(([,a], [,b]) => b - a)
    //   .slice(0, 3)
    //   .map(([context, count]) => ({ context, count }));

    // Day of week patterns
    const dayPatterns = recentEntries.reduce((acc, entry) => {
      const day = new Date(entry.entry_date).getDay(); // 0 = Sunday
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day];
      if (!acc[dayName]) {
        acc[dayName] = { total: 0, count: 0 };
      }
      acc[dayName].total += entry.mood_score;
      acc[dayName].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const dayAverages = Object.entries(dayPatterns)
      .map(([day, data]) => ({
        day,
        average: data.total / data.count,
        count: data.count
      }))
      .sort((a, b) => b.average - a.average);

    // Best and worst mood days
    const sortedEntries = [...recentEntries].sort((a, b) => b.mood_score - a.mood_score);
    const bestDay = sortedEntries[0];
    const worstDay = sortedEntries[sortedEntries.length - 1];    return {
      avgMood,
      avgEnergy,
      avgStress,
      trend,
      // TODO: Re-enable Phase 2 features when backend support is ready
      // topTriggers,
      // topContexts,
      dayAverages,
      bestDay,
      worstDay,
      totalEntries: recentEntries.length
    };
  }, [recentEntries]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Analyzing mood patterns...</p>
        </div>
      </div>
    );
  }

  if (!patterns || patterns.totalEntries < 3) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Not enough data for patterns</p>
          <p className="text-sm text-muted-foreground mt-2">
            Log mood entries for at least 3 days to see patterns
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Mood</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{moodEmojis[Math.round(patterns.avgMood) - 1]}</span>
              <div>
                <div className="text-2xl font-bold">{patterns.avgMood.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">
                  {moodLabels[Math.round(patterns.avgMood) - 1]}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {patterns.trend > 0.1 ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : patterns.trend < -0.1 ? (
                <TrendingDown className="h-5 w-5 text-red-600" />
              ) : (
                <Activity className="h-5 w-5 text-gray-500" />
              )}
              <div>
                <div className="text-2xl font-bold">
                  {patterns.trend > 0.1 ? '↗' : patterns.trend < -0.1 ? '↘' : '→'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {patterns.trend > 0.1 ? 'Improving' : 
                   patterns.trend < -0.1 ? 'Declining' : 'Stable'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {patterns.avgEnergy > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Energy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{patterns.avgEnergy.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">out of 5</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {patterns.avgStress > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Stress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold">{patterns.avgStress.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">out of 5</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Best and Worst Days */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <Smile className="h-5 w-5" />
              Best Day
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{moodEmojis[patterns.bestDay.mood_score - 1]}</span>
              <div>
                <div className="font-semibold">
                  {new Date(patterns.bestDay.entry_date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="text-sm text-muted-foreground">                  {moodLabels[patterns.bestDay.mood_score - 1]} ({patterns.bestDay.mood_score}/5)
                </div>
                {/* TODO: Re-enable Phase 2 features when backend support is ready */}
                {/* {patterns.bestDay.context_tags && (
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {patterns.bestDay.context_tags}
                  </Badge>
                )} */}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Challenging Day
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{moodEmojis[patterns.worstDay.mood_score - 1]}</span>
              <div>
                <div className="font-semibold">
                  {new Date(patterns.worstDay.entry_date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>                <div className="text-sm text-muted-foreground">
                  {moodLabels[patterns.worstDay.mood_score - 1]} ({patterns.worstDay.mood_score}/5)
                </div>
                {/* TODO: Re-enable Phase 2 features when backend support is ready */}
                {/* {patterns.worstDay.triggers && patterns.worstDay.triggers.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {patterns.worstDay.triggers.slice(0, 2).map((trigger) => (
                      <Badge key={trigger.id} variant="destructive" className="text-xs">
                        {trigger.name}
                      </Badge>
                    ))}
                  </div>
                )} */}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Day of Week Patterns */}
      {patterns.dayAverages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Day of Week Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {patterns.dayAverages.map(({ day, average, count }) => (
                <div key={day} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-20 text-sm font-medium">{day}</span>
                    <span className="text-lg">{moodEmojis[Math.round(average) - 1]}</span>
                    <span className="text-sm text-muted-foreground">
                      {average.toFixed(1)}/5
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {count} entr{count === 1 ? 'y' : 'ies'}
                    </span>
                    <div className="w-16 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(average / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}      {/* TODO: Re-enable Phase 2 features when backend support is ready */}
      {/* Top Triggers */}
      {/* {patterns.topTriggers?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Common Triggers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {patterns.topTriggers.map(({ trigger, count }) => (
                <Badge key={trigger} variant="destructive" className="gap-1">
                  {trigger}
                  <span className="text-xs opacity-75">({count})</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )} */}      {/* Top Contexts */}
      {/* {patterns.topContexts?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Most Common Contexts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {patterns.topContexts.map(({ context, count }) => (
                <Badge key={context} variant="secondary" className="gap-1">
                  {context}
                  <span className="text-xs opacity-75">({count})</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )} */}
    </div>
  );
};