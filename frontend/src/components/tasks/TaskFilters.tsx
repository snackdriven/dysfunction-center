import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { SavedSearches } from './SavedSearches';
import { tasksApi } from '../../services/tasks';
import { Search, Filter, X, Calendar, Tag, FolderOpen, Bookmark, ChevronDown } from 'lucide-react';

interface TaskFiltersProps {
  filters: TaskFilterState;
  onFiltersChange: (filters: TaskFilterState) => void;
}

export interface TaskFilterState {
  search: string;
  priority?: 'low' | 'medium' | 'high';
  completed?: boolean;
  status?: 'pending' | 'in_progress' | 'completed';
  category_id?: number;
  tag_ids?: number[];
  due_before?: string;
  due_after?: string;
  has_time_estimate?: boolean;
  overdue?: boolean;
  has_subtasks?: boolean;
  has_notes?: boolean;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  filters,
  onFiltersChange
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [showSavedSearches, setShowSavedSearches] = React.useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ['task-categories'],
    queryFn: tasksApi.getCategories
  });

  const { data: tags = [] } = useQuery({
    queryKey: ['task-tags'],
    queryFn: () => tasksApi.getTags()
  });

  const handleFilterChange = (key: keyof TaskFilterState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleTagToggle = (tagId: number) => {
    const currentTags = filters.tag_ids || [];
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter(id => id !== tagId)
      : [...currentTags, tagId];
    
    handleFilterChange('tag_ids', newTags.length > 0 ? newTags : undefined);
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      priority: undefined,
      completed: undefined,
      status: undefined,
      category_id: undefined,
      tag_ids: undefined,
      due_before: undefined,
      due_after: undefined,
      has_time_estimate: undefined,
      overdue: undefined,
      has_subtasks: undefined,
      has_notes: undefined,
    });
  };

  const getActiveFilterCount = () => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === 'search') return value.trim() !== '';
      return value !== undefined && value !== null;
    }).length;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="space-y-4">
      {/* Search and Quick Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Toggle */}
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {/* Saved Searches Toggle */}
        <Button
          variant="outline"
          onClick={() => setShowSavedSearches(!showSavedSearches)}
          className="flex items-center gap-2"
        >
          <Bookmark className="h-4 w-4" />
          Saved
          <ChevronDown className={`h-3 w-3 transition-transform ${showSavedSearches ? 'rotate-180' : ''}`} />
        </Button>

        {/* Clear Filters */}
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-gray-500"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Quick Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filters.overdue ? "primary" : "outline"}
          size="sm"
          onClick={() => handleFilterChange('overdue', filters.overdue ? undefined : true)}
        >
          Overdue
        </Button>
        <Button
          variant={filters.completed === false ? "primary" : "outline"}
          size="sm"
          onClick={() => handleFilterChange('completed', filters.completed === false ? undefined : false)}
        >
          Active
        </Button>
        <Button
          variant={filters.completed === true ? "primary" : "outline"}
          size="sm"
          onClick={() => handleFilterChange('completed', filters.completed === true ? undefined : true)}
        >
          Completed
        </Button>
        <Button
          variant={filters.has_time_estimate ? "primary" : "outline"}
          size="sm"
          onClick={() => handleFilterChange('has_time_estimate', filters.has_time_estimate ? undefined : true)}
        >
          With Time Estimate
        </Button>
        <Button
          variant={filters.has_subtasks ? "primary" : "outline"}
          size="sm"
          onClick={() => handleFilterChange('has_subtasks', filters.has_subtasks ? undefined : true)}
        >
          Has Subtasks
        </Button>
        <Button
          variant={filters.has_notes ? "primary" : "outline"}
          size="sm"
          onClick={() => handleFilterChange('has_notes', filters.has_notes ? undefined : true)}
        >
          Has Notes
        </Button>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-lg bg-gray-50">
          {/* Priority Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <Select
              value={filters.priority || ''}
              onValueChange={(value) => handleFilterChange('priority', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={filters.status || ''}
              onValueChange={(value) => handleFilterChange('status', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <FolderOpen className="h-4 w-4" />
              Category
            </label>
            <Select
              value={filters.category_id?.toString() || ''}
              onValueChange={(value) => handleFilterChange('category_id', value ? parseInt(value) : undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any category</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span>{category.icon}</span>
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Due Date Range
            </label>
            <div className="space-y-2">
              <Input
                type="date"
                placeholder="From date"
                value={filters.due_after || ''}
                onChange={(e) => handleFilterChange('due_after', e.target.value || undefined)}
              />
              <Input
                type="date"
                placeholder="To date"
                value={filters.due_before || ''}
                onChange={(e) => handleFilterChange('due_before', e.target.value || undefined)}
              />
            </div>
          </div>

          {/* Tags Filter */}
          {tags.length > 0 && (
            <div className="space-y-2 md:col-span-2 lg:col-span-3">
              <label className="text-sm font-medium flex items-center gap-1">
                <Tag className="h-4 w-4" />
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Button
                    key={tag.id}
                    variant={filters.tag_ids?.includes(tag.id) ? "primary" : "outline"}
                    size="sm"
                    onClick={() => handleTagToggle(tag.id)}
                  >
                    {tag.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Saved Searches */}
      {showSavedSearches && (
        <div className="p-4 border rounded-lg bg-gray-50">
          <SavedSearches
            currentFilters={filters}
            onApplySearch={(newFilters) => {
              onFiltersChange(newFilters);
              setShowSavedSearches(false);
            }}
          />
        </div>
      )}

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: "{filters.search}"
              <button
                onClick={() => handleFilterChange('search', '')}
                className="ml-1 text-gray-500 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.priority && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Priority: {filters.priority}
              <button
                onClick={() => handleFilterChange('priority', undefined)}
                className="ml-1 text-gray-500 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.category_id && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Category: {categories.find(c => c.id === filters.category_id)?.name}
              <button
                onClick={() => handleFilterChange('category_id', undefined)}
                className="ml-1 text-gray-500 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.tag_ids && filters.tag_ids.length > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Tags: {filters.tag_ids.map(id => tags.find(t => t.id === id)?.name).join(', ')}
              <button
                onClick={() => handleFilterChange('tag_ids', undefined)}
                className="ml-1 text-gray-500 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};