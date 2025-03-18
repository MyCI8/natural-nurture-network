
import { Home, Play, Newspaper, Activity } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const navigationItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/explore', label: 'Explore', icon: Play },
  { path: '/news', label: 'News', icon: Newspaper },
  { path: '/symptoms', label: 'Symptoms', icon: Activity },
];

interface NavigationItemsProps {
  onItemClick?: () => void;
  className?: string;
  iconOnly?: boolean;
}

export const NavigationItems = ({ 
  onItemClick, 
  className = "", 
  iconOnly = false 
}: NavigationItemsProps) => {
  const location = useLocation();

  return (
    <nav className={`space-y-2 ${className}`}>
      {navigationItems.map((item) => (
        iconOnly ? (
          <Link
            key={item.path}
            to={item.path}
            onClick={onItemClick}
            className={`flex items-center justify-center p-3 rounded-full transition-colors hover:bg-accent/30 ${
              location.pathname === item.path ? 'bg-accent/50 text-primary font-bold' : ''
            }`}
            title={item.label}
          >
            <item.icon className="h-6 w-6 shrink-0" />
          </Link>
        ) : (
          <Link
            key={item.path}
            to={item.path}
            onClick={onItemClick}
            className={`flex items-center space-x-4 px-4 py-3 rounded-full transition-colors hover:bg-accent/30 ${
              location.pathname === item.path ? 'bg-accent/50 text-primary font-bold' : ''
            }`}
          >
            <item.icon className="h-6 w-6 shrink-0" />
            <span>{item.label}</span>
          </Link>
        )
      ))}
    </nav>
  );
};

export const NavigationButtons = ({ 
  onItemClick, 
  className = "", 
  iconOnly = false 
}: NavigationItemsProps) => {
  const location = useLocation();

  return (
    <nav className={`space-y-2 ${className}`}>
      {navigationItems.map((item) => (
        <Button
          key={item.path}
          variant="ghost"
          className={`${
            iconOnly 
              ? "w-full flex items-center justify-center p-3 rounded-full" 
              : "w-full justify-start space-x-4 rounded-full"
          } ${
            location.pathname === item.path ? 'bg-accent/50 text-primary font-bold' : 'hover:bg-accent/30'
          }`}
          onClick={() => {
            if (onItemClick) onItemClick();
          }}
          title={iconOnly ? item.label : undefined}
          as={Link}
          to={item.path}
        >
          <item.icon className="h-6 w-6 shrink-0" />
          {!iconOnly && <span>{item.label}</span>}
        </Button>
      ))}
    </nav>
  );
};
