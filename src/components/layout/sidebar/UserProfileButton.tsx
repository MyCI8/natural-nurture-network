
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tables } from "@/integrations/supabase/types";

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
  
  if (!userId) {
    return (
      <Button
        className={compact ? "w-full rounded-full flex items-center justify-center p-2" : "w-full rounded-full"}
        onClick={onClick}
        as={Link}
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
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      className={compact 
        ? "w-full flex items-center justify-center rounded-full p-2" 
        : "w-full justify-start rounded-full p-4"
      }
      onClick={onClick}
      as={Link}
      to={`/users/${userId}`}
      title={compact ? displayName : undefined}
    >
      <Avatar className="h-8 w-8 shrink-0">
        {avatarSrc ? (
          <AvatarImage src={avatarSrc} alt={displayName} />
        ) : (
          <AvatarFallback>{initials}</AvatarFallback>
        )}
      </Avatar>
      
      {!compact && (
        <div className="flex flex-col items-start ml-3">
          <span className="font-semibold">{displayName}</span>
          <span className="text-sm text-muted-foreground">@{username}</span>
        </div>
      )}
    </Button>
  );
};
