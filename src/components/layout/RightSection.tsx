
import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useLayout } from '@/contexts/LayoutContext';
import Comments from '@/components/video/Comments';
import ProductLinksList from '@/components/video/ProductLinksList';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const RightSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { showRightSection, setShowRightSection } = useLayout();
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setShowRightSection(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, setShowRightSection]);
  
  const { id } = useParams<{ id: string }>();
  const isVideoDetailPage = window.location.pathname.includes('/explore/') && id;
  
  // Only fetch product links when on video detail page
  const { data: productLinks = [] } = useQuery({
    queryKey: ['rightSectionProductLinks', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('video_product_links')
        .select('*')
        .eq('video_id', id);
        
      if (error) {
        console.error("Error fetching product links:", error);
        return [];
      }
      return data || [];
    },
    enabled: !!isVideoDetailPage && !!id
  });
  
  // Only fetch video data when on video detail page
  const { data: videoData } = useQuery({
    queryKey: ['rightSectionVideo', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        console.error("Error fetching video:", error);
        return null;
      }
      return data;
    },
    enabled: !!isVideoDetailPage && !!id
  });
  
  // Only show comments and product links if we're on the video detail page
  if (isVideoDetailPage && showRightSection) {
    return (
      <div ref={ref} className="right-section h-screen w-full md:w-[350px] bg-white dark:bg-dm-background border-l border-gray-200 dark:border-gray-800 overflow-y-auto">
        <div className="p-4">
          {videoData && (
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2 dark:text-dm-text">{videoData.title || 'Video'}</h2>
              <p className="text-gray-600 dark:text-dm-text-supporting">{videoData.description}</p>
            </div>
          )}
          
          <h2 className="text-lg font-semibold mb-3 dark:text-dm-text">Comments</h2>
          {id && <Comments videoId={id} currentUser={null} />}
          
          <ProductLinksList productLinks={productLinks} />
        </div>
      </div>
    );
  }
  
  // Return the original content for non-video pages
  return (
    <div ref={ref} className={cn("right-section h-screen w-full md:w-[350px] bg-white dark:bg-dm-background border-l border-gray-200 dark:border-gray-800", !showRightSection ? 'hidden' : '')}>
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4 dark:text-dm-text">Right Section</h2>
        <p className="text-gray-600 dark:text-dm-text-supporting">This is the content of the right section.</p>
      </div>
    </div>
  );
};

export default RightSection;
