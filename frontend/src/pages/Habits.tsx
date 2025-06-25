import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { HabitGrid } from '../components/habits/HabitGrid';
import { HabitForm } from '../components/habits/HabitForm';
import { HabitTemplateSelector } from '../components/habits/HabitTemplateSelector';
import { HabitAnalytics } from '../components/habits/HabitAnalytics';
import { Dialog, DialogContent, DialogTrigger } from '../components/ui/Dialog';
import { Plus, Target, BarChart3, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { habitsApi } from '../services/habits';

export const Habits: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);

  const { data: habits, isLoading } = useQuery({
    queryKey: ['habits'],
    queryFn: habitsApi.getHabits,
  });

  const { data: todayCompletions } = useQuery({
    queryKey: ['habit-completions', 'today'],
    queryFn: () => habitsApi.getTodayCompletions(),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Habits</h1>
          <p className="text-muted-foreground">
            Build positive routines and track your progress
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsTemplateDialogOpen(true)}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Use Template
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Custom
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <HabitForm onSuccess={() => setIsCreateDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Daily Summary */}
          <div className="p-4 bg-card rounded-lg border">
            <h3 className="font-semibold mb-2">Today's Progress</h3>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">
                {todayCompletions?.filter(c => c.completed).length || 0} of {habits?.length || 0} completed
              </span>
              <div className="flex-1 bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ 
                    width: `${habits ? (todayCompletions?.filter(c => c.completed).length || 0) / habits.length * 100 : 0}%` 
                  }}
                />
              </div>
            </div>
          </div>

          {/* Habit Grid */}
          <HabitGrid 
            habits={habits || []}
            completions={todayCompletions || []}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <HabitAnalytics />
        </TabsContent>
      </Tabs>

      {/* Template Selector */}
      <HabitTemplateSelector
        isOpen={isTemplateDialogOpen}
        onClose={() => setIsTemplateDialogOpen(false)}
        onSuccess={() => {
          setIsTemplateDialogOpen(false);
          // Refresh habits data
        }}
      />
    </div>
  );
};