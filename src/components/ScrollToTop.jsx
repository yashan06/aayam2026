import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * - Automatically scrolls to top on route change (e.g. / -> /events).
 * - If a hash is present (e.g. /team#media), smoothly scrolls to the target branch/element.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const cleanHash = decodeURIComponent(hash.slice(1)).toLowerCase().trim();
      const scrollToHashElement = () => {
        const el = document.getElementById(cleanHash) ||
                   document.getElementById(`${cleanHash}-team`) ||
                   document.getElementById(cleanHash.replace(/-team$/, ''));
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return true;
        }
        return false;
      };

      if (!scrollToHashElement()) {
        const timer1 = setTimeout(scrollToHashElement, 100);
        const timer2 = setTimeout(scrollToHashElement, 300);
        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
        };
      }
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [pathname, hash]);

  return null;
}
