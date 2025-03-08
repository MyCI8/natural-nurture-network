
import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { NewsVideos } from '@/components/news/NewsVideos';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type VideoLink = { title: string; url: string };

const RightSection: React.FC = () => {
  const location = useLocation();
  const { id } = useParams<{ id?: string }>();
  const isNewsArticle = location.pathname.startsWith('/news/') && id;
  
  // Only fetch video data if we're on a news article page
  const { data: article } = useQuery({
    queryKey: ["right-section-article", id],
    queryFn: async () => {
      if (!isNewsArticle) return null;
      
      const { data, error } = await supabase
        .from("news_articles")
        .select("video_links, video_description")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!isNewsArticle,
  });
  
  // Process video links if available
  const videoLinks: VideoLink[] = React.useMemo(() => {
    if (!article?.video_links) return [];
    
    try {
      if (!Array.isArray(article.video_links)) {
        return [];
      }
      
      return article.video_links
        .filter(link => link && typeof link === 'object')
        .map(link => {
          const linkObj = typeof link === 'string' ? JSON.parse(link) : link;
          return {
            title: typeof linkObj.title === 'string' ? linkObj.title : '',
            url: typeof linkObj.url === 'string' ? linkObj.url : ''
          };
        })
        .filter(link => link.url.trim() !== '');
    } catch (error) {
      console.error("Error processing video links:", error);
      return [];
    }
  }, [article]);
  
  // Render based on current page context
  if (isNewsArticle && videoLinks.length > 0) {
    return (
      <div className="h-full py-6 pr-4">
        <NewsVideos 
          videoLinks={videoLinks}
          videoDescription={article?.video_description}
          isDesktop={true}
        />
      </div>
    );
  }
  
  // Default content for right section when no specific content is available
  return (
    <div className="px-4 py-6">
      <h3 className="text-lg font-medium mb-4">Suggestions For You</h3>
      <div className="space-y-4">
        <p className="text-sm text-text-light">
          Content will appear here based on what you're viewing.
        </p>
      </div>
    </div>
  );
};

export default RightSection;
