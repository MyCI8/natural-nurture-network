
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Play, Newspaper, Activity, Upload } from 'lucide-react';
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

  if (isMobile) {
    return (
      <nav 
        role="navigation" 
        aria-label="Main navigation"
        className="fixed bottom-0 left-0 right-0 h-16 bg-gray-100 border-t z-50 md:hidden"
      >
        <div className="flex items-center justify-around h-full max-w-[1265px] mx-auto px-4">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                p-3 rounded-full flex items-center justify-center w-12 h-12 transition-colors 
                ${location.pathname === item.path 
                  ? 'bg-gray-200 font-bold' 
                  : 'hover:bg-gray-300'
                }`
              }
            >
              <item.icon className="h-6 w-6" />
            </Link>
          ))}
          <Button
            size="icon"
            onClick={handlePost}
            className="h-12 w-12 rounded-full bg-primary text-white hover:bg-primary/90"
          >
            <Upload className="h-5 w-5" />
          </Button>
        </div>
      </nav>
    );
  }

  return (
    <nav 
      role="navigation" 
      aria-label="Main navigation"
      className="w-60 bg-gray-100 py-4 flex flex-col border-r border-gray-200"
    >
      <div className="px-4 space-y-2">
        {/* Logo */}
        <Button 
          variant="ghost" 
          className="h-14 px-4 justify-start hover:bg-gray-200 rounded-full w-full mb-4"
          asChild
        >
          <Link to="/">
            <span className="text-xl font-bold">BetterTogether</span>
          </Link>
        </Button>

        {/* Navigation Items */}
        {navigationItems.map((item) => (
          <Button
            key={item.path}
            variant="ghost"
            className={`
              w-full justify-start space-x-4 h-12 px-4 rounded-full 
              ${location.pathname === item.path 
                ? 'bg-gray-200 font-bold' 
                : 'hover:bg-gray-300'
              }`
            }
            asChild
          >
            <Link to={item.path}>
              <item.icon className="h-6 w-6" />
              <span>{item.label}</span>
            </Link>
          </Button>
        ))}

        {/* Post Button */}
        <Button
          className="w-full h-12 rounded-full mt-4 bg-primary text-white hover:bg-primary/90"
          onClick={handlePost}
        >
          <Upload className="h-5 w-5 mr-2" />
          <span>Post</span>
        </Button>
      </div>

      {/* User Profile */}
      <div className="mt-auto px-4">
        {currentUser ? (
          <Button
            variant="ghost"
            className="w-full justify-start rounded-full p-4 hover:bg-gray-200"
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
            className="w-full rounded-full bg-primary text-white hover:bg-primary/90"
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
