
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Label } from "@/components/ui/label";
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Eye, 
  HelpCircle, 
  LogOut,
} from "lucide-react";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string;
}

export function SettingsModal({ open, onOpenChange, userId }: SettingsModalProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("account");
  const [mounted, setMounted] = useState(false);

  // Only show the correct theme UI after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get user profile data
  const { data: profile } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // Check if user is admin
  const { data: isAdmin } = useQuery({
    queryKey: ['isAdmin', userId],
    queryFn: async () => {
      if (!userId) return false;
      const { data, error } = await supabase.rpc('check_is_admin');
      if (error) return false;
      return !!data;
    },
    enabled: !!userId,
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onOpenChange(false);
    navigate("/");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="help">Help</TabsTrigger>
          </TabsList>
          
          {/* Account Tab */}
          <TabsContent value="account" className="space-y-4">
            <div className="border rounded-lg p-4 space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <User className="h-4 w-4" /> Profile Information
              </h3>
              <div className="text-sm text-muted-foreground">
                <p>Email: {profile?.email || 'Not available'}</p>
                <p>Name: {profile?.full_name || 'Not set'}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/settings/profile')}
                className="w-full"
              >
                Edit Profile
              </Button>
            </div>
            
            <div className="border rounded-lg p-4 space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" /> Account Security
              </h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/settings/security')}
                className="w-full"
              >
                Change Password
              </Button>
            </div>
            
            {isAdmin && (
              <div className="border rounded-lg p-4">
                <h3 className="font-medium flex items-center gap-2 mb-3">
                  <Shield className="h-4 w-4" /> Admin Access
                </h3>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => {
                    onOpenChange(false);
                    navigate('/admin');
                  }}
                  className="w-full"
                >
                  Admin Dashboard
                </Button>
              </div>
            )}
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium flex items-center gap-2 text-destructive mb-3">
                <LogOut className="h-4 w-4" /> Sign Out
              </h3>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleSignOut}
                className="w-full"
              >
                Sign Out
              </Button>
            </div>
          </TabsContent>
          
          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-4">
            <div className="border rounded-lg p-4 space-y-3">
              <h3 className="font-medium flex items-center gap-2 mb-3">
                Appearance
              </h3>
              <div className="flex items-center justify-between">
                <Label htmlFor="settings-dark-mode">Theme</Label>
                {mounted && <ThemeToggle />}
              </div>
            </div>
            
            <div className="border rounded-lg p-4 space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <Bell className="h-4 w-4" /> Notifications
              </h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/settings/notifications')}
                className="w-full"
              >
                Notification Preferences
              </Button>
            </div>
            
            <div className="border rounded-lg p-4 space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <Eye className="h-4 w-4" /> Privacy
              </h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/settings/privacy')}
                className="w-full"
              >
                Privacy Settings
              </Button>
            </div>
          </TabsContent>
          
          {/* Help Tab */}
          <TabsContent value="help" className="space-y-4">
            <div className="border rounded-lg p-4 space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <HelpCircle className="h-4 w-4" /> Support
              </h3>
              <p className="text-sm text-muted-foreground">
                Need help with something? Get in touch with our support team.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('mailto:support@bettertogether.com')}
                className="w-full"
              >
                Contact Support
              </Button>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">About BetterTogether</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Version 1.0.0
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/about')}
                className="w-full"
              >
                About Us
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
