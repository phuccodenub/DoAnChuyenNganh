import React, { useEffect, useRef } from 'react';
import { focusUtils, ariaUtils, keyboardUtils } from '@/utils/accessibility.util';

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

/**
 * Accessibility Provider
 * Handles global accessibility features like focus management, keyboard navigation, and screen reader support
 */
export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add skip link to page
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-50 focus:p-2 focus:bg-blue-600 focus:text-white';
    document.body.prepend(skipLink);

    // Announce page changes to screen readers
    const observer = new MutationObserver(() => {
      const heading = document.querySelector('h1');
      if (heading) {
        ariaUtils.announce(`Page updated: ${heading.textContent}`, 'polite');
      }
    });

    observer.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'aria-label']
    });

    // Keyboard shortcuts
    const handleKeyboardShortcuts = (event: KeyboardEvent) => {
      // Alt+M for main content
      if (event.altKey && event.key === 'm') {
        event.preventDefault();
        mainRef.current?.focus();
        ariaUtils.announce('Focused on main content', 'assertive');
      }

      // Escape to close modals (handled by modal component)
      if (keyboardUtils.isEscapeKey(event)) {
        const modals = document.querySelectorAll('[role="dialog"]');
        if (modals.length > 0) {
          const modal = modals[modals.length - 1] as HTMLElement;
          const closeBtn = modal.querySelector('[aria-label*="close"]') as HTMLButtonElement;
          closeBtn?.click();
        }
      }
    };

    document.addEventListener('keydown', handleKeyboardShortcuts);

    return () => {
      skipLink.remove();
      observer.disconnect();
      document.removeEventListener('keydown', handleKeyboardShortcuts);
    };
  }, []);

  return (
    <div ref={mainRef} id="main-content" role="main" className="outline-none">
      {children}
    </div>
  );
};

export default AccessibilityProvider;

/**
 * Hook for focus management
 */
export function useFocusManagement() {
  const containerRef = useRef<HTMLDivElement>(null);

  const focusFirstElement = () => {
    if (!containerRef.current) return;
    const first = containerRef.current.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement;
    focusUtils.focusElement(first);
  };

  const trapFocus = (event: KeyboardEvent) => {
    if (!containerRef.current) return;
    focusUtils.trapFocus(containerRef.current, event);
  };

  return { containerRef, focusFirstElement, trapFocus };
}

/**
 * Hook for screen reader announcements
 */
export function useAriaAnnounce() {
  return {
    announce: (message: string, politeness?: 'polite' | 'assertive') => {
      ariaUtils.announce(message, politeness);
    }
  };
}
