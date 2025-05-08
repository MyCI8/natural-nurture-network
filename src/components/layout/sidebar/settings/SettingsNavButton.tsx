
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SettingsNavButtonProps {
  icon?: LucideIcon;
  path: string;
  children: React.ReactNode;
}

export const SettingsNavButton = ({ icon: Icon, path, children }: SettingsNavButtonProps) => {
  const navigate = useNavigate();
  
  return (
    <Button
      variant="ghost"
      className="w-full justify-start space-x-4 dark:text-dm-text dark:hover:bg-dm-mist active-scale thumb-friendly"
      onClick={() => navigate(path)}
      aria-label={typeof children === 'string' ? children : 'Navigation button'}
    >
      {Icon && <Icon className="h-5 w-5 mr-2" />}
      <span>{children}</span>
    </Button>
  );
};
