
import { useState, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface SidebarPortalProps {
  children: ReactNode;
  isVisible: boolean;
}

export const SidebarPortal = ({ children, isVisible }: SidebarPortalProps) => {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalRoot(document.body);
    
    // Clean up function to remove elements when component unmounts
    return () => {
      const existingOverlay = document.getElementById('mobile-menu-overlay');
      const existingSidebar = document.getElementById('mobile-menu-sidebar');
      if (existingOverlay) existingOverlay.remove();
      if (existingSidebar) existingSidebar.remove();
    };
  }, []);

  // Early return if no portal root is available or sidebar is not visible
  if (!portalRoot || !isVisible) return null;

  return createPortal(
    <>
      {/* Backdrop overlay */}
      <div 
        id="mobile-menu-overlay"
        className={`fixed inset-0 bg-black/90 backdrop-blur-md z-[9999] transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />
      
      {/* Sidebar container */}
      <div 
        id="mobile-menu-sidebar"
        className={`fixed inset-y-0 left-0 w-[80%] max-w-[320px] shadow-2xl transition-transform duration-300 ease-out 
          flex flex-col z-[10000] ${isVisible ? 'translate-x-0' : '-translate-x-full'} dark:bg-[#1A1F2C] bg-white`}
        style={{ 
          visibility: isVisible ? 'visible' : 'hidden',
          touchAction: 'auto'
        }}
      >
        {children}
      </div>
    </>,
    portalRoot
  );
};
