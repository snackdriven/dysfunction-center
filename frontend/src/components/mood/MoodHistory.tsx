import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Dialog, DialogContent, DialogTrigger } from '../ui/Dialog';
import { Edit, Trash2, Calendar, Clock, MessageCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { moodApi, MoodEntry, useDeleteMoodEntry } from '../../services/mood';
import { MoodEntryForm } from './MoodEntryForm';

const moodEmojis = ['😢', '😔', '😐', '🙂', '😊'];
const moodLabels = ['Very Low', 'Low', 'Neutral', 'Good', 'Excellent'];

export const MoodHistory: React.FC = () => {
  const [editingEntry, setEditingEntry] = useState<MoodEntry | null>(null);

  const { data: moodEntries, isLoading, error } = useQuery({
    queryKey: ['mood', 'entries'],
    queryFn: () => moodApi.getMoodEntries({ limit: 50 }),
  });

  const deleteMoodEntry = useDeleteMoodEntry();

  const handleDelete = async (entry: MoodEntry) => {
    if (window.confirm('Are you sure you want to delete this mood entry?')) {
      try {
        await deleteMoodEntry.mutateAsync(entry.id);
      } catch (error) {
        console.error('Failed to delete mood entry:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading mood history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load mood history</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!moodEntries?.length) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No mood entries yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Start logging your mood to see your history here
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {moodEntries.map((entry) => (
          <Card key={entry.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Mood Display */}
                  <div className="text-center">
                    <div className="text-3xl mb-1">
                      {moodEmojis[entry.mood_score - 1]}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {entry.mood_score}/5
                    </div>
                  </div>

                  {/* Entry Details */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">
                        {moodLabels[entry.mood_score - 1]}
                      </h4>
                      {entry.secondary_mood && (
                        <Badge variant="secondary" className="text-xs">
                          {entry.secondary_mood}
                        </Badge>
                      )}
                    </div>

                    {/* Date and Time */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(entry.date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(entry.created_at)}
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="flex flex-wrap gap-2 text-sm">
                      {entry.energy_level && (
                        <span className="text-muted-foreground">
                          Energy: {entry.energy_level}/5
                        </span>
                      )}
                      {entry.stress_level && (
                        <span className="text-muted-foreground">
                          Stress: {entry.stress_level}/5
                        </span>
                      )}
                      {entry.context && (
                        <Badge variant="outline" className="text-xs">
                          {entry.context}
                        </Badge>
                      )}
                    </div>

                    {/* Triggers */}
                    {entry.triggers && entry.triggers.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {entry.triggers.map((trigger) => (
                          <Badge key={trigger} variant="destructive" className="text-xs">
                            {trigger}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Notes */}
                    {entry.notes && (
                      <div className="flex items-start gap-2 mt-2 p-2 bg-muted rounded text-sm">
                        <MessageCircle className="h-3 w-3 mt-0.5 text-muted-foreground" />
                        <p className="text-muted-foreground">{entry.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingEntry(entry)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(entry)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Show count */}
        <div className="text-center pt-4 text-sm text-muted-foreground">
          Showing {moodEntries?.length || 0} recent entries
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog 
        open={!!editingEntry} 
        onOpenChange={(open) => !open && setEditingEntry(null)}
      >
        <DialogContent className="max-w-lg">
          {editingEntry && (
            <MoodEntryForm 
              entry={editingEntry}
              onSuccess={() => setEditingEntry(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};