import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { MoodEntryForm } from '../components/mood/MoodEntryForm';
import { MoodHistory } from '../components/mood/MoodHistory';
import { MoodPatterns } from '../components/mood/MoodPatterns';
import { MoodAnalytics } from '../components/mood/MoodAnalytics';
import { MoodCorrelationAnalyzer } from '../components/mood/MoodCorrelationAnalyzer';
import { Dialog, DialogContent, DialogTrigger } from '../components/ui/Dialog';
import { Smile, History, TrendingUp, BarChart3, Plus, Brain } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { moodApi } from '../services/mood';

export const Mood: React.FC = () => {
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);

  const { data: todayMood } = useQuery({
    queryKey: ['mood', 'today'],
    queryFn: moodApi.getTodayMood,
    retry: false,
  });

  const { data: recentMoods } = useQuery({
    queryKey: ['mood', 'recent'],
    queryFn: () => moodApi.getMoodEntries({ limit: 7 }),
  });

  const averageMood = React.useMemo(() => {
    if (!recentMoods?.length) return 0;
    return recentMoods.reduce((sum, mood) => sum + mood.mood_score, 0) / recentMoods.length;
  }, [recentMoods]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Mood Tracking
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
            Monitor your emotional wellbeing and identify patterns over time
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {todayMood && (
            <Button variant="outline" className="w-full sm:w-auto min-h-[44px]">
              <Smile className="mr-2 h-4 w-4" />
              Update Today's Mood
            </Button>
          )}
          <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto min-h-[44px]">
                <Plus className="mr-2 h-4 w-4" />
                {todayMood ? 'Add Entry' : 'Log Today\'s Mood'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <MoodEntryForm onSuccess={() => setIsEntryDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Today's Mood Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="p-4 sm:p-6 bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-semibold mb-3 text-base">Today's Mood</h3>
          {todayMood ? (
            <div className="flex items-center gap-3">
              <span className="text-3xl" role="img" aria-label="Mood emoji">
                {['😢', '😔', '😐', '🙂', '😊'][todayMood.mood_score - 1]}
              </span>
              <div>
                <p className="font-medium text-lg">{todayMood.mood_score}/5</p>
                <p className="text-sm text-muted-foreground">
                  {['Very Low', 'Low', 'Neutral', 'Good', 'Excellent'][todayMood.mood_score - 1]}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Not logged yet</p>
          )}
        </div>

        <div className="p-4 sm:p-6 bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-semibold mb-3 text-base">7-Day Average</h3>
          <div className="flex items-center gap-3">
            <span className="text-3xl" role="img" aria-label="Chart">📊</span>
            <div>
              <p className="font-medium text-lg">{averageMood.toFixed(1)}/5</p>
              <p className="text-sm text-muted-foreground">
                {averageMood >= 4 ? 'Great week!' : averageMood >= 3 ? 'Good week' : 'Challenging week'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
          <h3 className="font-semibold mb-3 text-base">Streak</h3>
          <div className="flex items-center gap-3">
            <span className="text-3xl" role="img" aria-label="Fire">🔥</span>
            <div>
              <p className="font-medium text-lg">{recentMoods?.length || 0} days</p>
              <p className="text-sm text-muted-foreground">Consecutive logs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="history" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
          <TabsTrigger value="history" className="flex items-center gap-2 min-h-[44px] text-sm">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
            <span className="sm:hidden">📋</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2 min-h-[44px] text-sm">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
            <span className="sm:hidden">📊</span>
          </TabsTrigger>
          <TabsTrigger value="patterns" className="flex items-center gap-2 min-h-[44px] text-sm">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Patterns</span>
            <span className="sm:hidden">📈</span>
          </TabsTrigger>
          <TabsTrigger value="correlations" className="flex items-center gap-2 min-h-[44px] text-sm">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">Correlations</span>
            <span className="sm:hidden">🧠</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          <MoodHistory />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <MoodAnalytics />
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <MoodPatterns />
        </TabsContent>

        <TabsContent value="correlations" className="space-y-4">
          <MoodCorrelationAnalyzer />
        </TabsContent>
      </Tabs>
    </div>
  );
};