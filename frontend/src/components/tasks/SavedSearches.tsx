import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/Dialog';
import { TaskFilterState } from './TaskFilters';
import { Bookmark, Trash2, Search, Star } from 'lucide-react';

interface SavedSearch {
  id: string;
  name: string;
  filters: TaskFilterState;
  created_at: string;
  is_favorite?: boolean;
}

interface SavedSearchesProps {
  currentFilters: TaskFilterState;
  onApplySearch: (filters: TaskFilterState) => void;
}

export const SavedSearches: React.FC<SavedSearchesProps> = ({
  currentFilters,
  onApplySearch
}) => {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(() => {
    // Load from localStorage
    const saved = localStorage.getItem('saved-task-searches');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newSearchName, setNewSearchName] = useState('');

  const hasActiveFilters = () => {
    return Object.entries(currentFilters).some(([key, value]) => {
      if (key === 'search') return value.trim() !== '';
      return value !== undefined && value !== null;
    });
  };

  const saveSearch = () => {
    if (!newSearchName.trim() || !hasActiveFilters()) return;

    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name: newSearchName.trim(),
      filters: { ...currentFilters },
      created_at: new Date().toISOString(),
    };

    const updatedSearches = [...savedSearches, newSearch];
    setSavedSearches(updatedSearches);
    localStorage.setItem('saved-task-searches', JSON.stringify(updatedSearches));
    
    setNewSearchName('');
    setIsCreateDialogOpen(false);
  };

  const deleteSearch = (searchId: string) => {
    const updatedSearches = savedSearches.filter(search => search.id !== searchId);
    setSavedSearches(updatedSearches);
    localStorage.setItem('saved-task-searches', JSON.stringify(updatedSearches));
  };

  const toggleFavorite = (searchId: string) => {
    const updatedSearches = savedSearches.map(search =>
      search.id === searchId
        ? { ...search, is_favorite: !search.is_favorite }
        : search
    );
    setSavedSearches(updatedSearches);
    localStorage.setItem('saved-task-searches', JSON.stringify(updatedSearches));
  };

  const getSearchDescription = (filters: TaskFilterState) => {
    const parts: string[] = [];
    
    if (filters.search) parts.push(`"${filters.search}"`);
    if (filters.priority) parts.push(`${filters.priority} priority`);
    if (filters.completed === true) parts.push('completed');
    if (filters.completed === false) parts.push('active');
    if (filters.overdue) parts.push('overdue');
    if (filters.has_time_estimate) parts.push('with time estimate');
    if (filters.tag_ids && filters.tag_ids.length > 0) parts.push(`${filters.tag_ids.length} tag${filters.tag_ids.length !== 1 ? 's' : ''}`);
    
    return parts.length > 0 ? parts.join(', ') : 'All tasks';
  };

  const favoriteSearches = savedSearches.filter(search => search.is_favorite);
  const regularSearches = savedSearches.filter(search => !search.is_favorite);

  return (
    <div className="space-y-3">
      {/* Create Saved Search */}
      <div className="flex items-center gap-2">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              disabled={!hasActiveFilters()}
              className="flex items-center gap-1"
            >
              <Bookmark className="h-4 w-4" />
              Save Search
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Save Current Search</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Input
                  label="Search Name"
                  placeholder="Enter a name for this search..."
                  value={newSearchName}
                  onChange={(e) => setNewSearchName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveSearch()}
                />
              </div>
              <div className="text-sm text-muted-foreground">
                <strong>Current filters:</strong> {getSearchDescription(currentFilters)}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={saveSearch} disabled={!newSearchName.trim()}>
                  Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <div className="space-y-3">
          {/* Favorite Searches */}
          {favoriteSearches.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                Favorite Searches
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {favoriteSearches.map((search) => (
                  <div
                    key={search.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-yellow-50 border-yellow-200 hover:bg-yellow-100 transition-colors"
                  >
                    <div className="flex-1 cursor-pointer" onClick={() => onApplySearch(search.filters)}>
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{search.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {getSearchDescription(search.filters)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleFavorite(search.id)}
                        className="h-6 w-6 p-0"
                      >
                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteSearch(search.id)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Regular Searches */}
          {regularSearches.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-1">
                <Bookmark className="h-4 w-4" />
                Saved Searches
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {regularSearches.map((search) => (
                  <div
                    key={search.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 cursor-pointer" onClick={() => onApplySearch(search.filters)}>
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{search.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {getSearchDescription(search.filters)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleFavorite(search.id)}
                        className="h-6 w-6 p-0"
                      >
                        <Star className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteSearch(search.id)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {savedSearches.length === 0 && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          <Bookmark className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
          <p>No saved searches yet.</p>
          <p>Apply some filters and save your first search!</p>
        </div>
      )}
    </div>
  );
};