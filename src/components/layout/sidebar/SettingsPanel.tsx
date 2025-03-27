
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export const SettingsPanel = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  
  // Only show the correct theme UI after hydration to avoid mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return null;
  }

  const isDarkMode = theme === 'dark';
  
  return (
    <div className="px-4 space-y-6">
      <h2 className="text-lg font-semibold mb-4">Settings</h2>
      
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label htmlFor="dark-mode-toggle" className="flex items-center gap-2">
            {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            Dark Mode
          </Label>
          <p className="text-sm text-muted-foreground">
            Toggle dark mode appearance
          </p>
        </div>
        <Switch
          id="dark-mode-toggle"
          checked={isDarkMode}
          onCheckedChange={() => setTheme(isDarkMode ? 'light' : 'dark')}
          className="data-[state=checked]:bg-primary"
        />
      </div>

      <Button
        variant="ghost"
        className="w-full justify-start space-x-4"
        onClick={() => navigate('/settings/profile')}
      >
        <Settings className="h-5 w-5" />
        <span>Edit Profile</span>
      </Button>

      <Button
        variant="ghost"
        className="w-full justify-start space-x-4"
        onClick={() => navigate('/settings/notifications')}
      >
        <span>Notification Preferences</span>
      </Button>

      <Button
        variant="ghost"
        className="w-full justify-start space-x-4"
        onClick={() => navigate('/settings/privacy')}
      >
        <span>Privacy Settings</span>
      </Button>
    </div>
  );
};
