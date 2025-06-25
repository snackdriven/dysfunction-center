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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Journal</h1>
            <p className="text-gray-600">
              Record your thoughts, track your mood, and reflect on your daily experiences.
            </p>
          </div>
          <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Entry
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search journal entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Privacy Filter */}
            <div>
              <Select value={privacyFilter} onValueChange={setPrivacyFilter}>
                <SelectTrigger>
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
                <SelectTrigger>
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
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading journal entries...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">
              Failed to load journal entries. Please try again.
            </p>
          </div>
        )}

        {/* Entries List */}
        {!isLoading && !error && (
          <>
            {filteredEntries.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No journal entries found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery || privacyFilter
                    ? 'Try adjusting your search or filters.'
                    : 'Start your journaling journey by creating your first entry.'}
                </p>
                {!searchQuery && !privacyFilter && (
                  <Button onClick={() => setIsCreating(true)} variant="outline">
                    Create your first entry
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Stats */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary">
                    {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
                  </Badge>
                  {searchQuery && (
                    <Badge variant="outline">
                      Searching: "{searchQuery}"
                    </Badge>
                  )}
                  {privacyFilter && (
                    <Badge variant="outline">
                      Privacy: {privacyFilter}
                    </Badge>
                  )}
                </div>

                {/* Entries */}
                {filteredEntries.map((entry) => (
                  <JournalEntry
                    key={entry.id}
                    entry={entry}
                    onEdit={setEditingEntry}
                    onDelete={handleDeleteEntry}
                  />
                ))}
              </div>
            )}          </>
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
