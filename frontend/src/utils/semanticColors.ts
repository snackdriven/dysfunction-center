/**
 * Semantic color system for consistent, meaningful color usage across the application
 * Replaces inconsistent color patterns with purposeful, accessible design tokens
 */

export const semanticColors = {
  success: {
    text: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    indicator: 'bg-emerald-500',
    hover: 'hover:bg-emerald-100',
    focus: 'focus:ring-emerald-500'
  },
  progress: {
    text: 'text-blue-700',
    bg: 'bg-blue-50', 
    border: 'border-blue-200',
    indicator: 'bg-blue-500',
    hover: 'hover:bg-blue-100',
    focus: 'focus:ring-blue-500'
  },
  warning: {
    text: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    indicator: 'bg-amber-500',
    hover: 'hover:bg-amber-100',
    focus: 'focus:ring-amber-500'
  },
  urgent: {
    text: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    indicator: 'bg-red-500',
    hover: 'hover:bg-red-100',
    focus: 'focus:ring-red-500'
  },
  neutral: {
    text: 'text-gray-700',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    indicator: 'bg-gray-300',
    hover: 'hover:bg-gray-100',
    focus: 'focus:ring-gray-500'
  },
  info: {
    text: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    indicator: 'bg-purple-500',
    hover: 'hover:bg-purple-100',
    focus: 'focus:ring-purple-500'
  }
} as const;

/**
 * Task priority semantic mapping
 * Provides consistent priority visualization across all task-related components
 */
export const getPrioritySemantics = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case 'high':
    case 'urgent':
      return {
        ...semanticColors.urgent,
        label: 'High Priority',
        badgeVariant: 'destructive' as const
      };
    case 'medium':
    case 'normal':
      return {
        ...semanticColors.warning,
        label: 'Medium Priority',
        badgeVariant: 'secondary' as const
      };
    case 'low':
      return {
        ...semanticColors.neutral,
        label: 'Low Priority',
        badgeVariant: 'outline' as const
      };
    default:
      return {
        ...semanticColors.neutral,
        label: 'No Priority',
        badgeVariant: 'outline' as const
      };
  }
};

/**
 * Productivity score semantic evaluation
 * Replaces scattered score color logic throughout the application
 */
export const getProductivityScoreSemantics = (score: number) => {
  if (score >= 80) {
    return {
      ...semanticColors.success,
      label: 'Excellent',
      description: 'Outstanding productivity!'
    };
  }
  if (score >= 60) {
    return {
      ...semanticColors.progress,
      label: 'Good',
      description: 'Solid progress today'
    };
  }
  if (score >= 40) {
    return {
      ...semanticColors.warning,
      label: 'Fair',
      description: 'Room for improvement'
    };
  }
  return {
    ...semanticColors.urgent,
    label: 'Needs Attention',
    description: 'Focus on key priorities'
  };
};

/**
 * Mood score semantic evaluation
 * Provides consistent mood score interpretation and visualization
 */
export const getMoodSemantics = (score: number) => {
  if (score >= 4) {
    return {
      ...semanticColors.success,
      label: 'Great',
      emoji: '😊'
    };
  }
  if (score >= 3) {
    return {
      ...semanticColors.progress,
      label: 'Good',
      emoji: '🙂'
    };
  }
  if (score >= 2) {
    return {
      ...semanticColors.warning,
      label: 'Okay',
      emoji: '😐'
    };
  }
  return {
    ...semanticColors.urgent,
    label: 'Struggling',
    emoji: '😔'
  };
};

/**
 * Habit streak semantic evaluation
 * Provides meaningful visualization for habit streak milestones
 */
export const getHabitStreakSemantics = (streak: number) => {
  if (streak >= 30) {
    return {
      ...semanticColors.success,
      label: 'Master',
      milestone: '30+ days strong!'
    };
  }
  if (streak >= 14) {
    return {
      ...semanticColors.progress,
      label: 'Champion',
      milestone: '2 weeks solid'
    };
  }
  if (streak >= 7) {
    return {
      ...semanticColors.info,
      label: 'Building',
      milestone: '1 week streak'
    };
  }
  if (streak >= 3) {
    return {
      ...semanticColors.warning,
      label: 'Starting',
      milestone: 'Keep it up!'
    };
  }
  return {
    ...semanticColors.neutral,
    label: 'Beginning',
    milestone: 'Every start counts'
  };
};

/**
 * Completion status semantic mapping
 * Provides consistent styling for completion states
 */
export const getCompletionSemantics = (isCompleted: boolean) => {
  return isCompleted ? {
    ...semanticColors.success,
    label: 'Completed',
    icon: '✓'
  } : {
    ...semanticColors.neutral,
    label: 'Pending',
    icon: '○'
  };
};

/**
 * Energy level semantic mapping for mood tracking
 */
export const getEnergySemantics = (level: number) => {
  if (level >= 4) return { ...semanticColors.success, label: 'High Energy' };
  if (level >= 3) return { ...semanticColors.progress, label: 'Good Energy' };
  if (level >= 2) return { ...semanticColors.warning, label: 'Low Energy' };
  return { ...semanticColors.urgent, label: 'Drained' };
};

/**
 * Stress level semantic mapping for mood tracking
 */
export const getStressSemantics = (level: number) => {
  if (level >= 4) return { ...semanticColors.urgent, label: 'High Stress' };
  if (level >= 3) return { ...semanticColors.warning, label: 'Moderate Stress' };
  if (level >= 2) return { ...semanticColors.progress, label: 'Mild Stress' };
  return { ...semanticColors.success, label: 'Relaxed' };
};

/**
 * Insight type semantic mapping
 * For AI insights and recommendations display
 */
export const getInsightSemantics = (type: string, priority: string = 'medium') => {
  if (type === 'positive') {
    return {
      ...semanticColors.success,
      icon: 'TrendingUp',
      label: 'Positive Insight'
    };
  }
  if (type === 'warning' || priority === 'high') {
    return {
      ...semanticColors.urgent,
      icon: 'AlertTriangle',
      label: 'Important Notice'
    };
  }
  return {
    ...semanticColors.info,
    icon: 'Lightbulb',
    label: 'Suggestion'
  };
};