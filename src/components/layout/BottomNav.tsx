
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Home, Play, Newspaper, Activity, Upload } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lastScrollY, setLastScrollY] = useState(0);
  const [visible, setVisible] = useState(true);
  
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.user || null;
    },
  });
  
  const navigationItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/explore', label: 'Explore', icon: Play },
    { path: '/news', label: 'News', icon: Newspaper },
    { path: '/symptoms', label: 'Symptoms', icon: Activity },
  ];
  
  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show navbar when:
      // 1. User scrolls up
      // 2. User is at the top of the page (within first 50px)
      // 3. User has scrolled to the bottom of the page
      const isAtBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 50;
      
      if (currentScrollY < 50 || currentScrollY < lastScrollY || isAtBottom) {
        setVisible(true);
      } else {
        setVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);
  
  const handlePost = () => {
    if (!currentUser) {
      toast({
        title: "Sign in required",
        description: "Please sign in to create a post",
      });
      return;
    }
    
    // Navigate to upload page
    navigate('/admin/videos/new');
  };
  
  return (
    <nav 
      role="navigation" 
      aria-label="Main navigation"
      className={`fixed bottom-0 left-0 right-0 h-16 bg-background border-t z-50 transition-transform duration-300 ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
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
          className="h-12 w-12 p-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Upload className="h-5 w-5" />
        </Button>
      </div>
    </nav>
  );
};

export default BottomNav;
