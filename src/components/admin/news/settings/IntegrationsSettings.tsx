
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const IntegrationsSettings = () => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const handleSave = () => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Integration settings saved successfully");
    }, 1000);
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Analytics Integration</CardTitle>
          <CardDescription>
            Connect analytics platforms to track news performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="google-analytics">Google Analytics</Label>
              <Switch id="google-analytics" defaultChecked />
            </div>
            <Input 
              id="ga-tracking-id" 
              placeholder="GA-XXXXXXXX"
              defaultValue="GA-12345678" 
            />
            <p className="text-sm text-muted-foreground">
              Enter your Google Analytics tracking ID
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="fb-pixel">Facebook Pixel</Label>
              <Switch id="fb-pixel" />
            </div>
            <Input 
              id="fb-pixel-id" 
              placeholder="XXXXXXXXXXXXXXXX"
            />
            <p className="text-sm text-muted-foreground">
              Enter your Facebook Pixel ID
            </p>
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
          <CardTitle>Newsletter Integration</CardTitle>
          <CardDescription>
            Connect your newsletter service for content distribution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="mailchimp">Mailchimp</Label>
              <Switch id="mailchimp" />
            </div>
            <Input 
              placeholder="API Key"
            />
            <Input 
              className="mt-2"
              placeholder="List ID"
            />
            <p className="text-sm text-muted-foreground">
              Connect Mailchimp to automatically send newsletters
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="auto-newsletter">Auto Newsletter</Label>
              <Switch id="auto-newsletter" />
            </div>
            <p className="text-sm text-muted-foreground">
              Automatically create and send a newsletter when new content is published
            </p>
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
          <CardTitle>Content API</CardTitle>
          <CardDescription>
            Configure API access for news content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-0.5">
              <Label htmlFor="enable-api">Enable Content API</Label>
              <p className="text-sm text-muted-foreground">
                Allow external applications to access your news content via API
              </p>
            </div>
            <Switch id="enable-api" defaultChecked />
          </div>
          
          <div className="p-3 bg-muted/50 rounded-md">
            <div className="flex items-center justify-between mb-2">
              <Label className="font-medium">API Key</Label>
              <Button variant="outline" size="sm">Generate New Key</Button>
            </div>
            <div className="flex items-center mt-2">
              <Input 
                className="font-mono text-sm"
                value="sk_live_51NzYprKLytR8rB0RqpVXzXrB6Syr73V"
                readOnly
              />
              <Button variant="ghost" size="sm" className="ml-2">
                Copy
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Keep this key secret. For security, rotate keys periodically.
            </p>
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

export default IntegrationsSettings;
