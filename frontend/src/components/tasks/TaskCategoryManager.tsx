import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/Dialog';
import { Badge } from '../ui/Badge';
import { tasksApi, TaskCategory, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../../services/tasks';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';

interface TaskCategoryManagerProps {
  selectedCategoryId?: number;
  onCategorySelect?: (categoryId: number | undefined) => void;
}

const CATEGORY_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

const CATEGORY_ICONS = [
  '📋', '💼', '🏠', '🎯', '📚', '🏃‍♂️', '💡', '🛠️', '🎨', '📊'
];

export const TaskCategoryManager: React.FC<TaskCategoryManagerProps> = ({
  selectedCategoryId,
  onCategorySelect
}) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<TaskCategory | null>(null);
  const [formData, setFormData] = React.useState({
    name: '',
    color: CATEGORY_COLORS[0],
    icon: CATEGORY_ICONS[0]
  });

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['task-categories'],
    queryFn: tasksApi.getCategories
  });

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const isEditing = !!editingCategory;
  const isSubmitting = createCategory.isPending || updateCategory.isPending;

  const handleEdit = (category: TaskCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      color: category.color || CATEGORY_COLORS[0],
      icon: category.icon || CATEGORY_ICONS[0]
    });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      color: CATEGORY_COLORS[0],
      icon: CATEGORY_ICONS[0]
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;

    try {
      if (isEditing) {
        await updateCategory.mutateAsync({
          id: editingCategory.id,
          ...formData
        });
      } else {
        await createCategory.mutateAsync(formData);
      }
      
      setIsDialogOpen(false);
      setEditingCategory(null);
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  const handleDelete = async (categoryId: number) => {
    if (window.confirm('Are you sure you want to delete this category? Tasks in this category will no longer be categorized.')) {
      try {
        await deleteCategory.mutateAsync(categoryId);
        if (selectedCategoryId === categoryId) {
          onCategorySelect?.(undefined);
        }
      } catch (error) {
        console.error('Failed to delete category:', error);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategoryId === undefined ? "default" : "outline"}
          size="sm"
          onClick={() => onCategorySelect?.(undefined)}
        >
          All Tasks
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategoryId === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => onCategorySelect?.(category.id)}
            className="flex items-center gap-1"
          >
            <span>{category.icon}</span>
            {category.name}
          </Button>
        ))}
      </div>

      {/* Category Management */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Categories
        </h3>
        <Button onClick={handleCreate} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Category
        </Button>
      </div>

      {/* Categories List */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="text-center py-4 text-gray-500">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No categories yet. Create your first category to organize tasks.
          </div>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-3 border rounded-lg bg-white"
            >
              <div className="flex items-center gap-3">
                <span 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span>{category.icon}</span>
                <span className="font-medium">{category.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(category)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(category.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? 'Edit Category' : 'Create Category'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <Input
                label="Category Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter category name..."
                required
              />

              <div className="space-y-2">
                <label className="text-sm font-medium">Color</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.color === color ? 'border-gray-800' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      className={`w-10 h-10 rounded border-2 flex items-center justify-center text-lg ${
                        formData.icon === icon ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, icon }))}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEditing ? 'Update Category' : 'Create Category'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};