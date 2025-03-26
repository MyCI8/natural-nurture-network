
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Settings, Upload, LogOut, X } from "lucide-react";
import { NavigationButtons } from "./NavigationItems";
import { SettingsPanel } from "./SettingsPanel";
import { UserProfileButton } from "./UserProfileButton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Drawer, DrawerContent } from "@/components/ui/drawer";

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
      if (diff > 30) { // Threshold for swipe
        setIsExpanded(false);
        touchStartX.current = null;
      }
    };

    const sidebarEl = sidebarRef.current;
    if (sidebarEl) {
      sidebarEl.addEventListener('touchstart', handleTouchStart, { passive: true });
      sidebarEl.addEventListener('touchmove', handleTouchMove, { passive: true });
    }

    return () => {
      if (sidebarEl) {
        sidebarEl.removeEventListener('touchstart', handleTouchStart);
        sidebarEl.removeEventListener('touchmove', handleTouchMove);
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

  return (
    <div className={`fixed inset-0 z-[60] transition-all duration-300 ${
      isExpanded ? 'visible bg-black/50 backdrop-blur-sm' : 'invisible'
    }`} style={{ touchAction: 'pan-y' }}>
      <div 
        ref={sidebarRef}
        className={`absolute left-0 top-0 bottom-0 w-[85%] max-w-[300px] bg-background shadow-lg transition-transform duration-300 ease-out h-full overflow-hidden ${
          isExpanded ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ overscrollBehavior: 'contain' }}
      >
        <div className="h-full flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <div className="text-lg font-semibold">Menu</div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full h-10 w-10 flex items-center justify-center" 
              onClick={() => {
                setIsExpanded(false);
                setShowSettings(false);
              }}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {showSettings ? (
            <div className="px-4 pb-4 overflow-y-auto h-full">
              <Button 
                variant="ghost" 
                className="mb-4 flex items-center mt-2"
                onClick={() => setShowSettings(false)}
              >
                ← Back
              </Button>
              <SettingsPanel />
            </div>
          ) : (
            <>
              {currentUser && (
                <div className="p-4 border-b">
                  <UserProfileButton 
                    userId={currentUser?.id}
                    profile={profile}
                    onClick={() => {
                      navigate(`/users/${currentUser.id}`);
                      setIsExpanded(false);
                    }}
                  />
                </div>
              )}
              
              <nav className="flex-1 px-4 py-2 overflow-y-auto">
                <NavigationButtons 
                  onItemClick={() => {
                    setIsExpanded(false);
                  }}
                />

                <Button
                  className="w-full rounded-full mt-6 mb-6 bg-primary text-primary-foreground hover:bg-primary/90 py-5 active:scale-95 transition-transform"
                  onClick={() => {
                    onPostClick();
                    setIsExpanded(false);
                  }}
                >
                  <Upload className="h-4 w-4 shrink-0 mr-2" />
                  <span>Post</span>
                </Button>

                {isAdmin && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start space-x-4 rounded-full py-3"
                    onClick={() => {
                      navigate('/admin');
                      setIsExpanded(false);
                    }}
                  >
                    <Shield className="h-5 w-5 mr-2" />
                    <span>Admin Panel</span>
                  </Button>
                )}

                <Button
                  variant="ghost"
                  className="w-full justify-start space-x-4 rounded-full mt-4 py-3"
                  onClick={() => setShowSettings(true)}
                >
                  <Settings className="h-5 w-5 mr-2" />
                  <span>Settings</span>
                </Button>

                {currentUser && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:text-destructive rounded-full mt-2 py-3"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    <span>Sign Out</span>
                  </Button>
                )}
              </nav>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
