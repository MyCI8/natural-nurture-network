
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Shield, Settings, Upload, LogOut, X, Search, Moon, Sun } from "lucide-react";
import { NavigationButtons } from "./NavigationItems";
import { SettingsPanel } from "./SettingsPanel";
import { UserProfileButton } from "./UserProfileButton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";

interface MobileSidebarProps {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  currentUser: any;
  profile: any;
  isAdmin?: boolean;
  onPostClick: () => void;
}

export const MobileSidebar = ({
  isExpanded,
  setIsExpanded,
  currentUser,
  profile,
  isAdmin,
  onPostClick
}: MobileSidebarProps) => {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  // Handle swipe gestures to close sidebar
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartX.current || !isExpanded) return;
      
      const touchX = e.touches[0].clientX;
      const diff = touchStartX.current - touchX;
      
      // If swiping left, start closing the sidebar
      if (diff > 50) { // Increased threshold for more deliberate swipe
        setIsExpanded(false);
        touchStartX.current = null;
      }
    };

    const handleTouchEnd = () => {
      touchStartX.current = null;
    };

    const sidebarEl = sidebarRef.current;
    if (sidebarEl) {
      sidebarEl.addEventListener('touchstart', handleTouchStart, { passive: true });
      sidebarEl.addEventListener('touchmove', handleTouchMove, { passive: true });
      sidebarEl.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    return () => {
      if (sidebarEl) {
        sidebarEl.removeEventListener('touchstart', handleTouchStart);
        sidebarEl.removeEventListener('touchmove', handleTouchMove);
        sidebarEl.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [isExpanded, setIsExpanded]);

  // Handle click outside to close sidebar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && isExpanded) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded, setIsExpanded]);

  // Prevent body scrolling when sidebar is open
  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isExpanded]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setIsExpanded(false);
      navigate("/");
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsExpanded(false);
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-[200] ${
        isExpanded ? 'visible' : 'invisible'
      } transition-all duration-300`} 
      style={{ touchAction: 'none' }}
    >
      {/* Backdrop with solid background */}
      <div 
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm ${
          isExpanded ? 'opacity-100' : 'opacity-0'
        } transition-opacity duration-300`}
        onClick={() => setIsExpanded(false)}
        aria-hidden="true"
      />
      
      {/* Sidebar with solid white/dark background */}
      <div 
        ref={sidebarRef}
        className={`absolute left-0 top-0 bottom-0 w-[80%] max-w-[320px] shadow-xl transition-transform duration-300 ease-out h-full flex flex-col ${
          isExpanded ? 'translate-x-0' : '-translate-x-full'
        } dark:bg-[#1A1F2C] bg-white z-[250]`} // Added z-index and solid backgrounds
      >
        <div className="flex justify-between items-center p-4 border-b">
          <div className="text-lg font-semibold">Menu</div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full h-10 w-10 flex items-center justify-center touch-manipulation active:scale-95 transition-transform absolute right-2 top-2" 
            onClick={() => {
              setIsExpanded(false);
              setShowSettings(false);
            }}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {showSettings ? (
          <div className="flex-1 px-4 py-4">
            <Button 
              variant="ghost" 
              className="mb-4 flex items-center mt-4 touch-manipulation active:scale-95 transition-transform"
              onClick={() => setShowSettings(false)}
            >
              ← Back
            </Button>
            <SettingsPanel />
          </div>
        ) : (
          <>
            <div className="p-4 border-b">
              <UserProfileButton 
                userId={currentUser?.id}
                profile={profile}
                onClick={() => {
                  navigate(currentUser ? `/users/${currentUser.id}` : '/auth');
                  setIsExpanded(false);
                }}
              />
            </div>
            
            <div className="flex-1 px-4 py-2">
              <NavigationButtons 
                onItemClick={() => {
                  setIsExpanded(false);
                }}
                className="py-2"
              />

              <Separator className="my-4" />

              <Button
                className="w-full rounded-full my-4 bg-primary text-primary-foreground hover:bg-primary/90 py-5 touch-manipulation active:scale-95 transition-transform h-12"
                onClick={() => {
                  onPostClick();
                  setIsExpanded(false);
                }}
              >
                <Upload className="h-5 w-5 shrink-0 mr-2" />
                <span>Post</span>
              </Button>

              {isAdmin && (
                <Button
                  variant="ghost"
                  className="w-full justify-start space-x-4 rounded-lg py-3 my-2 touch-manipulation active:scale-95 transition-transform h-12"
                  onClick={() => {
                    navigate('/admin');
                    setIsExpanded(false);
                  }}
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
                <span className="text-sm font-medium">Dark Mode</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {theme === 'dark' ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
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
        )}
      </div>
    </div>
  );
};
