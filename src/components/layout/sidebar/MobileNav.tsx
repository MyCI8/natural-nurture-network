
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
  { name: 'Symptoms', icon: Activity, path: '/symptoms', label: 'Symptoms' },
  { name: 'News', icon: Newspaper, path: '/news', label: 'News' },
];

export const MobileNav = ({ showMobileNav }: MobileNavProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isHomePage, setIsHomePage] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [visible, setVisible] = useState(false);

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
  }, [location]);

  // Handle touch interactions and scrolling
  useEffect(() => {
    if (!isHomePage) {
      setVisible(true);
      return;
    }

    const handleScroll = () => {
      if (window.scrollY > 100) {
        setVisible(true);
      } else if (!userInteracted) {
        setVisible(false);
      }
    };

    const handleTouchStart = () => {
      setUserInteracted(true);
      setVisible(true);
      
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

    // Initialize visibility
    setVisible(window.scrollY > 100);

    // Add event listeners
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('click', handleTouchStart);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('click', handleTouchStart);
    };
  }, [isHomePage, userInteracted]);

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
