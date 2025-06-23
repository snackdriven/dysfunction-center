import React from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Plus } from 'lucide-react';

export const Mood: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mood Tracking</h1>
          <p className="text-muted-foreground">
            Monitor your emotional wellbeing and identify patterns
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Log Mood
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mood History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No mood entries yet. Log your first mood to get started!</p>
        </CardContent>
      </Card>
    </div>
  );
};