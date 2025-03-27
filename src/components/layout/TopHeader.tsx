import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Search, Leaf, Sun, Moon, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserProfileButton } from "./sidebar/UserProfileButton";
import { NavigationButtons } from "./sidebar/NavigationItems";
import { SettingsPanel } from "./sidebar/SettingsPanel";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";

const TopHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [lastScrollY, setLastScrollY] = useState(0);
  const [visible, setVisible] = useState(true);
  const [isHomePage, setIsHomePage] = useState(false);
  const [initialHideComplete, setInitialHideComplete] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
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
  
  useEffect(() => {
    const path = location.pathname;
    setIsHomePage(path === '/' || path === '/home');
  }, [location]);
  
  useEffect(() => {
    if (isHomePage) {
      setVisible(false);
      
      const timer = setTimeout(() => {
        setInitialHideComplete(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      setVisible(true);
      setInitialHideComplete(true);
    }
  }, [isHomePage]);
  
  useEffect(() => {
    if (!initialHideComplete) return;
    
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
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isHomePage, initialHideComplete]);
  
  const handlePost = () => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    navigate('/admin/videos/new');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMenuOpen && !target.closest('[data-menu="sidebar"]')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const isDarkMode = mounted ? theme === 'dark' : false;
  
  return (
    <header 
      className={`fixed top-0 left-0 right-0 h-14 bg-background z-50 border-b flex items-center justify-between px-4 transition-transform duration-300 ${
        visible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="flex items-center gap-2">
        <Avatar 
          className="h-8 w-8 cursor-pointer" 
          onClick={() => setIsMenuOpen(true)}
          role="button"
          aria-label="Open menu"
          tabIndex={0}
        >
          {profile?.avatar_url ? (
            <AvatarImage src={profile.avatar_url} alt={profile.full_name || ''} />
          ) : (
            <AvatarFallback>{profile?.full_name?.[0] || '?'}</AvatarFallback>
          )}
        </Avatar>
      </div>
      
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
      />
      
      <div 
        data-menu="sidebar"
        className={`fixed top-0 left-0 bottom-0 w-[280px] bg-background border-r z-50 transition-all duration-300 ease-in-out p-4 ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-4 border-b">
            <UserProfileButton 
              userId={currentUser?.id}
              profile={profile}
              onClick={() => {
                navigate(currentUser ? `/users/${currentUser.id}` : '/auth');
                setIsMenuOpen(false);
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setIsMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
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
                  setIsMenuOpen(false);
                }}
              />
              
              <div className="px-4 mt-6">
                <Button
                  className="w-full rounded-full mb-6 bg-primary text-primary-foreground hover:bg-primary/90 py-5"
                  onClick={() => {
                    handlePost();
                    setIsMenuOpen(false);
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
                      setIsMenuOpen(false);
                    }}
                  >
                    Admin Panel
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  className="w-full justify-start rounded-full py-3 mb-2"
                  onClick={() => setShowSettingsPanel(true)}
                >
                  Settings
                </Button>
                
                <div className="flex items-center justify-between px-3 py-2 rounded-lg mt-4">
                  <div className="flex items-center gap-2">
                    {isDarkMode ? (
                      <Moon className="h-5 w-5" />
                    ) : (
                      <Sun className="h-5 w-5" />
                    )}
                    <span>Dark Mode</span>
                  </div>
                  <Switch
                    checked={isDarkMode}
                    onCheckedChange={() => setTheme(isDarkMode ? 'light' : 'dark')}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              </div>
            </div>
          )}
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
