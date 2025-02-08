
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CrawlResult } from "./types";

interface SearchResultsProps {
  result: CrawlResult;
  onSelectData: (data: Partial<CrawlResult['data']>) => void;
}

export const SearchResults = ({ result, onSelectData }: SearchResultsProps) => {
  if (!result) return null;

  return (
    <Card className="p-4">
      <h4 className="font-semibold mb-4">Search Results</h4>
      {result.success && result.data ? (
        <div className="space-y-4">
          {result.data.image && (
            <div className="flex justify-center">
              <img 
                src={result.data.image} 
                alt={result.data.name} 
                className="max-w-[200px] rounded-lg"
              />
            </div>
          )}
          
          <div className="space-y-2">
            {result.data.name && (
              <div>
                <h5 className="font-medium">Name</h5>
                <p>{result.data.name}</p>
              </div>
            )}
            
            {result.data.biography && (
              <div>
                <h5 className="font-medium">Biography</h5>
                <p className="text-sm">{result.data.biography}</p>
              </div>
            )}

            {result.data.socialLinks && Object.keys(result.data.socialLinks).length > 0 && (
              <div>
                <h5 className="font-medium">Social Links</h5>
                <ul className="text-sm">
                  {Object.entries(result.data.socialLinks).map(([platform, url]) => (
                    <li key={platform} className="capitalize">
                      {platform}: {url}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <Button 
            onClick={() => onSelectData(result.data)}
            className="w-full"
          >
            Use This Data
          </Button>
        </div>
      ) : (
        <p className="text-red-500">{result.error}</p>
      )}
    </Card>
  );
};
