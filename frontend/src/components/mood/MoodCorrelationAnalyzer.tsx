import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp,
  Brain,
  Activity,
  Cloud,
  Clock,
  Download
} from 'lucide-react';
import { moodApi, MoodEntry } from '../../services/mood';
import { tasksApi, Task } from '../../services/tasks';
import { habitsApi, Habit } from '../../services/habits';

interface CorrelationData {
  factor: string;
  correlation: number;
  significance: number;
  description: string;
  color: string;
}

interface TimeBasedMoodData {
  hour: number;
  averageMood: number;
  count: number;
}

interface WeatherMoodData {
  weather: string;
  averageMood: number;
  count: number;
}

interface ActivityMoodData {
  activity: string;
  averageMood: number;
  count: number;
  moodRange: [number, number];
}

export const MoodCorrelationAnalyzer: React.FC = () => {
  // const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]); // Commented out as unused
  // const [tasks, setTasks] = useState<Task[]>([]); // Commented out as unused
  // const [habits, setHabits] = useState<Habit[]>([]); // Commented out as unused
  const [correlations, setCorrelations] = useState<CorrelationData[]>([]);
  const [timeBasedData, setTimeBasedData] = useState<TimeBasedMoodData[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherMoodData[]>([]);
  const [activityData, setActivityData] = useState<ActivityMoodData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeframe) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      const [moodData, taskData, habitData] = await Promise.all([
        moodApi.getMoodEntries({
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          limit: 1000
        }),
        tasksApi.getTasks({
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        }),
        habitsApi.getHabits()
      ]);

      // setMoodEntries(moodData); // Commented out as state is unused
      // setTasks(taskData); // Commented out as state is unused
      // setHabits(habitData); // Commented out as state is unused

      analyzeCorrelations(moodData, taskData, habitData);
      analyzeTimePatterns(moodData);
      analyzeWeatherPatterns(moodData);
      analyzeActivityPatterns(moodData);
    } catch (error) {
      console.error('Error fetching correlation data:', error);
    } finally {
      setLoading(false);
    }
  }, [timeframe]); // eslint-disable-line react-hooks/exhaustive-deps

  const analyzeCorrelations = (moods: MoodEntry[], tasks: Task[], habits: Habit[]) => {
    const correlationResults: CorrelationData[] = [];

    // Task completion correlation
    const taskCompletionDays = new Map<string, { completed: number, total: number, mood: number[] }>();
    
    moods.forEach(mood => {
      const date = new Date(mood.entry_date).toDateString();
      const dayTasks = tasks.filter(task => 
        new Date(task.created_at).toDateString() === date
      );
      const completedTasks = dayTasks.filter(task => task.completed).length;
      
      if (!taskCompletionDays.has(date)) {
        taskCompletionDays.set(date, { completed: 0, total: 0, mood: [] });
      }
      const dayData = taskCompletionDays.get(date)!;
      dayData.completed = completedTasks;
      dayData.total = dayTasks.length;
      dayData.mood.push(mood.mood_score);
    });

    // Calculate task completion correlation
    const taskCorrelationData = Array.from(taskCompletionDays.values())
      .filter(d => d.total > 0 && d.mood.length > 0)
      .map(d => ({
        completionRate: d.completed / d.total,
        avgMood: d.mood.reduce((sum, m) => sum + m, 0) / d.mood.length
      }));

    if (taskCorrelationData.length > 1) {
      const taskCorrelation = calculateCorrelation(
        taskCorrelationData.map(d => d.completionRate),
        taskCorrelationData.map(d => d.avgMood)
      );

      correlationResults.push({
        factor: 'Task Completion',
        correlation: taskCorrelation,
        significance: Math.abs(taskCorrelation) > 0.3 ? 0.8 : 0.4,
        description: taskCorrelation > 0.3 
          ? 'Higher task completion strongly correlates with better mood'
          : taskCorrelation < -0.3
          ? 'Lower task completion correlates with worse mood'
          : 'Task completion has minimal impact on mood',
        color: taskCorrelation > 0.3 ? '#10b981' : taskCorrelation < -0.3 ? '#ef4444' : '#6b7280'
      });
    }

    // Time of day correlation
    const hourlyMoods = new Map<number, number[]>();
    moods.forEach(mood => {
      const hour = new Date(mood.created_at).getHours();
      if (!hourlyMoods.has(hour)) {
        hourlyMoods.set(hour, []);
      }
      hourlyMoods.get(hour)!.push(mood.energy_level || mood.mood_score);
    });

    const morningMoods = Array.from(hourlyMoods.entries())
      .filter(([hour]) => hour >= 6 && hour < 12)
      .flatMap(([, moods]) => moods);
    
    const eveningMoods = Array.from(hourlyMoods.entries())
      .filter(([hour]) => hour >= 18 && hour < 24)
      .flatMap(([, moods]) => moods);

    if (morningMoods.length > 0 && eveningMoods.length > 0) {
      const morningAvg = morningMoods.reduce((sum, m) => sum + m, 0) / morningMoods.length;
      const eveningAvg = eveningMoods.reduce((sum, m) => sum + m, 0) / eveningMoods.length;
      const timeDiff = morningAvg - eveningAvg;

      correlationResults.push({
        factor: 'Time of Day',
        correlation: timeDiff / 5, // Normalize to -1 to 1 range
        significance: Math.abs(timeDiff) > 0.5 ? 0.7 : 0.3,
        description: timeDiff > 0.5
          ? 'You tend to feel better in the mornings'
          : timeDiff < -0.5
          ? 'You tend to feel better in the evenings'
          : 'Time of day has minimal impact on your mood',
        color: timeDiff > 0.5 ? '#f59e0b' : timeDiff < -0.5 ? '#3b82f6' : '#6b7280'
      });
    }

    // Weather correlation (if available)
    const weatherMoods = new Map<string, number[]>();
    moods.forEach(mood => {
      if (mood.weather) {
        if (!weatherMoods.has(mood.weather)) {
          weatherMoods.set(mood.weather, []);
        }
        weatherMoods.get(mood.weather)!.push(mood.mood_score);
      }
    });

    if (weatherMoods.size > 1) {
      const sunnyMoods = weatherMoods.get('sunny') || [];
      const rainyMoods = weatherMoods.get('rainy') || [];
      
      if (sunnyMoods.length > 0 && rainyMoods.length > 0) {
        const sunnyAvg = sunnyMoods.reduce((sum, m) => sum + m, 0) / sunnyMoods.length;
        const rainyAvg = rainyMoods.reduce((sum, m) => sum + m, 0) / rainyMoods.length;
        const weatherDiff = sunnyAvg - rainyAvg;

        correlationResults.push({
          factor: 'Weather',
          correlation: weatherDiff / 5,
          significance: Math.abs(weatherDiff) > 0.5 ? 0.6 : 0.3,
          description: weatherDiff > 0.5
            ? 'Sunny weather significantly improves your mood'
            : weatherDiff < -0.5
            ? 'Rainy weather tends to lower your mood'
            : 'Weather has minimal impact on your mood',
          color: weatherDiff > 0.5 ? '#fbbf24' : weatherDiff < -0.5 ? '#60a5fa' : '#6b7280'
        });
      }
    }

    setCorrelations(correlationResults.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation)));
  };

  const calculateCorrelation = (x: number[], y: number[]): number => {
    if (x.length !== y.length || x.length < 2) return 0;
    
    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);
    const sumYY = y.reduce((sum, val) => sum + val * val, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  };

  const analyzeTimePatterns = (moods: MoodEntry[]) => {
    const hourlyData = new Map<number, { total: number, count: number }>();
    
    moods.forEach(mood => {
      const hour = new Date(mood.created_at).getHours();
      if (!hourlyData.has(hour)) {
        hourlyData.set(hour, { total: 0, count: 0 });
      }
      const data = hourlyData.get(hour)!;
      data.total += mood.mood_score;
      data.count += 1;
    });

    const timeData = Array.from(hourlyData.entries())
      .map(([hour, data]) => ({
        hour,
        averageMood: data.total / data.count,
        count: data.count
      }))
      .sort((a, b) => a.hour - b.hour);

    setTimeBasedData(timeData);
  };

  const analyzeWeatherPatterns = (moods: MoodEntry[]) => {
    const weatherMap = new Map<string, { total: number, count: number }>();
    
    moods.forEach(mood => {
      const weather = mood.weather || 'unknown';
      if (!weatherMap.has(weather)) {
        weatherMap.set(weather, { total: 0, count: 0 });
      }
      const data = weatherMap.get(weather)!;
      data.total += mood.mood_score;
      data.count += 1;
    });

    const weatherResults = Array.from(weatherMap.entries())
      .map(([weather, data]) => ({
        weather,
        averageMood: data.total / data.count,
        count: data.count
      }))
      .filter(d => d.count > 1) // Filter out single occurrences
      .sort((a, b) => b.averageMood - a.averageMood);

    setWeatherData(weatherResults);
  };

  const analyzeActivityPatterns = (moods: MoodEntry[]) => {
    const activityMap = new Map<string, number[]>();
    
    moods.forEach(mood => {
      if (mood.context_tags?.activities) {
        mood.context_tags.activities.forEach(activity => {
          if (!activityMap.has(activity)) {
            activityMap.set(activity, []);
          }
          activityMap.get(activity)!.push(mood.mood_score);
        });
      }
    });

    const activityResults = Array.from(activityMap.entries())
      .map(([activity, moodScores]) => ({
        activity,
        averageMood: moodScores.reduce((sum, score) => sum + score, 0) / moodScores.length,
        count: moodScores.length,
        moodRange: [Math.min(...moodScores), Math.max(...moodScores)] as [number, number]
      }))
      .filter(d => d.count > 2) // Filter out activities with few data points
      .sort((a, b) => b.averageMood - a.averageMood);

    setActivityData(activityResults);
  };

  const exportAnalysis = () => {
    const analysisData = {
      correlations,
      timeBasedData,
      weatherData,
      activityData,
      generatedAt: new Date().toISOString(),
      timeframe
    };

    const blob = new Blob([JSON.stringify(analysisData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mood-correlation-analysis-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4']; // Commented out as unused

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <Brain className="h-8 w-8 animate-pulse mx-auto mb-2" />
              <p>Analyzing mood correlations...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6" />
            Mood Correlation Analysis
          </h2>
          <p className="text-muted-foreground">
            Discover patterns and correlations in your mood data
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Past Week</SelectItem>
              <SelectItem value="month">Past Month</SelectItem>
              <SelectItem value="quarter">Past Quarter</SelectItem>
              <SelectItem value="year">Past Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportAnalysis}>
            <Download className="h-4 w-4 mr-2" />
            Export Analysis
          </Button>
        </div>
      </div>

      <Tabs defaultValue="correlations" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="correlations">Correlations</TabsTrigger>
          <TabsTrigger value="time">Time Patterns</TabsTrigger>
          <TabsTrigger value="weather">Weather Impact</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>

        <TabsContent value="correlations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Key Correlations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {correlations.length > 0 ? (
                <div className="space-y-4">
                  {correlations.map((correlation, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{correlation.factor}</h4>
                          <Badge 
                            variant={Math.abs(correlation.correlation) > 0.5 ? 'default' : 'secondary'}
                          >
                            {Math.abs(correlation.correlation) > 0.5 ? 'Strong' : 'Moderate'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {correlation.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <div 
                          className="text-lg font-bold"
                          style={{ color: correlation.color }}
                        >
                          {(correlation.correlation > 0 ? '+' : '')}
                          {(correlation.correlation * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Correlation
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Not enough data to calculate correlations. Try logging more mood entries.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Time-Based Mood Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              {timeBasedData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timeBasedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="hour" 
                      tickFormatter={(hour) => `${hour}:00`}
                    />
                    <YAxis domain={[1, 5]} />
                    <Tooltip 
                      labelFormatter={(hour) => `${hour}:00`}
                      formatter={(value: number) => [value.toFixed(2), 'Average Mood']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="averageMood" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No time-based patterns found in your data.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weather" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                Weather Impact on Mood
              </CardTitle>
            </CardHeader>
            <CardContent>
              {weatherData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weatherData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="weather" />
                    <YAxis domain={[1, 5]} />
                    <Tooltip 
                      formatter={(value: number) => [value.toFixed(2), 'Average Mood']}
                    />
                    <Bar dataKey="averageMood" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No weather data found. Consider adding weather information to your mood entries.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Activity Impact on Mood
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activityData.length > 0 ? (
                <div className="space-y-3">
                  {activityData.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium capitalize">{activity.activity}</h4>
                        <p className="text-sm text-muted-foreground">
                          {activity.count} entries
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {activity.averageMood.toFixed(1)}/5
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Range: {activity.moodRange[0]}-{activity.moodRange[1]}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No activity data found. Try adding activity tags to your mood entries.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
