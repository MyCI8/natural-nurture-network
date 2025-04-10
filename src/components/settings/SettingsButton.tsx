
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, User, Bell, Shield, Eye, HelpCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { supabase } from "@/integrations/supabase/client";

interface SettingsButtonProps {
  userId?: string;
  compact?: boolean;
  variant?: "default" | "ghost" | "outline";
}

export function SettingsButton({ userId, compact = false, variant = "ghost" }: SettingsButtonProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleNavigate = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setOpen(false);
    navigate("/");
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={variant}
                size={compact ? "icon" : "default"}
                className={compact ? "h-9 w-9 rounded-full active-scale" : "active-scale"}
                aria-label="Settings"
              >
                <Settings className="h-[1.2rem] w-[1.2rem]" />
                {!compact && <span className="ml-2">Settings</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-3 dark:bg-dm-foreground dark:border-dm-mist" side="right" align="start">
              <div className="grid gap-2">
                <h3 className="font-medium mb-1 dark:text-dm-text">Account</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-sm active-scale dark:text-dm-text dark:hover:bg-dm-mist-extra" 
                  onClick={() => handleNavigate('/settings/profile')}
                >
                  <User className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-sm active-scale dark:text-dm-text dark:hover:bg-dm-mist-extra" 
                  onClick={() => handleNavigate('/settings/security')}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Security
                </Button>
                
                <h3 className="font-medium mt-2 mb-1 dark:text-dm-text">Preferences</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-sm active-scale dark:text-dm-text dark:hover:bg-dm-mist-extra" 
                  onClick={() => handleNavigate('/settings/notifications')}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-sm active-scale dark:text-dm-text dark:hover:bg-dm-mist-extra" 
                  onClick={() => handleNavigate('/settings/privacy')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Privacy
                </Button>
                
                <div className="mt-2 mb-1 flex justify-between items-center">
                  <span className="font-medium dark:text-dm-text">Theme</span>
                  <ThemeToggle />
                </div>
                
                <h3 className="font-medium mt-2 mb-1 dark:text-dm-text">Help</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-sm active-scale dark:text-dm-text dark:hover:bg-dm-mist-extra" 
                  onClick={() => window.open('mailto:support@bettertogether.com')}
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Support
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-sm text-destructive hover:text-destructive active-scale dark:text-dm-alert dark:hover:text-dm-alert" 
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </TooltipTrigger>
        <TooltipContent side="right" className="dark:bg-dm-foreground dark:text-dm-text dark:border-dm-mist">
          <p>Settings</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
