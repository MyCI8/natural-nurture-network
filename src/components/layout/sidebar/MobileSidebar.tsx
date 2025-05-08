
import React, { useRef, useState } from "react";
import { SidebarHeader } from './components/SidebarHeader';
import { SidebarMainView } from './components/SidebarMainView';
import { SidebarSettingsView } from './components/SidebarSettingsView';
import { SidebarPortal } from './components/SidebarPortal';
import { useSwipeGesture } from './hooks/useSwipeGesture';

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
  const [showSettings, setShowSettings] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  // Use our new swipe gesture hook
  useSwipeGesture({
    isExpanded,
    setIsExpanded,
    elementRef: sidebarRef
  });

  // Handler for closing the sidebar
  const handleClose = () => {
    setIsExpanded(false);
    setShowSettings(false);
  };

  return (
    <SidebarPortal isVisible={isExpanded}>
      <div ref={sidebarRef} className="flex flex-col h-full">
        <SidebarHeader onClose={handleClose} />
        
        <div id="mobile-menu-content" className="flex-1 flex flex-col overflow-hidden">
          {showSettings ? (
            <SidebarSettingsView onBackClick={() => setShowSettings(false)} />
          ) : (
            <SidebarMainView
              currentUser={currentUser}
              profile={profile}
              isAdmin={isAdmin}
              onPostClick={onPostClick}
              onClose={handleClose}
            />
          )}
        </div>
      </div>
    </SidebarPortal>
  );
};
