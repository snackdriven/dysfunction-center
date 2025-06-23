import React, { useState } from 'react';
import { DashboardWidget } from '../../layout/DashboardGrid';
import { Button } from '../../ui/Button';
import { Slider } from '../../ui/Slider';
import { Smile, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { moodApi, useCreateMoodEntry } from '../../../services/mood';

const moodEmojis = ['😢', '😔', '😐', '🙂', '😊'];
const moodLabels = ['Very Low', 'Low', 'Neutral', 'Good', 'Excellent'];

export const MoodCheckinWidget: React.FC = () => {
  const [showQuickEntry, setShowQuickEntry] = useState(false);
  const [moodScore, setMoodScore] = useState(3);

  const { data: todayMood } = useQuery({
    queryKey: ['mood', 'today'],
    queryFn: moodApi.getTodayMood,
    retry: false,
  });

  const { data: recentMoods } = useQuery({
    queryKey: ['mood', 'recent'],
    queryFn: () => moodApi.getMoodEntries({ limit: 7 }),
  });

  const createMoodEntry = useCreateMoodEntry();

  const averageMood = React.useMemo(() => {
    if (!recentMoods?.length) return 0;
    return recentMoods.reduce((sum, mood) => sum + mood.mood_score, 0) / recentMoods.length;
  }, [recentMoods]);

  const handleQuickMoodLog = async () => {
    try {
      await createMoodEntry.mutateAsync({
        mood_score: moodScore,
        date: new Date().toISOString().split('T')[0],
      });
      setShowQuickEntry(false);
    } catch (error) {
      console.error('Failed to log mood:', error);
    }
  };

  return (
    <DashboardWidget
      title="Mood Check-in"
      subtitle="How are you feeling today?"
      action={
        <Button size="sm" variant="outline">
          View History
        </Button>
      }
    >
      <div className="space-y-4">
        {todayMood ? (
          // Today's mood already logged
          <div className="text-center">
            <div className="text-4xl mb-2">
              {moodEmojis[todayMood.mood_score - 1]}
            </div>
            <p className="font-medium">
              {moodLabels[todayMood.mood_score - 1]}
            </p>
            <p className="text-sm text-muted-foreground">
              Logged today at {new Date(todayMood.created_at).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
        ) : showQuickEntry ? (
          // Quick mood entry form
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl mb-2">
                {moodEmojis[moodScore - 1]}
              </div>
              <p className="font-medium mb-4">
                {moodLabels[moodScore - 1]}
              </p>
              <div className="px-2">
                <Slider
                  value={[moodScore]}
                  onValueChange={(value) => setMoodScore(value[0])}
                  min={1}
                  max={5}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowQuickEntry(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1"
                onClick={handleQuickMoodLog}
                disabled={createMoodEntry.isPending}
              >
                {createMoodEntry.isPending ? 'Logging...' : 'Log Mood'}
              </Button>
            </div>
          </div>
        ) : (
          // Prompt to log mood
          <div className="text-center space-y-4">
            <div className="text-4xl mb-2">🤔</div>
            <p className="text-sm text-muted-foreground mb-4">
              You haven't logged your mood today
            </p>
            <Button 
              className="w-full"
              onClick={() => setShowQuickEntry(true)}
            >
              <Smile className="mr-2 h-4 w-4" />
              Quick Check-in
            </Button>
          </div>
        )}

        {/* Recent trend */}
        {recentMoods && recentMoods.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">7-day average</span>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="font-medium">{averageMood.toFixed(1)}/5</span>
              </div>
            </div>
            <div className="mt-2 flex gap-1">
              {recentMoods.slice(0, 7).reverse().map((mood, index) => (
                <div 
                  key={mood.id} 
                  className="flex-1 text-center text-xs"
                  title={`${new Date(mood.date).toLocaleDateString()}: ${moodLabels[mood.mood_score - 1]}`}
                >
                  <div className="text-lg">{moodEmojis[mood.mood_score - 1]}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardWidget>
  );
};