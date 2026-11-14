import { useEffect, useState } from 'react';

/**
 * Hides floating action buttons on mobile (< 768px) whenever a modal overlay,
 * form, or text input is active so FABs never cover submit/action buttons.
 */
export function useMobileFabHidden(): boolean {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const check = () => {
      if (typeof window === 'undefined') return;
      const isMobile = window.innerWidth < 768;
      if (!isMobile) {
        setHidden(false);
        return;
      }
      const activeTag = document.activeElement?.tagName;
      const inputFocused = activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT';
      const hasModal = Array.from(document.querySelectorAll('div.fixed.inset-0')).some(
        (el) =>
          !el.closest('#ai-advisor-wrapper') &&
          !el.classList.contains('pointer-events-none') &&
          !el.classList.contains('-z-10')
      );
      setHidden(inputFocused || hasModal);
    };

    check();
    const observer = new MutationObserver(check);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', check);
    document.addEventListener('focusin', check);
    document.addEventListener('focusout', check);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', check);
      document.removeEventListener('focusin', check);
      document.removeEventListener('focusout', check);
    };
  }, []);

  return hidden;
}

