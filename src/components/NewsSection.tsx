
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

const NewsSection = () => {
  const { data: newsItems, isLoading } = useQuery({
    queryKey: ["news-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_articles")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(4);

      if (error) throw error;
      return data;
    },
  });

  // Fetch videos for the right column
  const { data: videos, isLoading: videosLoading } = useQuery({
    queryKey: ["news-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(4);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-secondary">
        <div className="w-full px-4 sm:px-6">
          <h2 className="text-3xl font-bold mb-10 text-center">Latest News</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="col-span-1 md:col-span-2 lg:col-span-2 space-y-12">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row md:items-center">
                      <div className="w-full md:w-2/5 lg:w-1/3">
                        <Skeleton className="h-72 sm:h-80 md:h-64 w-full" />
                      </div>
                      <div className="p-8 md:w-3/5 lg:w-2/3 space-y-4">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-3/4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="space-y-8">
              <h3 className="text-xl font-semibold mb-4">Latest Videos</h3>
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-0">
                    <Skeleton className="h-40 w-full" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-secondary">
      <div className="w-full px-4 sm:px-6">
        <h2 className="text-3xl font-bold mb-10 text-center">Latest News</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="col-span-1 md:col-span-2 lg:col-span-2 space-y-12">
            {newsItems?.map((item) => (
              <Link to={`/news/${item.id}`} key={item.id}>
                <Card className="overflow-hidden animate-fadeIn hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row md:items-center">
                      <div className="w-full md:w-2/5 lg:w-1/3 h-64 sm:h-72 md:h-80">
                        <img
                          src={item.image_url || "/placeholder.svg"}
                          alt={item.thumbnail_description || ""}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-6 sm:p-8 md:w-3/5 lg:w-2/3 text-left">
                        <h3 className="text-xl sm:text-2xl font-semibold text-text mb-3">
                          {item.title}
                        </h3>
                        <p className="text-base sm:text-lg text-text-light line-clamp-3 sm:line-clamp-4">
                          {item.summary}
                        </p>
                        <div className="mt-4 text-sm text-primary font-medium">
                          Read more
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4 text-left">Latest Videos</h3>
            {videos?.map((video) => (
              <Link to={`/explore/${video.id}`} key={video.id}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-0">
                    <div className="aspect-video bg-gray-100">
                      {video.thumbnail_url ? (
                        <img
                          src={video.thumbnail_url}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        video.video_url && video.video_url.includes('youtube.com') && (
                          <img
                            src={`https://img.youtube.com/vi/${video.video_url.split('v=')[1]?.split('&')[0]}/hqdefault.jpg`}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                        )
                      )}
                    </div>
                    <div className="p-4 text-left">
                      <h4 className="font-medium text-sm line-clamp-2">{video.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {new Date(video.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
            {videos?.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No videos available
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
