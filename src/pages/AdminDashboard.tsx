
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Leaf,
  Newspaper,
  UserCog,
  Apple,
  MessageSquare,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import StatsGrid from "@/components/admin/dashboard/StatsGrid";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const [
        usersCount,
        remediesCount,
        expertsCount,
        pendingCommentsCount,
        ingredientsCount,
        newsCount,
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact" }),
        supabase.from("remedies").select("*", { count: "exact" }).eq("status", "published"),
        supabase.from("experts").select("*", { count: "exact" }),
        supabase.from("comments").select("*", { count: "exact" }).eq("status", "pending"),
        supabase.from("ingredients").select("*", { count: "exact" }),
        supabase.from("news_articles").select("*", { count: "exact" }).eq("status", "published"),
      ]);

      return {
        users: usersCount.count || 0,
        remedies: remediesCount.count || 0,
        experts: expertsCount.count || 0,
        pendingComments: pendingCommentsCount.count || 0,
        ingredients: ingredientsCount.count || 0,
        news: newsCount.count || 0,
      };
    },
  });

  const quickLinks = [
    {
      title: "Remedies",
      description: `${stats?.remedies || 0} Active remedies`,
      icon: Leaf,
      path: "/admin/remedies",
    },
    {
      title: "Ingredients",
      description: `${stats?.ingredients || 0} Available ingredients`,
      icon: Apple,
      path: "/admin/ingredients",
    },
    {
      title: "Pending Comments",
      description: `${stats?.pendingComments || 0} Awaiting moderation`,
      icon: MessageSquare,
      path: "/admin/comments",
    },
    {
      title: "Recent News",
      description: `${stats?.news || 0} Articles published`,
      icon: Newspaper,
      path: "/admin/news",
    },
    {
      title: "Experts",
      description: `${stats?.experts || 0} Medical experts`,
      icon: UserCog,
      path: "/admin/manage-experts",
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <StatsGrid stats={stats} isLoading={isLoading} />

        {/* Quick Links */}
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickLinks.map((link) => (
            <Card
              key={link.title}
              className="hover:bg-accent transition-colors cursor-pointer"
              onClick={() => navigate(link.path)}
            >
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center space-x-4">
                  <link.icon className="h-6 w-6" />
                  <div>
                    <CardTitle className="text-lg">{link.title}</CardTitle>
                    <CardDescription>{link.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
