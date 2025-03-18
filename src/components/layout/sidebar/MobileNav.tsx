
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { navigationItems } from "./NavigationItems";

interface MobileNavProps {
  showMobileNav: boolean;
  onPostClick: () => void;
}

export const MobileNav = ({ showMobileNav, onPostClick }: MobileNavProps) => {
  const location = useLocation();

  return (
    <nav 
      role="navigation" 
      aria-label="Main navigation"
      className={`fixed bottom-0 left-0 right-0 h-16 bg-background border-t z-50 ${
        showMobileNav ? 'translate-y-0' : 'translate-y-full'
      } transition-transform duration-300`}
    >
      <div className="h-full flex items-center justify-around px-4 max-w-7xl mx-auto">
        {navigationItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`p-3 rounded-full flex items-center justify-center w-12 h-12 transition-colors ${
              location.pathname === item.path 
                ? 'bg-accent/50 text-primary font-bold' 
                : 'hover:bg-accent/30'
            }`}
          >
            <item.icon className="h-6 w-6" />
          </Link>
        ))}
        <Button
          size="icon"
          onClick={onPostClick}
          className="h-12 w-12 p-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Upload className="h-5 w-5" />
        </Button>
      </div>
    </nav>
  );
};
