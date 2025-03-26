
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tables } from "@/integrations/supabase/types";
import { isValidStorageUrl } from '@/utils/imageUtils';
import { useState, useEffect } from 'react';

interface ProfileData {
  full_name?: string | null;
  avatar_url?: string | null;
  username?: string | null;
}

interface UserProfileButtonProps {
  userId?: string;
  profile?: ProfileData;
  compact?: boolean;
  onClick?: () => void;
}

export const UserProfileButton = ({ 
  userId, 
  profile, 
  compact = false,
  onClick 
}: UserProfileButtonProps) => {
  const displayName = profile?.full_name || 'User';
  const username = profile?.username || 'user';
  const avatarSrc = profile?.avatar_url;
  const initials = displayName?.[0] || '?';
  
  const [isValidAvatar, setIsValidAvatar] = useState<boolean>(false);
  
  // Validate avatar URL
  useEffect(() => {
    const checkUrl = async () => {
      // Check if avatar URL is valid and set state accordingly
      const isValid = isValidStorageUrl(avatarSrc);
      console.log("Checking avatar URL validity:", avatarSrc, isValid);
      setIsValidAvatar(isValid);
    };
    
    checkUrl();
  }, [avatarSrc]);
  
  if (!userId) {
    return (
      <Link
        className={compact 
          ? "w-full rounded-full flex items-center justify-center p-2 inline-flex bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium"
          : "w-full rounded-full inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 text-sm font-medium"}
        onClick={onClick}
        to="/auth"
        title={compact ? "Sign in" : undefined}
      >
        {compact ? (
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback>?</AvatarFallback>
          </Avatar>
        ) : (
          "Sign in"
        )}
      </Link>
    );
  }

  // Add a touch-friendly ripple effect
  const touchRippleClasses = "relative overflow-hidden transform active:scale-95 transition-transform";

  return (
    <Link
      className={`${touchRippleClasses} ${compact 
        ? "w-full flex items-center justify-center rounded-full p-2 bg-transparent hover:bg-accent/30 text-sm font-medium transition-colors" 
        : "w-full justify-start rounded-full p-4 bg-transparent hover:bg-accent/30 text-sm font-medium inline-flex items-center transition-colors"
      }`}
      onClick={onClick}
      to={`/users/${userId}`}
      title={compact ? displayName : undefined}
    >
      <Avatar className="h-8 w-8 shrink-0 mr-3 touch-manipulation">
        {isValidAvatar && avatarSrc ? (
          <AvatarImage 
            src={avatarSrc} 
            alt={displayName} 
            onError={() => setIsValidAvatar(false)}
          />
        ) : (
          <AvatarFallback>{initials}</AvatarFallback>
        )}
      </Avatar>
      
      {!compact && (
        <div className="flex flex-col items-start">
          <span className="font-semibold">{displayName}</span>
          <span className="text-sm text-muted-foreground">@{username}</span>
        </div>
      )}
    </Link>
  );
};
