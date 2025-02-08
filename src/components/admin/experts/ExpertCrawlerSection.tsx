
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";

interface CrawlResult {
  success: boolean;
  data?: any;
  error?: string;
}

export const ExpertCrawlerSection = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [crawlResult, setCrawlResult] = useState<CrawlResult | null>(null);
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');

  const handleCrawl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) {
      toast({
        title: "Error",
        description: "Please enter your Firecrawl API key",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Initialize Firecrawl with the API key
      const firecrawl = new (window as any).FirecrawlApp({ apiKey });
      
      const response = await firecrawl.crawlUrl(url, {
        limit: 10,
        scrapeOptions: {
          formats: ['markdown', 'html'],
        }
      });

      if (response.success) {
        setCrawlResult({
          success: true,
          data: response.data
        });
        toast({
          title: "Success",
          description: "Website crawled successfully",
        });
      } else {
        setCrawlResult({
          success: false,
          error: response.error || "Failed to crawl website"
        });
        toast({
          title: "Error",
          description: response.error || "Failed to crawl website",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Crawl error:', error);
      toast({
        title: "Error",
        description: "Failed to crawl website",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Expert Web Crawler</h3>
      
      <form onSubmit={handleCrawl} className="space-y-4">
        <div>
          <Input
            type="password"
            placeholder="Enter your Firecrawl API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="mb-4"
          />
          <Input
            type="url"
            placeholder="Enter website URL (e.g., Wikipedia page)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Crawling..." : "Start Crawl"}
        </Button>
      </form>

      {crawlResult && (
        <Card className="p-4 mt-4">
          <h4 className="font-semibold mb-2">Crawl Results</h4>
          {crawlResult.success ? (
            <pre className="whitespace-pre-wrap overflow-auto max-h-96">
              {JSON.stringify(crawlResult.data, null, 2)}
            </pre>
          ) : (
            <p className="text-red-500">{crawlResult.error}</p>
          )}
        </Card>
      )}
    </div>
  );
};
