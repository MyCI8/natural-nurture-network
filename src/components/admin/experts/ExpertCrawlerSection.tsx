
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Key, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CrawlResult {
  success: boolean;
  data?: {
    name?: string;
    biography?: string;
    image?: string;
    socialLinks?: {
      wikipedia?: string;
      linkedin?: string;
      twitter?: string;
      website?: string;
    };
    credentials?: string[];
  };
  error?: string;
}

interface ExpertCrawlerSectionProps {
  onDataSelect?: (data: Partial<CrawlResult['data']>) => void;
}

export const ExpertCrawlerSection = ({ onDataSelect }: ExpertCrawlerSectionProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [crawlResult, setCrawlResult] = useState<CrawlResult | null>(null);
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);

  useEffect(() => {
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('key_value')
        .eq('name', 'firecrawl')
        .maybeSingle();

      if (data?.key_value) {
        setApiKey(data.key_value);
      }
    } catch (error) {
      console.error('Error loading API key:', error);
    }
  };

  const saveApiKey = async (key: string) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .upsert({ 
          name: 'firecrawl', 
          key_value: key 
        }, { 
          onConflict: 'name' // Specify the column name, not the constraint name
        });

      if (error) {
        console.error('Error saving API key:', error);
        toast({
          title: "Error",
          description: "Failed to save API key",
          variant: "destructive",
        });
        return false;
      }
      setApiKey(key);
      setShowApiKeyDialog(false);
      toast({
        title: "Success",
        description: "API key saved successfully",
      });
      return true;
    } catch (error) {
      console.error('Error saving API key:', error);
      toast({
        title: "Error",
        description: "Failed to save API key",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) {
      setShowApiKeyDialog(true);
      return;
    }

    setIsLoading(true);
    try {
      // Initialize Firecrawl with the API key
      const firecrawl = new (window as any).FirecrawlApp({ apiKey });
      
      const response = await firecrawl.searchExperts(searchQuery, {
        sources: ['wikipedia', 'linkedin', 'professional_websites'],
        includeImages: true,
        includeSocialLinks: true
      });

      if (response.success) {
        setCrawlResult({
          success: true,
          data: response.data
        });
        toast({
          title: "Success",
          description: "Found expert information",
        });
      } else {
        setCrawlResult({
          success: false,
          error: response.error || "Failed to find expert information"
        });
        toast({
          title: "Error",
          description: response.error || "Failed to find expert information",
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

      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Firecrawl API Key</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Enter your Firecrawl API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <Button 
              onClick={() => saveApiKey(apiKey)}
              className="w-full"
            >
              Save API Key
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {crawlResult && (
        <Card className="p-4">
          <h4 className="font-semibold mb-4">Search Results</h4>
          {crawlResult.success && crawlResult.data ? (
            <div className="space-y-4">
              {crawlResult.data.image && (
                <div className="flex justify-center">
                  <img 
                    src={crawlResult.data.image} 
                    alt={crawlResult.data.name} 
                    className="max-w-[200px] rounded-lg"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                {crawlResult.data.name && (
                  <div>
                    <h5 className="font-medium">Name</h5>
                    <p>{crawlResult.data.name}</p>
                  </div>
                )}
                
                {crawlResult.data.biography && (
                  <div>
                    <h5 className="font-medium">Biography</h5>
                    <p className="text-sm">{crawlResult.data.biography}</p>
                  </div>
                )}

                {crawlResult.data.socialLinks && Object.keys(crawlResult.data.socialLinks).length > 0 && (
                  <div>
                    <h5 className="font-medium">Social Links</h5>
                    <ul className="text-sm">
                      {Object.entries(crawlResult.data.socialLinks).map(([platform, url]) => (
                        <li key={platform} className="capitalize">
                          {platform}: {url}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <Button 
                onClick={() => handleSelectData(crawlResult.data)}
                className="w-full"
              >
                Use This Data
              </Button>
            </div>
          ) : (
            <p className="text-red-500">{crawlResult.error}</p>
          )}
        </Card>
      )}
    </div>
  );
};
