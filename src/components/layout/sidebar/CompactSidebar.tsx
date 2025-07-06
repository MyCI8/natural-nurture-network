
import { Link, useNavigate } from "react-router-dom";
import { Leaf, Shield, Upload } from "lucide-react";
import NavigationItems from "./NavigationItems";
import { UserProfileButton } from "./UserProfileButton";
import { useTheme } from "next-themes";
import { SettingsButton } from "@/components/settings/SettingsButton";

interface CompactSidebarProps {
  currentUser: any;
  profile: any;
  isAdmin?: boolean;
  onPostClick: () => void;
}

export const CompactSidebar = ({
  currentUser,
  profile,
  isAdmin,
  onPostClick
}: CompactSidebarProps) => {
  const navigate = useNavigate();

  return (
    <nav 
      role="navigation" 
      aria-label="Main navigation"
      className="fixed h-screen flex flex-col py-4 bg-background border-r border-border transition-all duration-300 z-50 w-16"
    >
      <div className="px-2">
        <Link 
          to="/" 
          className="flex items-center justify-center mb-8"
        >
          <Leaf className="h-8 w-8 text-primary shrink-0" />
        </Link>
        
        <div className="mb-4">
          <NavigationItems 
            isAdmin={!!isAdmin}
            isMobile={false}
          />
        </div>

        <Button
          className="w-full rounded-full mt-4 mb-6 flex items-center justify-center p-3 h-12 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={onPostClick}
          title="Post"
        >
          <Upload className="h-5 w-5 shrink-0" />
        </Button>

        {isAdmin && (
          <Button
            variant="ghost"
            className="w-full flex items-center justify-center p-3 rounded-full mb-4"
            onClick={() => navigate('/admin')}
            title="Admin Panel"
          >
            <Shield className="h-6 w-6" />
          </Button>
        )}
      </div>

      <div className="mt-auto px-2 space-y-4">
        <SettingsButton 
          userId={currentUser?.id}
          compact 
        />

        <UserProfileButton 
          userId={currentUser?.id} 
          profile={profile} 
          compact 
        />
      </div>
    </nav>
  );
};
