import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Play, Newspaper, Activity, Upload, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useIsMobile } from '@/hooks/use-mobile';

const navigationItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/videos', label: 'Explore', icon: Play },
  { path: '/news', label: 'News', icon: Newspaper },
  { path: '/symptoms', label: 'Symptoms', icon: Activity },
];

const MainSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showTopBar, setShowTopBar] = useState(false);

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

  const handlePost = () => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    navigate('/admin/videos/new');
  };

  useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      setShowTopBar(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  if (isMobile) {
    return (
      <>
        <div 
          className={`fixed top-0 left-0 right-0 h-14 bg-background border-b z-50 transition-transform duration-200 ${
            showTopBar ? 'translate-y-0' : '-translate-y-full'
          }`}
        >
          <div className="flex items-center h-full px-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
              className="h-10 w-10 rounded-full"
            >
              <Avatar className="h-8 w-8">
                {profile?.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt={profile.full_name || ''} />
                ) : (
                  <AvatarFallback>{profile?.full_name?.[0] || '?'}</AvatarFallback>
                )}
              </Avatar>
            </Button>
          </div>
        </div>

        <nav 
          role="navigation" 
          aria-label="Main navigation"
          className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t z-50 md:hidden"
        >
          <div className="flex items-center justify-around h-full px-2">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`p-3 rounded-full transition-colors ${
                  location.pathname === item.path 
                    ? 'bg-accent/50' 
                    : 'hover:bg-accent/30'
                }`}
              >
                <item.icon className="h-6 w-6" />
              </Link>
            ))}
            <Button
              size="icon"
              onClick={handlePost}
              className="h-12 w-12 rounded-full"
            >
              <Upload className="h-5 w-5" />
            </Button>
          </div>
        </nav>

        {isSidebarOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
              onClick={() => setIsSidebarOpen(false)}
            />
            <nav 
              className={`
                fixed left-0 top-0 h-screen w-[280px] bg-background border-r z-50
                transform transition-transform duration-300 ease-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
              `}
            >
              <div className="flex flex-col h-full px-4 py-4">
                <div className="flex items-center justify-between mb-6">
                  <Link to="/" className="text-xl font-bold">BetterTogether</Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSidebarOpen(false)}
                    className="h-8 w-8 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-1">
                  {navigationItems.map((item) => (
                    <Button
                      key={item.path}
                      variant="ghost"
                      className={`w-full justify-start space-x-4 h-12 rounded-full ${
                        location.pathname === item.path 
                          ? 'bg-accent/50 font-bold' 
                          : 'hover:bg-accent/30'
                      }`}
                      asChild
                    >
                      <Link to={item.path}>
                        <item.icon className="h-6 w-6" />
                        <span>{item.label}</span>
                      </Link>
                    </Button>
                  ))}

                  <Button
                    className="w-full h-12 rounded-full mt-4"
                    onClick={handlePost}
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    <span>Post</span>
                  </Button>
                </div>

                <div className="mt-auto">
                  {currentUser ? (
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-full p-4"
                      onClick={() => navigate(`/users/${currentUser.id}`)}
                    >
                      <Avatar className="h-8 w-8">
                        {profile?.avatar_url ? (
                          <AvatarImage src={profile.avatar_url} alt={profile.full_name || ''} />
                        ) : (
                          <AvatarFallback>{profile?.full_name?.[0] || '?'}</AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex flex-col items-start ml-3">
                        <span className="font-semibold">{profile?.full_name}</span>
                        <span className="text-sm text-muted-foreground">@{profile?.username || 'user'}</span>
                      </div>
                    </Button>
                  ) : (
                    <Button
                      className="w-full rounded-full"
                      onClick={() => navigate('/auth')}
                    >
                      Sign in
                    </Button>
                  )}
                </div>
              </div>
            </nav>
          </>
        )}
      </>
    );
  }

  return (
    <nav 
      role="navigation" 
      aria-label="Main navigation"
      className="fixed left-0 top-0 h-screen w-60 bg-background py-4 hidden md:flex flex-col"
    >
      <div className="px-4 space-y-2">
        <Button 
          variant="ghost" 
          className="h-14 px-4 justify-start hover:bg-accent/50 rounded-full w-full mb-4"
          asChild
        >
          <Link to="/">
            <span className="text-xl font-bold">BetterTogether</span>
          </Link>
        </Button>

        {navigationItems.map((item) => (
          <Button
            key={item.path}
            variant="ghost"
            className={`w-full justify-start space-x-4 h-12 px-4 rounded-full ${
              location.pathname === item.path 
                ? 'bg-accent/50 font-bold' 
                : 'hover:bg-accent/30'
            }`}
            asChild
          >
            <Link to={item.path}>
              <item.icon className="h-6 w-6" />
              <span>{item.label}</span>
            </Link>
          </Button>
        ))}

        <Button
          className="w-full h-12 rounded-full mt-4"
          onClick={handlePost}
        >
          <Upload className="h-5 w-5 mr-2" />
          <span>Post</span>
        </Button>
      </div>

      <div className="mt-auto px-4">
        {currentUser ? (
          <Button
            variant="ghost"
            className="w-full justify-start rounded-full p-4"
            onClick={() => navigate(`/users/${currentUser.id}`)}
          >
            <Avatar className="h-8 w-8">
              {profile?.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={profile.full_name || ''} />
              ) : (
                <AvatarFallback>{profile?.full_name?.[0] || '?'}</AvatarFallback>
              )}
            </Avatar>
            <div className="flex flex-col items-start ml-3">
              <span className="font-semibold">{profile?.full_name}</span>
              <span className="text-sm text-muted-foreground">@{profile?.username || 'user'}</span>
            </div>
          </Button>
        ) : (
          <Button
            className="w-full rounded-full"
            onClick={() => navigate('/auth')}
          >
            Sign in
          </Button>
        )}
      </div>
    </nav>
  );
};

export default MainSidebar;
