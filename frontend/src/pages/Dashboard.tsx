import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Good morning! 👋
        </h1>
        <p className="text-muted-foreground">
          Welcome to your productivity dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Today's Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">5</p>
            <p className="text-sm text-muted-foreground">3 completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Habit Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">7 days</p>
            <p className="text-sm text-muted-foreground">Keep it up!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mood Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">😊</p>
            <p className="text-sm text-muted-foreground">Feeling good</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};