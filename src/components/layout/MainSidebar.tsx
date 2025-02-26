
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Home,
  Play,
  Newspaper,
  HeartPulse,
  Video,
  User,
  LogOut,
  Settings,
  Shield,
  Sun,
  Moon,
  Plus
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MenuItem {
  path: string;
  icon: JSX.Element;
  label: string;
  onClick?: () => void;
}

const MainSidebar = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.user || null;
    },
  });

  const { data: isAdmin } = useQuery({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      
      if (error) return false;
      return !!data;
    },
    enabled: !!user,
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    queryClient.clear();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setIsDarkMode(!isDarkMode);
  };

  const menuItems: MenuItem[] = [
    { path: "/", icon: <Home className="w-5 h-5" />, label: "Home" },
    { path: "/explore", icon: <Play className="w-5 h-5" />, label: "Explore" },
    { path: "/news", icon: <Newspaper className="w-5 h-5" />, label: "News" },
    { path: "/symptoms", icon: <HeartPulse className="w-5 h-5" />, label: "Symptoms" },
    { path: "/videos", icon: <Video className="w-5 h-5" />, label: "Videos" },
  ];

  if (!user) {
    menuItems.push({ path: "/auth", icon: <User className="w-5 h-5" />, label: "Sign In" });
  }

  if (user) {
    menuItems.push(
      { path: `/users/${user.id}`, icon: <User className="w-5 h-5" />, label: "Profile" }
    );
  }

  return (
    <div className="flex flex-col h-full bg-background border-r">
      {/* Profile Section */}
      {user && (
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-foreground">
                {user.user_metadata?.full_name || user.email}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Menu */}
      <nav className="flex-1 p-2 space-y-1">
        {menuItems.map((item) => (
          <Button
            key={item.path}
            variant="ghost"
            className={`w-full justify-start ${
              location.pathname === item.path 
                ? 'text-[#4CAF50] hover:text-[#388E3C]' 
                : 'text-foreground hover:text-[#4CAF50]'
            }`}
            onClick={item.onClick}
            asChild={!item.onClick}
          >
            {item.onClick ? (
              <div className="flex items-center">
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </div>
            ) : (
              <Link to={item.path} className="flex items-center">
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </Link>
            )}
          </Button>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t space-y-2">
        {isAdmin && (
          <Button
            variant="ghost"
            className="w-full justify-start"
            asChild
          >
            <Link to="/admin" className="flex items-center">
              <Shield className="w-5 h-5" />
              <span className="ml-3">Admin</span>
            </Link>
          </Button>
        )}
        
        <Button
          variant="ghost"
          className="w-full justify-start"
          asChild
        >
          <Link to="/settings" className="flex items-center">
            <Settings className="w-5 h-5" />
            <span className="ml-3">Settings</span>
          </Link>
        </Button>

        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center">
            {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            <span className="ml-3">Dark Mode</span>
          </div>
          <Switch
            checked={isDarkMode}
            onCheckedChange={toggleDarkMode}
          />
        </div>

        {user && (
          <>
            {isAdmin ? (
              <Button
                className="w-full bg-[#4CAF50] hover:bg-[#388E3C] text-white"
                asChild
              >
                <Link to="/admin/videos/new" className="flex items-center justify-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Post
                </Link>
              </Button>
            ) : (
              <Button
                className="w-full bg-[#4CAF50] hover:bg-[#388E3C] text-white"
                asChild
              >
                <Link to="/posts/new" className="flex items-center justify-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Post
                </Link>
              </Button>
            )}

            <Button
              variant="ghost"
              className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={handleLogout}
            >
              <div className="flex items-center">
                <LogOut className="w-5 h-5" />
                <span className="ml-3">Logout</span>
              </div>
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default MainSidebar;
