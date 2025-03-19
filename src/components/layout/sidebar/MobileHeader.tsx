
import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Leaf, Search } from "lucide-react";
import { Link } from "react-router-dom";

interface MobileHeaderProps {
  showMobileHeader: boolean;
  profile: any;
  onMenuClick: () => void;
}

export const MobileHeader = ({ 
  showMobileHeader, 
  profile, 
  onMenuClick 
}: MobileHeaderProps) => {
  return (
    <header 
      className={`fixed top-0 left-0 right-0 h-14 bg-background border-b z-50 transition-transform duration-300 ease-in-out ${
        showMobileHeader ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="h-full flex items-center justify-between px-4 max-w-7xl mx-auto">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full h-10 w-10 flex items-center justify-center"
          onClick={onMenuClick}
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
        
        <Link to="/" className="flex items-center" aria-label="Home">
          <Leaf className="h-6 w-6 text-primary" />
        </Link>
        
        <Link to="/search" aria-label="Search">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full h-10 w-10 flex items-center justify-center"
          >
            <Search className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </header>
  );
};
