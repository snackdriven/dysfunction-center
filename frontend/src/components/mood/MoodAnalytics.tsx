import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { useQuery } from '@tanstack/react-query';
import { moodApi } from '../../services/mood';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Calendar, Activity, TrendingUp, TrendingDown } from 'lucide-react';

export const MoodAnalytics: React.FC = () => {
  const { data: monthlyMoods } = useQuery({
    queryKey: ['mood', 'monthly'],
    queryFn: () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      return moodApi.getMoodEntries({
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
      });
    },
  });

  // const { data: patterns } = useQuery({ // Commented out as unused
  //   queryKey: ['mood', 'patterns'],
  //   queryFn: () => moodApi.getMoodPatterns(),
  // });

  const analyticsData = React.useMemo(() => {
    if (!monthlyMoods?.length) return null;

    // Trend data for line chart
    const trendData = monthlyMoods.map(entry => ({
      date: new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      mood: entry.mood_score,
      fullDate: entry.created_at,
    })).slice(-14); // Last 14 days

    // Distribution data for pie chart
    const moodCounts = monthlyMoods.reduce((acc, entry) => {
      const score = entry.mood_score;
      acc[score] = (acc[score] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const distributionData = [
      { name: 'Very Low (1)', value: moodCounts[1] || 0, color: '#ef4444' },
      { name: 'Low (2)', value: moodCounts[2] || 0, color: '#f97316' },
      { name: 'Neutral (3)', value: moodCounts[3] || 0, color: '#eab308' },
      { name: 'Good (4)', value: moodCounts[4] || 0, color: '#22c55e' },
      { name: 'Excellent (5)', value: moodCounts[5] || 0, color: '#16a34a' },
    ].filter(item => item.value > 0);

    // Weekly patterns
    const weeklyData = Array.from({ length: 7 }, (_, i) => {
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][i];
      const dayMoods = monthlyMoods.filter(entry => new Date(entry.created_at).getDay() === i);
      const average = dayMoods.length > 0 
        ? dayMoods.reduce((sum, entry) => sum + entry.mood_score, 0) / dayMoods.length 
        : 0;
      
      return {
        day: dayName.slice(0, 3),
        average: parseFloat(average.toFixed(1)),
        count: dayMoods.length,
      };
    });

    // Calculate trends
    const recentAverage = trendData.slice(-7).reduce((sum, entry) => sum + entry.mood, 0) / Math.min(trendData.length, 7);
    const previousAverage = trendData.slice(-14, -7).reduce((sum, entry) => sum + entry.mood, 0) / Math.min(trendData.length - 7, 7);
    const trend = recentAverage - previousAverage;

    return {
      trendData,
      distributionData,
      weeklyData,
      trend,
      recentAverage,
      totalEntries: monthlyMoods.length,
    };
  }, [monthlyMoods]);

  if (!analyticsData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-64 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Recent Average</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {analyticsData.recentAverage.toFixed(1)}
            </p>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              {analyticsData.trend >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm font-medium">Trend</span>
            </div>
            <p className={`text-2xl font-bold ${analyticsData.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analyticsData.trend >= 0 ? '+' : ''}{analyticsData.trend.toFixed(1)}
            </p>
            <p className="text-xs text-muted-foreground">vs previous week</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Total Entries</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {analyticsData.totalEntries}
            </p>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔥</span>
              <span className="text-sm font-medium">Consistency</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">
              {Math.round((analyticsData.totalEntries / 30) * 100)}%
            </p>
            <p className="text-xs text-muted-foreground">Daily logging rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mood Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Mood Trend (Last 14 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis domain={[1, 5]} fontSize={12} />
                <Tooltip 
                  labelFormatter={(label) => `Date: ${label}`}
                  formatter={(value) => [`${value}/5`, 'Mood Score']}
                />
                <Line 
                  type="monotone" 
                  dataKey="mood" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Mood Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Mood Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.distributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData.distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Patterns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" fontSize={12} />
                <YAxis domain={[0, 5]} fontSize={12} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'average' ? `${value}/5` : value,
                    name === 'average' ? 'Average Mood' : 'Entry Count'
                  ]}
                />
                <Bar dataKey="average" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Insights & Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analyticsData.trend >= 0.5 && (
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800">Positive Trend</p>
                  <p className="text-xs text-green-700">Your mood has been improving recently. Keep up the great work!</p>
                </div>
              </div>
            )}
            
            {analyticsData.trend <= -0.5 && (
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                <TrendingDown className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-orange-800">Declining Trend</p>
                  <p className="text-xs text-orange-700">Consider reaching out to support or practicing self-care activities.</p>
                </div>
              </div>
            )}

            {analyticsData.recentAverage >= 4 && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <span className="text-lg">🌟</span>
                <div>
                  <p className="text-sm font-medium text-blue-800">Excellent Mood</p>
                  <p className="text-xs text-blue-700">You've been feeling great! What's been working well for you?</p>
                </div>
              </div>
            )}

            {/* Weekly pattern insights */}
            {(() => {
              const bestDay = analyticsData.weeklyData.reduce((max, day) => day.average > max.average ? day : max);
              const worstDay = analyticsData.weeklyData.reduce((min, day) => day.average < min.average && day.average > 0 ? day : min);
              
              return bestDay.average > 0 && worstDay.average > 0 && bestDay.day !== worstDay.day ? (
                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-purple-800">Weekly Pattern</p>
                    <p className="text-xs text-purple-700">
                      Your mood is typically highest on {bestDay.day}s and lowest on {worstDay.day}s.
                    </p>
                  </div>
                </div>
              ) : null;
            })()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
