
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
      className="rounded-full h-10 w-10 flex items-center justify-center touch-manipulation active:scale-95 transition-transform"
      onClick={onClick}
      aria-label="Open menu"
    >
      <Avatar className="h-8 w-8">
        {profile?.avatar_url ? (
          <AvatarImage src={profile.avatar_url} alt={profile.full_name || ''} />
        ) : (
          <AvatarFallback>{profile?.full_name?.[0] || '?'}</AvatarFallback>
        )}
      </Avatar>
    </Button>
  );
};
