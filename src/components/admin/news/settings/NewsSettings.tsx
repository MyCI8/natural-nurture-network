
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GeneralSettings from "./GeneralSettings";
import PublishingSettings from "./PublishingSettings";
import SEOSettings from "./SEOSettings";
import IntegrationsSettings from "./IntegrationsSettings";

const NewsSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">News Settings</h1>
        <p className="text-muted-foreground">
          Configure your news system settings and preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="publishing">Publishing</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="general" className="space-y-4">
            <GeneralSettings />
          </TabsContent>
          
          <TabsContent value="publishing" className="space-y-4">
            <PublishingSettings />
          </TabsContent>
          
          <TabsContent value="seo" className="space-y-4">
            <SEOSettings />
          </TabsContent>
          
          <TabsContent value="integrations" className="space-y-4">
            <IntegrationsSettings />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default NewsSettings;
