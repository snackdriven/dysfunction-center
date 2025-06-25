import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { TaskList } from '../components/tasks/TaskList';
import { TaskForm } from '../components/tasks/TaskForm';
import { TaskCategoryManager } from '../components/tasks/TaskCategoryManager';
import { TaskKanbanView } from '../components/tasks/TaskKanbanView';
import { TaskCalendarView } from '../components/tasks/TaskCalendarView';
import { Dialog, DialogContent, DialogTrigger } from '../components/ui/Dialog';
import { Plus, Search, List, Columns, Calendar, Filter } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { tasksApi, Task } from '../services/tasks';

export const Tasks: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<number | undefined>();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'list' | 'kanban' | 'calendar'>('list');
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            Manage your tasks and stay productive
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <TaskForm onSuccess={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* View Modes and Filters */}
      <div className="space-y-4">
        {/* View Mode Tabs */}
        <Tabs value={currentView} defaultValue="list" onValueChange={(value) => setCurrentView(value as 'list' | 'kanban' | 'calendar')}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                List
              </TabsTrigger>
              <TabsTrigger value="kanban" className="flex items-center gap-2">
                <Columns className="h-4 w-4" />
                Kanban
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Calendar
              </TabsTrigger>
            </TabsList>
            
            {/* Filters */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
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
          <div className="relative max-w-md">
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

          <TabsContent value="calendar" className="space-y-4">
            <TaskCalendarView
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