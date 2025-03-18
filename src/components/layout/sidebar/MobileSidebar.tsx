
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Settings, Upload } from "lucide-react";
import { NavigationButtons } from "./NavigationItems";
import { SettingsPanel } from "./SettingsPanel";
import { UserProfileButton } from "./UserProfileButton";

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

  return (
    <div className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${
      isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`}>
      <div className={`absolute left-0 top-0 bottom-0 w-[280px] bg-background transition-transform duration-300 ${
        isExpanded ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          <div className="flex justify-end p-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full"
              onClick={() => {
                setIsExpanded(false);
                setShowSettings(false);
              }}
            >
              ✕
            </Button>
          </div>

          {showSettings ? (
            <SettingsPanel />
          ) : (
            <nav className="flex-1 px-4 space-y-2">
              <NavigationButtons 
                onItemClick={() => {
                  setIsExpanded(false);
                }}
              />

              <Button
                className="w-full rounded-full mt-4 mb-6 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => {
                  onPostClick();
                  setIsExpanded(false);
                }}
              >
                <Upload className="h-4 w-4 shrink-0" />
                <span className="ml-2">Post</span>
              </Button>

              {isAdmin && (
                <Button
                  variant="ghost"
                  className="w-full justify-start space-x-4 rounded-full"
                  onClick={() => {
                    navigate('/admin');
                    setIsExpanded(false);
                  }}
                >
                  <Shield className="h-6 w-6" />
                  <span>Admin Panel</span>
                </Button>
              )}

              <Button
                variant="ghost"
                className="w-full justify-start space-x-4 rounded-full mt-4"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="h-6 w-6" />
                <span>Settings</span>
              </Button>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
};
