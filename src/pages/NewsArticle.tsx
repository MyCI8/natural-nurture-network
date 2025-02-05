import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import type { Database } from "@/integrations/supabase/types";

type Expert = Database["public"]["Tables"]["experts"]["Row"];
type NewsArticleLink = Database["public"]["Tables"]["news_article_links"]["Row"];
type NewsArticle = Database["public"]["Tables"]["news_articles"]["Row"] & {
  experts?: Expert[];
  news_article_links?: NewsArticleLink[];
};

const NewsArticle = () => {
  const { id } = useParams();

  const { data: article, isLoading } = useQuery({
    queryKey: ["news-article", id],
    queryFn: async () => {
      // First, fetch the article
      const { data: articleData, error: articleError } = await supabase
        .from("news_articles")
        .select("*, news_article_links(*)")
        .eq("id", id)
        .single();

      if (articleError) throw articleError;

      // If there are related experts, fetch their details
      if (articleData.related_experts && articleData.related_experts.length > 0) {
        const { data: expertsData, error: expertsError } = await supabase
          .from("experts")
          .select("*")
          .in("id", articleData.related_experts);

        if (expertsError) throw expertsError;
        
        return {
          ...articleData,
          experts: expertsData
        } as NewsArticle;
      }

      return articleData as NewsArticle;
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-64 w-full mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-bold mb-4">Article not found</h1>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <article className="text-left">
        <h1 className="text-3xl font-bold mb-6">{article.title}</h1>
        {article.main_image_url && (
          <figure className="mb-8">
            <img
              src={article.main_image_url}
              alt={article.main_image_description || ""}
              className="w-full rounded-lg"
            />
            {article.main_image_description && (
              <figcaption className="mt-2 text-sm text-text-light text-center italic">
                {article.main_image_description}
              </figcaption>
            )}
          </figure>
        )}
        <div 
          className="prose prose-lg max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Related Experts Section */}
        {article.experts && article.experts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Related Experts</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {article.experts.map((expert) => (
                <Link to={`/experts/${expert.id}`} key={expert.id}>
                  <Card className="hover:shadow-lg transition-shadow duration-200">
                    <CardContent className="p-3">
                      {expert.image_url ? (
                        <img
                          src={expert.image_url}
                          alt={expert.full_name}
                          className="w-16 h-16 rounded-full mx-auto mb-2 object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-2 flex items-center justify-center">
                          <span className="text-2xl text-text-light">
                            {expert.full_name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <h3 className="font-semibold text-sm text-center line-clamp-1">{expert.full_name}</h3>
                      <p className="text-text-light text-xs text-center line-clamp-1">{expert.title}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Related Links Section */}
        {article.news_article_links && article.news_article_links.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-6">Related Links</h2>
            <div className="space-y-4">
              {article.news_article_links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-secondary rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-shrink-0 w-16 h-16 bg-primary/10 rounded flex items-center justify-center">
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${new URL(link.url).hostname}&sz=64`}
                      alt=""
                      className="w-8 h-8"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg";
                      }}
                    />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="font-medium text-lg text-text truncate">{link.title}</h3>
                    <p className="text-sm text-text-light truncate">{link.url}</p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
};

export default NewsArticle;