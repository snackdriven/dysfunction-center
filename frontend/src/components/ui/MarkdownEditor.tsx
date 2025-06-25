import React, { forwardRef, useState, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { Button } from './Button';
import { cn } from '../../utils/cn';
import { Eye, EyeOff, Type, Code, Bold, Italic, List, Link2, Image } from 'lucide-react';

interface MarkdownEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  height?: number;
  preview?: 'edit' | 'preview' | 'live';
  hideToolbar?: boolean;
  className?: string;
  maxLength?: number;
  showCharacterCount?: boolean;
  autoFocus?: boolean;
  readOnly?: boolean;
  required?: boolean;
  id?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export const MarkdownEditor = forwardRef<HTMLDivElement, MarkdownEditorProps>(
  ({
    value = '',
    onChange,
    placeholder = 'Start writing your markdown...',
    height = 300,
    preview = 'live',
    hideToolbar = false,
    className,
    maxLength,
    showCharacterCount = false,
    autoFocus = false,
    readOnly = false,
    required = false,
    id,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    ...props
  }, ref) => {
    const [previewMode, setPreviewMode] = useState<'edit' | 'preview' | 'live'>(preview);
    const [isFocused, setIsFocused] = useState(false);
    const characterCount = value.length;
    const isOverLimit = maxLength ? characterCount > maxLength : false;

    // Handle keyboard shortcuts
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (!isFocused) return;

        // Ctrl/Cmd + B for bold
        if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
          event.preventDefault();
          insertMarkdown('**', '**', 'bold text');
        }
        
        // Ctrl/Cmd + I for italic
        if ((event.ctrlKey || event.metaKey) && event.key === 'i') {
          event.preventDefault();
          insertMarkdown('*', '*', 'italic text');
        }

        // Ctrl/Cmd + K for link
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
          event.preventDefault();
          insertMarkdown('[', '](url)', 'link text');
        }

        // Ctrl/Cmd + Enter to toggle preview
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
          event.preventDefault();
          togglePreviewMode();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isFocused, value]);

    const insertMarkdown = (before: string, after: string, defaultText: string) => {
      if (!onChange) return;
      
      // For now, just append at the end - in a real implementation,
      // we'd get cursor position and insert at that location
      const newValue = value + before + defaultText + after;
      onChange(newValue);
    };

    const togglePreviewMode = () => {
      setPreviewMode(current => {
        switch (current) {
          case 'edit': return 'live';
          case 'live': return 'preview';
          case 'preview': return 'edit';
          default: return 'live';
        }
      });
    };

    const handleChange = (val?: string) => {
      const newValue = val || '';
      
      // Enforce character limit
      if (maxLength && newValue.length > maxLength) {
        return; // Don't update if over limit
      }

      onChange?.(newValue);
    };

    const customToolbar = !hideToolbar ? (
      <div className="border-b border-gray-200 p-2 bg-gray-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {/* Formatting buttons */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown('**', '**', 'bold text')}
              title="Bold (Ctrl+B)"
              className="h-8 w-8 p-0"
            >
              <Bold className="h-4 w-4" />
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown('*', '*', 'italic text')}
              title="Italic (Ctrl+I)"
              className="h-8 w-8 p-0"
            >
              <Italic className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown('\n\n## ', '', 'Heading')}
              title="Heading"
              className="h-8 w-8 p-0"
            >
              <Type className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown('\n- ', '', 'List item')}
              title="List"
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown('[', '](url)', 'link text')}
              title="Link (Ctrl+K)"
              className="h-8 w-8 p-0"
            >
              <Link2 className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown('![', '](image-url)', 'alt text')}
              title="Image"
              className="h-8 w-8 p-0"
            >
              <Image className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown('\n```\n', '\n```\n', 'code')}
              title="Code Block"
              className="h-8 w-8 p-0"
            >
              <Code className="h-4 w-4" />
            </Button>
          </div>

          {/* View toggle */}
          <div className="flex items-center space-x-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={togglePreviewMode}
              title={`Switch to ${previewMode === 'edit' ? 'preview' : previewMode === 'live' ? 'preview' : 'edit'} mode (Ctrl+Enter)`}
              className="h-8 px-2"
            >
              {previewMode === 'edit' ? (
                <>
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </>
              ) : previewMode === 'preview' ? (
                <>
                  <Type className="h-4 w-4 mr-1" />
                  Edit
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4 mr-1" />
                  Split
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    ) : null;

    return (
      <div 
        ref={ref}
        className={cn('relative', className)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        {/* Custom toolbar */}
        {customToolbar}

        {/* Editor */}
        <div className={cn(
          'border border-gray-300 rounded-b-lg',
          hideToolbar && 'rounded-t-lg',
          isFocused && 'ring-2 ring-blue-500 ring-opacity-50',
          isOverLimit && 'border-red-500'
        )}>
          <MDEditor
            value={value}
            onChange={handleChange}
            preview={previewMode}
            height={height}
            hideToolbar={true} // We use our custom toolbar
            visibleDragbar={false}
            textareaProps={{
              placeholder,
              id,
              required,
              readOnly,
              autoFocus,
              'aria-label': ariaLabel || 'Markdown editor',
              'aria-describedby': ariaDescribedBy,
              style: {
                fontSize: '14px',
                lineHeight: '1.5',
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
              }
            }}
            data-color-mode="light"
            {...props}
          />
        </div>

        {/* Character count and validation */}
        {(showCharacterCount || maxLength) && (
          <div className="flex justify-between items-center mt-2 text-sm">
            {showCharacterCount && (
              <span className={cn(
                'text-gray-500',
                isOverLimit && 'text-red-500'
              )}>
                {characterCount}{maxLength && ` / ${maxLength}`} characters
              </span>
            )}
            
            {isOverLimit && (
              <span className="text-red-500 text-xs">
                Character limit exceeded
              </span>
            )}
          </div>
        )}

        {/* Help text */}
        <div className="mt-2 text-xs text-gray-500">
          <details className="cursor-pointer">
            <summary className="hover:text-gray-700">Markdown formatting help</summary>
            <div className="mt-2 space-y-1 bg-gray-50 p-3 rounded border">
              <div><strong>**bold**</strong> → <strong>bold</strong></div>
              <div><em>*italic*</em> → <em>italic</em></div>
              <div><code># Heading</code> → <h3 className="text-lg font-bold">Heading</h3></div>
              <div><code>- List item</code> → • List item</div>
              <div><code>[Link](url)</code> → <a href="#" className="text-blue-600 underline">Link</a></div>
              <div><code>`code`</code> → <code className="bg-gray-100 px-1 rounded">code</code></div>
              <div className="pt-2 border-t">
                <strong>Shortcuts:</strong> Ctrl+B (bold), Ctrl+I (italic), Ctrl+K (link), Ctrl+Enter (toggle preview)
              </div>
            </div>
          </details>
        </div>
      </div>
    );
  }
);

MarkdownEditor.displayName = 'MarkdownEditor';