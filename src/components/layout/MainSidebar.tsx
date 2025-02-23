
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Leaf, Home, TrendingUp, Newspaper, Play, Upload, User, Settings } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const MainSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

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
    { path: '/explore', label: 'Explore', icon: TrendingUp },
    { path: '/news', label: 'News', icon: Newspaper },
    { path: '/videos', label: 'Videos', icon: Play },
  ];

  const handlePost = () => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    navigate('/admin/videos/new');
  };

  return (
    <div className="fixed h-screen w-[280px] border-r flex flex-col p-4">
      <Link to="/" className="flex items-center space-x-2 px-4 mb-8">
        <Leaf className="h-8 w-8 text-primary" />
        <span className="text-xl font-semibold">BetterTogether</span>
      </Link>
      
      <nav className="space-y-2">
        {navigationItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-4 px-4 py-3 rounded-full transition-colors hover:bg-accent ${
              location.pathname === item.path ? 'font-bold' : ''
            }`}
          >
            <item.icon className="h-6 w-6" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <Button
        className="w-full rounded-full mt-4 mb-8"
        size="lg"
        onClick={handlePost}
      >
        <Upload className="mr-2 h-5 w-5" />
        Post
      </Button>

      {currentUser ? (
        <div className="mt-auto">
          <Button
            variant="ghost"
            className="w-full justify-start rounded-full p-4"
            onClick={() => navigate(`/users/${currentUser.id}`)}
          >
            <Avatar className="h-8 w-8 mr-3">
              {profile?.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={profile.full_name || ''} />
              ) : (
                <AvatarFallback>{profile?.full_name?.[0] || '?'}</AvatarFallback>
              )}
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="font-semibold">{profile?.full_name}</span>
              <span className="text-sm text-muted-foreground">@{profile?.username || 'user'}</span>
            </div>
          </Button>
        </div>
      ) : (
        <Button
          className="mt-auto w-full"
          onClick={() => navigate('/auth')}
        >
          Sign in
        </Button>
      )}
    </div>
  );
};

export default MainSidebar;
