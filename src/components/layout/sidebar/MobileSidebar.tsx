
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Shield, Settings, Upload, LogOut, X, Search } from "lucide-react";
import { NavigationButtons } from "./NavigationItems";
import { SettingsPanel } from "./SettingsPanel";
import { UserProfileButton } from "./UserProfileButton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ui/theme-toggle";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  // Create a React portal for the sidebar elements
  useEffect(() => {
    setPortalRoot(document.body);
    
    // Clean up any existing portal elements when component unmounts
    return () => {
      const existingOverlay = document.getElementById('mobile-menu-overlay');
      const existingSidebar = document.getElementById('mobile-menu-sidebar');
      if (existingOverlay) existingOverlay.remove();
      if (existingSidebar) existingSidebar.remove();
    };
  }, []);

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
      const sidebarElement = document.getElementById('mobile-menu-sidebar');
      if (sidebarElement && !sidebarElement.contains(event.target as Node) && isExpanded) {
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

  // Early return if no portal root is available
  if (!portalRoot || !isExpanded) return null;

  // Using direct DOM manipulation for better stacking control
  return (
    <>
      {/* Backdrop overlay - positioned at the root level of the DOM */}
      {portalRoot.appendChild(
        (() => {
          const overlay = document.getElementById('mobile-menu-overlay') || document.createElement('div');
          overlay.id = 'mobile-menu-overlay';
          overlay.className = `fixed inset-0 bg-black/90 backdrop-blur-md z-[9999] transition-opacity duration-300 ${
            isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`;
          overlay.onclick = () => setIsExpanded(false);
          return overlay;
        })()
      )}
      
      {/* Sidebar content - positioned at the root level with even higher z-index */}
      {portalRoot.appendChild(
        (() => {
          const sidebar = document.getElementById('mobile-menu-sidebar') || document.createElement('div');
          sidebar.id = 'mobile-menu-sidebar';
          sidebar.className = `fixed inset-y-0 left-0 w-[80%] max-w-[320px] shadow-2xl transition-transform duration-300 ease-out 
            flex flex-col z-[10000] ${isExpanded ? 'translate-x-0' : '-translate-x-full'} dark:bg-[#1A1F2C] bg-white`;
          sidebar.style.visibility = isExpanded ? 'visible' : 'hidden';
          sidebar.style.touchAction = 'auto';
          sidebar.innerHTML = `
            <div class="flex justify-between items-center p-4 border-b">
              <div class="text-lg font-semibold">Menu</div>
              <button id="mobile-menu-close" class="rounded-full h-10 w-10 flex items-center justify-center active:scale-95 transition-transform absolute right-2 top-2 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div id="mobile-menu-content" class="flex-1 overflow-y-auto"></div>
          `;
          
          setTimeout(() => {
            const closeBtn = document.getElementById('mobile-menu-close');
            if (closeBtn) {
              closeBtn.onclick = () => {
                setIsExpanded(false);
                setShowSettings(false);
              };
            }
          }, 0);
          
          return sidebar;
        })()
      )}

      {/* Render React content into the sidebar */}
      {document.getElementById('mobile-menu-content') && 
        (() => {
          const content = document.getElementById('mobile-menu-content')!;
          content.innerHTML = '';
          
          // Create a container for React content
          const reactRoot = document.createElement('div');
          reactRoot.className = 'h-full flex flex-col';
          content.appendChild(reactRoot);
          
          // Return React element to be rendered
          return (
            <div className="h-full flex flex-col" ref={sidebarRef}>
              {showSettings ? (
                <div className="flex-1 px-4 py-4 overflow-y-auto">
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
                  
                  <div className="flex-1 px-4 py-2 overflow-y-auto">
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
              )}
            </div>
          );
        })()
      }
    </>
  );
};
