
import { Settings, LogOut } from "lucide-react";
import { SettingsNavButton } from "./SettingsNavButton";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { invalidateAuthQueries } from "@/utils/authUtils";

export const SettingsNavigation = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      invalidateAuthQueries(queryClient);
      navigate("/");
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

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

      <Separator className="my-4" />
      
      <Button
        variant="ghost"
        className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 touch-manipulation active:scale-95 transition-transform"
        onClick={handleSignOut}
      >
        <LogOut className="h-5 w-5 mr-2" />
        <span>Sign Out</span>
      </Button>
    </div>
  );
};
