
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Key, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ApiKeyDialog } from "./crawler/ApiKeyDialog";
import { SearchResults } from "./crawler/SearchResults";
import { useApiKey } from "./crawler/useApiKey";
import type { ExpertCrawlerProps, CrawlResult } from "./crawler/types";

export const ExpertCrawlerSection = ({ onDataSelect }: ExpertCrawlerProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [crawlResult, setCrawlResult] = useState<CrawlResult | null>(null);
  const { toast } = useToast();
  const {
    apiKey,
    setApiKey,
    showApiKeyDialog,
    setShowApiKeyDialog,
    saveApiKey,
  } = useApiKey();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) {
      setShowApiKeyDialog(true);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('searchExperts', {
        body: { searchQuery }
      });

      if (error) {throw error;}

      if (data.success) {
        setCrawlResult({
          success: true,
          data: data.data
        });
        toast({
          title: "Success",
          description: "Found expert information",
        });
      } else {
        setCrawlResult({
          success: false,
          error: data.error || "Failed to find expert information"
        });
        toast({
          title: "Error",
          description: data.error || "Failed to find expert information",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Error",
        description: "Failed to search for expert",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectData = (data: Partial<CrawlResult['data']>) => {
    if (onDataSelect) {
      onDataSelect(data);
      toast({
        title: "Success",
        description: "Data applied to form",
      });
    }
  };

  const handleApiKeyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowApiKeyDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Firecrawl</span>
        <Button
          variant="outline"
          size="icon"
          onClick={handleApiKeyClick}
          className="h-8 w-8"
        >
          <Key className="h-4 w-4" />
        </Button>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Expert Search</h3>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter expert name to search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? "Searching..." : <Search className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <ApiKeyDialog
        open={showApiKeyDialog}
        onOpenChange={setShowApiKeyDialog}
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
        onSave={saveApiKey}
      />

      {crawlResult && (
        <SearchResults
          result={crawlResult}
          onSelectData={handleSelectData}
        />
      )}
    </div>
  );
};
