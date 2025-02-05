import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

interface MediaLinks {
  youtube_videos?: string[];
  podcasts?: string[];
  news_articles?: string[];
  research_papers?: string[];
}

interface ExpertMediaSectionProps {
  mediaLinks: MediaLinks;
}

export const ExpertMediaSection = ({ mediaLinks }: ExpertMediaSectionProps) => {
  const hasMedia = Object.values(mediaLinks || {}).some(
    (links) => Array.isArray(links) && links.length > 0
  );

  if (!hasMedia) return null;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8">Media & Interviews</h2>
        <div className="space-y-8">
          {mediaLinks.youtube_videos?.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Videos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mediaLinks.youtube_videos.map((videoUrl, index) => (
                  <div key={index} className="aspect-video">
                    <iframe
                      src={videoUrl}
                      title={`Expert video ${index + 1}`}
                      className="w-full h-full rounded-lg"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {(mediaLinks.podcasts?.length > 0 ||
            mediaLinks.news_articles?.length > 0 ||
            mediaLinks.research_papers?.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mediaLinks.podcasts?.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Podcasts</h3>
                    <ul className="space-y-3">
                      {mediaLinks.podcasts.map((url, index) => (
                        <li key={index}>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-primary hover:underline"
                          >
                            <span className="mr-2">Listen to Episode</span>
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {mediaLinks.news_articles?.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">News Articles</h3>
                    <ul className="space-y-3">
                      {mediaLinks.news_articles.map((url, index) => (
                        <li key={index}>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-primary hover:underline"
                          >
                            <span className="mr-2">Read Article</span>
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {mediaLinks.research_papers?.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Research Papers</h3>
                    <ul className="space-y-3">
                      {mediaLinks.research_papers.map((url, index) => (
                        <li key={index}>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-primary hover:underline"
                          >
                            <span className="mr-2">View Paper</span>
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};