
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { useTheme } from "next-themes";

interface HeaderMenuButtonProps {
  profile: any;
  onClick: () => void;
}

export const HeaderMenuButton = ({ profile, onClick }: HeaderMenuButtonProps) => {
  const { theme } = useTheme();

  // If user is not logged in (no profile), show user icon
  if (!profile) {
    return (
      <Button 
        variant="ghost" 
        size="icon" 
        className="rounded-full h-12 w-12 flex items-center justify-center touch-manipulation active:scale-95 transition-transform touch-button"
        onClick={onClick}
        aria-label="Sign in"
      >
        <User 
          className={`h-6 w-6 ${
            theme === 'dark' 
              ? 'text-gray-300 hover:text-white' 
              : 'text-gray-700 hover:text-gray-900'
          }`} 
        />
      </Button>
    );
  }

  // If user is logged in, show their profile picture
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="rounded-full h-12 w-12 flex items-center justify-center touch-manipulation active:scale-95 transition-transform touch-button"
      onClick={onClick}
      aria-label="Open menu"
    >
      <Avatar className="h-10 w-10">
        {profile?.avatar_url ? (
          <AvatarImage src={profile.avatar_url} alt={profile.full_name || ''} />
        ) : (
          <AvatarFallback>{profile?.full_name?.[0] || '?'}</AvatarFallback>
        )}
      </Avatar>
    </Button>
  );
}
