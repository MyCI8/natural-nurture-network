
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const SettingsPrivacy = () => {
  const [settings, setSettings] = React.useState({
    profileVisibility: "public",
    activityVisibility: "friends",
    searchable: true,
    dataCollection: true,
    cookiePreferences: "essential",
  });

  const handleSwitch = (setting: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: typeof prev[setting] === "boolean" ? !prev[setting] : prev[setting],
    }));
  };

  const handleSelect = (setting: keyof typeof settings, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  const handleSave = () => {
    toast.success("Privacy settings saved");
    // In a real app, this would save to the backend
  };

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-6">Privacy Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Privacy Controls</CardTitle>
          <CardDescription>
            Manage how your information is displayed and used
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Profile Visibility</h3>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="profile-visibility">Who can see your profile</Label>
                <Select
                  value={settings.profileVisibility}
                  onValueChange={(value) => handleSelect("profileVisibility", value)}
                >
                  <SelectTrigger id="profile-visibility">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Everyone</SelectItem>
                    <SelectItem value="friends">Only Friends</SelectItem>
                    <SelectItem value="private">Only Me</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="activity-visibility">Who can see your activity</Label>
                <Select
                  value={settings.activityVisibility}
                  onValueChange={(value) => handleSelect("activityVisibility", value)}
                >
                  <SelectTrigger id="activity-visibility">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Everyone</SelectItem>
                    <SelectItem value="friends">Only Friends</SelectItem>
                    <SelectItem value="private">Only Me</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Searchable</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow others to find you by name or username
                  </p>
                </div>
                <Switch
                  checked={settings.searchable as boolean}
                  onCheckedChange={() => handleSwitch("searchable")}
                />
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-4">Data & Privacy</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Data Collection</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow us to collect usage data to improve your experience
                  </p>
                </div>
                <Switch
                  checked={settings.dataCollection as boolean}
                  onCheckedChange={() => handleSwitch("dataCollection")}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="cookie-preferences">Cookie Preferences</Label>
                <Select
                  value={settings.cookiePreferences as string}
                  onValueChange={(value) => handleSelect("cookiePreferences", value)}
                >
                  <SelectTrigger id="cookie-preferences">
                    <SelectValue placeholder="Select cookie preferences" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Accept All Cookies</SelectItem>
                    <SelectItem value="necessary">Only Necessary Cookies</SelectItem>
                    <SelectItem value="essential">Essential Cookies Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-4">Data Control</h3>
            <div className="space-y-4">
              <Button variant="outline">Download My Data</Button>
              <Button variant="destructive">Delete Account</Button>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleSave}>Save Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPrivacy;
