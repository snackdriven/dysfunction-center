/**
 * Desktop-Optimized Focus Management and Accessibility
 * Designed specifically for executive dysfunction support
 */

interface FocusableElement extends HTMLElement {
  tabIndex: number;
}

interface FocusHistoryEntry {
  element: HTMLElement;
  timestamp: number;
  reason: 'user' | 'programmatic' | 'restoration';
}

interface FocusOptions {
  preventScroll?: boolean;
  restoreOnEscape?: boolean;
  highlightMode?: 'ring' | 'outline' | 'background' | 'border';
  announceToScreenReader?: boolean;
}

class FocusManager {
  private focusHistory: FocusHistoryEntry[] = [];
  private focusStack: HTMLElement[] = [];
  private activeModals: HTMLElement[] = [];
  private skipLinks: HTMLElement[] = [];
  private lastUserFocus: HTMLElement | null = null;
  private focusVisible: boolean = false;
  private currentHighlightMode: 'ring' | 'outline' | 'background' | 'border' = 'ring';

  constructor() {
    this.initializeFocusManagement();
    this.createSkipLinks();
    this.setupKeyboardNavigation();
    this.setupFocusVisible();
  }

  private initializeFocusManagement() {
    // Track focus changes
    document.addEventListener('focusin', this.handleFocusIn.bind(this));
    document.addEventListener('focusout', this.handleFocusOut.bind(this));
    
    // Handle keyboard navigation
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    
    // Track mouse interactions to distinguish keyboard vs mouse focus
    document.addEventListener('mousedown', () => {
      this.focusVisible = false;
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab' || e.key === 'Enter' || e.key === ' ') {
        this.focusVisible = true;
      }
    });
  }

  private handleFocusIn(event: FocusEvent) {
    const target = event.target as HTMLElement;
    
    if (target && this.isValidFocusTarget(target)) {
      // Add to focus history
      this.focusHistory.push({
        element: target,
        timestamp: Date.now(),
        reason: this.focusVisible ? 'user' : 'programmatic'
      });
      
      // Keep history manageable
      if (this.focusHistory.length > 50) {
        this.focusHistory = this.focusHistory.slice(-25);
      }
      
      // Apply executive dysfunction optimizations
      this.optimizeFocusForED(target);
      
      // Announce to screen readers if needed
      this.announceToScreenReader(target);
    }
  }

  private handleFocusOut(event: FocusEvent) {
    const target = event.target as HTMLElement;
    
    if (target) {
      // Clear any focus enhancements
      this.clearFocusEnhancements(target);
    }
  }

  private handleKeyDown(event: KeyboardEvent) {
    // Escape key handling
    if (event.key === 'Escape') {
      this.handleEscapeKey(event);
    }
    
    // Focus restoration shortcuts
    if (event.ctrlKey && event.key === 'z') {
      event.preventDefault();
      this.restorePreviousFocus();
    }
    
    // Focus navigation shortcuts
    if (event.altKey) {
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          this.focusPreviousSection();
          break;
        case 'ArrowDown':
          event.preventDefault();
          this.focusNextSection();
          break;
        case 'Home':
          event.preventDefault();
          this.focusMainContent();
          break;
      }
    }
  }

  private isValidFocusTarget(element: HTMLElement): boolean {
    return (
      element.tabIndex >= 0 &&
      !element.disabled &&
      element.offsetParent !== null && // Element is visible
      !element.hasAttribute('inert')
    );
  }

  private optimizeFocusForED(element: HTMLElement) {
    // Apply executive dysfunction-friendly focus styling
    element.classList.add('ed-focus-enhanced');
    
    // Add visual focus indicators based on current mode
    switch (this.currentHighlightMode) {
      case 'ring':
        element.style.outline = '3px solid var(--brand-primary)';
        element.style.outlineOffset = '2px';
        element.style.borderRadius = '4px';
        break;
      case 'outline':
        element.style.outline = '2px solid var(--brand-primary)';
        element.style.outlineOffset = '1px';
        break;
      case 'background':
        element.style.backgroundColor = 'var(--brand-primary)/10';
        element.style.border = '2px solid var(--brand-primary)';
        break;
      case 'border':
        element.style.border = '2px solid var(--brand-primary)';
        element.style.borderRadius = '4px';
        break;
    }
    
    // Ensure element is fully visible
    this.ensureElementVisible(element);
    
    // Add breathing room for complex elements
    if (this.isComplexElement(element)) {
      element.style.padding = 'max(var(--spacing-normal-text), 0.75rem)';
      element.style.margin = 'var(--spacing-normal-text)';
    }
  }

  private clearFocusEnhancements(element: HTMLElement) {
    element.classList.remove('ed-focus-enhanced');
    
    // Clear inline styles (only the ones we added)
    const stylesToClear = ['outline', 'outlineOffset', 'borderRadius', 'backgroundColor', 'border'];
    stylesToClear.forEach(style => {
      element.style.removeProperty(style);
    });
  }

  private ensureElementVisible(element: HTMLElement) {
    // Check if element is in viewport
    const rect = element.getBoundingClientRect();
    const viewport = {
      top: 0,
      left: 0,
      right: window.innerWidth,
      bottom: window.innerHeight
    };
    
    // If element is not fully visible, scroll it into view
    if (
      rect.top < viewport.top ||
      rect.bottom > viewport.bottom ||
      rect.left < viewport.left ||
      rect.right > viewport.right
    ) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    }
  }

  private isComplexElement(element: HTMLElement): boolean {
    // Define complex elements that need extra focus support
    const complexSelectors = [
      'form',
      '.task-card',
      '.habit-card',
      '.mood-entry',
      '.journal-entry',
      '[role="dialog"]',
      '[role="tabpanel"]',
      '.dashboard-widget'
    ];
    
    return complexSelectors.some(selector => 
      element.matches(selector) || element.closest(selector)
    );
  }

  private announceToScreenReader(element: HTMLElement) {
    // Create announcement for screen readers
    let announcement = '';
    
    // Get element description
    const label = element.getAttribute('aria-label') || 
                  element.getAttribute('aria-labelledby') ||
                  element.textContent ||
                  element.getAttribute('title') ||
                  element.getAttribute('placeholder');
    
    if (label) {
      announcement = label.trim();
      
      // Add context for executive dysfunction users
      const context = this.getExecutiveDysfunctionContext(element);
      if (context) {
        announcement += `. ${context}`;
      }
      
      // Announce using live region
      this.announceToLiveRegion(announcement);
    }
  }

  private getExecutiveDysfunctionContext(element: HTMLElement): string {
    // Provide additional context helpful for executive dysfunction
    const contexts: string[] = [];
    
    // Task-related context
    if (element.closest('.task-card')) {
      contexts.push('Task item');
    }
    
    // Form context
    if (element.closest('form')) {
      const form = element.closest('form');
      const requiredFields = form?.querySelectorAll('[required]').length || 0;
      if (requiredFields > 0) {
        contexts.push(`Form with ${requiredFields} required fields`);
      }
    }
    
    // Navigation context
    if (element.closest('nav')) {
      contexts.push('Navigation area');
    }
    
    // Time estimate context
    const timeEstimate = element.getAttribute('data-estimated-time');
    if (timeEstimate) {
      contexts.push(`Estimated time: ${timeEstimate} minutes`);
    }
    
    // Difficulty context
    const difficulty = element.getAttribute('data-difficulty');
    if (difficulty) {
      contexts.push(`Difficulty: ${difficulty}`);
    }
    
    return contexts.join(', ');
  }

  private announceToLiveRegion(message: string) {
    // Create or update live region for announcements
    let liveRegion = document.getElementById('ed-live-region');
    
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'ed-live-region';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-10000px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      document.body.appendChild(liveRegion);
    }
    
    // Clear and set new message
    liveRegion.textContent = '';
    setTimeout(() => {
      liveRegion!.textContent = message;
    }, 100);
  }

  private createSkipLinks() {
    // Create skip navigation links for keyboard users
    const skipLinksContainer = document.createElement('div');
    skipLinksContainer.className = 'skip-links';
    skipLinksContainer.style.position = 'absolute';
    skipLinksContainer.style.top = '-1000px';
    skipLinksContainer.style.left = '6px';
    skipLinksContainer.style.zIndex = '9999';
    
    const skipLinks = [
      { text: 'Skip to main content', target: '#main-content' },
      { text: 'Skip to navigation', target: '#navigation' },
      { text: 'Skip to search', target: '[data-search-input]' },
      { text: 'Skip to primary tasks', target: '.task-list' }
    ];
    
    skipLinks.forEach(({ text, target }) => {
      const link = document.createElement('a');
      link.href = target;
      link.textContent = text;
      link.className = 'skip-link';
      link.style.background = 'var(--brand-primary)';
      link.style.color = 'white';
      link.style.padding = '8px 16px';
      link.style.textDecoration = 'none';
      link.style.borderRadius = '0 0 4px 4px';
      link.style.fontWeight = '600';
      
      link.addEventListener('focus', () => {
        link.style.top = '0';
      });
      
      link.addEventListener('blur', () => {
        link.style.top = '-1000px';
      });
      
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetElement = document.querySelector(target) as HTMLElement;
        if (targetElement) {
          this.focusElement(targetElement, { announceToScreenReader: true });
        }
      });
      
      skipLinksContainer.appendChild(link);
    });
    
    document.body.insertBefore(skipLinksContainer, document.body.firstChild);
  }

  private setupKeyboardNavigation() {
    // Implement roving tabindex for complex widgets
    this.setupRovingTabindex('.dashboard-grid', '.dashboard-widget');
    this.setupRovingTabindex('.task-list', '.task-card');
    this.setupRovingTabindex('.habit-grid', '.habit-card');
  }

  private setupRovingTabindex(containerSelector: string, itemSelector: string) {
    const containers = document.querySelectorAll(containerSelector);
    
    containers.forEach(container => {
      const items = container.querySelectorAll(itemSelector) as NodeListOf<HTMLElement>;
      
      if (items.length === 0) return;
      
      // Set first item as tabbable
      items.forEach((item, index) => {
        item.tabIndex = index === 0 ? 0 : -1;
      });
      
      // Handle arrow key navigation within container
      container.addEventListener('keydown', (e) => {
        if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
          return;
        }
        
        e.preventDefault();
        
        const currentIndex = Array.from(items).findIndex(item => item === document.activeElement);
        let newIndex = currentIndex;
        
        switch (e.key) {
          case 'ArrowDown':
          case 'ArrowRight':
            newIndex = (currentIndex + 1) % items.length;
            break;
          case 'ArrowUp':
          case 'ArrowLeft':
            newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
            break;
          case 'Home':
            newIndex = 0;
            break;
          case 'End':
            newIndex = items.length - 1;
            break;
        }
        
        // Update tabindex and focus
        items[currentIndex].tabIndex = -1;
        items[newIndex].tabIndex = 0;
        this.focusElement(items[newIndex]);
      });
    });
  }

  private setupFocusVisible() {
    // Enhance focus-visible support for better visual indicators
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('focus-visible-active');
      }
    });
    
    document.addEventListener('mousedown', () => {
      document.body.classList.remove('focus-visible-active');
    });
  }

  private handleEscapeKey(event: KeyboardEvent) {
    // Handle escape key for modal dismissal and focus restoration
    const activeModal = this.activeModals[this.activeModals.length - 1];
    
    if (activeModal) {
      // Close modal and restore focus
      event.preventDefault();
      this.closeModal(activeModal);
    } else {
      // General escape handling - restore to last meaningful focus
      this.restorePreviousFocus();
    }
  }

  // Public API methods
  public focusElement(element: HTMLElement, options: FocusOptions = {}) {
    if (!element || !this.isValidFocusTarget(element)) {
      console.warn('Invalid focus target:', element);
      return false;
    }
    
    // Store current focus for potential restoration
    if (document.activeElement && document.activeElement !== element) {
      this.lastUserFocus = document.activeElement as HTMLElement;
    }
    
    // Focus the element
    element.focus({ preventScroll: options.preventScroll });
    
    // Apply enhancements
    if (options.announceToScreenReader) {
      this.announceToScreenReader(element);
    }
    
    return true;
  }

  public focusFirstInteractiveElement(container: HTMLElement = document.body): boolean {
    const focusableElements = this.getFocusableElements(container);
    
    if (focusableElements.length > 0) {
      return this.focusElement(focusableElements[0], { announceToScreenReader: true });
    }
    
    return false;
  }

  public focusMainContent(): boolean {
    const mainContent = document.querySelector('#main-content') as HTMLElement;
    if (mainContent) {
      return this.focusElement(mainContent, { announceToScreenReader: true });
    }
    return false;
  }

  public focusNextSection(): boolean {
    const currentElement = document.activeElement as HTMLElement;
    const sections = document.querySelectorAll('section, main, article, .section') as NodeListOf<HTMLElement>;
    
    const currentSection = currentElement?.closest('section, main, article, .section') as HTMLElement;
    const currentIndex = Array.from(sections).indexOf(currentSection);
    
    if (currentIndex >= 0 && currentIndex < sections.length - 1) {
      const nextSection = sections[currentIndex + 1];
      return this.focusFirstInteractiveElement(nextSection);
    }
    
    return false;
  }

  public focusPreviousSection(): boolean {
    const currentElement = document.activeElement as HTMLElement;
    const sections = document.querySelectorAll('section, main, article, .section') as NodeListOf<HTMLElement>;
    
    const currentSection = currentElement?.closest('section, main, article, .section') as HTMLElement;
    const currentIndex = Array.from(sections).indexOf(currentSection);
    
    if (currentIndex > 0) {
      const previousSection = sections[currentIndex - 1];
      return this.focusFirstInteractiveElement(previousSection);
    }
    
    return false;
  }

  public restorePreviousFocus(): boolean {
    if (this.lastUserFocus && this.isValidFocusTarget(this.lastUserFocus)) {
      return this.focusElement(this.lastUserFocus, { announceToScreenReader: true });
    }
    
    // Fallback to focus history
    for (let i = this.focusHistory.length - 1; i >= 0; i--) {
      const entry = this.focusHistory[i];
      if (entry.element && this.isValidFocusTarget(entry.element)) {
        return this.focusElement(entry.element, { announceToScreenReader: true });
      }
    }
    
    return false;
  }

  public setHighlightMode(mode: 'ring' | 'outline' | 'background' | 'border') {
    this.currentHighlightMode = mode;
    
    // Update CSS custom property
    document.documentElement.style.setProperty('--focus-highlight-mode', mode);
  }

  public registerModal(modal: HTMLElement) {
    this.activeModals.push(modal);
    
    // Trap focus within modal
    this.trapFocus(modal);
  }

  public closeModal(modal: HTMLElement) {
    const index = this.activeModals.indexOf(modal);
    if (index > -1) {
      this.activeModals.splice(index, 1);
    }
    
    // Restore focus to the element that opened the modal
    this.restorePreviousFocus();
  }

  private trapFocus(container: HTMLElement) {
    const focusableElements = this.getFocusableElements(container);
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          this.focusElement(lastElement);
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          this.focusElement(firstElement);
        }
      }
    };
    
    container.addEventListener('keydown', handleTabKey);
    
    // Focus first element
    this.focusElement(firstElement);
    
    // Clean up when modal is removed
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.removedNodes) {
          mutation.removedNodes.forEach((node) => {
            if (node === container) {
              container.removeEventListener('keydown', handleTabKey);
              observer.disconnect();
            }
          });
        }
      });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
  }

  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(',');
    
    return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
  }

  public getFocusHistory(): FocusHistoryEntry[] {
    return [...this.focusHistory];
  }

  public clearFocusHistory() {
    this.focusHistory = [];
  }

  public destroy() {
    document.removeEventListener('focusin', this.handleFocusIn);
    document.removeEventListener('focusout', this.handleFocusOut);
    document.removeEventListener('keydown', this.handleKeyDown);
    
    // Remove live region
    const liveRegion = document.getElementById('ed-live-region');
    if (liveRegion) {
      liveRegion.remove();
    }
  }
}

// Global focus manager instance
let focusManager: FocusManager | null = null;

export const initializeFocusManagement = () => {
  if (typeof window !== 'undefined' && !focusManager) {
    focusManager = new FocusManager();
  }
  return focusManager;
};

export const getFocusManager = () => focusManager;

// Convenience functions for common focus operations
export const focusElement = (element: HTMLElement, options?: FocusOptions) => {
  return focusManager?.focusElement(element, options) || false;
};

export const focusMainContent = () => {
  return focusManager?.focusMainContent() || false;
};

export const restorePreviousFocus = () => {
  return focusManager?.restorePreviousFocus() || false;
};

export const setFocusHighlightMode = (mode: 'ring' | 'outline' | 'background' | 'border') => {
  focusManager?.setHighlightMode(mode);
};

export const registerModal = (modal: HTMLElement) => {
  focusManager?.registerModal(modal);
};

export const closeModal = (modal: HTMLElement) => {
  focusManager?.closeModal(modal);
};

export default {
  initializeFocusManagement,
  getFocusManager,
  focusElement,
  focusMainContent,
  restorePreviousFocus,
  setFocusHighlightMode,
  registerModal,
  closeModal
};