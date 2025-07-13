
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Upload, Home, Video, Pill, Stethoscope, TestTube, Activity, Newspaper } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MobileNavProps {
  showMobileNav: boolean;
  onPostClick: () => void;
}

// Define navigation items directly here since we need different structure for mobile
const getNavigationItems = (isAdmin: boolean) => [
  { name: 'Home', icon: Home, path: '/', label: 'Home' },
  { name: 'Explore', icon: Video, path: '/explore', label: 'Explore' },
  { name: 'Remedies', icon: Pill, path: '/remedies', label: 'Remedies' },
  { name: 'Experts', icon: Stethoscope, path: '/experts', label: 'Experts' },
  { name: 'Ingredients', icon: TestTube, path: '/ingredients', label: 'Ingredients' },
  { name: 'Health Concerns', icon: Activity, path: '/health-concerns', label: 'Health Concerns' },
  { name: 'News', icon: Newspaper, path: '/news', label: 'News' },
];

export const MobileNav = ({ showMobileNav }: MobileNavProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isHomePage, setIsHomePage] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Get navigation items (without admin for mobile nav)
  const navigationItems = getNavigationItems(false);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.user || null;
    },
  });

  // Determine if we're on the homepage
  useEffect(() => {
    const path = location.pathname;
    setIsHomePage(path === '/' || path === '/home');
    setInitialLoad(true);
    setUserInteracted(false);
  }, [location]);

  // Handle initial visibility and scroll behavior
  useEffect(() => {
    if (!isHomePage) {
      setVisible(true);
      setInitialLoad(false);
      return;
    }

    const handleScroll = () => {
      if (!initialLoad && window.scrollY > 100) {
        setVisible(true);
      } else if (!userInteracted && window.scrollY <= 100) {
        setVisible(false);
      }
    };

    const handleUserInteraction = () => {
      setUserInteracted(true);
      setVisible(true);
      setInitialLoad(false);
      
      // Hide again after 3 seconds if at the top of the page
      if (window.scrollY < 100) {
        setTimeout(() => {
          if (window.scrollY < 100) {
            setUserInteracted(false);
            setVisible(false);
          }
        }, 3000);
      }
    };

    // Initialize visibility based on scroll position
    if (initialLoad) {
      setVisible(window.scrollY > 100);
      setTimeout(() => setInitialLoad(false), 100);
    }

    // Add event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('touchstart', handleUserInteraction, { passive: true });
    document.addEventListener('click', handleUserInteraction);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('click', handleUserInteraction);
    };
  }, [isHomePage, userInteracted, initialLoad]);

  // Context-aware post handler
  const handlePost = () => {
    if (!currentUser) {
      toast("Sign in required", {
        description: "Please sign in to create a post"
      });
      navigate("/auth");
      return;
    }
    
    // Context-aware navigation based on current page
    const currentPath = location.pathname;
    
    if (currentPath === '/remedies' || currentPath.startsWith('/remedies/')) {
      // Navigate to remedy creation page
      navigate('/remedies/create');
    } else {
      // Navigate to regular post page for other routes (explore, etc.)
      navigate('/post');
    }
  };

  // Combine the visibility logic
  const shouldShowNav = showMobileNav && visible;

  return (
    <nav 
      role="navigation" 
      aria-label="Main navigation"
      className={`fixed bottom-0 left-0 right-0 h-16 z-50 border-t transition-transform duration-300 ${
        shouldShowNav ? 'translate-y-0' : 'translate-y-full'
      } dark:bg-[#1A1F2C] bg-white`}
      style={{ willChange: 'transform' }} // Optimize for animations
    >
      <div className="h-full flex items-center justify-around px-4 max-w-7xl mx-auto">
        {navigationItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            aria-label={item.label}
            className={`p-3 rounded-full flex items-center justify-center w-12 h-12 transition-colors ${
              location.pathname === item.path 
                ? 'bg-accent/50 text-primary font-bold' 
                : 'hover:bg-accent/30'
            }`}
          >
            <item.icon className="h-6 w-6" />
          </Link>
        ))}
        <Button
          size="icon"
          onClick={handlePost}
          aria-label="Create post"
          className="h-12 w-12 p-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
        >
          <Upload className="h-5 w-5" />
        </Button>
      </div>
    </nav>
  );
};
