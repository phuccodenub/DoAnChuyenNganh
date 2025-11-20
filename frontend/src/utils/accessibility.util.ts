/**
 * Accessibility Utilities
 * WCAG 2.1 Level AA compliance helpers
 */

/**
 * Focus management utilities
 */
export const focusUtils = {
  /**
   * Focus element with smooth scroll
   */
  focusElement: (element: HTMLElement | null, smooth: boolean = true) => {
    if (!element) return;
    
    if (smooth) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    element.focus();
  },

  /**
   * Restore focus to element
   */
  restoreFocus: (element: HTMLElement | null) => {
    if (!element) return;
    setTimeout(() => {
      element.focus();
    }, 100);
  },

  /**
   * Trap focus within modal or container
   */
  trapFocus: (container: HTMLElement, event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    const focusable = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const first = focusable[0] as HTMLElement;
    const last = focusable[focusable.length - 1] as HTMLElement;

    if (event.shiftKey) {
      if (document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }
};

/**
 * ARIA utilities for screen readers
 */
export const ariaUtils = {
  /**
   * Announce message to screen readers
   */
  announce: (message: string, politeness: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', politeness);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only'; // Hidden visually but available to screen readers
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      announcement.remove();
    }, 1000);
  },

  /**
   * Set label for form control
   */
  setLabel: (input: HTMLElement, label: string) => {
    input.setAttribute('aria-label', label);
  },

  /**
   * Set description for form control
   */
  setDescription: (input: HTMLElement, descId: string) => {
    input.setAttribute('aria-describedby', descId);
  },

  /**
   * Set loading state
   */
  setLoading: (element: HTMLElement, isLoading: boolean) => {
    if (isLoading) {
      element.setAttribute('aria-busy', 'true');
      element.setAttribute('aria-label', 'Loading...');
    } else {
      element.removeAttribute('aria-busy');
    }
  }
};

/**
 * Keyboard handling utilities
 */
export const keyboardUtils = {
  /**
   * Check if key is Enter or Space
   */
  isActivationKey: (event: KeyboardEvent): boolean => {
    return event.key === 'Enter' || event.code === 'Space';
  },

  /**
   * Check if key is Escape
   */
  isEscapeKey: (event: KeyboardEvent): boolean => {
    return event.key === 'Escape';
  },

  /**
   * Check if key is Arrow key
   */
  isArrowKey: (event: KeyboardEvent): boolean => {
    return ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key);
  },

  /**
   * Handle navigation keys in listbox
   */
  handleListboxNavigation: (
    event: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    onSelect: (index: number) => void
  ) => {
    if (!keyboardUtils.isArrowKey(event)) return;

    event.preventDefault();
    let newIndex = currentIndex;

    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      newIndex = (currentIndex + 1) % items.length;
    } else {
      newIndex = (currentIndex - 1 + items.length) % items.length;
    }

    onSelect(newIndex);
  }
};

/**
 * Color contrast utilities
 */
export const contrastUtils = {
  /**
   * Calculate relative luminance (WCAG formula)
   */
  getLuminance: (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map((x) => {
      x = x / 255;
      return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  /**
   * Calculate contrast ratio between two colors
   */
  getContrastRatio: (color1: string, color2: string): number => {
    const rgb1 = parseInt(color1.slice(1), 16);
    const rgb2 = parseInt(color2.slice(1), 16);

    const r1 = (rgb1 >> 16) & 255;
    const g1 = (rgb1 >> 8) & 255;
    const b1 = rgb1 & 255;

    const r2 = (rgb2 >> 16) & 255;
    const g2 = (rgb2 >> 8) & 255;
    const b2 = rgb2 & 255;

    const l1 = contrastUtils.getLuminance(r1, g1, b1);
    const l2 = contrastUtils.getLuminance(r2, g2, b2);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  },

  /**
   * Check if contrast meets WCAG AA standard (4.5:1)
   */
  meetsWCAGAA: (color1: string, color2: string): boolean => {
    return contrastUtils.getContrastRatio(color1, color2) >= 4.5;
  }
};

/**
 * Skip link component utility
 */
export const createSkipLink = (): HTMLElement => {
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.textContent = 'Skip to main content';
  skipLink.className = 'sr-only focus:not-sr-only';
  skipLink.setAttribute('aria-label', 'Skip to main content');
  
  return skipLink;
};
