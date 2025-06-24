import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { habitsApi, HabitTemplate, useCreateHabitFromTemplate } from '../../services/habits';
import { Sparkles, Clock, Target, Repeat, CheckCircle } from 'lucide-react';

interface HabitTemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const HabitTemplateSelector: React.FC<HabitTemplateSelectorProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [selectedTemplate, setSelectedTemplate] = React.useState<HabitTemplate | null>(null);
  const [customization, setCustomization] = React.useState({
    name: '',
    target_value: 1,
    reminder_enabled: false,
    reminder_time: '',
  });
  const [categoryFilter, setCategoryFilter] = React.useState<string>('');

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['habit-templates', categoryFilter],
    queryFn: () => habitsApi.getTemplates(categoryFilter || undefined),
    enabled: isOpen
  });

  const createFromTemplate = useCreateHabitFromTemplate();

  const handleTemplateSelect = (template: HabitTemplate) => {
    setSelectedTemplate(template);
    setCustomization({
      name: template.name,
      target_value: template.suggested_value,
      reminder_enabled: false,
      reminder_time: '',
    });
  };

  const handleCreateFromTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      await createFromTemplate.mutateAsync({
        template_id: selectedTemplate.id,
        name: customization.name !== selectedTemplate.name ? customization.name : undefined,
        target_value: customization.target_value !== selectedTemplate.suggested_value ? customization.target_value : undefined,
        reminder_enabled: customization.reminder_enabled,
        reminder_time: customization.reminder_enabled ? customization.reminder_time : undefined,
      });

      onSuccess?.();
      onClose();
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Failed to create habit from template:', error);
    }
  };

  const formatTargetDisplay = (template: HabitTemplate) => {
    if (template.completion_type === 'boolean') {
      return `${template.suggested_frequency}x per ${template.target_type || 'day'}`;
    }
    
    return `${template.suggested_value} ${template.unit || ''} ${template.suggested_frequency}x per ${template.target_type || 'day'}`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'health': return '🏃‍♂️';
      case 'productivity': return '💼';
      case 'personal': return '🌱';
      default: return '📋';
    }
  };

  const getCompletionTypeIcon = (type: string) => {
    switch (type) {
      case 'boolean': return <CheckCircle className="h-4 w-4" />;
      case 'count': return <Target className="h-4 w-4" />;
      case 'duration': return <Clock className="h-4 w-4" />;
      default: return <Repeat className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Choose a Habit Template
          </DialogTitle>
        </DialogHeader>

        {!selectedTemplate ? (
          <div className="space-y-4">
            {/* Category Filter */}
            <div className="flex items-center gap-4">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All categories</SelectItem>
                  <SelectItem value="health">🏃‍♂️ Health & Fitness</SelectItem>
                  <SelectItem value="productivity">💼 Productivity</SelectItem>
                  <SelectItem value="personal">🌱 Personal Development</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-500">
                {templates.length} template{templates.length !== 1 ? 's' : ''} available
              </span>
            </div>

            {/* Templates Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🎯</div>
                <p className="text-gray-500">No templates found for the selected category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <Card 
                    key={template.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{template.icon || getCategoryIcon(template.category)}</span>
                          <div>
                            <h3 className="font-medium text-sm">{template.name}</h3>
                            <Badge variant="outline" className="text-xs mt-1">
                              {template.category}
                            </Badge>
                          </div>
                        </div>
                        {getCompletionTypeIcon(template.completion_type)}
                      </div>

                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {template.description}
                      </p>

                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1 text-gray-500">
                          <Target className="h-3 w-3" />
                          <span>{formatTargetDisplay(template)}</span>
                        </div>
                        
                        {template.tags && template.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {template.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {template.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{template.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Template Preview */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{selectedTemplate.icon || getCategoryIcon(selectedTemplate.category)}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{selectedTemplate.name}</h3>
                    <p className="text-gray-600 mb-2">{selectedTemplate.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        {formatTargetDisplay(selectedTemplate)}
                      </div>
                      <Badge variant="outline">{selectedTemplate.category}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customization Form */}
            <div className="space-y-4">
              <h4 className="font-medium">Customize Your Habit</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Habit Name"
                  value={customization.name}
                  onChange={(e) => setCustomization(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Custom habit name..."
                />

                {selectedTemplate.completion_type !== 'boolean' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Target {selectedTemplate.completion_type === 'count' ? 'Count' : 'Duration'} 
                      {selectedTemplate.unit && ` (${selectedTemplate.unit})`}
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={customization.target_value}
                      onChange={(e) => setCustomization(prev => ({ 
                        ...prev, 
                        target_value: parseInt(e.target.value) || 1 
                      }))}
                    />
                  </div>
                )}
              </div>

              {/* Reminder Settings */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="reminder"
                    checked={customization.reminder_enabled}
                    onChange={(e) => setCustomization(prev => ({ 
                      ...prev, 
                      reminder_enabled: e.target.checked 
                    }))}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="reminder" className="text-sm font-medium">
                    Enable daily reminder
                  </label>
                </div>

                {customization.reminder_enabled && (
                  <Input
                    type="time"
                    label="Reminder Time"
                    value={customization.reminder_time}
                    onChange={(e) => setCustomization(prev => ({ 
                      ...prev, 
                      reminder_time: e.target.value 
                    }))}
                  />
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setSelectedTemplate(null)}
              >
                Back to Templates
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateFromTemplate}
                  disabled={createFromTemplate.isPending || !customization.name.trim()}
                >
                  {createFromTemplate.isPending ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                      Creating...
                    </>
                  ) : (
                    'Create Habit'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};