
import React from 'react';
import { Button } from "@/components/ui/button";
import { SettingsPanel } from "../SettingsPanel";
import { ArrowLeft, Move } from "lucide-react";

interface SidebarSettingsViewProps {
  onBackClick: () => void;
}

export const SidebarSettingsView = ({ onBackClick }: SidebarSettingsViewProps) => {
  return (
    <div className="flex-1 px-4 py-4 overflow-y-auto">
      <Button 
        variant="ghost" 
        className="mb-6 flex items-center mt-4 touch-manipulation active:scale-95 transition-transform px-4 py-3 thumb-friendly"
        onClick={onBackClick}
        aria-label="Go back"
      >
        <ArrowLeft size={20} className="mr-2" />
        <span>Back</span>
      </Button>
      <SettingsPanel />
    </div>
  );
};
