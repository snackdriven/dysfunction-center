import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import { cn } from '../../utils/cn';

interface MarkdownDisplayProps {
  content: string;
  className?: string;
  showLineNumbers?: boolean;
  maxHeight?: number;
  isPreview?: boolean;
}

export const MarkdownDisplay: React.FC<MarkdownDisplayProps> = ({
  content,
  className,
  showLineNumbers = false,
  maxHeight,
  isPreview = false
}) => {
  // If content is empty, show placeholder
  if (!content || content.trim() === '') {
    return (
      <div className={cn(
        'text-gray-500 italic py-4 text-center border border-dashed border-gray-200 rounded-lg',
        className
      )}>
        No content to display
      </div>
    );
  }

  // For preview mode (collapsed), show plain text with markdown stripped
  if (isPreview) {
    // Simple markdown stripping for preview
    const strippedContent = content
      .replace(/^#{1,6}\s+/gm, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/`(.*?)`/g, '$1') // Remove inline code
      .replace(/^\s*[-*+]\s+/gm, '• ') // Convert lists to bullets
      .replace(/^\s*\d+\.\s+/gm, '• ') // Convert numbered lists to bullets
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove link formatting, keep text
      .replace(/\n{2,}/g, ' ') // Replace multiple newlines with single space
      .replace(/\n/g, ' ') // Replace single newlines with space
      .trim();

    return (
      <div className={cn(
        'text-gray-700 line-clamp-3',
        className
      )}>
        {strippedContent}
      </div>
    );
  }

  // For full display, render markdown
  return (
    <div 
      className={cn('markdown-display', className)}
      style={{
        maxHeight: maxHeight ? `${maxHeight}px` : undefined,
        overflow: maxHeight ? 'auto' : 'visible'
      }}
    >
      <MDEditor.Markdown 
        source={content}
        data-color-mode="light"
        style={{
          backgroundColor: 'transparent',
          fontSize: '14px',
          lineHeight: '1.6'
        }}
        components={{
          // Custom component overrides for better styling
          h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
            <h1 {...props} className="text-2xl font-bold mb-4 mt-6 text-gray-900 border-b border-gray-200 pb-2">
              {children}
            </h1>
          ),
          h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
            <h2 {...props} className="text-xl font-semibold mb-3 mt-5 text-gray-900">
              {children}
            </h2>
          ),
          h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
            <h3 {...props} className="text-lg font-medium mb-2 mt-4 text-gray-900">
              {children}
            </h3>
          ),
          p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
            <p {...props} className="mb-3 text-gray-700 leading-relaxed">
              {children}
            </p>
          ),
          ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
            <ul {...props} className="mb-3 ml-6 list-disc space-y-1">
              {children}
            </ul>
          ),
          ol: ({ children, ...props }: React.OlHTMLAttributes<HTMLOListElement>) => (
            <ol {...props} className="mb-3 ml-6 list-decimal space-y-1">
              {children}
            </ol>
          ),
          li: ({ children, ...props }: React.LiHTMLAttributes<HTMLLIElement>) => (
            <li {...props} className="text-gray-700">
              {children}
            </li>
          ),
          blockquote: ({ children, ...props }: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => (
            <blockquote {...props} className="border-l-4 border-blue-200 pl-4 my-4 italic text-gray-600 bg-blue-50 py-2 rounded-r">
              {children}
            </blockquote>
          ),
          code: ({ children, className, ...props }: React.HTMLAttributes<HTMLElement>) => {
            // Inline code
            if (!className) {
              return (
                <code {...props} className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">
                  {children}
                </code>
              );
            }
            // Block code (handled by pre)
            return <code {...props} className={className}>{children}</code>;
          },
          pre: ({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
            <pre {...props} className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4 text-sm">
              {children}
            </pre>
          ),
          a: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
            <a 
              {...props}
              href={href} 
              className="text-blue-600 hover:text-blue-800 underline hover:no-underline transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          img: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
            <img 
              {...props}
              src={src} 
              alt={alt}
              className="max-w-full h-auto rounded-lg shadow-sm my-4"
              loading="lazy"
            />
          ),
          table: ({ children, ...props }: React.TableHTMLAttributes<HTMLTableElement>) => (
            <div className="overflow-x-auto my-4">
              <table {...props} className="min-w-full border border-gray-200 rounded-lg">
                {children}
              </table>
            </div>
          ),
          thead: ({ children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
            <thead {...props} className="bg-gray-50">
              {children}
            </thead>
          ),
          th: ({ children, ...props }: React.ThHTMLAttributes<HTMLTableHeaderCellElement>) => (
            <th {...props} className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
              {children}
            </th>
          ),
          td: ({ children, ...props }: React.TdHTMLAttributes<HTMLTableDataCellElement>) => (
            <td {...props} className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
              {children}
            </td>
          ),
          hr: () => (
            <hr className="my-6 border-gray-200" />
          )
        }}
      />
    </div>
  );
};

// Custom CSS for better markdown display (to be added to global styles)
export const markdownDisplayStyles = `
.markdown-display .wmde-markdown {
  background-color: transparent !important;
  color: inherit !important;
  font-family: inherit !important;
}

.markdown-display .wmde-markdown h1,
.markdown-display .wmde-markdown h2,
.markdown-display .wmde-markdown h3,
.markdown-display .wmde-markdown h4,
.markdown-display .wmde-markdown h5,
.markdown-display .wmde-markdown h6 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

.markdown-display .wmde-markdown h1:first-child,
.markdown-display .wmde-markdown h2:first-child,
.markdown-display .wmde-markdown h3:first-child {
  margin-top: 0;
}

.markdown-display .wmde-markdown p:last-child {
  margin-bottom: 0;
}

.markdown-display .wmde-markdown pre {
  margin: 1rem 0;
}

.markdown-display .wmde-markdown code {
  padding: 0.125rem 0.25rem;
  font-size: 85%;
}
`;