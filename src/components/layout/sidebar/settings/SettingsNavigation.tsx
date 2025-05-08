
import { Settings } from "lucide-react";
import { SettingsNavButton } from "./SettingsNavButton";

export const SettingsNavigation = () => {
  return (
    <div className="space-y-2">
      <SettingsNavButton path="/settings/profile" icon={Settings}>
        Edit Profile
      </SettingsNavButton>
      
      <SettingsNavButton path="/settings/notifications">
        Notification Preferences
      </SettingsNavButton>
      
      <SettingsNavButton path="/settings/privacy">
        Privacy Settings
      </SettingsNavButton>
    </div>
  );
};
