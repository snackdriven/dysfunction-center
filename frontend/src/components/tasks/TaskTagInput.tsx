import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { tasksApi, TaskTag, useCreateTag } from '../../services/tasks';
import { X, Plus } from 'lucide-react';

interface TaskTagInputProps {
  selectedTagIds: number[];
  onTagsChange: (tagIds: number[]) => void;
  placeholder?: string;
}

export const TaskTagInput: React.FC<TaskTagInputProps> = ({
  selectedTagIds,
  onTagsChange,
  placeholder = "Search and select tags..."
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  const { data: allTags = [] } = useQuery({
    queryKey: ['task-tags', searchTerm],
    queryFn: () => tasksApi.getTags(searchTerm)
  });

  const createTag = useCreateTag();

  const selectedTags = allTags.filter(tag => selectedTagIds.includes(tag.id));
  const filteredTags = allTags.filter(
    tag => 
      !selectedTagIds.includes(tag.id) &&
      tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exactMatch = allTags.find(
    tag => tag.name.toLowerCase() === searchTerm.toLowerCase()
  );

  const handleTagSelect = (tag: TaskTag) => {
    onTagsChange([...selectedTagIds, tag.id]);
    setSearchTerm('');
    setShowSuggestions(false);
  };

  const handleTagRemove = (tagId: number) => {
    onTagsChange(selectedTagIds.filter(id => id !== tagId));
  };

  const handleCreateTag = async () => {
    if (searchTerm.trim() && !exactMatch) {
      try {
        const newTag = await createTag.mutateAsync({ name: searchTerm.trim() });
        onTagsChange([...selectedTagIds, newTag.id]);
        setSearchTerm('');
        setShowSuggestions(false);
      } catch (error) {
        console.error('Failed to create tag:', error);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredTags.length > 0) {
        handleTagSelect(filteredTags[0]);
      } else if (searchTerm.trim() && !exactMatch) {
        handleCreateTag();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Tags</label>
      
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              {tag.name}
              <button
                type="button"
                onClick={() => handleTagRemove(tag.id)}
                className="ml-1 text-gray-500 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Tag Input */}
      <div className="relative">
        <Input
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            // Delay hiding suggestions to allow clicking on them
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
        />

        {/* Suggestions Dropdown */}
        {showSuggestions && (searchTerm || filteredTags.length > 0) && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {/* Existing tags */}
            {filteredTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                onClick={() => handleTagSelect(tag)}
              >
                <span>{tag.name}</span>
              </button>
            ))}

            {/* Create new tag option */}
            {searchTerm.trim() && !exactMatch && (
              <button
                type="button"
                className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-blue-600 border-t"
                onClick={handleCreateTag}
                disabled={createTag.isPending}
              >
                <Plus className="h-4 w-4" />
                Create "{searchTerm}"
              </button>
            )}

            {/* No results */}
            {!searchTerm && filteredTags.length === 0 && (
              <div className="px-3 py-2 text-gray-500 text-sm">
                No more tags available
              </div>
            )}

            {searchTerm && filteredTags.length === 0 && exactMatch && (
              <div className="px-3 py-2 text-gray-500 text-sm">
                Tag already selected
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};