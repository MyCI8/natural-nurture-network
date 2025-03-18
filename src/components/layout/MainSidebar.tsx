
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile, useBreakpoint } from "@/hooks/use-mobile";
import { useTheme } from "next-themes";

// Import our new components
import { MobileHeader } from "./sidebar/MobileHeader";
import { MobileSidebar } from "./sidebar/MobileSidebar";
import { MobileNav } from "./sidebar/MobileNav";
import { CompactSidebar } from "./sidebar/CompactSidebar";
import { FullSidebar } from "./sidebar/FullSidebar";

const MainSidebar = () => {
  // Hooks
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const breakpoint = useBreakpoint();
  const { theme } = useTheme();
  
  // State
  const [isExpanded, setIsExpanded] = useState(true);
  const [isCompact, setIsCompact] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showMobileHeader, setShowMobileHeader] = useState(true);
  const [showMobileNav, setShowMobileNav] = useState(true);

  // Data fetching
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.user || null;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ['userProfile', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!currentUser?.id,
  });

  const { data: isAdmin } = useQuery({
    queryKey: ['isAdmin', currentUser?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('check_is_admin');
      if (error) return false;
      return data;
    },
    enabled: !!currentUser?.id,
  });

  // Check window width and adjust sidebar accordingly
  useEffect(() => {
    const checkWidth = () => {
      setIsCompact(window.innerWidth <= 1280 && window.innerWidth > 768);
    };
    
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  // Handle mobile scroll
  useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowMobileHeader(
        currentScrollY < 50 || currentScrollY < lastScrollY
      );
      
      // Show navbar when at top, scrolling up, or at bottom
      const isAtBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 50;
      setShowMobileNav(
        currentScrollY < 50 || currentScrollY < lastScrollY || isAtBottom
      );
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile, lastScrollY]);

  // Close sidebar on mobile when navigating
  useEffect(() => {
    if (isMobile) {
      setIsExpanded(false);
    }
  }, [location.pathname, isMobile]);

  // Expand sidebar on desktop
  useEffect(() => {
    if (!isMobile) {
      setIsExpanded(true);
    }
  }, [isMobile]);

  // Handle post button click
  const handlePost = () => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    navigate('/admin/videos/new');
  };

  // Mobile view
  if (isMobile) {
    return (
      <>
        <MobileHeader 
          showMobileHeader={showMobileHeader} 
          profile={profile} 
          onMenuClick={() => {
            setIsExpanded(true);
          }}
        />
        
        <MobileSidebar
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
          currentUser={currentUser}
          profile={profile}
          isAdmin={isAdmin}
          onPostClick={handlePost}
        />
        
        <MobileNav 
          showMobileNav={showMobileNav} 
          onPostClick={handlePost} 
        />
      </>
    );
  }

  // Compact sidebar for medium screens (icons only)
  if (isCompact) {
    return (
      <CompactSidebar
        currentUser={currentUser}
        profile={profile}
        isAdmin={isAdmin}
        onPostClick={handlePost}
      />
    );
  }

  // Full sidebar for larger screens
  return (
    <FullSidebar
      currentUser={currentUser}
      profile={profile}
      isAdmin={isAdmin}
      onPostClick={handlePost}
    />
  );
};

export default MainSidebar;
