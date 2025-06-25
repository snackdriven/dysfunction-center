import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Target, 
  CheckCircle,
  AlertCircle,
  Calendar,
  Filter,
  Download,
  PieChart,
  Activity
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart as RechartsPieChart, 
  Cell, 
  LineChart,
  Line,
  ResponsiveContainer
} from 'recharts';
import { tasksApi } from '../../services/tasks';

interface TaskAnalyticsProps {
  timeRange?: '7days' | '30days' | '90days' | 'all';
  categoryFilter?: number;
}

export const TaskAnalytics: React.FC<TaskAnalyticsProps> = ({
  timeRange = '30days',
  categoryFilter
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(categoryFilter);
  const [activeTab, setActiveTab] = useState('overview');

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['task-analytics', selectedTimeRange, selectedCategory],
    queryFn: () => tasksApi.getAnalytics({
      time_range: selectedTimeRange,
      category_id: selectedCategory
    })
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['task-categories'],
    queryFn: tasksApi.getCategories
  });

  // Sample data for charts - replace with real data from analytics
  const completionTrendData = analytics?.completion_trend || [
    { date: '2024-06-18', completed: 12, created: 15 },
    { date: '2024-06-19', completed: 8, created: 10 },
    { date: '2024-06-20', completed: 15, created: 12 },
    { date: '2024-06-21', completed: 10, created: 14 },
    { date: '2024-06-22', completed: 18, created: 16 },
    { date: '2024-06-23', completed: 14, created: 11 },
    { date: '2024-06-24', completed: 16, created: 13 }
  ];

  const priorityDistribution = analytics?.priority_distribution || [
    { name: 'High', value: 25, count: 8 },
    { name: 'Medium', value: 45, count: 14 },
    { name: 'Low', value: 30, count: 9 }
  ];

  const categoryPerformance = analytics?.category_performance || [
    { category: 'Work', completed: 45, total: 52, rate: 86.5 },
    { category: 'Personal', completed: 23, total: 30, rate: 76.7 },
    { category: 'Learning', completed: 18, total: 22, rate: 81.8 },
    { category: 'Health', completed: 12, total: 15, rate: 80.0 }
  ];

  const timeToCompletion = analytics?.time_to_completion || [
    { range: 'Same day', tasks: 45 },
    { range: '1-2 days', tasks: 32 },
    { range: '3-7 days', tasks: 18 },
    { range: '1-2 weeks', tasks: 12 },
    { range: '2+ weeks', tasks: 8 }
  ];

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

  const exportAnalytics = () => {
    // Implement analytics export functionality
    const exportData = {
      timeRange: selectedTimeRange,
      category: selectedCategory,
      analytics,
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `task-analytics-${selectedTimeRange}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Task Analytics</h2>
          <p className="text-muted-foreground">
            Insights into your task completion patterns and productivity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportAnalytics}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={selectedTimeRange} onValueChange={(value: any) => setSelectedTimeRange(value)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
        <Select 
          value={selectedCategory?.toString() || 'all'} 
          onValueChange={(value) => setSelectedCategory(value === 'all' ? undefined : parseInt(value))}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold">{analytics?.total_tasks || 124}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                +12% vs last period
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{analytics?.completed_tasks || 98}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2">
              <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                79% completion rate
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Time</p>
                <p className="text-2xl font-bold">{analytics?.avg_completion_time || '2.4'}d</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                -0.3d vs target
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">{analytics?.overdue_tasks || 8}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <div className="mt-2">
              <Badge variant="destructive" className="text-xs">
                6.5% of total
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Priority Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Priority Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Tooltip />
                    <RechartsPieChart data={priorityDistribution}>
                      {priorityDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </RechartsPieChart>
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Category Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="rate" fill="#8884d8" name="Completion Rate %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Completion Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={completionTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="completed" stroke="#8884d8" name="Completed" />
                  <Line type="monotone" dataKey="created" stroke="#82ca9d" name="Created" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Time to Completion */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Time to Completion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={timeToCompletion} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="range" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="tasks" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Performance Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">Strong Performance</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Your task completion rate is 15% above average this period.
                  </p>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Trending Up</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    You're completing high-priority tasks 23% faster than last month.
                  </p>
                </div>

                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Opportunity</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Consider breaking down large tasks - they take 40% longer on average.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Pattern */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Productivity Pattern</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { day: 'Monday', completed: 18, percentage: 85 },
                    { day: 'Tuesday', completed: 22, percentage: 95 },
                    { day: 'Wednesday', completed: 20, percentage: 90 },
                    { day: 'Thursday', completed: 19, percentage: 88 },
                    { day: 'Friday', completed: 16, percentage: 80 },
                    { day: 'Saturday', completed: 8, percentage: 60 },
                    { day: 'Sunday', completed: 5, percentage: 45 }
                  ].map(({ day, completed, percentage }) => (
                    <div key={day} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-20 text-sm font-medium">{day}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2 w-32">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">{completed} tasks</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Time of Day Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Peak Productivity Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { time: '6-9 AM', productivity: 70, label: 'Morning boost' },
                    { time: '9-12 PM', productivity: 95, label: 'Peak focus' },
                    { time: '12-3 PM', productivity: 60, label: 'Post-lunch dip' },
                    { time: '3-6 PM', productivity: 85, label: 'Afternoon surge' },
                    { time: '6-9 PM', productivity: 40, label: 'Evening wind-down' },
                    { time: '9+ PM', productivity: 20, label: 'Late night' }
                  ].map(({ time, productivity, label }) => (
                    <div key={time} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-20 text-sm font-medium">{time}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2 w-32">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${productivity}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
