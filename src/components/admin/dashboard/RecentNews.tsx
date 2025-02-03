import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface RecentNewsProps {
  news: any[];
  isLoading: boolean;
}

const RecentNews = ({ news, isLoading }: RecentNewsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Recent News Articles</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {news?.map((article) => (
              <div key={article.id} className="flex items-center space-x-4">
                <div>
                  <p className="font-medium">{article.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(article.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentNews;