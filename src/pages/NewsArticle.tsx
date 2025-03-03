
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { RelatedNewsExperts } from "@/components/news/RelatedNewsExperts";
import { RelatedNewsLinks } from "@/components/news/RelatedNewsLinks";
import { NewsVideos } from "@/components/news/NewsVideos";
import type { Database } from "@/integrations/supabase/types";
import "../styles/news-article.css";

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
  
  console.log("NewsArticle rendering with window width:", window.innerWidth);

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

        return { ...articleData, experts: expertsData } as NewsArticle;
      }

      return articleData as NewsArticle;
    },
  });

  if (isLoading) {
    return (
      <div className="pt-8 lg:pt-12">
        <div className="x-container px-4 sm:px-6">
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
      <div className="pt-8 lg:pt-12">
        <div className="x-container px-4 sm:px-6">
          <h1 className="text-2xl font-bold mb-4">Article not found</h1>
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
      
      const filtered = article.video_links
        .filter((link): link is { title: string; url: string } =>
          link && typeof link === "object" && "title" in link && "url" in link &&
          typeof link.title === "string" && typeof link.url === "string"
        )
        .map(link => ({ title: link.title, url: link.url }))
        .filter(link => link.url.trim() !== "");
      
      console.log("Processed video links:", filtered);
      return filtered;
    } catch (error) {
      console.error("Error processing video links:", error);
      return [];
    }
  })();

  console.log("Video links count:", videoLinks.length, "Window width:", window.innerWidth);

  return (
    <div className="pt-6 lg:pt-12">
      <div className="x-container px-4 sm:px-5 lg:px-6">
        <div className="mb-6 lg:mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-text-light hover:text-primary mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
          <h1 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6 text-left">News</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr,3fr] gap-4 lg:gap-6">
          <article className="text-left w-full">
            <h2 className="text-2xl sm:text-2xl md:text-2xl lg:text-3xl font-bold mb-6 text-left">
              {article.title}
            </h2>
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

            {/* Mobile video carousel - only visible on mobile/tablet */}
            <div className="block lg:hidden my-6">
              <NewsVideos 
                videoLinks={videoLinks} 
                videoDescription={article.video_description}
                viewMode="mobile"
              />
            </div>

            <div
              className="prose prose-sm sm:prose-base md:prose-lg max-w-none mb-10 text-left"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {article.experts?.length > 0 && <RelatedNewsExperts experts={article.experts} />}
            {article.news_article_links?.length > 0 && (
              <RelatedNewsLinks links={article.news_article_links} />
            )}
          </article>

          {/* Desktop video section - only visible on desktop */}
          <div className="hidden lg:block border-l border-gray-300 pl-6 min-h-[50vh]">
            <NewsVideos 
              videoLinks={videoLinks} 
              videoDescription={article.video_description}
              viewMode="desktop" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsArticle;
