
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Video, Newspaper, Settings, ShieldCheck, Pill, Stethoscope, TestTube, Activity, Heart } from 'lucide-react';
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

  // Main navigation items
  const mainItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Explore', icon: Video, path: '/explore' },
    { name: 'Remedies', icon: Pill, path: '/remedies' },
    { name: 'Experts', icon: Stethoscope, path: '/experts' },
    { name: 'Ingredients', icon: TestTube, path: '/ingredients' },
    { name: 'Symptoms', icon: Activity, path: '/symptoms' },
    { name: 'News', icon: Newspaper, path: '/news' },
  ];

  // Admin navigation items
  const adminItems = isAdmin ? [
    { name: 'Admin Dashboard', icon: ShieldCheck, path: '/admin' },
    { name: 'Manage Users', icon: Users, path: '/admin/users' },
    { name: 'Manage Experts', icon: Stethoscope, path: '/admin/manage-experts' },
    { name: 'Manage Remedies', icon: Pill, path: '/admin/remedies' },
    { name: 'Health Concerns', icon: Heart, path: '/admin/health-concerns' },
    { name: 'Manage Ingredients', icon: TestTube, path: '/admin/ingredients' },
    { name: 'Manage Symptoms', icon: Activity, path: '/admin/symptoms' },
    { name: 'Manage News', icon: Newspaper, path: '/admin/news' },
    { name: 'Manage Videos', icon: Video, path: '/admin/videos' },
  ] : [];

  const buttonClass = (path: string) => 
    `w-full justify-start gap-3 h-12 ${
      isActive(path) 
        ? 'bg-primary text-primary-foreground' 
        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
    } ${isMobile ? 'touch-manipulation' : ''}`;

  return (
    <div className="space-y-1">
      {/* Main Navigation */}
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

      {/* Admin Section */}
      {isAdmin && (
        <>
          <div className="my-4 border-t border-border" />
          <div className="space-y-1">
            <div className="px-3 py-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Admin
              </h3>
            </div>
            {adminItems.map((item) => (
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
        </>
      )}
    </div>
  );
};

export default NavigationItems;
