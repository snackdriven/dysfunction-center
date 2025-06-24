/**
 * Shared types for UI components
 */

export type Size = 'sm' | 'md' | 'lg';

export type Variant = 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'info' 
  | 'ghost' 
  | 'outline' 
  | 'destructive';

export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'ghost' 
  | 'outline' 
  | 'destructive' 
  | 'link';

export type InputVariant = 'default' | 'error' | 'success';

export type BadgeVariant = 
  | 'default' 
  | 'secondary' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'info' 
  | 'outline';

export type CardVariant = 'default' | 'elevated' | 'outline';

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface BaseProps {
  className?: string;
  children?: React.ReactNode;
}

export interface SizeProps {
  size?: Size;
}

export interface VariantProps<T = Variant> {
  variant?: T;
}

export interface DisabledProps {
  disabled?: boolean;
}

export interface LoadingProps {
  loading?: boolean;
}
