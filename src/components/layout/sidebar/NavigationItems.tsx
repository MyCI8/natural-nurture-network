
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Video, Newspaper, Pill, Stethoscope, TestTube, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavigationItemsProps {
  isAdmin: boolean;
  isMobile?: boolean;
  onItemClick?: () => void;
}

const NavigationItems: React.FC<NavigationItemsProps> = ({ 
  isAdmin, 
  isMobile = false, 
  onItemClick 
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
    onItemClick?.();
  };

  const isActive = (path: string) => location.pathname === path;

  // Main navigation items only
  const mainItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Explore', icon: Video, path: '/explore' },
    { name: 'Remedies', icon: Pill, path: '/remedies' },
    { name: 'Experts', icon: Stethoscope, path: '/experts' },
    { name: 'Ingredients', icon: TestTube, path: '/ingredients' },
    { name: 'Symptoms', icon: Activity, path: '/symptoms' },
    { name: 'News', icon: Newspaper, path: '/news' },
  ];

  const buttonClass = (path: string) => 
    `w-full justify-start gap-3 h-12 ${
      isActive(path) 
        ? 'bg-primary text-primary-foreground' 
        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
    } ${isMobile ? 'touch-manipulation' : ''}`;

  return (
    <div className="space-y-1">
      {/* Main Navigation Only */}
      <div className="space-y-1">
        {mainItems.map((item) => (
          <Button
            key={item.path}
            variant="ghost"
            className={buttonClass(item.path)}
            onClick={() => handleNavigate(item.path)}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span className="truncate">{item.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default NavigationItems;
