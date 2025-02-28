
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { RelatedNewsExperts } from "@/components/news/RelatedNewsExperts";
import { RelatedNewsLinks } from "@/components/news/RelatedNewsLinks";
import { NewsVideos } from "@/components/news/NewsVideos";
import { useIsMobile } from "@/hooks/use-mobile";
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
  const isMobile = useIsMobile();

  const { data: article, isLoading } = useQuery({
    queryKey: ["news-article", id],
    queryFn: async () => {
      const { data: articleData, error: articleError } = await supabase
        .from("news_articles")
        .select("*, news_article_links(*)")
        .eq("id", id)
        .single();

      if (articleError) {
        console.error("Error fetching article:", articleError);
        throw articleError;
      }

      if (articleData.related_experts && articleData.related_experts.length > 0) {
        const { data: expertsData, error: expertsError } = await supabase
          .from("experts")
          .select("*")
          .in("id", articleData.related_experts);

        if (expertsError) {
          console.error("Error fetching experts:", expertsError);
          throw expertsError;
        }
        
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
      <div className="pt-12">
        <div className="container mx-auto px-4 sm:px-6">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-64 w-full mb-6" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="pt-12">
        <div className="container mx-auto px-4 sm:px-6">
          <h1 className="text-2xl font-bold mb-4">Article not found</h1>
        </div>
      </div>
    );
  }

  // Process video links and ensure they are valid
  const videoLinks: VideoLink[] = (() => {
    try {
      if (!Array.isArray(article.video_links)) {
        console.log("Video links is not an array:", article.video_links);
        return [];
      }
      
      // Filter out invalid entries and ensure correct structure
      return article.video_links
        .filter(link => link && typeof link === 'object')
        .map(link => ({
          title: typeof link.title === 'string' ? link.title : '',
          url: typeof link.url === 'string' ? link.url : ''
        }))
        .filter(link => link.url.trim() !== ''); // Remove empty URLs
    } catch (error) {
      console.error("Error processing video links:", error);
      return [];
    }
  })();

  console.log("Video Links:", videoLinks);

  // Content wrapper class based on mobile/desktop view
  const contentWrapperClass = isMobile 
    ? "flex flex-col"
    : "grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6 lg:gap-8 relative";

  // Article wrapper class based on mobile/desktop view
  const articleWrapperClass = isMobile
    ? "w-full max-w-xl mx-auto"
    : "text-left w-full max-w-3xl";

  return (
    <div className="pt-12">
      <div className="container mx-auto px-4 sm:px-6 overflow-hidden">
        <div className="mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-text-light hover:text-primary mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
          <h1 className="text-2xl font-bold mb-6">News</h1>
        </div>

        <div className={contentWrapperClass}>
          <article className={articleWrapperClass}>
            <h2 className="text-2xl sm:text-2xl md:text-2xl lg:text-3xl font-bold mb-6">{article.title}</h2>
            
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

            {/* First half of article content on mobile */}
            {isMobile && (
              <div 
                className="prose prose-sm sm:prose-base max-w-none mb-8"
                dangerouslySetInnerHTML={{ 
                  __html: article.content.substring(0, Math.floor(article.content.length / 2)) 
                }}
              />
            )}

            {/* Videos Section - In the middle on mobile */}
            {isMobile && videoLinks.length > 0 && (
              <div className="my-8">
                <NewsVideos 
                  videoLinks={videoLinks}
                  videoDescription={article.video_description} 
                />
              </div>
            )}

            {/* Full content on desktop, second half on mobile */}
            <div 
              className="prose prose-sm sm:prose-base md:prose-lg max-w-none mb-12"
              dangerouslySetInnerHTML={{ 
                __html: isMobile 
                  ? article.content.substring(Math.floor(article.content.length / 2)) 
                  : article.content 
              }}
            />

            {/* Related Experts Section */}
            {article.experts && article.experts.length > 0 && (
              <RelatedNewsExperts experts={article.experts} />
            )}

            {/* Related Links Section */}
            {article.news_article_links && article.news_article_links.length > 0 && (
              <RelatedNewsLinks links={article.news_article_links} />
            )}
          </article>

          {/* Vertical Separator - Visible on large screens only */}
          {!isMobile && (
            <div className="hidden lg:block border-l border-gray-300 absolute h-full left-[66.66%] top-0 -z-10"></div>
          )}

          {/* Videos Section - On the right on desktop */}
          {!isMobile && (
            <div className="lg:pl-6">
              <NewsVideos 
                videoLinks={videoLinks}
                videoDescription={article.video_description} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsArticle;
