
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Leaf, Search, Shield, Upload } from "lucide-react";
import { NavigationItems } from "./NavigationItems";
import { UserProfileButton } from "./UserProfileButton";
import { useTheme } from "next-themes";
import { SettingsButton } from "@/components/settings/SettingsButton";

interface FullSidebarProps {
  currentUser: any;
  profile: any;
  isAdmin?: boolean;
  onPostClick: () => void;
}

export const FullSidebar = ({
  currentUser,
  profile,
  isAdmin,
  onPostClick
}: FullSidebarProps) => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  const handleThemeToggle = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    console.log(`Switching theme from ${theme} to ${newTheme}`);
    setTheme(newTheme);
  };

  return (
    <nav 
      role="navigation" 
      aria-label="Main navigation"
      className="fixed h-screen flex flex-col py-4 bg-background border-r border-border transition-all duration-300 z-50 w-64"
    >
      <div className="px-4">
        <Link 
          to="/" 
          className="flex items-center space-x-2 mb-8 touch-manipulation"
        >
          <Leaf className="h-8 w-8 text-primary shrink-0" />
          <span className="text-xl font-semibold">BetterTogether</span>
        </Link>
        
        <NavigationItems className="mb-4" />

        <Button
          className="w-full rounded-full mt-4 mb-6 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] touch-manipulation"
          onClick={onPostClick}
        >
          <Upload className="h-4 w-4 shrink-0" />
          <span className="ml-2">Post</span>
        </Button>

        {isAdmin && (
          <Button
            variant="ghost"
            className="w-full justify-start space-x-4 rounded-full mb-4 touch-manipulation"
            onClick={() => navigate('/admin')}
          >
            <Shield className="h-6 w-6" />
            <span>Admin Panel</span>
          </Button>
        )}
      </div>

      <div className="mt-auto px-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            className="pl-9 rounded-full bg-accent"
          />
        </div>

        <div className="flex items-center justify-between px-2 touch-manipulation">
          <Label htmlFor="theme-toggle" className="cursor-pointer">Dark Mode</Label>
          <Switch
            id="theme-toggle"
            checked={isDarkMode}
            onCheckedChange={handleThemeToggle}
            aria-label="Toggle dark mode"
            className="touch-manipulation"
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <UserProfileButton 
            userId={currentUser?.id} 
            profile={profile} 
            className="touch-manipulation"
          />
          <SettingsButton 
            userId={currentUser?.id}
            compact 
            className="touch-manipulation"
          />
        </div>
      </div>
    </nav>
  );
};
