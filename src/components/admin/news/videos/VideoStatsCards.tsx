
import React from 'react';
import { Video, Clock, ShoppingCart, PlayCircle } from 'lucide-react';
import { Video as VideoType } from '@/types/video';

interface VideoStatsCardsProps {
  videos: VideoType[];
}

const VideoStatsCards = ({ videos }: VideoStatsCardsProps) => {
  // Calculate statistics
  const totalVideos = videos.length;
  const totalViews = videos.reduce((sum, video) => sum + (video.views_count || 0), 0);
  
  // Count videos with product links
  const videosWithLinks = videos.filter(video => 
    (video as any).product_links_count && (video as any).product_links_count > 0
  ).length;
  
  // Count published videos
  const publishedVideos = videos.filter(video => video.status === 'published').length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard 
        title="Total Videos" 
        value={totalVideos.toString()} 
        description={`${publishedVideos} published`}
        icon={<Video className="h-5 w-5 text-muted-foreground" />}
      />
      
      <StatCard 
        title="Total Views" 
        value={totalViews.toLocaleString()} 
        description="All videos combined"
        icon={<PlayCircle className="h-5 w-5 text-muted-foreground" />}
      />
      
      <StatCard 
        title="With Product Links" 
        value={videosWithLinks.toString()} 
        description={`${(videosWithLinks / totalVideos * 100 || 0).toFixed(0)}% of videos`}
        icon={<ShoppingCart className="h-5 w-5 text-muted-foreground" />}
      />
      
      <StatCard 
        title="Average Age" 
        value={calculateAverageAge(videos)}
        description="Since creation"
        icon={<Clock className="h-5 w-5 text-muted-foreground" />}
      />
    </div>
  );
};

const StatCard = ({ 
  title, 
  value, 
  description, 
  icon 
}: { 
  title: string; 
  value: string; 
  description: string; 
  icon: React.ReactNode;
}) => {
  return (
    <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {icon}
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
};

// Helper function to calculate average age of videos
const calculateAverageAge = (videos: VideoType[]): string => {
  if (!videos.length) return "N/A";
  
  const now = new Date();
  const totalDays = videos.reduce((sum, video) => {
    const createdAt = new Date(video.created_at || now);
    const diffTime = Math.abs(now.getTime() - createdAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return sum + diffDays;
  }, 0);
  
  const averageDays = Math.round(totalDays / videos.length);
  
  if (averageDays > 30) {
    const months = Math.floor(averageDays / 30);
    return `${months} month${months > 1 ? 's' : ''}`;
  }
  
  return `${averageDays} day${averageDays !== 1 ? 's' : ''}`;
};

export default VideoStatsCards;
