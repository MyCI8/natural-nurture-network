
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Search, Leaf } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserProfileButton } from "./sidebar/UserProfileButton";
import { NavigationButtons } from "./sidebar/NavigationItems";
import { SettingsPanel } from "./sidebar/SettingsPanel";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";

const TopHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [lastScrollY, setLastScrollY] = useState(0);
  const [visible, setVisible] = useState(true);
  const [isHomePage, setIsHomePage] = useState(false);
  const [initialHideComplete, setInitialHideComplete] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
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
  
  // Determine if we're on the homepage
  useEffect(() => {
    const path = location.pathname;
    setIsHomePage(path === '/' || path === '/home');
  }, [location]);
  
  // Initial hide on homepage
  useEffect(() => {
    if (isHomePage) {
      setVisible(false);
      
      // After 3 seconds, mark the initial hide as complete
      const timer = setTimeout(() => {
        setInitialHideComplete(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      setVisible(true);
      setInitialHideComplete(true);
    }
  }, [isHomePage]);
  
  // Handle scroll behavior
  useEffect(() => {
    if (!initialHideComplete) return;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (isHomePage) {
        // Show header on homepage only when:
        // 1. User scrolls up
        // 2. User is at the top of the page (within first 50px)
        if (currentScrollY < lastScrollY) {
          setVisible(true);
        } else if (currentScrollY > lastScrollY && currentScrollY > 50) {
          setVisible(false);
        }
      } else {
        // Regular behavior for non-homepage
        if (currentScrollY < 50 || currentScrollY < lastScrollY) {
          setVisible(true);
        } else {
          setVisible(false);
        }
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isHomePage, initialHideComplete]);

  // Handle post button click
  const handlePost = () => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    navigate('/admin/videos/new');
  };
  
  return (
    <header 
      className={`fixed top-0 left-0 right-0 h-14 bg-background z-50 border-b flex items-center justify-between px-4 transition-transform duration-300 ${
        visible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="flex items-center gap-2">
        <div 
          className="relative"
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
        >
          <Avatar className="h-8 w-8 cursor-pointer">
            {profile?.avatar_url ? (
              <AvatarImage src={profile.avatar_url} alt={profile.full_name || ''} />
            ) : (
              <AvatarFallback>{profile?.full_name?.[0] || '?'}</AvatarFallback>
            )}
          </Avatar>
        </div>
        
        {isDrawerOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsDrawerOpen(false)}
          />
        )}
        
        <div 
          className={`fixed left-0 top-0 bottom-0 w-[280px] bg-background border-r z-50 p-4 transition-transform duration-300 ${
            isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="p-4 border-b">
              <UserProfileButton 
                userId={currentUser?.id}
                profile={profile}
                onClick={() => {
                  navigate(currentUser ? `/users/${currentUser.id}` : '/auth');
                  setIsDrawerOpen(false);
                }}
              />
            </div>
            
            {showSettingsPanel ? (
              <div className="flex-1 overflow-y-auto">
                <div className="p-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mb-4"
                    onClick={() => setShowSettingsPanel(false)}
                  >
                    ← Back
                  </Button>
                  <SettingsPanel />
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto py-4">
                <NavigationButtons 
                  onItemClick={() => {
                    setIsDrawerOpen(false);
                  }}
                />
                
                <div className="px-4 mt-6">
                  <Button
                    className="w-full rounded-full mb-6 bg-primary text-primary-foreground hover:bg-primary/90 py-5"
                    onClick={() => {
                      handlePost();
                      setIsDrawerOpen(false);
                    }}
                  >
                    Post
                  </Button>
                  
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-full py-3 mb-2"
                      onClick={() => {
                        navigate('/admin');
                        setIsDrawerOpen(false);
                      }}
                    >
                      Admin Panel
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    className="w-full justify-start rounded-full py-3"
                    onClick={() => setShowSettingsPanel(true)}
                  >
                    Settings
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Link to="/" className="flex items-center">
        <Leaf className="h-6 w-6 text-primary" />
      </Link>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="rounded-full"
        asChild
      >
        <Link to="/search">
          <Search className="h-5 w-5" />
        </Link>
      </Button>
    </header>
  );
};

export default TopHeader;
