
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const PublishingSettings = () => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const handleSave = () => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Publishing settings saved successfully");
    }, 1000);
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Publication Workflow</CardTitle>
          <CardDescription>
            Configure how content publishing works
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="require-approval">Require Approval</Label>
              <p className="text-sm text-muted-foreground">
                New articles require approval before publishing
              </p>
            </div>
            <Switch id="require-approval" />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-publish">Auto Publish Scheduled</Label>
              <p className="text-sm text-muted-foreground">
                Automatically publish content at scheduled times
              </p>
            </div>
            <Switch id="auto-publish" defaultChecked />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="default-status">Default Status</Label>
            <Select defaultValue="draft">
              <SelectTrigger id="default-status">
                <SelectValue placeholder="Select default status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Default status for new articles
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Send email notifications for publishing events
              </p>
            </div>
            <Switch id="email-notifications" defaultChecked />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Social Media Publishing</CardTitle>
          <CardDescription>
            Automatically share content to social media
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-share">Auto Share</Label>
              <p className="text-sm text-muted-foreground">
                Automatically share new articles to social media
              </p>
            </div>
            <Switch id="auto-share" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="social-accounts">Connected Accounts</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold">T</span>
                  </div>
                  <span>Twitter</span>
                </div>
                <Button variant="outline" size="sm">Connect</Button>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold">F</span>
                  </div>
                  <span>Facebook</span>
                </div>
                <Button variant="outline" size="sm">Connect</Button>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold">I</span>
                  </div>
                  <span>Instagram</span>
                </div>
                <Button variant="outline" size="sm">Connect</Button>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PublishingSettings;
