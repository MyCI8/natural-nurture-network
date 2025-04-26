import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import { useLayout } from '@/contexts/LayoutContext';
import Comments from '@/components/video/Comments';
import ProductLinksList from '@/components/video/ProductLinksList';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';

const RightSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const {
    showRightSection,
    setShowRightSection
  } = useLayout();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const isVideoDetailPage = location.pathname.includes('/explore/') && id;
  const isNewsPage = location.pathname.includes('/news');
  const {
    data: productLinks = []
  } = useQuery({
    queryKey: ['rightSectionProductLinks', id],
    queryFn: async () => {
      if (!id) return [];
      const {
        data,
        error
      } = await supabase.from('video_product_links').select('*').eq('video_id', id);
      if (error) {
        console.error("Error fetching product links:", error);
        return [];
      }
      return data || [];
    },
    enabled: !!isVideoDetailPage && !!id
  });
  const {
    data: videoData
  } = useQuery({
    queryKey: ['rightSectionVideo', id],
    queryFn: async () => {
      if (!id) return null;
      const {
        data,
        error
      } = await supabase.from('videos').select(`
          *,
          creator:creator_id (
            id,
            username,
            avatar_url,
            full_name
          )
        `).eq('id', id).single();
      if (error) {
        console.error("Error fetching video:", error);
        return null;
      }
      return data;
    },
    enabled: !!isVideoDetailPage && !!id
  });
  const {
    data: latestVideos = [],
    isLoading: isLoadingVideos
  } = useQuery({
    queryKey: ['latestNewsVideos'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('videos').select('*').eq('video_type', 'news').eq('show_in_latest', true).eq('status', 'published').order('created_at', {
        ascending: false
      }).limit(4);
      if (error) {
        console.error("Error fetching latest videos:", error);
        return [];
      }
      return data;
    },
    enabled: isNewsPage
  });

  const handleClose = () => {
    if (isVideoDetailPage) {
      navigate('/explore');
    } else {
      setShowRightSection(false);
    }
  };

  if (isNewsPage && showRightSection) {
    return <div ref={ref} className="right-section h-screen sticky top-0 w-full md:w-[350px] bg-white dark:bg-dm-background border-l border-gray-200 dark:border-gray-800 overflow-y-auto flex flex-col min-h-screen touch-manipulation" style={{
      minHeight: '100vh'
    }}>
        <div className="p-4 flex-1 flex flex-col">
          <h2 className="text-lg font-semibold mb-4 text-text-dark dark:text-dm-text">Latest Videos</h2>
          
          {isLoadingVideos ? <div className="space-y-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-lg h-36 animate-pulse"></div>)}
            </div> : latestVideos.length > 0 ? <div className="space-y-4">
              {latestVideos.map(video => <div key={video.id} className="border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/news/videos/${video.id}`)}>
                  <AspectRatio ratio={16 / 9} className="bg-gray-100 dark:bg-dm-mist">
                    {video.thumbnail_url ? <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                        <span className="text-gray-500 dark:text-gray-400">No thumbnail</span>
                      </div>}
                  </AspectRatio>
                  <div className="p-2">
                    <h3 className="text-sm font-medium line-clamp-2 text-text-dark dark:text-dm-text">{video.title}</h3>
                  </div>
                </div>)}
            </div> : <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No videos available
            </div>}
        </div>
      </div>;
  }

  if (isVideoDetailPage && showRightSection) {
    return <div ref={ref} className="right-section h-screen sticky top-0 w-full md:w-[350px] bg-white dark:bg-dm-background border-l border-gray-200 dark:border-gray-800 overflow-y-auto flex flex-col min-h-screen touch-manipulation" style={{
      minHeight: '100vh'
    }}>
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            {videoData && videoData.creator && (
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-3 border-2 border-gray-100 dark:border-gray-700">
                  {videoData.creator.avatar_url ? (
                    <AvatarImage src={videoData.creator.avatar_url} alt={videoData.creator.username || ''} />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {(videoData.creator.username || '?')[0]}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="font-medium text-base text-text-dark dark:text-dm-text">
                  {videoData.creator.username || 'Anonymous'}
                </span>
              </div>
            )}
          </div>

          <div className="mb-4 mt-3">
            <h2 className="text-lg font-semibold mb-3 text-text-dark dark:text-dm-text">Comments</h2>
            {id && <Comments videoId={id} currentUser={null} />}
          </div>
          
          <ProductLinksList productLinks={productLinks} />
        </div>
      </div>;
  }

  return <div ref={ref} className={cn("right-section h-screen sticky top-0 w-full md:w-[350px] bg-white dark:bg-dm-background border-l border-gray-200 dark:border-gray-800", !showRightSection ? 'hidden' : '')} style={{
    minHeight: '100vh'
  }}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-text-dark dark:text-dm-text">Right Section</h2>
          {!isNewsPage && <Button variant="ghost" size="icon" onClick={handleClose} className="text-gray-500 hover:bg-gray-100 dark:hover:bg-dm-mist rounded-full touch-manipulation">
              <X className="h-5 w-5" />
            </Button>}
        </div>
        <p className="text-gray-600 dark:text-dm-text-supporting">This is the content of the right section.</p>
      </div>
    </div>;
};

export default RightSection;
