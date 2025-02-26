
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Home,
  Users,
  Leaf,
  HeartPulse,
  Newspaper,
  Upload,
  User,
  LogOut,
  Shield,
  Play
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

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

  const menuItems: MenuItem[] = [
    { path: "/", icon: <Home className="w-5 h-5" />, label: "Home" },
    { path: "/experts", icon: <Users className="w-5 h-5" />, label: "Experts" },
    { path: "/remedies", icon: <Leaf className="w-5 h-5" />, label: "Remedies" },
    { path: "/symptoms", icon: <HeartPulse className="w-5 h-5" />, label: "Symptoms" },
    { path: "/news", icon: <Newspaper className="w-5 h-5" />, label: "News" },
    { path: "/explore", icon: <Play className="w-5 h-5" />, label: "Explore" },
  ];

  if (!user) {
    menuItems.push({ path: "/auth", icon: <User className="w-5 h-5" />, label: "Sign In" });
  }

  if (user) {
    if (isAdmin) {
      menuItems.push({ path: "/admin", icon: <Shield className="w-5 h-5" />, label: "Admin" });
    }
    menuItems.push(
      { path: `/users/${user.id}`, icon: <User className="w-5 h-5" />, label: "Profile" },
      { path: "/auth", icon: <LogOut className="w-5 h-5" />, label: "Logout", onClick: handleLogout }
    );
  }

  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-50">
        <nav className="flex justify-around p-2">
          {menuItems.slice(0, 5).map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              onClick={item.onClick}
              className={`p-2 rounded-lg ${
                location.pathname === item.path 
                  ? 'text-[#4CAF50]' 
                  : 'text-muted-foreground'
              }`}
            >
              {item.icon}
            </Link>
          ))}
        </nav>
      </div>
    );
  }

  return (
    <div className="fixed w-[240px] h-screen p-4 border-r bg-background">
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.path}
            variant={location.pathname === item.path ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={item.onClick}
            asChild
          >
            <Link to={item.path}>
              {item.icon}
              <span className="ml-2">{item.label}</span>
            </Link>
          </Button>
        ))}
      </nav>
    </div>
  );
};

export default MainSidebar;
