
import { Home, Play, Newspaper, Activity, Leaf } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const navigationItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/explore', label: 'Explore', icon: Play },
  { path: '/news', label: 'News', icon: Newspaper },
  { path: '/remedies', label: 'Remedies', icon: Leaf },
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
    <nav className={`space-y-3 ${className}`}>
      {navigationItems.map((item) => (
        iconOnly ? (
          <Link
            key={item.path}
            to={item.path}
            onClick={onItemClick}
            className={`flex items-center justify-center p-3 rounded-full transition-colors hover:bg-accent/30 touch-manipulation active:scale-95 transition-transform ${
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
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-accent/30 touch-manipulation active:scale-95 transition-transform ${
              location.pathname === item.path ? 'bg-accent/50 text-primary font-bold' : ''
            }`}
          >
            <item.icon className="h-6 w-6 shrink-0" />
            <span className="text-base">{item.label}</span>
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
        <Link
          key={item.path}
          to={item.path}
          onClick={onItemClick}
          className={`inline-flex items-center justify-center gap-3 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
            iconOnly 
              ? "w-full flex items-center justify-center p-3 rounded-full" 
              : "w-full justify-start px-4 py-3 rounded-lg"
          } ${
            location.pathname === item.path 
              ? 'bg-accent/50 text-primary font-bold' 
              : 'hover:bg-accent/30 bg-transparent active:bg-accent/70'
          } touch-manipulation active:scale-95 transition-transform min-h-[48px]`}
          title={iconOnly ? item.label : undefined}
        >
          <item.icon className="h-6 w-6 shrink-0" />
          {!iconOnly && <span>{item.label}</span>}
        </Link>
      ))}
    </nav>
  );
};
