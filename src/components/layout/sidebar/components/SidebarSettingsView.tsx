
import React from 'react';
import { Button } from "@/components/ui/button";
import { SettingsPanel } from "../SettingsPanel";

interface SidebarSettingsViewProps {
  onBackClick: () => void;
}

export const SidebarSettingsView = ({ onBackClick }: SidebarSettingsViewProps) => {
  return (
    <div className="flex-1 px-4 py-4 overflow-y-auto">
      <Button 
        variant="ghost" 
        className="mb-4 flex items-center mt-4 touch-manipulation active:scale-95 transition-transform"
        onClick={onBackClick}
      >
        ← Back
      </Button>
      <SettingsPanel />
    </div>
  );
};
