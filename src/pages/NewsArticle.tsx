
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { RelatedNewsExperts } from "@/components/news/RelatedNewsExperts";
import { RelatedNewsLinks } from "@/components/news/RelatedNewsLinks";
import { NewsVideos } from "@/components/news/NewsVideos";
import type { Database } from "@/integrations/supabase/types";

type Expert = Database["public"]["Tables"]["experts"]["Row"];
type NewsArticleLink = Database["public"]["Tables"]["news_article_links"]["Row"];
type VideoLink = {
  title: string;
  url: string;
};
type NewsArticle = Database["public"]["Tables"]["news_articles"]["Row"] & {
  experts?: Expert[];
  news_article_links?: NewsArticleLink[];
};

const NewsArticle = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: article, isLoading } = useQuery({
    queryKey: ["news-article", id],
    queryFn: async () => {
      const { data: articleData, error: articleError } = await supabase
        .from("news_articles")
        .select("*, news_article_links(*)")
        .eq("id", id)
        .single();

      if (articleError) throw articleError;

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
      <div className="max-w-7xl mx-auto px-1 sm:px-2 py-20">
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
      <div className="max-w-7xl mx-auto px-1 sm:px-2 py-20">
        <h1 className="text-2xl font-bold mb-4">Article not found</h1>
      </div>
    );
  }

  // Safely transform video_links to the correct type
  const videoLinks: VideoLink[] = Array.isArray(article.video_links) 
    ? article.video_links.map((link: any) => ({
        title: typeof link.title === 'string' ? link.title : '',
        url: typeof link.url === 'string' ? link.url : ''
      }))
    : [];

  return (
    <div className="max-w-7xl mx-auto px-1 sm:px-2 py-20">
      <div className="mb-8">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-text-light hover:text-primary mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>
        <h1 className="text-3xl font-bold mb-6">News</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,1fr] gap-8">
        <article className="text-left">
          <h2 className="text-2xl font-bold mb-6">{article.title}</h2>
          
          {article.main_image_url && (
            <figure className="mb-8">
              <img
                src={article.main_image_url}
                alt={article.main_image_description || ""}
                className="w-full rounded-lg"
              />
              {article.main_image_description && (
                <figcaption className="mt-2 text-sm text-text-light pl-4 italic">
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
          {article.experts && <RelatedNewsExperts experts={article.experts} />}

          {/* Related Links Section */}
          {article.news_article_links && <RelatedNewsLinks links={article.news_article_links} />}
        </article>

        {/* Videos Section */}
        <NewsVideos 
          videoLinks={videoLinks}
          videoDescription={article.video_description} 
        />
      </div>
    </div>
  );
};

export default NewsArticle;
