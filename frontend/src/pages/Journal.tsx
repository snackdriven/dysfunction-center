import React, { useState } from 'react';
import { Plus, Search, FileText } from 'lucide-react';
import { JournalEntry } from '../components/journal/JournalEntry';
import { JournalEntryForm } from '../components/journal/JournalEntryForm';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/Dialog';
import {
  useJournalEntries,
  useCreateJournalEntry,
  useUpdateJournalEntry,
  useDeleteJournalEntry,
  JournalEntry as JournalEntryType,
  CreateJournalEntryRequest,
  UpdateJournalEntryRequest
} from '../services/journal';

export const Journal: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntryType | null>(null);  const [searchQuery, setSearchQuery] = useState('');
  const [privacyFilter, setPrivacyFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState('created_at');  const { data: entries = [], isLoading, error } = useJournalEntries({
    limit: 50,
    offset: 0,
    ...(privacyFilter && { privacy_level: privacyFilter as 'private' | 'shared' | 'public' })
  });

  const createMutation = useCreateJournalEntry();
  const updateMutation = useUpdateJournalEntry();
  const deleteMutation = useDeleteJournalEntry();

  const handleCreateEntry = async (data: CreateJournalEntryRequest | UpdateJournalEntryRequest) => {
    try {
      await createMutation.mutateAsync(data as CreateJournalEntryRequest);
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to create journal entry:', error);
    }
  };

  const handleUpdateEntry = async (data: CreateJournalEntryRequest | UpdateJournalEntryRequest) => {
    if (!editingEntry) return;
    
    try {
      await updateMutation.mutateAsync({ id: editingEntry.id, ...(data as UpdateJournalEntryRequest) });  
      setEditingEntry(null);
    } catch (error) {
      console.error('Failed to update journal entry:', error);
    }
  };

  const handleDeleteEntry = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this journal entry?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete journal entry:', error);
      }
    }
  };
  const filteredEntries = entries.filter(entry =>
    searchQuery === '' || 
    entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (Array.isArray(entry.tags) && entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Journal
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
              Record your thoughts, track your mood, and reflect on your daily experiences.
            </p>
          </div>
          <Button 
            onClick={() => setIsCreating(true)} 
            className="flex items-center gap-2 w-full sm:w-auto min-h-[44px]"
          >
            <Plus className="h-4 w-4" />
            New Entry
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="bg-card rounded-lg shadow-sm border p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search journal entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 min-h-[44px]"
                aria-label="Search journal entries"
              />
            </div>

            {/* Privacy Filter */}
            <div>
              <Select value={privacyFilter} onValueChange={setPrivacyFilter}>
                <SelectTrigger className="min-h-[44px]" aria-label="Filter by privacy level">
                  <SelectValue placeholder="All privacy levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All privacy levels</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="shared">Shared</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="min-h-[44px]" aria-label="Sort entries">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Newest first</SelectItem>
                  <SelectItem value="-created_at">Oldest first</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                  <SelectItem value="-title">Title Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12" role="status" aria-live="polite">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading journal entries...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8" role="alert">
            <p className="text-destructive font-medium">
              Failed to load journal entries. Please try again.
            </p>
          </div>
        )}

        {/* Entries List */}
        {!isLoading && !error && (
          <>
            {filteredEntries.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                <h3 className="text-lg sm:text-xl font-medium text-foreground mb-3">No journal entries found</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {searchQuery || privacyFilter
                    ? 'Try adjusting your search or filters to find what you\'re looking for.'
                    : 'Start your journaling journey by creating your first entry and begin tracking your thoughts and experiences.'}
                </p>
                {!searchQuery && !privacyFilter && (
                  <Button 
                    onClick={() => setIsCreating(true)} 
                    variant="outline"
                    className="min-h-[44px]"
                  >
                    Create your first entry
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {/* Stats */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary" className="text-xs sm:text-sm">
                    {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
                  </Badge>
                  {searchQuery && (
                    <Badge variant="outline" className="text-xs sm:text-sm">
                      Searching: "{searchQuery}"
                    </Badge>
                  )}
                  {privacyFilter && (
                    <Badge variant="outline" className="text-xs sm:text-sm">
                      Privacy: {privacyFilter}
                    </Badge>
                  )}
                </div>

                {/* Entries */}
                <div className="space-y-4 sm:space-y-6">
                  {filteredEntries.map((entry) => (
                    <JournalEntry
                      key={entry.id}
                      entry={entry}
                      onEdit={setEditingEntry}
                      onDelete={handleDeleteEntry}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Create Entry Modal */}
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>New Journal Entry</DialogTitle>
            </DialogHeader>
            <JournalEntryForm
              onSubmit={handleCreateEntry}
              onCancel={() => setIsCreating(false)}
              isLoading={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Entry Modal */}
        <Dialog open={!!editingEntry} onOpenChange={() => setEditingEntry(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Edit Journal Entry</DialogTitle>
            </DialogHeader>
            {editingEntry && (
              <JournalEntryForm
                entry={editingEntry}
                onSubmit={handleUpdateEntry}
                onCancel={() => setEditingEntry(null)}
                isLoading={updateMutation.isPending}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
