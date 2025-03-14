
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Search, Leaf } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const TopHeader = () => {
  const [lastScrollY, setLastScrollY] = useState(0);
  const [visible, setVisible] = useState(true);
  
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
  
  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show header when:
      // 1. User scrolls up
      // 2. User is at the top of the page (within first 50px)
      if (currentScrollY < 50 || currentScrollY < lastScrollY) {
        setVisible(true);
      } else {
        setVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);
  
  return (
    <header 
      className={`fixed top-0 left-0 right-0 h-14 bg-background z-50 border-b flex items-center justify-between px-4 transition-transform duration-300 ${
        visible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <Button 
        variant="ghost" 
        size="icon" 
        className="rounded-full"
        asChild
      >
        <Link to={currentUser ? `/users/${currentUser.id}` : '/auth'}>
          <Avatar className="h-8 w-8">
            {profile?.avatar_url ? (
              <AvatarImage src={profile.avatar_url} alt={profile.full_name || ''} />
            ) : (
              <AvatarFallback>{profile?.full_name?.[0] || '?'}</AvatarFallback>
            )}
          </Avatar>
        </Link>
      </Button>
      
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
