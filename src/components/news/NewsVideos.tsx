
interface VideoLink {
  title: string;
  url: string;
}

interface NewsVideosProps {
  videoLinks: VideoLink[];
  videoDescription?: string;
}

// Helper function to extract YouTube video ID
const getYouTubeVideoId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export const NewsVideos = ({ videoLinks, videoDescription }: NewsVideosProps) => {
  if (!videoLinks?.length && !videoDescription) return null;

  return (
    <aside className="lg:sticky lg:top-8 w-full">
      <h2 className="text-2xl font-semibold">Videos</h2>
      {videoDescription && (
        <p className="text-text-light mb-6">{videoDescription}</p>
      )}
      <div className="space-y-8">
        {Array.isArray(videoLinks) && videoLinks.map((video: VideoLink, index: number) => {
          const videoId = getYouTubeVideoId(video.url);
          if (!videoId) return null;
          
          return (
            <div key={index} className="space-y-4">
              <div className="relative aspect-video w-full">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
                />
              </div>
              <h3 className="font-medium text-xl text-text line-clamp-2">
                {video.title}
              </h3>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
