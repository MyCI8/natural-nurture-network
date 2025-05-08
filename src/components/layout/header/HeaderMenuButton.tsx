
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface HeaderMenuButtonProps {
  profile: any;
  onClick: () => void;
}

export const HeaderMenuButton = ({ profile, onClick }: HeaderMenuButtonProps) => {
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
