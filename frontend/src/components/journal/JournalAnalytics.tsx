import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { 
  BarChart3, 
  Calendar, 
  Target, 
  BookOpen, 
  Clock 
} from 'lucide-react';
import { useJournalAnalytics } from '../../services/journal';

export const JournalAnalytics: React.FC = () => {
  const { data: analytics, isLoading, error } = useJournalAnalytics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-red-600">Failed to load journal analytics. Please try again.</p>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card className="p-6">
        <p className="text-gray-600">No analytics data available yet. Start journaling to see insights!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Entries</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.total_entries}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.entries_this_week}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Target className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Words</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(analytics.average_words_per_entry)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Writing Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Used Tags */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Used Tags</h3>
          {analytics.most_used_tags.length > 0 ? (
            <div className="space-y-3">
              {analytics.most_used_tags.slice(0, 10).map((tag, index) => (
                <div key={index} className="flex items-center justify-between">
                  <Badge variant="secondary">#{tag.tag}</Badge>
                  <span className="text-sm text-gray-600">{tag.count} uses</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No tags used yet. Add tags to your entries to see insights!</p>
          )}
        </Card>

        {/* Writing Patterns by Day */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Writing by Day of Week</h3>
          <div className="space-y-3">
            {analytics.writing_patterns.entries_by_day_of_week.map((day, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{day.day}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.max(5, (day.count / Math.max(...analytics.writing_patterns.entries_by_day_of_week.map(d => d.count))) * 100)}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">{day.count}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Mood and Productivity Correlations */}
      {(analytics.mood_correlation || analytics.productivity_correlation) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mood Correlation */}
          {analytics.mood_correlation && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mood & Writing Correlation</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg mood on writing days</span>
                  <Badge variant="outline">
                    {analytics.mood_correlation.average_mood_on_writing_days.toFixed(1)}/5
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg mood on non-writing days</span>
                  <Badge variant="outline">
                    {analytics.mood_correlation.average_mood_on_non_writing_days.toFixed(1)}/5
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Correlation strength</span>
                  <Badge 
                    variant={analytics.mood_correlation.correlation_strength > 0.3 ? "default" : "secondary"}
                  >
                    {analytics.mood_correlation.correlation_strength > 0 ? '+' : ''}
                    {analytics.mood_correlation.correlation_strength.toFixed(2)}
                  </Badge>
                </div>
              </div>
            </Card>
          )}

          {/* Productivity Correlation */}
          {analytics.productivity_correlation && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Productivity Scores</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average score</span>
                  <Badge variant="outline">
                    {analytics.productivity_correlation.average_productivity_score.toFixed(1)}/10
                  </Badge>
                </div>
                <div className="space-y-2">
                  <span className="text-sm text-gray-600">Score distribution</span>                  {analytics.productivity_correlation.entries_by_score.map((score, index) => {
                    const maxCount = Math.max(...analytics.productivity_correlation!.entries_by_score.map(s => s.count));
                    const width = Math.max(5, (score.count / maxCount) * 100);
                    return (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <span>{score.score}/10</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500 rounded-full transition-all duration-500"
                              style={{ width: `${width}%` }}
                            />
                          </div>
                          <span className="w-6 text-right">{score.count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Writing Time Patterns */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Writing Time Patterns</h3>
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1">
          {analytics.writing_patterns.entries_by_hour.map((hour, index) => {
            const maxCount = Math.max(...analytics.writing_patterns.entries_by_hour.map(h => h.count));
            const intensity = maxCount > 0 ? (hour.count / maxCount) : 0;
            const getIntensityColor = (intensity: number) => {
              if (intensity === 0) return 'bg-gray-100';
              if (intensity < 0.25) return 'bg-blue-200';
              if (intensity < 0.5) return 'bg-blue-300';
              if (intensity < 0.75) return 'bg-blue-400';
              return 'bg-blue-500';
            };
            
            return (
              <div
                key={index}
                className={`aspect-square rounded-sm ${getIntensityColor(intensity)} 
                           flex items-center justify-center text-xs font-medium text-gray-700
                           hover:scale-110 transition-transform cursor-pointer`}
                title={`${hour.hour}:00 - ${hour.count} entries`}
              >
                {hour.hour}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
          <span>12 AM</span>
          <span>12 PM</span>
          <span>11 PM</span>
        </div>
      </Card>
    </div>
  );
};
