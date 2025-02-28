
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
  if (!videoLinks?.length && !videoDescription) {
    console.log("No video links or description provided");
    return null;
  }

  console.log("Rendering videos:", videoLinks.length); // Debug log

  return (
    <aside className="lg:sticky lg:top-8 w-full">
      <h2 className="text-xl sm:text-xl md:text-xl lg:text-2xl font-semibold mb-4">Videos</h2>
      {videoDescription && (
        <p className="text-text-light mb-6 text-xs sm:text-xs md:text-sm lg:text-base">{videoDescription}</p>
      )}
      <div className="space-y-6">
        {Array.isArray(videoLinks) && videoLinks.map((video: VideoLink, index: number) => {
          const videoId = getYouTubeVideoId(video.url);
          if (!videoId) {
            console.log("Invalid video URL:", video.url);
            return null;
          }
          
          return (
            <div key={index} className="mb-6">
              <div className="w-full">
                <div className="relative aspect-video w-full sm:w-[200px] md:w-[240px] lg:w-[320px] max-w-full overflow-hidden rounded-lg shadow-lg">
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute top-0 left-0 w-full h-full border-0"
                  />
                </div>
              </div>
              <h3 className="font-medium text-base sm:text-base md:text-lg lg:text-xl text-text line-clamp-2 mt-2">
                {video.title}
              </h3>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
