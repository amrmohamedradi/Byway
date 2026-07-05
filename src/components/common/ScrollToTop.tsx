import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component scrolls the window to the top instantly on pathname change.
 * It is placed inside the React Router Context (BrowserRouter) in App.tsx.
 */
export const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'instant' as ScrollBehavior, // 'instant' to avoid jarring scroll animation
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
