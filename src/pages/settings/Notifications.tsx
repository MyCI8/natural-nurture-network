
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const SettingsNotifications = () => {
  const [preferences, setPreferences] = React.useState({
    emailNotifications: true,
    appNotifications: true,
    commentsNotifications: true,
    likesNotifications: true,
    mentionsNotifications: true,
    newsletterNotifications: false,
    marketingNotifications: false,
  });

  const handleToggle = (setting: keyof typeof preferences) => {
    setPreferences((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const handleSave = () => {
    toast.success("Notification preferences saved");
    // In a real app, this would save to the backend
  };

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-6">Notification Preferences</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>
            Control how and when you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Delivery Methods</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={preferences.emailNotifications}
                  onCheckedChange={() => handleToggle("emailNotifications")}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">App Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications in the app
                  </p>
                </div>
                <Switch
                  checked={preferences.appNotifications}
                  onCheckedChange={() => handleToggle("appNotifications")}
                />
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-4">Notification Types</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Comments</Label>
                  <p className="text-sm text-muted-foreground">
                    When someone comments on your content
                  </p>
                </div>
                <Switch
                  checked={preferences.commentsNotifications}
                  onCheckedChange={() => handleToggle("commentsNotifications")}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Likes</Label>
                  <p className="text-sm text-muted-foreground">
                    When someone likes your content
                  </p>
                </div>
                <Switch
                  checked={preferences.likesNotifications}
                  onCheckedChange={() => handleToggle("likesNotifications")}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Mentions</Label>
                  <p className="text-sm text-muted-foreground">
                    When someone mentions you
                  </p>
                </div>
                <Switch
                  checked={preferences.mentionsNotifications}
                  onCheckedChange={() => handleToggle("mentionsNotifications")}
                />
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-4">Marketing</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Newsletter</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive our weekly newsletter
                  </p>
                </div>
                <Switch
                  checked={preferences.newsletterNotifications}
                  onCheckedChange={() => handleToggle("newsletterNotifications")}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Marketing</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive marketing communications
                  </p>
                </div>
                <Switch
                  checked={preferences.marketingNotifications}
                  onCheckedChange={() => handleToggle("marketingNotifications")}
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleSave}>Save Preferences</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsNotifications;
