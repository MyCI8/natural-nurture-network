
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Newspaper, Video, BarChart2, ListFilter, Calendar, Settings, Bookmark } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import NewsStatsCard from "./news/dashboard/NewsStatsCard";
import RecentActivity from "./news/dashboard/RecentActivity";
import QuickActions from "./news/dashboard/QuickActions";
import ContentOverview from "./news/dashboard/ContentOverview";

const ManageNews = () => {
  const navigate = useNavigate();
  
    queryKey: ["news-stats"],
    queryFn: async () => {
      // Get article count
      const { count: articleCount, error: articleError } = await supabase
        .from("news_articles")
        .select("*", { count: "exact", head: true });
      
      // Get published article count
      const { count: publishedCount, error: publishedError } = await supabase
        .from("news_articles")
        .select("*", { count: "exact", head: true })
        .eq("status", "published");
      
      // Get video count
      const { count: videoCount, error: videoError } = await supabase
        .from("videos")
        .select("*", { count: "exact", head: true })
        .eq("video_type", "news");
      
      // Get latest videos count
      const { count: latestCount, error: latestError } = await supabase
        .from("videos")
        .select("*", { count: "exact", head: true })
        .eq("video_type", "news")
        .eq("show_in_latest", true);
      
      if (articleError || publishedError || videoError || latestError) {
        console.error("Error fetching stats", articleError || publishedError || videoError || latestError);
      }
      
      return {
        articles: articleCount || 0,
        publishedArticles: publishedCount || 0,
        videos: videoCount || 0,
        latestVideos: latestCount || 0,
      };
    },
  });
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">News Management</h1>
          <p className="text-muted-foreground">
            Manage your news content, articles, videos and more.
          </p>
        </div>
        <Tabs defaultValue="dashboard" className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:grid-cols-4">
            <TabsTrigger value="dashboard" onClick={() => {}}>
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="articles" onClick={() => navigate("/admin/news/articles")}>
              Articles
            </TabsTrigger>
            <TabsTrigger value="videos" onClick={() => navigate("/admin/news/videos")}>
              Videos
            </TabsTrigger>
            <TabsTrigger value="settings" onClick={() => navigate("/admin/news/settings")}>
              Settings
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <NewsStatsCard 
          title="Total Articles" 
          value={stats?.articles || 0}
          description={`${stats?.publishedArticles || 0} published`}
          icon={<Newspaper className="h-5 w-5 text-muted-foreground" />}
          trend={"+12%"}
          statusColor="text-green-600"
          onClick={() => navigate("/admin/news/articles")}
        />
        
        <NewsStatsCard 
          title="News Videos" 
          value={stats?.videos || 0}
          description={`${stats?.latestVideos || 0} in Latest Videos`}
          icon={<Video className="h-5 w-5 text-muted-foreground" />}
          trend={"+5%"}
          statusColor="text-green-600"
          onClick={() => navigate("/admin/news/videos")}
        />
        
        <NewsStatsCard 
          title="Avg. Engagement" 
          value="3.2m"
          description="Views across content"
          icon={<BarChart2 className="h-5 w-5 text-muted-foreground" />}
          trend={"-2%"}
          statusColor="text-red-600"
        />
        
        <NewsStatsCard 
          title="Scheduled" 
          value="12"
          description="Upcoming publications"
          icon={<Calendar className="h-5 w-5 text-muted-foreground" />}
          trend={"+3"}
          statusColor="text-green-600"
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-7">
        <ContentOverview className="md:col-span-4" />
        <div className="space-y-4 md:col-span-3">
          <QuickActions />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};

export default ManageNews;
