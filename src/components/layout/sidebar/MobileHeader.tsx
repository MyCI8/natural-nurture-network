
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Leaf, Search } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface MobileHeaderProps {
  showMobileHeader: boolean;
  profile: any;
  onMenuClick: () => void;
}

export const MobileHeader = ({ 
  showMobileHeader, 
  profile, 
  onMenuClick 
}: MobileHeaderProps) => {
  const location = useLocation();
  const [isHomePage, setIsHomePage] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

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

    // For homepage, start hidden and show based on user interaction
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

  // Combine the visibility logic
  const shouldShowHeader = showMobileHeader && visible;

  return (
    <header 
      className={`fixed top-0 left-0 right-0 h-14 bg-background border-b z-50 transition-transform duration-300 ease-in-out ${
        shouldShowHeader ? 'translate-y-0' : '-translate-y-full'
      }`}
      style={{ willChange: 'transform' }} // Optimize for animations
    >
      <div className="h-full flex items-center justify-between px-4 max-w-7xl mx-auto">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full h-10 w-10 flex items-center justify-center touch-manipulation active:scale-95 transition-transform"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Avatar className="h-8 w-8">
            {profile?.avatar_url ? (
              <AvatarImage src={profile.avatar_url} alt={profile.full_name || ''} />
            ) : (
              <AvatarFallback>{profile?.full_name?.[0] || '?'}</AvatarFallback>
            )}
          </Avatar>
        </Button>
        
        <Link to="/" className="flex items-center" aria-label="Home">
          <Leaf className="h-6 w-6 text-primary" />
        </Link>
        
        <Link to="/search" aria-label="Search">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full h-10 w-10 flex items-center justify-center touch-manipulation active:scale-95 transition-transform"
          >
            <Search className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </header>
  );
};
