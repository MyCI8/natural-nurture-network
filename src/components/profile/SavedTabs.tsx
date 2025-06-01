
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bookmark, Heart } from 'lucide-react';
import { SavedVideos } from './SavedVideos';
import { SavedRemedies } from './SavedRemedies';

interface SavedTabsProps {
  userId: string;
}

export const SavedTabs = ({ userId }: SavedTabsProps) => {
  return (
    <Tabs defaultValue="posts" className="w-full">
      <TabsList className="grid w-full grid-cols-2 dark:bg-muted/10">
        <TabsTrigger value="posts" className="flex items-center py-3 sm:py-2 data-[state=active]:dark:bg-muted/30">
          <Bookmark className="w-4 h-4 mr-2" />
          Posts
        </TabsTrigger>
        <TabsTrigger value="remedies" className="flex items-center py-3 sm:py-2 data-[state=active]:dark:bg-muted/30">
          <Heart className="w-4 h-4 mr-2" />
          Remedies
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="posts" className="mt-4 sm:mt-6">
        <SavedVideos userId={userId} />
      </TabsContent>
      
      <TabsContent value="remedies" className="mt-4 sm:mt-6">
        <SavedRemedies userId={userId} />
      </TabsContent>
    </Tabs>
  );
};
