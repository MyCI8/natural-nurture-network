
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const SEOSettings = () => {
  const [formState, setFormState] = useState({
    siteName: "Health News Platform",
    titleTemplate: "%s | Health News",
    defaultDescription: "Latest health news, articles, and videos about wellness and medical research.",
    enableOgTags: true,
    defaultCategory: "Health",
    twitterHandle: "@healthnews",
    enableTwitterCards: true,
    googleSiteVerification: "",
    enableStructuredData: true,
    enableCanonicalUrls: true
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormState(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here we would typically save to the database
    console.log("Saving SEO settings:", formState);
    
    // Show success toast
    toast.success("SEO settings saved successfully");
  };

  // Example generated meta tags based on settings
  const metaTagPreview = `
<title>${formState.titleTemplate.replace("%s", "Article Title")}</title>
<meta name="description" content="${formState.defaultDescription}" />
<meta property="og:title" content="Article Title" />
<meta property="og:site_name" content="${formState.siteName}" />
<meta property="og:type" content="article" />
<meta property="og:category" content="${formState.defaultCategory}" />
  `.trim();

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>General SEO Settings</CardTitle>
            <CardDescription>Configure basic search engine optimization settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input 
                  id="siteName" 
                  name="siteName"
                  value={formState.siteName} 
                  onChange={handleChange} 
                  placeholder="Your News Site Name" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="titleTemplate">Title Template</Label>
                <Input 
                  id="titleTemplate" 
                  name="titleTemplate"
                  value={formState.titleTemplate} 
                  onChange={handleChange} 
                  placeholder="%s | Site Name" 
                />
                <p className="text-xs text-muted-foreground">Use %s for the page title position</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="defaultDescription">Default Meta Description</Label>
              <Textarea 
                id="defaultDescription" 
                name="defaultDescription"
                value={formState.defaultDescription} 
                onChange={handleChange} 
                placeholder="Enter a default meta description" 
                rows={3}
              />
              <p className="text-xs text-muted-foreground">Default description when no article-specific one is provided</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="defaultCategory">Default Category</Label>
              <Input 
                id="defaultCategory" 
                name="defaultCategory"
                value={formState.defaultCategory} 
                onChange={handleChange} 
                placeholder="News" 
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Social Media</CardTitle>
            <CardDescription>Optimize how your content appears when shared on social platforms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableOgTags">Open Graph Tags</Label>
                <p className="text-sm text-muted-foreground">Enable Facebook and general social sharing tags</p>
              </div>
              <Switch 
                id="enableOgTags"
                checked={formState.enableOgTags}
                onCheckedChange={(checked) => handleSwitchChange("enableOgTags", checked)}
              />
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="twitterHandle">Twitter Handle</Label>
                <Input 
                  id="twitterHandle" 
                  name="twitterHandle"
                  value={formState.twitterHandle} 
                  onChange={handleChange} 
                  placeholder="@username" 
                />
              </div>
              
              <div className="flex items-center justify-between md:flex-col md:items-start md:space-y-2">
                <div className="space-y-0.5">
                  <Label htmlFor="enableTwitterCards">Twitter Cards</Label>
                  <p className="text-sm text-muted-foreground">Rich previews when shared on Twitter</p>
                </div>
                <Switch 
                  id="enableTwitterCards"
                  checked={formState.enableTwitterCards}
                  onCheckedChange={(checked) => handleSwitchChange("enableTwitterCards", checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Advanced SEO Settings</CardTitle>
            <CardDescription>Additional settings for advanced search engine optimization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="googleSiteVerification">Google Site Verification</Label>
                <Input 
                  id="googleSiteVerification" 
                  name="googleSiteVerification"
                  value={formState.googleSiteVerification} 
                  onChange={handleChange} 
                  placeholder="Verification code" 
                />
                <p className="text-xs text-muted-foreground">For Google Search Console verification</p>
              </div>
              
              <div className="flex items-center justify-between md:flex-col md:items-start md:space-y-2">
                <div className="space-y-0.5">
                  <Label htmlFor="enableStructuredData">Structured Data</Label>
                  <p className="text-sm text-muted-foreground">JSON-LD schema markup for rich results</p>
                </div>
                <Switch 
                  id="enableStructuredData"
                  checked={formState.enableStructuredData}
                  onCheckedChange={(checked) => handleSwitchChange("enableStructuredData", checked)}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableCanonicalUrls">Canonical URLs</Label>
                <p className="text-sm text-muted-foreground">Automatically generate canonical URL tags</p>
              </div>
              <Switch 
                id="enableCanonicalUrls"
                checked={formState.enableCanonicalUrls}
                onCheckedChange={(checked) => handleSwitchChange("enableCanonicalUrls", checked)}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Meta Tag Preview</CardTitle>
            <CardDescription>Preview of how meta tags will be generated</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs">
              {metaTagPreview}
            </pre>
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Button type="submit">Save SEO Settings</Button>
        </div>
      </div>
    </form>
  );
};

export default SEOSettings;
