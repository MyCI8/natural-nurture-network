
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Leaf, Home, Play, Newspaper, Activity, Search, Upload } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';

const MainSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showMobileHeader, setShowMobileHeader] = useState(true);

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

  const navigationItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/videos', label: 'Explore', icon: Play },
    { path: '/news', label: 'News', icon: Newspaper },
    { path: '/symptoms', label: 'Symptoms', icon: Activity },
  ];

  // Handle mobile scroll for top header
  useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowMobileHeader(
        currentScrollY < 50 || currentScrollY < lastScrollY
      );
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile, lastScrollY]);

  // Auto collapse on mobile when route changes
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

  const handlePost = () => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    navigate('/admin/videos/new');
  };

  if (isMobile) {
    return (
      <>
        {/* Mobile Top Header */}
        <header 
          className={`fixed top-0 left-0 right-0 h-14 bg-gray-100 border-b z-50 transition-transform duration-300 ease-in-out ${
            showMobileHeader ? 'translate-y-0' : '-translate-y-full'
          }`}
        >
          <div className="h-full flex items-center justify-between px-4 max-w-7xl mx-auto">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full"
              onClick={() => setIsExpanded(true)}
            >
              <Avatar className="h-8 w-8">
                {profile?.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt={profile.full_name || ''} />
                ) : (
                  <AvatarFallback>{profile?.full_name?.[0] || '?'}</AvatarFallback>
                )}
              </Avatar>
            </Button>
            <Leaf className="h-6 w-6 text-primary" />
            <Button variant="ghost" size="icon" className="rounded-full">
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Mobile Bottom Navigation */}
        <nav 
          role="navigation" 
          aria-label="Main navigation"
          className="fixed bottom-0 left-0 right-0 h-16 bg-gray-100 border-t z-50"
        >
          <div className="h-full flex items-center justify-around px-4 max-w-7xl mx-auto">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => isMobile && setIsExpanded(false)}
                className={`p-3 rounded-full flex items-center justify-center w-12 h-12 transition-colors ${
                  location.pathname === item.path ? 'bg-gray-200 font-bold' : 'hover:bg-gray-300'
                }`}
              >
                <item.icon className="h-6 w-6" />
              </Link>
            ))}
            <Button
              size="icon"
              onClick={handlePost}
              className="h-12 w-12 p-0 rounded-full"
            >
              <Upload className="h-5 w-5" />
            </Button>
          </div>
        </nav>

        {/* Mobile Expandable Sidebar */}
        <div className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${
          isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          <div className={`absolute left-0 top-0 bottom-0 w-[280px] bg-gray-100 transition-transform duration-300 ${
            isExpanded ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <div className="h-full flex flex-col">
              <div className="flex justify-end p-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full"
                  onClick={() => setIsExpanded(false)}
                >
                  ✕
                </Button>
              </div>
              <nav className="flex-1 px-4 space-y-2">
                {navigationItems.map((item) => (
                  <Button
                    key={item.path}
                    variant="ghost"
                    className={`w-full justify-start space-x-4 rounded-full ${
                      location.pathname === item.path ? 'bg-gray-200 font-bold' : 'hover:bg-gray-300'
                    }`}
                    onClick={() => {
                      navigate(item.path);
                      setIsExpanded(false);
                    }}
                  >
                    <item.icon className="h-6 w-6" />
                    <span>{item.label}</span>
                  </Button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <nav 
      role="navigation" 
      aria-label="Main navigation"
      className="fixed h-screen flex flex-col py-4 bg-background transition-all duration-300 z-50"
    >
      <div className="px-4">
        <Link 
          to="/" 
          className="flex items-center space-x-2 mb-8"
          onClick={() => isMobile && setIsExpanded(false)}
        >
          <Leaf className="h-8 w-8 text-primary shrink-0" />
          <span className="text-xl font-semibold">BetterTogether</span>
        </Link>
        
        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => isMobile && setIsExpanded(false)}
              className={`flex items-center space-x-4 px-4 py-3 rounded-full transition-colors hover:bg-accent ${
                location.pathname === item.path ? 'font-bold bg-accent/50' : ''
              }`}
            >
              <item.icon className="h-6 w-6 shrink-0" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <Button
          className={`rounded-full mt-4 mb-6 ${isExpanded ? 'w-full' : 'w-[40px] h-[40px] p-0 mx-auto'}`}
          size={isExpanded ? "default" : "icon"}
          onClick={handlePost}
        >
          <Upload className="h-4 w-4 shrink-0" />
          {isExpanded && <span className="ml-2">Post</span>}
        </Button>
      </div>

      <div className="mt-auto px-4">
        {/* Search bar */}
        {isExpanded && (
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search"
                className="pl-9 rounded-full bg-accent"
              />
            </div>
          </div>
        )}

        {currentUser ? (
          <Button
            variant="ghost"
            className={`w-full justify-start rounded-full p-4 ${!isExpanded && 'px-2'}`}
            onClick={() => {
              navigate(`/users/${currentUser.id}`);
              isMobile && setIsExpanded(false);
            }}
          >
            <Avatar className="h-8 w-8 shrink-0">
              {profile?.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={profile.full_name || ''} />
              ) : (
                <AvatarFallback>{profile?.full_name?.[0] || '?'}</AvatarFallback>
              )}
            </Avatar>
            {isExpanded && (
              <div className="flex flex-col items-start ml-3">
                <span className="font-semibold">{profile?.full_name}</span>
                <span className="text-sm text-muted-foreground">@{profile?.username || 'user'}</span>
              </div>
            )}
          </Button>
        ) : (
          <Button
            className={isExpanded ? "w-full" : "w-[40px] h-[40px] p-0 mx-auto"}
            onClick={() => {
              navigate('/auth');
              isMobile && setIsExpanded(false);
            }}
          >
            {isExpanded ? "Sign in" : "→"}
          </Button>
        )}

        {/* Mobile expand/collapse button */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-4 top-4 h-8 w-8 rounded-full bg-background border shadow-md"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "←" : "→"}
          </Button>
        )}
      </div>
    </nav>
  );
};

export default MainSidebar;
