
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

interface Article {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ArticleGridProps {
  articles: Article[];
}

const ArticleGrid = ({ articles }: ArticleGridProps) => {
  const navigate = useNavigate();

  if (!articles.length) {
    return (
      <div className="text-center py-8 bg-muted/20 rounded-md">
        <p className="text-muted-foreground">No articles found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <Card key={article.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-0">
            <div className="aspect-video mb-0">
              <img
                src={article.image_url || "/placeholder.svg"}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-2 line-clamp-1">{article.title}</h3>
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {article.content.substring(0, 100)}...
              </p>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${
                  article.status === 'published' ? 'text-green-600' : 
                  article.status === 'submitted' ? 'text-blue-600' : 
                  'text-yellow-600'
                }`}>
                  {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/admin/news/${article.id}`)}
                >
                  Edit
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Last updated: {formatDate(article.updated_at)}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ArticleGrid;
