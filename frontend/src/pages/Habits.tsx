import React from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Plus } from 'lucide-react';

export const Habits: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Habits</h1>
          <p className="text-muted-foreground">
            Build positive routines and track your progress
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Habit
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Habits</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No habits yet. Create your first habit to get started!</p>
        </CardContent>
      </Card>
    </div>
  );
};