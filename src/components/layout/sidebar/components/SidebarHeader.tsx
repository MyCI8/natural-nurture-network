
import React from 'react';
import { X } from 'lucide-react';

interface SidebarHeaderProps {
  onClose: () => void;
}

export const SidebarHeader = ({ onClose }: SidebarHeaderProps) => {
  return (
    <div className="flex justify-between items-center p-4 border-b">
      <div className="text-lg font-semibold">Menu</div>
      <button 
        className="rounded-full h-10 w-10 flex items-center justify-center active:scale-95 transition-transform absolute right-2 top-2 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800"
        onClick={onClose}
        aria-label="Close menu"
      >
        <X size={20} />
      </button>
    </div>
  );
};
