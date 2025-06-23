import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { MoodEntryForm } from '../components/mood/MoodEntryForm';
import { MoodHistory } from '../components/mood/MoodHistory';
import { MoodPatterns } from '../components/mood/MoodPatterns';
import { Dialog, DialogContent, DialogTrigger } from '../components/ui/Dialog';
import { Smile, History, TrendingUp } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mood Tracking</h1>
          <p className="text-muted-foreground">
            Monitor your emotional wellbeing and identify patterns
          </p>
        </div>
        {!todayMood && (
          <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Smile className="mr-2 h-4 w-4" />
                Log Today's Mood
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <MoodEntryForm onSuccess={() => setIsEntryDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Today's Mood Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-card rounded-lg border">
          <h3 className="font-semibold mb-2">Today's Mood</h3>
          {todayMood ? (
            <div className="flex items-center gap-2">
              <span className="text-2xl">
                {['😢', '😔', '😐', '🙂', '😊'][todayMood.mood_score - 1]}
              </span>
              <div>
                <p className="font-medium">{todayMood.mood_score}/5</p>
                <p className="text-sm text-muted-foreground">
                  {['Very Low', 'Low', 'Neutral', 'Good', 'Excellent'][todayMood.mood_score - 1]}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Not logged yet</p>
          )}
        </div>

        <div className="p-4 bg-card rounded-lg border">
          <h3 className="font-semibold mb-2">7-Day Average</h3>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <div>
              <p className="font-medium">{averageMood.toFixed(1)}/5</p>
              <p className="text-sm text-muted-foreground">
                {averageMood >= 4 ? 'Great week!' : averageMood >= 3 ? 'Good week' : 'Challenging week'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-card rounded-lg border">
          <h3 className="font-semibold mb-2">Streak</h3>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="font-medium">{recentMoods?.length || 0} days</p>
              <p className="text-sm text-muted-foreground">Consecutive logs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="patterns" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Patterns
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <MoodHistory />
        </TabsContent>

        <TabsContent value="patterns">
          <MoodPatterns />
        </TabsContent>
      </Tabs>
    </div>
  );
};