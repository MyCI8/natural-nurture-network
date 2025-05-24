import React from 'react';
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { HeaderMenuButton } from "./header/HeaderMenuButton";
import { HeaderLogo } from "./header/HeaderLogo";
import { HeaderSearch } from "./header/HeaderSearch";
import { HeaderMenuContent } from "./header/HeaderMenuContent";
import { useHeaderVisibility } from "./header/useHeaderVisibility";
import { useMenuState } from "./header/useMenuState";
import { toast } from "sonner";

const TopHeader = () => {
  const navigate = useNavigate();
  const { visible } = useHeaderVisibility();
  const { isMenuOpen, setIsMenuOpen, mounted } = useMenuState();
  
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
  
  const handleMenuClick = () => {
    if (!currentUser) {
      // If user is not logged in, navigate to auth page
      navigate('/auth');
    } else {
      // If user is logged in, open the menu
      setIsMenuOpen(true);
    }
  };
  
  const handlePost = () => {
    if (!currentUser) {
      toast("Sign in required", {
        description: "Please sign in to create a post"
      });
      navigate('/auth');
      return;
    }
    // Navigate to the new post page instead of admin
    navigate('/post');
  };
  
  if (!mounted) return null;
  
  return (
    <>
      {/* Fixed header bar */}
      <header 
        className={`fixed top-0 left-0 right-0 h-14 z-[100] border-b flex items-center justify-between px-4 transition-transform duration-300 ${
          visible ? 'translate-y-0' : '-translate-y-full'
        } dark:bg-[#1A1F2C] bg-white`}
      >
        <HeaderMenuButton 
          profile={profile} 
          onClick={handleMenuClick}
        />
        <HeaderLogo />
        <HeaderSearch />
      </header>
      
      {/* Modal overlay - separate from the header */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[1000]"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
      
      {/* Sidebar content */}
      <div 
        data-menu="sidebar"
        className={`fixed inset-y-0 left-0 w-[280px] border-r shadow-xl z-[1001] transition-all duration-300 ease-in-out p-4 ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } dark:bg-[#1A1F2C] bg-white`}
        style={{ 
          visibility: isMenuOpen ? 'visible' : 'hidden'
        }}
      >
        <HeaderMenuContent
          currentUser={currentUser}
          profile={profile}
          isAdmin={isAdmin}
          onClose={() => setIsMenuOpen(false)}
          onPostClick={handlePost}
        />
      </div>
    </>
  );
};

export default TopHeader;
