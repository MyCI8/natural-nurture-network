import React from 'react';
import { Video } from '@/types/video';
import InstagramVideoFeed from '@/components/video/InstagramVideoFeed';

interface ExploreVideoFeedProps {
  type?: 'explore' | 'news' | 'general';
  className?: string;
  onVideoClick?: (video: Video) => void;
}

const ExploreVideoFeed: React.FC<ExploreVideoFeedProps> = (props) => {
  return <InstagramVideoFeed {...props} />;
};

export default ExploreVideoFeed;