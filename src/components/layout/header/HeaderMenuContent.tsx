
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, X } from "lucide-react";
import { NavigationButtons } from "../sidebar/NavigationItems";
import { SettingsPanel } from "../sidebar/SettingsPanel";
import { UserProfileButton } from "../sidebar/UserProfileButton";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface HeaderMenuContentProps {
  currentUser: any;
  profile: any;
  isAdmin?: boolean;
  onClose: () => void;
  onPostClick: () => void;
}

export const HeaderMenuContent = ({ 
  currentUser, 
  profile, 
  isAdmin, 
  onClose, 
  onPostClick 
}: HeaderMenuContentProps) => {
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b">
        <UserProfileButton 
          userId={currentUser?.id}
          profile={profile}
          onClick={() => {
            navigate(currentUser ? `/users/${currentUser.id}` : '/auth');
            onClose();
          }}
        />
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      {showSettingsPanel ? (
        <div className="flex-1 px-4 py-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-4"
            onClick={() => setShowSettingsPanel(false)}
          >
            ← Back
          </Button>
          <SettingsPanel />
        </div>
      ) : (
        <div className="flex-1 px-4 py-2">
          <NavigationButtons 
            onItemClick={() => {
              onClose();
            }}
          />
          
          <div className="mt-6">
            <Button
              className="w-full rounded-full mb-6 bg-primary text-primary-foreground hover:bg-primary/90 py-5 active-scale"
              onClick={() => {
                onPostClick();
                onClose();
              }}
            >
              Post
            </Button>
            
            {isAdmin && (
              <Button
                variant="ghost"
                className="w-full justify-start rounded-full py-3 mb-2"
                onClick={() => {
                  navigate('/admin');
                  onClose();
                }}
              >
                <Shield className="h-5 w-5 mr-2" />
                Admin Panel
              </Button>
            )}
            
            <Button
              variant="ghost"
              className="w-full justify-start rounded-full py-3 mb-2"
              onClick={() => setShowSettingsPanel(true)}
            >
              Settings
            </Button>
            
            <div className="flex items-center justify-between px-3 py-2 rounded-lg mt-4">
              <span>Theme</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
