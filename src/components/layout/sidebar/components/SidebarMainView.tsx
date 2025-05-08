
import React from 'react';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Shield, Upload, LogOut, Search } from "lucide-react";
import { NavigationButtons } from "../NavigationItems";
import { UserProfileButton } from "../UserProfileButton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Input } from "@/components/ui/input";
import { useSidebarSearch } from "../hooks/useSidebarSearch";

interface SidebarMainViewProps {
  currentUser: any;
  profile: any;
  isAdmin?: boolean;
  onPostClick: () => void;
  onClose: () => void;
}

export const SidebarMainView = ({ 
  currentUser, 
  profile, 
  isAdmin,
  onPostClick,
  onClose
}: SidebarMainViewProps) => {
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery, handleSearch } = useSidebarSearch(onClose);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      onClose();
      navigate("/");
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      <div className="p-4 border-b">
        <UserProfileButton 
          userId={currentUser?.id}
          profile={profile}
          onClick={() => {
            handleNavigation(currentUser ? `/users/${currentUser.id}` : '/auth');
          }}
        />
      </div>
      
      <div className="flex-1 px-4 py-2 overflow-y-auto">
        <NavigationButtons 
          onItemClick={onClose}
          className="py-2"
        />

        <Separator className="my-4" />

        <Button
          className="w-full rounded-full my-4 bg-primary text-primary-foreground hover:bg-primary/90 py-5 touch-manipulation active:scale-95 transition-transform h-12"
          onClick={() => {
            onPostClick();
            onClose();
          }}
        >
          <Upload className="h-5 w-5 shrink-0 mr-2" />
          <span>Post</span>
        </Button>

        {isAdmin && (
          <Button
            variant="ghost"
            className="w-full justify-start space-x-4 rounded-lg py-3 my-2 touch-manipulation active:scale-95 transition-transform h-12"
            onClick={() => handleNavigation('/admin')}
          >
            <Shield className="h-5 w-5 mr-2" />
            <span>Admin Panel</span>
          </Button>
        )}
      </div>
      
      {/* Bottom section with search and theme toggle */}
      <div className="mt-auto p-4 border-t">
        <form onSubmit={handleSearch} className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search"
              placeholder="Search..."
              className="pl-9 h-10 bg-muted/50 rounded-full w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium">Theme</span>
          <ThemeToggle />
        </div>

        {currentUser && (
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive rounded-lg mt-2 py-3 touch-manipulation active:scale-95 transition-transform"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5 mr-2" />
            <span>Sign Out</span>
          </Button>
        )}
      </div>
    </>
  );
};
