import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { getNavigationItems } from "./NavigationItems";

interface MobileNavProps {
  showMobileNav: boolean;
  onPostClick: () => void;
}

export const MobileNav = ({ showMobileNav, onPostClick }: MobileNavProps) => {
  const location = useLocation();
  const [isHomePage, setIsHomePage] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [visible, setVisible] = useState(false);

  // Get navigation items (without admin for mobile nav)
  const navigationItems = getNavigationItems(false);

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
          onClick={onPostClick}
          aria-label="Create post"
          className="h-12 w-12 p-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
        >
          <Upload className="h-5 w-5" />
        </Button>
      </div>
    </nav>
  );
};
