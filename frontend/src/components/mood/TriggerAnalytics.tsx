import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  BarChart3, 
  Calendar,
  Clock,
  Target,
  Activity,
  Lightbulb
} from 'lucide-react';
import { moodApi } from '../../services/mood';

const moodEmojis = ['😢', '😔', '😐', '🙂', '😊'];
const moodLabels = ['Very Low', 'Low', 'Neutral', 'Good', 'Excellent'];

export const TriggerAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | '90days'>('30days');
  const [selectedTrigger, setSelectedTrigger] = useState<string>('');

  const { data: entries } = useQuery({
    queryKey: ['mood', 'entries', timeRange],
    queryFn: () => moodApi.getMoodEntries({ 
      limit: timeRange === '7days' ? 50 : timeRange === '30days' ? 200 : 500 
    }),
  });

  const { data: triggers = [] } = useQuery({
    queryKey: ['mood-triggers'],
    queryFn: () => moodApi.getTriggers()
  });

  const triggerAnalytics = React.useMemo(() => {
    if (!entries?.length || !triggers.length) return null;

    // Calculate trigger impact on mood
    const triggerImpact = triggers.map(trigger => {
      const entriesWithTrigger = entries.filter(entry => 
        entry.triggers?.some(t => t.id === trigger.id)
      );
      const entriesWithoutTrigger = entries.filter(entry => 
        !entry.triggers?.some(t => t.id === trigger.id)
      );

      const avgMoodWithTrigger = entriesWithTrigger.length > 0
        ? entriesWithTrigger.reduce((sum, entry) => sum + entry.mood_score, 0) / entriesWithTrigger.length
        : 0;

      const avgMoodWithoutTrigger = entriesWithoutTrigger.length > 0
        ? entriesWithoutTrigger.reduce((sum, entry) => sum + entry.mood_score, 0) / entriesWithoutTrigger.length
        : 0;

      const impact = avgMoodWithTrigger - avgMoodWithoutTrigger;
      
      return {
        trigger,
        count: entriesWithTrigger.length,
        avgMoodWithTrigger,
        avgMoodWithoutTrigger,
        impact,
        frequency: (entriesWithTrigger.length / entries.length) * 100
      };
    }).filter(item => item.count > 0)
      .sort((a, b) => a.impact - b.impact); // Sort by impact (negative first)

    // Time patterns for triggers
    const timePatterns = triggers.map(trigger => {
      const entriesWithTrigger = entries.filter(entry => 
        entry.triggers?.some(t => t.id === trigger.id)
      );

      const hourCounts = entriesWithTrigger.reduce((acc, entry) => {
        const hour = new Date(entry.created_at || entry.entry_date).getHours();
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      const dayOfWeekCounts = entriesWithTrigger.reduce((acc, entry) => {
        const day = new Date(entry.entry_date).getDay();
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      const peakHour = Object.entries(hourCounts)
        .reduce((peak, [hour, count]) => 
          count > (hourCounts[parseInt(peak)] || 0) ? hour : peak, '0'
        );

      const peakDay = Object.entries(dayOfWeekCounts)
        .reduce((peak, [day, count]) => 
          count > (dayOfWeekCounts[parseInt(peak)] || 0) ? day : peak, '0'
        );

      return {
        trigger,
        count: entriesWithTrigger.length,
        peakHour: parseInt(peakHour),
        peakDay: parseInt(peakDay),
        hourDistribution: hourCounts,
        dayDistribution: dayOfWeekCounts
      };
    }).filter(item => item.count > 0);

    // Trigger combinations
    const combinations = entries
      .filter(entry => entry.triggers && entry.triggers.length > 1)
      .reduce((acc, entry) => {
        const triggerNames = entry.triggers!
          .map(t => t.name)
          .sort()
          .join(' + ');
        
        if (!acc[triggerNames]) {
          acc[triggerNames] = {
            combination: triggerNames,
            count: 0,
            totalMood: 0,
            entries: []
          };
        }
        
        acc[triggerNames].count++;
        acc[triggerNames].totalMood += entry.mood_score;
        acc[triggerNames].entries.push(entry);
        
        return acc;
      }, {} as Record<string, any>);

    const topCombinations = Object.values(combinations)
      .map((combo: any) => ({
        ...combo,
        avgMood: combo.totalMood / combo.count
      }))
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 5);

    return {
      triggerImpact,
      timePatterns,
      topCombinations,
      totalTriggerOccurrences: triggerImpact.reduce((sum, item) => sum + item.count, 0)
    };
  }, [entries, triggers, timeRange]);

  const selectedTriggerData = React.useMemo(() => {
    if (!selectedTrigger || !triggerAnalytics) return null;

    const triggerInfo = triggerAnalytics.triggerImpact.find(
      item => item.trigger.id.toString() === selectedTrigger
    );
    
    const timeInfo = triggerAnalytics.timePatterns.find(
      item => item.trigger.id.toString() === selectedTrigger
    );

    return { triggerInfo, timeInfo };
  }, [selectedTrigger, triggerAnalytics]);

  const getDayName = (dayIndex: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex];
  };

  const formatHour = (hour: number) => {
    return new Date(2000, 0, 1, hour).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      hour12: true 
    });
  };

  if (!triggerAnalytics) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No trigger data available yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Log mood entries with triggers to see analytics
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Trigger Analytics
        </h3>
        <div className="flex items-center gap-4">
          <Select value={selectedTrigger} onValueChange={setSelectedTrigger}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select trigger to analyze" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All triggers</SelectItem>
              {triggers.map((trigger) => (
                <SelectItem key={trigger.id} value={trigger.id.toString()}>
                  {trigger.icon} {trigger.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as typeof timeRange)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 Days</SelectItem>
              <SelectItem value="30days">30 Days</SelectItem>
              <SelectItem value="90days">90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Occurrences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{triggerAnalytics.totalTriggerOccurrences}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Most Impactful</CardTitle>
          </CardHeader>
          <CardContent>
            {triggerAnalytics.triggerImpact.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-red-600">
                  <TrendingDown className="h-4 w-4" />
                </span>
                <span className="font-medium text-sm truncate">
                  {triggerAnalytics.triggerImpact[0].trigger.name}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Most Frequent</CardTitle>
          </CardHeader>
          <CardContent>
            {triggerAnalytics.triggerImpact.length > 0 && (
              <div className="flex items-center gap-2">
                <span>{triggerAnalytics.triggerImpact
                  .sort((a, b) => b.count - a.count)[0].trigger.icon || '⚡'}</span>
                <span className="font-medium text-sm truncate">
                  {triggerAnalytics.triggerImpact
                    .sort((a, b) => b.count - a.count)[0].trigger.name}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Combinations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{triggerAnalytics.topCombinations.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Trigger Impact Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Trigger Impact on Mood
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {triggerAnalytics.triggerImpact.map(({ trigger, count, avgMoodWithTrigger, impact, frequency }) => (
              <div key={trigger.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{trigger.icon || '⚡'}</span>
                  <div>
                    <h4 className="font-medium">{trigger.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{count} occurrences</span>
                      <span>•</span>
                      <span>{frequency.toFixed(1)}% of entries</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-sm font-medium">
                      {moodEmojis[Math.round(avgMoodWithTrigger) - 1]}
                    </div>
                    <div className="text-xs text-muted-foreground">avg mood</div>
                  </div>
                  <div className="flex items-center gap-1">
                    {impact < -0.2 ? (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    ) : impact > 0.2 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <Activity className="h-4 w-4 text-gray-500" />
                    )}
                    <span className={`text-sm font-medium ${
                      impact < -0.2 ? 'text-red-600' : 
                      impact > 0.2 ? 'text-green-600' : 
                      'text-gray-500'
                    }`}>
                      {impact > 0 ? '+' : ''}{impact.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Trigger Details */}
      {selectedTriggerData?.triggerInfo && selectedTriggerData?.timeInfo && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Time Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Peak Hour:</span>
                  <span className="font-medium">
                    {formatHour(selectedTriggerData.timeInfo.peakHour)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Peak Day:</span>
                  <span className="font-medium">
                    {getDayName(selectedTriggerData.timeInfo.peakDay)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Occurrences:</span>
                  <span className="font-medium">
                    {selectedTriggerData.timeInfo.count}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Impact Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Mood Impact:</span>
                  <div className="flex items-center gap-2">
                    {selectedTriggerData.triggerInfo.impact < -0.2 ? (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    ) : selectedTriggerData.triggerInfo.impact > 0.2 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <Activity className="h-4 w-4 text-gray-500" />
                    )}
                    <span className="font-medium">
                      {selectedTriggerData.triggerInfo.impact > 0 ? 'Positive' : 
                       selectedTriggerData.triggerInfo.impact < -0.2 ? 'Negative' : 'Neutral'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Frequency:</span>
                  <span className="font-medium">
                    {selectedTriggerData.triggerInfo.frequency.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg Mood When Present:</span>
                  <span className="font-medium">
                    {selectedTriggerData.triggerInfo.avgMoodWithTrigger.toFixed(1)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trigger Combinations */}
      {triggerAnalytics.topCombinations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Common Trigger Combinations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {triggerAnalytics.topCombinations.map((combo: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{combo.combination}</h4>
                    <div className="text-xs text-muted-foreground">
                      {combo.count} occurrence{combo.count !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{moodEmojis[Math.round(combo.avgMood) - 1]}</span>
                    <div className="text-right">
                      <div className="font-medium">{combo.avgMood.toFixed(1)}</div>
                      <div className="text-xs text-muted-foreground">avg mood</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {triggerAnalytics.triggerImpact.length > 0 && triggerAnalytics.triggerImpact[0].impact < -0.5 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800 text-sm font-medium">
                  <AlertTriangle className="h-4 w-4" />
                  High Impact Trigger Detected
                </div>
                <p className="text-red-700 text-sm mt-1">
                  "{triggerAnalytics.triggerImpact[0].trigger.name}" significantly affects your mood. 
                  Consider developing coping strategies or avoiding this trigger when possible.
                </p>
              </div>
            )}
            
            {triggerAnalytics.triggerImpact.some(item => item.frequency > 50) && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2 text-orange-800 text-sm font-medium">
                  <Calendar className="h-4 w-4" />
                  Frequent Trigger Pattern
                </div>
                <p className="text-orange-700 text-sm mt-1">
                  Some triggers appear in over 50% of your entries. Consider whether these are 
                  environment factors you can modify or personal patterns to address.
                </p>
              </div>
            )}

            {triggerAnalytics.topCombinations.length > 0 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800 text-sm font-medium">
                  <Activity className="h-4 w-4" />
                  Trigger Combinations
                </div>
                <p className="text-blue-700 text-sm mt-1">
                  You have {triggerAnalytics.topCombinations.length} common trigger combinations. 
                  Understanding these patterns can help you prepare for challenging situations.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};