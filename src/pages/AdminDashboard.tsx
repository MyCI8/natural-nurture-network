
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Leaf,
  Newspaper,
  UserCog,
  Apple,
  MessageSquare,
  ChevronRight,
  Heart,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import RecentNews from "@/components/admin/dashboard/RecentNews";
import RecentSymptoms from "@/components/admin/dashboard/RecentSymptoms";
import PendingHealthConcerns from "@/components/admin/dashboard/PendingHealthConcerns";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const [
        usersCount, 
        remediesCount, 
        expertsCount, 
        commentsCount, 
        symptoms, 
        news
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact" }),
        supabase.from("remedies").select("*", { count: "exact" }),
        supabase.from("experts").select("*", { count: "exact" }),
        supabase.from("comments").select("*", { count: "exact" }),
        supabase.rpc('get_top_symptoms', { limit_count: 5 }),
        supabase
          .from("news_articles")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      // Mock pending health concerns count
      const pendingHealthConcerns = 2; // Parasites + Heavy Metal Detox

      return {
        users: usersCount.count || 0,
        remedies: remediesCount.count || 0,
        experts: expertsCount.count || 0,
        comments: commentsCount.count || 0,
        symptoms: symptoms.data || [],
        recentNews: news.data || [],
        healthConcerns: 15, // Total approved health concerns
        pendingHealthConcerns: pendingHealthConcerns,
      };
    },
  });

  const statsCards = [
    { title: "Total Users", value: stats?.users || 0, icon: Users, path: "/admin/users" },
    { title: "Total Remedies", value: stats?.remedies || 0, icon: Leaf, path: "/admin/remedies" },
    { title: "Total Experts", value: stats?.experts || 0, icon: UserCog, path: "/admin/manage-experts" },
    { 
      title: "Health Concerns", 
      value: stats?.healthConcerns || 0, 
      icon: Heart,
      path: "/admin/health-concerns",
      badge: stats?.pendingHealthConcerns ? {
        text: `${stats.pendingHealthConcerns} pending`,
        variant: "destructive" as const
      } : undefined
    },
    { title: "Total Comments", value: stats?.comments || 0, icon: MessageSquare },
  ];

  const quickLinks = [
    {
      title: "Manage Users",
      description: "Manage user roles and permissions",
      icon: Users,
      path: "/admin/users",
    },
    {
      title: "Manage Experts",
      description: "Add, edit, or remove expert profiles",
      icon: UserCog,
      path: "/admin/manage-experts",
    },
    {
      title: "Manage Remedies",
      description: "Create and update natural remedies",
      icon: Leaf,
      path: "/admin/remedies",
    },
    {
      title: "Manage News",
      description: "Publish and edit news articles",
      icon: Newspaper,
      path: "/admin/news",
    },
    {
      title: "Manage Ingredients",
      description: "Add and update remedy ingredients",
      icon: Apple,
      path: "/admin/ingredients",
    },
    {
      title: "Manage Health Concerns",
      description: "Manage health concerns and approve suggestions",
      icon: Heart,
      path: "/admin/health-concerns",
      badge: stats?.pendingHealthConcerns ? {
        text: stats.pendingHealthConcerns.toString(),
        variant: "destructive" as const
      } : undefined
    },
  ];

  const handleCardClick = (path?: string) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {statsCards.map((stat) => (
            <Card 
              key={stat.title}
              className={stat.path ? "cursor-pointer hover:bg-accent/50 transition-colors" : ""}
              onClick={() => handleCardClick(stat.path)}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                  {stat.badge && (
                    <Badge variant={stat.badge.variant} className="text-xs">
                      {stat.badge.text}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">{stat.value}</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pending Health Concerns - Priority Section */}
        <div className="mb-8">
          <PendingHealthConcerns />
        </div>

        {/* Quick Links */}
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {quickLinks.map((link) => (
            <Card
              key={link.title}
              className="hover:bg-accent transition-colors cursor-pointer"
              onClick={() => navigate(link.path)}
            >
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center gap-2">
                    <link.icon className="h-6 w-6" />
                    {link.badge && (
                      <Badge variant={link.badge.variant} className="text-xs">
                        {link.badge.text}
                      </Badge>
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{link.title}</CardTitle>
                    <CardDescription>{link.description}</CardDescription>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Dashboard Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          <RecentNews news={stats?.recentNews || []} isLoading={isLoading} />
          <RecentSymptoms symptoms={stats?.symptoms || []} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
