import React from 'react';
import { cn } from '../../utils/cn';

interface AdaptiveTypographyProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'heading' | 'body' | 'caption' | 'display';
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  responsive?: boolean;
  element?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
}

export const AdaptiveTypography: React.FC<AdaptiveTypographyProps> = ({
  children,
  className,
  variant = 'body',
  level = 1,
  size,
  responsive = true,
  element
}) => {
  // Determine the HTML element based on variant and level
  const getElement = () => {
    if (element) return element;
    
    switch (variant) {
      case 'heading':
        return `h${level}` as 'h1';
      case 'display':
        return 'h1';
      case 'caption':
        return 'span';
      default:
        return 'p';
    }
  };

  // Base typography styles
  const baseStyles = {
    heading: 'font-semibold tracking-tight text-foreground',
    body: 'text-foreground leading-relaxed',
    caption: 'text-muted-foreground font-medium',
    display: 'font-bold tracking-tight text-foreground'
  };

  // Responsive size classes
  const responsiveSizes = {
    heading: {
      1: responsive 
        ? 'text-2xl @container/content-[min-width:_400px]:text-3xl @container/content-[min-width:_600px]:text-4xl'
        : 'text-3xl',
      2: responsive
        ? 'text-xl @container/content-[min-width:_400px]:text-2xl @container/content-[min-width:_600px]:text-3xl'
        : 'text-2xl',
      3: responsive
        ? 'text-lg @container/content-[min-width:_400px]:text-xl @container/content-[min-width:_600px]:text-2xl'
        : 'text-xl',
      4: responsive
        ? 'text-base @container/content-[min-width:_400px]:text-lg @container/content-[min-width:_600px]:text-xl'
        : 'text-lg',
      5: responsive
        ? 'text-sm @container/content-[min-width:_400px]:text-base @container/content-[min-width:_600px]:text-lg'
        : 'text-base',
      6: responsive
        ? 'text-sm @container/content-[min-width:_400px]:text-base'
        : 'text-base'
    },
    body: responsive
      ? 'text-sm @container/content-[min-width:_400px]:text-base'
      : 'text-base',
    caption: responsive
      ? 'text-xs @container/content-[min-width:_400px]:text-sm'
      : 'text-sm',
    display: responsive
      ? 'text-3xl @container/content-[min-width:_400px]:text-4xl @container/content-[min-width:_600px]:text-5xl @container/content-[min-width:_800px]:text-6xl'
      : 'text-4xl'
  };

  // Fixed size classes (override responsive)
  const fixedSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl'
  };

  const getSizeClasses = () => {
    if (size) return fixedSizes[size];
    
    switch (variant) {
      case 'heading':
        return responsiveSizes.heading[level as keyof typeof responsiveSizes.heading];
      default:
        return responsiveSizes[variant];
    }
  };

  const Element = getElement();

  return React.createElement(
    Element,
    {
      className: cn(
        'adaptive-typography',
        'cognitive-ease', // From our container queries CSS
        baseStyles[variant],
        getSizeClasses(),
        // Executive dysfunction optimizations
        'leading-relaxed',
        'word-spacing-normal',
        'hyphens-auto',
        className
      )
    },
    children
  );
};

interface AdaptiveSpacingProps {
  children: React.ReactNode;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  direction?: 'vertical' | 'horizontal' | 'all';
  responsive?: boolean;
}

export const AdaptiveSpacing: React.FC<AdaptiveSpacingProps> = ({
  children,
  className,
  size = 'md',
  direction = 'vertical',
  responsive = true
}) => {
  const getSpacingClasses = () => {
    const baseSpacing = {
      xs: {
        vertical: responsive ? 'space-y-1 @container/content-[min-width:_400px]:space-y-2' : 'space-y-2',
        horizontal: responsive ? 'space-x-1 @container/content-[min-width:_400px]:space-x-2' : 'space-x-2',
        all: responsive ? 'gap-1 @container/content-[min-width:_400px]:gap-2' : 'gap-2'
      },
      sm: {
        vertical: responsive ? 'space-y-2 @container/content-[min-width:_400px]:space-y-3' : 'space-y-3',
        horizontal: responsive ? 'space-x-2 @container/content-[min-width:_400px]:space-x-3' : 'space-x-3',
        all: responsive ? 'gap-2 @container/content-[min-width:_400px]:gap-3' : 'gap-3'
      },
      md: {
        vertical: responsive ? 'space-y-3 @container/content-[min-width:_400px]:space-y-4 @container/content-[min-width:_600px]:space-y-6' : 'space-y-4',
        horizontal: responsive ? 'space-x-3 @container/content-[min-width:_400px]:space-x-4 @container/content-[min-width:_600px]:space-x-6' : 'space-x-4',
        all: responsive ? 'gap-3 @container/content-[min-width:_400px]:gap-4 @container/content-[min-width:_600px]:gap-6' : 'gap-4'
      },
      lg: {
        vertical: responsive ? 'space-y-4 @container/content-[min-width:_400px]:space-y-6 @container/content-[min-width:_600px]:space-y-8' : 'space-y-6',
        horizontal: responsive ? 'space-x-4 @container/content-[min-width:_400px]:space-x-6 @container/content-[min-width:_600px]:space-x-8' : 'space-x-6',
        all: responsive ? 'gap-4 @container/content-[min-width:_400px]:gap-6 @container/content-[min-width:_600px]:gap-8' : 'gap-6'
      },
      xl: {
        vertical: responsive ? 'space-y-6 @container/content-[min-width:_400px]:space-y-8 @container/content-[min-width:_600px]:space-y-12' : 'space-y-8',
        horizontal: responsive ? 'space-x-6 @container/content-[min-width:_400px]:space-x-8 @container/content-[min-width:_600px]:space-x-12' : 'space-x-8',
        all: responsive ? 'gap-6 @container/content-[min-width:_400px]:gap-8 @container/content-[min-width:_600px]:gap-12' : 'gap-8'
      },
      '2xl': {
        vertical: responsive ? 'space-y-8 @container/content-[min-width:_400px]:space-y-12 @container/content-[min-width:_600px]:space-y-16' : 'space-y-12',
        horizontal: responsive ? 'space-x-8 @container/content-[min-width:_400px]:space-x-12 @container/content-[min-width:_600px]:space-x-16' : 'space-x-12',
        all: responsive ? 'gap-8 @container/content-[min-width:_400px]:gap-12 @container/content-[min-width:_600px]:gap-16' : 'gap-12'
      }
    };

    return baseSpacing[size][direction];
  };

  return (
    <div className={cn(
      'adaptive-spacing',
      'container-type-inline-size',
      getSpacingClasses(),
      className
    )}>
      {children}
    </div>
  );
};

interface ResponsiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'wide' | 'tall' | 'auto';
  sizes?: string;
  priority?: boolean;
  fallbackSrc?: string;
  adaptive?: boolean;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className,
  aspectRatio = 'auto',
  sizes,
  priority = false,
  fallbackSrc,
  adaptive = true,
  ...props
}) => {
  const [imageSrc, setImageSrc] = React.useState(src);
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setImageSrc(src);
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    if (fallbackSrc && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
    }
  };

  const aspectRatioStyles = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[3/1]',
    tall: 'aspect-[3/4]',
    auto: ''
  };

  const containerClasses = cn(
    'responsive-image-container',
    'relative overflow-hidden',
    aspectRatio !== 'auto' && aspectRatioStyles[aspectRatio],
    adaptive && 'container-type-inline-size',
    // Responsive sizing
    adaptive && aspectRatio !== 'auto' && [
      'w-full',
      '@container/content-[min-width:_400px]:max-w-md',
      '@container/content-[min-width:_600px]:max-w-lg',
      '@container/content-[min-width:_800px]:max-w-xl'
    ]
  );

  const imageClasses = cn(
    'responsive-image',
    'w-full h-full object-cover',
    'transition-opacity duration-300',
    isLoading && 'opacity-0',
    !isLoading && 'opacity-100',
    className
  );

  return (
    <div className={containerClasses}>
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {hasError && !fallbackSrc ? (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <div className="text-muted-foreground text-center">
            <div className="w-12 h-12 mx-auto mb-2 opacity-50">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
            </div>
            <p className="text-sm">Image not available</p>
          </div>
        </div>
      ) : (
        <img
          src={imageSrc}
          alt={alt}
          className={imageClasses}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          sizes={sizes}
          {...props}
        />
      )}
    </div>
  );
};

interface AdaptiveIconProps {
  icon: React.ComponentType<any>;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  responsive?: boolean;
  color?: 'current' | 'muted' | 'primary' | 'success' | 'warning' | 'danger';
}

export const AdaptiveIcon: React.FC<AdaptiveIconProps> = ({
  icon: Icon,
  className,
  size = 'md',
  responsive = true,
  color = 'current'
}) => {
  const sizeClasses = {
    xs: responsive ? 'w-3 h-3 @container/content-[min-width:_400px]:w-4 @container/content-[min-width:_400px]:h-4' : 'w-4 h-4',
    sm: responsive ? 'w-4 h-4 @container/content-[min-width:_400px]:w-5 @container/content-[min-width:_400px]:h-5' : 'w-5 h-5',
    md: responsive ? 'w-5 h-5 @container/content-[min-width:_400px]:w-6 @container/content-[min-width:_400px]:h-6' : 'w-6 h-6',
    lg: responsive ? 'w-6 h-6 @container/content-[min-width:_400px]:w-8 @container/content-[min-width:_400px]:h-8' : 'w-8 h-8',
    xl: responsive ? 'w-8 h-8 @container/content-[min-width:_400px]:w-10 @container/content-[min-width:_400px]:h-10' : 'w-10 h-10'
  };

  const colorClasses = {
    current: 'text-current',
    muted: 'text-muted-foreground',
    primary: 'text-primary',
    success: 'text-green-600',
    warning: 'text-orange-600',
    danger: 'text-red-600'
  };

  return (
    <Icon className={cn(
      'adaptive-icon',
      'flex-shrink-0',
      sizeClasses[size],
      colorClasses[color],
      className
    )} />
  );
};
