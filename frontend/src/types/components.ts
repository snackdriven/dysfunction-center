/**
 * Simplified Component Interface System
 * Executive Dysfunction Center - Streamlined interfaces for better developer experience
 */

import React from 'react';

/**
 * Base props interface that all components should extend
 * Essential props only for maximum usability
 */
export interface BaseComponentProps {
  /** Additional CSS classes */
  className?: string;
  
  /** Child components */
  children?: React.ReactNode;
  
  /** Test identifier for automated testing */
  'data-testid'?: string;
  
  /** HTML id attribute */
  id?: string;
  
  /** Custom inline styles - use sparingly, prefer className */
  style?: React.CSSProperties;
}

/**
 * Form props interface for input components
 * Essential form functionality with accessibility and executive dysfunction support
 */
export interface FormProps extends BaseComponentProps {
  /** Field label */
  label?: string;
  
  /** Error message to display */
  error?: string;
  
  /** Helper text displayed below the field */
  helperText?: string;
  
  /** Whether the component is in a loading state */
  loading?: boolean;
  
  /** Whether the component is disabled */
  disabled?: boolean;
  
  /** Whether the component is required */
  required?: boolean;
  
  /** Priority level for attention management (executive dysfunction support) */
  priority?: 'high' | 'urgent';
  
  // Essential accessibility props
  /** Accessible name for the component */
  'aria-label'?: string;
  
  /** References to elements that describe this component */
  'aria-describedby'?: string;
  
  /** Indicates if the component has an error */
  'aria-invalid'?: boolean;
}

/**
 * Layout props interface for container components
 * Essential layout functionality without over-engineering
 */
export interface LayoutProps extends BaseComponentProps {
  /** Layout type */
  layout?: 'flex' | 'grid';
  
  /** Number of columns for grid layout */
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  
  /** Gap between items */
  gap?: 'sm' | 'md' | 'lg';
  
  /** Container width */
  width?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  
  /** Center the container */
  centered?: boolean;
}

/**
 * Interactive props interface for clickable components
 * Essential interactive functionality with accessibility
 */
export interface InteractiveProps extends BaseComponentProps {
  /** Whether the component is disabled */
  disabled?: boolean;
  
  /** Click event handler */
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  
  // Essential accessibility props
  /** Accessible name for the component */
  'aria-label'?: string;
  
  /** Role override for semantic meaning */
  role?: string;
  
  /** Tab index for keyboard navigation */
  tabIndex?: number;
}

// Utility types
export type ComponentSize = 'sm' | 'md' | 'lg';
export type ComponentVariant = 'default' | 'primary' | 'secondary' | 'outline';