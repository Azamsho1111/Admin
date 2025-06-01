import { useEffect } from 'react';

export const useKeyboardNavigation = (containerRef, focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') => {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (event) => {
      const focusableElements = container.querySelectorAll(focusableSelector);
      const focusableArray = Array.from(focusableElements);
      const currentIndex = focusableArray.indexOf(document.activeElement);

      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          event.preventDefault();
          const nextIndex = (currentIndex + 1) % focusableArray.length;
          focusableArray[nextIndex]?.focus();
          break;
        
        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault();
          const prevIndex = currentIndex === 0 ? focusableArray.length - 1 : currentIndex - 1;
          focusableArray[prevIndex]?.focus();
          break;
        
        case 'Home':
          event.preventDefault();
          focusableArray[0]?.focus();
          break;
        
        case 'End':
          event.preventDefault();
          focusableArray[focusableArray.length - 1]?.focus();
          break;
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [containerRef, focusableSelector]);
};

export const useScreenReader = () => {
  const announceToScreenReader = (message, priority = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  return { announceToScreenReader };
};