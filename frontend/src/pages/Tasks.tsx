import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { TaskList } from '../components/tasks/TaskList';
import { TaskForm } from '../components/tasks/TaskForm';
import { TaskCategoryManager } from '../components/tasks/TaskCategoryManager';
import { TaskKanbanView } from '../components/tasks/TaskKanbanView';
import { Dialog, DialogContent, DialogTrigger } from '../components/ui/Dialog';
import { Plus, Search, List, Columns, Filter } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { tasksApi, Task } from '../services/tasks';

export const Tasks: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<number | undefined>();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'list' | 'kanban'>('list');
  const queryClient = useQueryClient();

  const { data: tasks, isLoading, error, refetch } = useQuery({
    queryKey: ['tasks', { search: searchQuery, status: statusFilter, priority: priorityFilter, category: categoryFilter }],
    queryFn: () => tasksApi.getTasks({
      search: searchQuery || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      priority: priorityFilter !== 'all' ? priorityFilter : undefined,
      category_id: categoryFilter,
    }),
  });

  const handleRetry = () => {
    refetch();
  };

  const handleTaskUpdate = async (taskId: number, updates: Partial<Task>) => {
    // Handle task updates for kanban view
    try {
      await tasksApi.updateTask({ id: taskId, ...updates });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleTaskCreate = (status?: string, date?: Date) => {
    // Handle task creation from different views
    setIsCreateDialogOpen(true);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Task Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Organize, prioritize, and complete your tasks efficiently
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover-lift">
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <TaskForm onSuccess={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* View Modes and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        {/* View Mode Tabs */}
        <Tabs value={currentView} defaultValue="list" onValueChange={(value) => setCurrentView(value as 'list' | 'kanban')}>
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-gray-100 dark:bg-gray-700">
              <TabsTrigger value="list" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600">
                <List className="h-4 w-4" />
                List View
              </TabsTrigger>
              <TabsTrigger value="kanban" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600">
                <Columns className="h-4 w-4" />
                Kanban Board
              </TabsTrigger>
            </TabsList>
            
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Filter className="h-4 w-4" />
                Filter by:
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Management */}
          <TaskCategoryManager
            selectedCategoryId={categoryFilter}
            onCategorySelect={setCategoryFilter}
          />

          {/* Content Views */}
          <TabsContent value="list" className="space-y-4">
            <TaskList 
              tasks={tasks || []}
              isLoading={isLoading}
              error={error}
              onRetry={handleRetry}
            />
          </TabsContent>

          <TabsContent value="kanban" className="space-y-4">
            <TaskKanbanView
              tasks={tasks || []}
              onTaskUpdate={handleTaskUpdate}
              onTaskCreate={handleTaskCreate}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};