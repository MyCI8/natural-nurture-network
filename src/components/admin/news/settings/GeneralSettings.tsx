
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const GeneralSettings = () => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const handleSave = () => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Settings saved successfully");
    }, 1000);
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Display Settings</CardTitle>
          <CardDescription>
            Configure how news content appears on your site
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="articles-per-page">Articles Per Page</Label>
              <Input id="articles-per-page" type="number" defaultValue="10" />
              <p className="text-sm text-muted-foreground">
                Number of articles to display per page on your news listing
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date-format">Date Format</Label>
              <Select defaultValue="mdy">
                <SelectTrigger id="date-format">
                  <SelectValue placeholder="Select date format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                  <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                  <SelectItem value="ymd">YYYY/MM/DD</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Format for displaying dates on news content
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latest-videos-count">Latest Videos Count</Label>
              <Input id="latest-videos-count" type="number" defaultValue="6" />
              <p className="text-sm text-muted-foreground">
                Number of videos to display in the Latest Videos section
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="thumbnail-size">Thumbnail Size</Label>
              <Select defaultValue="medium">
                <SelectTrigger id="thumbnail-size">
                  <SelectValue placeholder="Select thumbnail size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small (320x180)</SelectItem>
                  <SelectItem value="medium">Medium (640x360)</SelectItem>
                  <SelectItem value="large">Large (1280x720)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Size of thumbnails in news listings
              </p>
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
      
      <Card>
        <CardHeader>
          <CardTitle>Content Features</CardTitle>
          <CardDescription>
            Enable or disable specific news features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="comments">Comments</Label>
              <p className="text-sm text-muted-foreground">
                Allow users to comment on news articles
              </p>
            </div>
            <Switch id="comments" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="social-sharing">Social Sharing</Label>
              <p className="text-sm text-muted-foreground">
                Display social sharing buttons on news content
              </p>
            </div>
            <Switch id="social-sharing" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="related-articles">Related Articles</Label>
              <p className="text-sm text-muted-foreground">
                Show related articles at the end of each article
              </p>
            </div>
            <Switch id="related-articles" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="author-info">Author Information</Label>
              <p className="text-sm text-muted-foreground">
                Display author information on articles
              </p>
            </div>
            <Switch id="author-info" defaultChecked />
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

export default GeneralSettings;
