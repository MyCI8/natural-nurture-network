
export interface CrawlResult {
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

export interface ExpertCrawlerProps {
  onDataSelect?: (data: Partial<CrawlResult['data']>) => void;
}
