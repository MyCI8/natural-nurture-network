
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const SEOSettings = () => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const handleSave = () => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("SEO settings saved successfully");
    }, 1000);
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>SEO Defaults</CardTitle>
          <CardDescription>
            Configure default SEO settings for news content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meta-title-format">Default Meta Title Format</Label>
            <Input 
              id="meta-title-format" 
              defaultValue="{title} | {site_name}" 
            />
            <p className="text-sm text-muted-foreground">
              Format for article meta titles. Use {title}, {site_name}, {category} as placeholders.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="meta-description">Default Meta Description</Label>
            <Textarea 
              id="meta-description" 
              placeholder="Enter default meta description"
              defaultValue="Latest news and updates from our team."
            />
            <p className="text-sm text-muted-foreground">
              Default meta description when none is provided for an article
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="open-graph">Open Graph Image</Label>
            <div className="flex items-center gap-2">
              <Input 
                id="open-graph" 
                defaultValue="https://example.com/default-og-image.jpg" 
              />
              <Button variant="outline">Select</Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Default image for social sharing when none is provided
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
          <CardTitle>Advanced SEO Options</CardTitle>
          <CardDescription>
            Configure advanced SEO settings for your news content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="canonical-urls">Generate Canonical URLs</Label>
              <p className="text-sm text-muted-foreground">
                Automatically generate canonical URLs for articles
              </p>
            </div>
            <Switch id="canonical-urls" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="schema-markup">Add Schema Markup</Label>
              <p className="text-sm text-muted-foreground">
                Include schema.org markup for articles
              </p>
            </div>
            <Switch id="schema-markup" defaultChecked />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="robots-news">News Section Robots</Label>
            <Select defaultValue="index-follow">
              <SelectTrigger id="robots-news">
                <SelectValue placeholder="Select robots directive" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="index-follow">index, follow</SelectItem>
                <SelectItem value="noindex-follow">noindex, follow</SelectItem>
                <SelectItem value="index-nofollow">index, nofollow</SelectItem>
                <SelectItem value="noindex-nofollow">noindex, nofollow</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Robots directive for news section pages
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-sitemap">Include in Sitemap</Label>
              <p className="text-sm text-muted-foreground">
                Automatically include news content in sitemap
              </p>
            </div>
            <Switch id="auto-sitemap" defaultChecked />
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

export default SEOSettings;
