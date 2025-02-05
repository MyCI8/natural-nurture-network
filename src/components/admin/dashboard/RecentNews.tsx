import { useNavigate } from "react-router-dom";
import { Edit, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface RecentNewsProps {
  news: any[];
  isLoading: boolean;
}

const RecentNews = ({ news, isLoading }: RecentNewsProps) => {
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    if (status === "published") {
      return (
        <Badge className="bg-green-500">
          <CheckCircle className="w-3 h-3 mr-1" />
          Published
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        <Clock className="w-3 h-3 mr-1" />
        Draft
      </Badge>
    );
  };

  const handleArticleClick = (articleId: string) => {
    navigate(`/admin/news/${articleId}`);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Recent News Articles</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/admin/news")}
        >
          View All
        </Button>
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
              <div
                key={article.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                onClick={() => handleArticleClick(article.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleArticleClick(article.id);
                  }
                }}
              >
                <div className="space-y-1">
                  <p className="font-medium">{article.title}</p>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span>
                      {new Date(article.created_at).toLocaleDateString()}
                    </span>
                    {getStatusBadge(article.status)}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/admin/news/${article.id}`);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentNews;