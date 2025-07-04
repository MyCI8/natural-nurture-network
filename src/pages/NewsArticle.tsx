
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { RelatedNewsExperts } from "@/components/news/RelatedNewsExperts";
import { RelatedNewsLinks } from "@/components/news/RelatedNewsLinks";
import { NewsVideos } from "@/components/news/NewsVideos";
import { useBreakpoint } from "@/hooks/use-mobile";
import { useEffect } from "react";
import type { Database } from "@/integrations/supabase/types";
import "../styles/news-article.css";
import { useLayout } from "@/contexts/LayoutContext";
import { SafeHtml } from '@/utils/sanitizer';
import ErrorBoundary from '@/components/ErrorBoundary';

type Expert = Database["public"]["Tables"]["experts"]["Row"];
type NewsArticleLink = Database["public"]["Tables"]["news_article_links"]["Row"];
type VideoLink = { title: string; url: string };
type NewsArticle = Database["public"]["Tables"]["news_articles"]["Row"] & {
  experts?: Expert[];
  news_article_links?: NewsArticleLink[];
};

const NewsArticle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === 'mobile';
  
  // This ensures the layout context is properly set
  const { setLayoutMode, setShowRightSection } = useLayout();
  
  useEffect(() => {
    // Ensure the right layout mode is set for this page
    setLayoutMode('full');
    setShowRightSection(true);
    
    return () => {
      // Clean up when leaving the page
      setLayoutMode('default');
    };
  }, [setLayoutMode, setShowRightSection]);

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

      if (articleData.related_experts?.length > 0) {
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
      <div className="pt-4 sm:pt-8 lg:pt-12 news-article-container mx-auto">
        <div className="px-4 sm:px-6">
          <Skeleton className="h-7 sm:h-8 w-3/4 mb-4" />
          <Skeleton className="h-48 sm:h-64 w-full mb-6" />
          <div className="space-y-3 sm:space-y-4">
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
      <div className="pt-4 sm:pt-8 lg:pt-12 news-article-container mx-auto">
        <div className="px-4 sm:px-6">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 text-[#1A1F2C] dark:text-dm-text">Article not found</h1>
        </div>
      </div>
    );
  }

  const videoLinks: VideoLink[] = (() => {
    try {
      if (!Array.isArray(article.video_links)) {
        console.log("Video links is not an array:", article.video_links);
        return [];
      }
      
      console.log("Raw video links:", article.video_links);
      
      const links = article.video_links
        .filter(link => link && typeof link === 'object')
        .map(link => {
          const linkObj = typeof link === 'string' ? JSON.parse(link) : link;
          return {
            title: typeof linkObj.title === 'string' ? linkObj.title : '',
            url: typeof linkObj.url === 'string' ? linkObj.url : ''
          };
        })
        .filter(link => link.url.trim() !== '');
      
      console.log("Processed video links:", links);
      return links;
    } catch (error) {
      console.error("Error processing video links:", error);
      return [];
    }
  })();

  return (
    <div className="pt-4 sm:pt-6 lg:pt-12 news-article-content">
      <div className="px-4 sm:px-5 lg:px-0">
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-text-light hover:text-primary mb-3 sm:mb-4"
          >
            <ArrowLeft className="h-4 sm:h-5 w-4 sm:w-5 mr-2" />
            Back
          </button>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 lg:mb-6 text-left text-[#1A1F2C] dark:text-primary">News</h1>
        </div>

        <article className="w-full text-left">
          <h2 className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 text-left text-[#1A1F2C] dark:text-primary">
            {article.title}
          </h2>
          
          {article.main_image_url && (
            <figure className="mb-4 sm:mb-8">
              <img
                src={article.main_image_url}
                alt={article.main_image_description || ""}
                className="w-full rounded-lg"
                loading="lazy"
              />
              {article.main_image_description && (
                <figcaption className="mt-2 text-xs sm:text-sm text-text-light pl-2 sm:pl-4 italic">
                  {article.main_image_description}
                </figcaption>
              )}
            </figure>
          )}

          <ErrorBoundary level="component">
            <SafeHtml 
              html={article.content}
              className="prose prose-sm sm:prose-base md:prose-lg max-w-none mb-6 sm:mb-10 text-left text-[#333333] dark:text-dm-text"
            />
          </ErrorBoundary>

          {article.experts?.length > 0 && (
            <RelatedNewsExperts experts={article.experts} />
          )}

          {article.news_article_links?.length > 0 && (
            <RelatedNewsLinks links={article.news_article_links} />
          )}
        </article>

        {/* Show videos on mobile - the desktop videos are handled by RightSection */}
        {isMobile && videoLinks.length > 0 && (
          <div className="block lg:hidden my-4 sm:my-6">
            <NewsVideos 
              videoLinks={videoLinks}
              videoDescription={article.video_description}
              isDesktop={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsArticle;
