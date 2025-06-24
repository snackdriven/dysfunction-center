import React from 'react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ContextTags } from '../../services/mood';
import { MapPin, Users, Activity, Heart, Plus, X } from 'lucide-react';

interface MoodContextTagsProps {
  contextTags: ContextTags;
  onContextChange: (context: ContextTags) => void;
}

const defaultOptions = {
  activities: [
    'Working', 'Exercising', 'Eating', 'Relaxing', 'Studying', 'Traveling',
    'Shopping', 'Cooking', 'Reading', 'Watching TV', 'Gaming', 'Socializing'
  ],
  people: [
    'Alone', 'With family', 'With friends', 'With partner', 'With colleagues',
    'With strangers', 'In a crowd', 'With pets'
  ],
  emotions: [
    'Grateful', 'Hopeful', 'Motivated', 'Peaceful', 'Excited', 'Content',
    'Anxious', 'Frustrated', 'Overwhelmed', 'Lonely', 'Restless', 'Worried'
  ],
  locations: [
    'Home', 'Work', 'Outdoors', 'Car', 'Public transport', 'Restaurant',
    'Gym', 'Park', 'Store', 'Hospital', 'School', 'Vacation'
  ]
};

export const MoodContextTags: React.FC<MoodContextTagsProps> = ({
  contextTags,
  onContextChange
}) => {
  const [newTag, setNewTag] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState<keyof ContextTags | null>(null);

  const addTag = (category: keyof ContextTags, tag: string) => {
    const currentTags = contextTags[category] || [];
    if (!currentTags.includes(tag)) {
      onContextChange({
        ...contextTags,
        [category]: [...currentTags, tag]
      });
    }
  };

  const removeTag = (category: keyof ContextTags, tag: string) => {
    const currentTags = contextTags[category] || [];
    onContextChange({
      ...contextTags,
      [category]: currentTags.filter(t => t !== tag)
    });
  };

  const addCustomTag = (category: keyof ContextTags) => {
    if (newTag.trim()) {
      addTag(category, newTag.trim());
      setNewTag('');
      setActiveCategory(null);
    }
  };

  const getCategoryIcon = (category: keyof ContextTags) => {
    switch (category) {
      case 'activities': return <Activity className="h-4 w-4" />;
      case 'people': return <Users className="h-4 w-4" />;
      case 'emotions': return <Heart className="h-4 w-4" />;
      case 'locations': return <MapPin className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: keyof ContextTags) => {
    switch (category) {
      case 'activities': return 'border-blue-200 bg-blue-50 text-blue-700';
      case 'people': return 'border-green-200 bg-green-50 text-green-700';
      case 'emotions': return 'border-purple-200 bg-purple-50 text-purple-700';
      case 'locations': return 'border-orange-200 bg-orange-50 text-orange-700';
    }
  };

  const categories: { key: keyof ContextTags; label: string }[] = [
    { key: 'activities', label: 'Activities' },
    { key: 'people', label: 'People' },
    { key: 'emotions', label: 'Emotions' },
    { key: 'locations', label: 'Locations' }
  ];

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium">Context Tags (optional)</label>
      
      {categories.map(({ key, label }) => (
        <div key={key} className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium flex items-center gap-2">
              {getCategoryIcon(key)}
              {label}
            </h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setActiveCategory(activeCategory === key ? null : key)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Selected Tags */}
          {contextTags[key] && contextTags[key]!.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {contextTags[key]!.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className={`flex items-center gap-1 ${getCategoryColor(key)}`}
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(key, tag)}
                    className="ml-1 text-current hover:bg-black hover:bg-opacity-10 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Custom Tag Input */}
          {activeCategory === key && (
            <div className="flex gap-2">
              <Input
                placeholder={`Add custom ${label.toLowerCase()}...`}
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomTag(key);
                  } else if (e.key === 'Escape') {
                    setActiveCategory(null);
                    setNewTag('');
                  }
                }}
                className="flex-1"
                autoFocus
              />
              <Button
                type="button"
                size="sm"
                onClick={() => addCustomTag(key)}
                disabled={!newTag.trim()}
              >
                Add
              </Button>
            </div>
          )}

          {/* Suggested Tags */}
          {activeCategory !== key && (
            <div className="flex flex-wrap gap-2">
              {defaultOptions[key]
                .filter(option => !contextTags[key]?.includes(option))
                .slice(0, 6)
                .map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => addTag(key, option)}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors hover:bg-opacity-80 ${getCategoryColor(key)} border-current`}
                  >
                    {option}
                  </button>
                ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};