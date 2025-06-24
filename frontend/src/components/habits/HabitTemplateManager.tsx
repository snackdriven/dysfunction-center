import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/Dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { 
  Plus, 
  Star, 
  Heart, 
  Coffee, 
  Dumbbell, 
  Book, 
  Smartphone, 
  Moon, 
  Sun,
  Droplets,
  Apple,
  Brain,
  Zap,
  Target,
  Clock,
  Calendar,
  CheckCircle,
  Trash2,
  Edit,
  Copy
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { habitsApi, HabitTemplate } from '../../services/habits';

interface HabitTemplateManagerProps {
  onTemplateSelect?: (template: HabitTemplate) => void;
}

const HABIT_ICONS = {
  star: Star,
  heart: Heart,
  coffee: Coffee,
  dumbbell: Dumbbell,
  book: Book,
  smartphone: Smartphone,
  moon: Moon,
  sun: Sun,
  droplets: Droplets,
  apple: Apple,
  brain: Brain,
  zap: Zap,
  target: Target,
  clock: Clock,
  calendar: Calendar,
  checkCircle: CheckCircle,
};

const PRESET_TEMPLATES: HabitTemplate[] = [
  {
    id: 0,
    name: 'Daily Exercise',
    description: 'Build a consistent exercise routine',
    icon: 'dumbbell',
    category: 'health',
    suggested_frequency: 7,
    suggested_value: 1,
    completion_type: 'boolean',
    target_type: 'daily',
    unit: 'workout',
    tags: ['health', 'fitness', 'energy'],
    difficulty: 'medium',
    estimated_time_minutes: 30,
    benefits: ['Improved physical health', 'Better mood', 'Increased energy'],
    tips: [
      'Start with just 10 minutes a day',
      'Choose activities you enjoy',
      'Schedule it at the same time daily',
      'Track your progress'
    ],
    is_preset: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 0,
    name: 'Read Daily',
    description: 'Develop a daily reading habit',
    icon: 'book',
    category: 'personal',
    suggested_frequency: 7,
    suggested_value: 20,
    completion_type: 'duration',
    target_type: 'daily',
    unit: 'minutes',
    tags: ['learning', 'knowledge', 'relaxation'],
    difficulty: 'easy',
    estimated_time_minutes: 20,
    benefits: ['Expanded knowledge', 'Improved focus', 'Better vocabulary'],
    tips: [
      'Choose books you genuinely enjoy',
      'Set a specific reading time',
      'Keep a book nearby',
      'Start with shorter sessions'
    ],
    is_preset: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 0,
    name: 'Drink Water',
    description: 'Stay hydrated throughout the day',
    icon: 'droplets',
    category: 'health',
    suggested_frequency: 7,
    suggested_value: 8,
    completion_type: 'count',
    target_type: 'daily',
    unit: 'glasses',
    tags: ['health', 'hydration', 'wellness'],
    difficulty: 'easy',
    estimated_time_minutes: 2,
    benefits: ['Better hydration', 'Improved skin', 'Enhanced energy'],
    tips: [
      'Keep a water bottle nearby',
      'Set hourly reminders',
      'Add lemon for flavor',
      'Track your intake'
    ],
    is_preset: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 0,
    name: 'Meditation',
    description: 'Practice mindfulness and reduce stress',
    icon: 'brain',
    category: 'personal',
    suggested_frequency: 7,
    suggested_value: 10,
    completion_type: 'duration',
    target_type: 'daily',
    unit: 'minutes',
    tags: ['mindfulness', 'stress-relief', 'mental-health'],
    difficulty: 'medium',
    estimated_time_minutes: 10,
    benefits: ['Reduced stress', 'Better focus', 'Emotional balance'],
    tips: [
      'Start with just 5 minutes',
      'Use guided meditation apps',
      'Find a quiet space',
      'Be patient with yourself'
    ],
    is_preset: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const HabitTemplateManager: React.FC<HabitTemplateManagerProps> = ({ onTemplateSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: customTemplates = [] } = useQuery({
    queryKey: ['habit-templates'],
    queryFn: () => habitsApi.getTemplates()
  });

  const createTemplate = useMutation({
    mutationFn: habitsApi.createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habit-templates'] });
      setIsCreateDialogOpen(false);
    }
  });

  const deleteTemplate = useMutation({
    mutationFn: habitsApi.deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habit-templates'] });
    }
  });

  const allTemplates = [...PRESET_TEMPLATES, ...customTemplates];

  const filteredTemplates = allTemplates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (template.tags && template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    
    return matchesCategory && matchesSearch;
  });

  const categories = ['all', ...Array.from(new Set(allTemplates.map(t => t.category)))];

  const handleTemplateSelect = (template: HabitTemplate) => {
    if (onTemplateSelect) {
      onTemplateSelect(template);
    }
  };

  const handleDeleteTemplate = async (templateId: number) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      await deleteTemplate.mutateAsync(templateId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Habit Templates</h2>
          <p className="text-muted-foreground">
            Choose from preset templates or create your own
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Habit Template</DialogTitle>
            </DialogHeader>
            <CreateTemplateForm 
              onSuccess={() => setIsCreateDialogOpen(false)}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category === 'all' ? 'All Categories' : 
                 category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template, index) => {
          const IconComponent = HABIT_ICONS[template.icon as keyof typeof HABIT_ICONS] || Target;
          
          return (
            <Card key={`${template.id}-${index}`} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {template.category}
                        </Badge>
                        <Badge 
                          variant={template.difficulty === 'easy' ? 'default' : 
                                  template.difficulty === 'medium' ? 'secondary' : 'destructive'}
                          className="text-xs"
                        >
                          {template.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {!template.is_preset && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {template.description}
                </p>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span>{template.suggested_value} {template.unit} {template.target_type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>~{template.estimated_time_minutes} minutes</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {(template.tags || []).slice(0, 3).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {(template.tags || []).length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{(template.tags || []).length - 3}
                    </Badge>
                  )}
                </div>

                <Button 
                  className="w-full" 
                  onClick={() => handleTemplateSelect(template)}
                >
                  Use Template
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Start by creating your first habit template'
              }
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

interface CreateTemplateFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  template?: HabitTemplate;
}

const CreateTemplateForm: React.FC<CreateTemplateFormProps> = ({
  onSuccess,
  onCancel,
  template
}) => {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    icon: template?.icon || 'target',
    category: template?.category || 'personal',
    suggested_frequency: template?.suggested_frequency || 7,
    suggested_value: template?.suggested_value || 1,
    completion_type: template?.completion_type || 'boolean' as const,
    target_type: template?.target_type || 'daily' as const,
    unit: template?.unit || 'time',
    tags: template?.tags || [] as string[],
    difficulty: template?.difficulty || 'medium' as const,
    estimated_time_minutes: template?.estimated_time_minutes || 10,
    benefits: template?.benefits || [] as string[],
    tips: template?.tips || [] as string[],
  });

  const [newTag, setNewTag] = useState('');
  const [newBenefit, setNewBenefit] = useState('');
  const [newTip, setNewTip] = useState('');

  const createTemplate = useMutation({
    mutationFn: habitsApi.createTemplate,
    onSuccess: () => {
      onSuccess();
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const templateData: Omit<HabitTemplate, 'id' | 'is_preset' | 'created_at' | 'updated_at'> = {
      ...formData
    };

    await createTemplate.mutateAsync(templateData);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const addBenefit = () => {
    if (newBenefit.trim() && !formData.benefits.includes(newBenefit.trim())) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, newBenefit.trim()]
      }));
      setNewBenefit('');
    }
  };

  const removeBenefit = (benefit: string) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter(b => b !== benefit)
    }));
  };

  const addTip = () => {
    if (newTip.trim() && !formData.tips.includes(newTip.trim())) {
      setFormData(prev => ({
        ...prev,
        tips: [...prev.tips, newTip.trim()]
      }));
      setNewTip('');
    }
  };

  const removeTip = (tip: string) => {
    setFormData(prev => ({
      ...prev,
      tips: prev.tips.filter(t => t !== tip)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="guidance">Guidance</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Habit name"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, category: value as 'health' | 'productivity' | 'personal' }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="learning">Learning</SelectItem>
                  <SelectItem value="wellness">Wellness</SelectItem>
                  <SelectItem value="productivity">Productivity</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the habit"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Target Value</label>
              <Input
                type="number"
                value={formData.suggested_value}
                onChange={(e) => setFormData(prev => ({ ...prev, suggested_value: parseInt(e.target.value) || 1 }))}
                min="1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Unit</label>
              <Input
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                placeholder="e.g., minutes, times, pages"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Difficulty</label>
              <Select 
                value={formData.difficulty} 
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, difficulty: value as 'easy' | 'medium' | 'hard' }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Estimated Time (minutes)</label>
              <Input
                type="number"
                value={formData.estimated_time_minutes}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  estimated_time_minutes: parseInt(e.target.value) || 0 
                }))}
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Tags</label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                  {tag} ×
                </Badge>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="guidance" className="space-y-4">
          <div>
            <label className="text-sm font-medium">Benefits</label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newBenefit}
                onChange={(e) => setNewBenefit(e.target.value)}
                placeholder="Add a benefit..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addBenefit();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addBenefit}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1">
              {formData.benefits.map(benefit => (
                <div key={benefit} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">{benefit}</span>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeBenefit(benefit)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Tips for Success</label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTip}
                onChange={(e) => setNewTip(e.target.value)}
                placeholder="Add a tip..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTip();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addTip}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1">
              {formData.tips.map(tip => (
                <div key={tip} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">{tip}</span>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeTip(tip)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={createTemplate.isPending}>
          {createTemplate.isPending ? 'Creating...' : 'Create Template'}
        </Button>
      </div>
    </form>
  );
};
