import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export const useHeaderVisibility = () => {
  const location = useLocation();
  const [lastScrollY, setLastScrollY] = useState(0);
  const [visible, setVisible] = useState(true);
  const [isHomePage, setIsHomePage] = useState(false);
  const [initialHideComplete, setInitialHideComplete] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const timeoutsRef = useRef<number[]>([]);

  // Determine if we're on the homepage
  useEffect(() => {
    const path = location.pathname;
    setIsHomePage(path === '/' || path === '/home');
    setInitialLoad(true);
    setUserInteracted(false);
  }, [location]);
  
  // Initialize visibility based on page
  useEffect(() => {
    if (isHomePage) {
      setVisible(false);
      const timeoutId = window.setTimeout(() => {
        setInitialHideComplete(true);
        setInitialLoad(false);
      }, 100);
      timeoutsRef.current.push(timeoutId);
      return () => {
        window.clearTimeout(timeoutId);
      };
    } else {
      setVisible(true);
      setInitialHideComplete(true);
      setInitialLoad(false);
    }
  }, [isHomePage]);
  
  // Handle scroll-based visibility
  useEffect(() => {
    if (!initialHideComplete || initialLoad) {return;}
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (isHomePage) {
        if (currentScrollY < lastScrollY) {
          setVisible(true);
        } else if (currentScrollY > lastScrollY && currentScrollY > 50) {
          setVisible(false);
        }
      } else {
        if (currentScrollY < 50 || currentScrollY < lastScrollY) {
          setVisible(true);
        } else {
          setVisible(false);
        }
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY, isHomePage, initialHideComplete, initialLoad]);

  // Handle touch interactions for visibility
  useEffect(() => {
    if (!isHomePage || initialLoad) {return;}

    const handleUserInteraction = () => {
      setUserInteracted(true);
      setVisible(true);
      // Hide again after 3 seconds if at the top of the page
      if (window.scrollY < 100) {
        const timeoutId = window.setTimeout(() => {
          if (window.scrollY < 100) {
            setUserInteracted(false);
            setVisible(false);
          }
        }, 3000);
        timeoutsRef.current.push(timeoutId);
      }
    };
    document.addEventListener('touchstart', handleUserInteraction, { passive: true });
    document.addEventListener('click', handleUserInteraction);
    return () => {
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('click', handleUserInteraction);
      // Clear all timeouts set in this effect
      timeoutsRef.current.forEach(timeoutId => window.clearTimeout(timeoutId));
      timeoutsRef.current.length = 0;
    };
  }, [isHomePage, initialLoad]);

  return { visible, isHomePage };
};
