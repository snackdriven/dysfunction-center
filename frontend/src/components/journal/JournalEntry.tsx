import React, { useState } from 'react';
import { JournalEntry as JournalEntryType } from '../../services/journal';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { MarkdownDisplay } from '../ui/MarkdownDisplay';
import { formatDistanceToNow } from 'date-fns';

interface JournalEntryProps {
  entry: JournalEntryType;
  onEdit?: (entry: JournalEntryType) => void;
  onDelete?: (id: number) => void;
  isExpanded?: boolean;
}

export const JournalEntry: React.FC<JournalEntryProps> = ({
  entry,
  onEdit,
  onDelete,
  isExpanded = false
}) => {
  const [expanded, setExpanded] = useState(isExpanded);

  const toggleExpanded = () => setExpanded(!expanded);
  const getMoodColor = (mood?: number) => {
    // You might want to map mood numbers to mood names first
    // For now, using a simple mapping
    const moodMap: { [key: number]: string } = {
      1: 'terrible',
      2: 'bad', 
      3: 'okay',
      4: 'good',
      5: 'great'
    };
    
    const moodName = mood ? moodMap[mood] : undefined;
    
    switch (moodName) {
      case 'great': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'okay': return 'bg-yellow-100 text-yellow-800';
      case 'bad': return 'bg-orange-100 text-orange-800';
      case 'terrible': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPrivacyColor = (privacy: string) => {
    switch (privacy) {
      case 'public': return 'bg-green-100 text-green-800';
      case 'private': return 'bg-red-100 text-red-800';
      case 'shared': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="p-6 mb-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 
            className="text-lg font-semibold cursor-pointer text-gray-900 hover:text-blue-600"
            onClick={toggleExpanded}
          >
            {entry.title}
          </h3>
          <p className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
            {entry.updated_at !== entry.created_at && (
              <span className="ml-1">(edited)</span>
            )}
          </p>
        </div>
        
        <div className="flex gap-2 ml-4">
          {entry.productivity_score && (
            <Badge variant="outline">
              Score: {entry.productivity_score}/10
            </Badge>
          )}
          <Badge className={getPrivacyColor(entry.privacy_level)}>
            {entry.privacy_level}
          </Badge>
        </div>
      </div>      {/* Mood and Tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        {entry.mood_reference && (
          <Badge className={getMoodColor(entry.mood_reference)}>
            Mood: {entry.mood_reference}
          </Badge>
        )}
        {Array.isArray(entry.tags) && entry.tags.map((tag, index) => (
          <Badge key={index} variant="secondary">
            #{tag}
          </Badge>
        ))}
      </div>

      {/* Content */}
      <div className="mb-4">
        {expanded ? (
          <MarkdownDisplay 
            content={entry.content}
            className="prose max-w-none"
          />
        ) : (
          <div 
            className="cursor-pointer"
            onClick={toggleExpanded}
          >
            <MarkdownDisplay 
              content={entry.content}
              isPreview={true}
              className="text-gray-700"
            />
          </div>
        )}
        
        {/* Show expand/collapse hint */}
        {!expanded && entry.content && entry.content.length > 200 && (
          <button
            onClick={toggleExpanded}
            className="text-blue-600 hover:text-blue-800 text-sm mt-2 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
          >
            Read more...
          </button>
        )}
        
        {expanded && (
          <button
            onClick={toggleExpanded}
            className="text-blue-600 hover:text-blue-800 text-sm mt-2 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
          >
            Show less
          </button>
        )}
      </div>      {/* Related Items */}
      {((entry.related_tasks && Array.isArray(entry.related_tasks) && entry.related_tasks.length > 0) || 
        (entry.related_habits && Array.isArray(entry.related_habits) && entry.related_habits.length > 0)) && (
        <div className="mb-4">
          {entry.related_tasks && Array.isArray(entry.related_tasks) && entry.related_tasks.length > 0 && (
            <div className="mb-2">
              <span className="text-sm font-medium text-gray-600">Related Tasks:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {entry.related_tasks.map((taskId, index) => (
                  <Badge key={index} variant="outline">Task #{taskId}</Badge>
                ))}
              </div>
            </div>
          )}
          {entry.related_habits && Array.isArray(entry.related_habits) && entry.related_habits.length > 0 && (
            <div>
              <span className="text-sm font-medium text-gray-600">Related Habits:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {entry.related_habits.map((habitId, index) => (
                  <Badge key={index} variant="outline">Habit #{habitId}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {(onEdit || onDelete) && (
        <div className="flex gap-2 pt-3 border-t border-gray-200 relative z-10">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit(entry);
              }}
              className="relative z-10 pointer-events-auto"
              type="button"
              role="button"
              tabIndex={0}
            >
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(entry.id);
              }}
              className="text-red-600 hover:text-red-800 relative z-10 pointer-events-auto"
              type="button"
              role="button"
              tabIndex={0}
            >
              Delete
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};
