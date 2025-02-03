import { useQuery } from "@tanstack/react-query";
import { Users, BookOpen, MessageSquare, Newspaper, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

const Admin = () => {
  // Fetch dashboard statistics
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const [usersCount, remediesCount, pendingCommentsCount, newsArticles] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact" }),
        supabase.from("remedies").select("id", { count: "exact" }),
        supabase.from("comments").select("id", { count: "exact" }).eq("status", "pending"),
        supabase.from("news_articles").select("*").order("created_at", { ascending: false }).limit(5),
      ]);

      return {
        users: usersCount.count || 0,
        remedies: remediesCount.count || 0,
        pendingComments: pendingCommentsCount.count || 0,
        recentNews: newsArticles.data || [],
      };
    },
  });

  // Fetch recent activity
  const { data: recentActivity, isLoading: isLoadingActivity } = useQuery({
    queryKey: ["recentActivity"],
    queryFn: async () => {
      const { data: comments } = await supabase
        .from("comments")
        .select(`
          id,
          content,
          status,
          created_at,
          profiles:user_id (full_name)
        `)
        .order("created_at", { ascending: false })
        .limit(5);

      return comments || [];
    },
  });

  const statCards = [
    {
      title: "Total Users",
      value: stats?.users || 0,
      icon: Users,
      description: "Registered users",
    },
    {
      title: "Published Remedies",
      value: stats?.remedies || 0,
      icon: BookOpen,
      description: "Active remedies",
    },
    {
      title: "Pending Comments",
      value: stats?.pendingComments || 0,
      icon: MessageSquare,
      description: "Awaiting moderation",
    },
    {
      title: "Recent News",
      value: stats?.recentNews?.length || 0,
      icon: Newspaper,
      description: "Articles published",
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoadingStats ? (
                  <Skeleton className="h-7 w-[100px]" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent News */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Recent News Articles</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {stats?.recentNews.map((article) => (
                    <div key={article.id} className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">{article.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(article.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingActivity ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentActivity?.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>{activity.profiles?.full_name || "Anonymous"}</TableCell>
                        <TableCell>Added a comment</TableCell>
                        <TableCell>
                          {new Date(activity.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;