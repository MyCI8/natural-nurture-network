
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

const ManageNews = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "title">("recent");
  const [currentTab, setCurrentTab] = useState<"all" | "draft" | "published" | "submitted">("all");

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["admin-news", searchQuery, currentTab, sortBy],
    queryFn: async () => {
      let query = supabase
        .from("news_articles")
        .select("*");

      if (searchQuery) {
        query = query.ilike("title", `%${searchQuery}%`);
      }

      if (currentTab !== "all") {
        query = query.eq("status", currentTab);
      }

      if (sortBy === "title") {
        query = query.order("title", { ascending: true });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage News Articles</h2>
        <Button onClick={() => navigate("/admin/news/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add New Article
        </Button>
      </div>

      <div className="space-y-6">
        <Tabs defaultValue="all" value={currentTab} onValueChange={(value: "all" | "draft" | "published" | "submitted") => setCurrentTab(value)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Articles</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="submitted">Submitted</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="relative">
                <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>

              <Select
                value={sortBy}
                onValueChange={(value: "recent" | "title") => setSortBy(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="all" className="mt-6">
            <ArticleGrid articles={articles} navigate={navigate} />
          </TabsContent>
          <TabsContent value="draft" className="mt-6">
            <ArticleGrid articles={articles} navigate={navigate} />
          </TabsContent>
          <TabsContent value="published" className="mt-6">
            <ArticleGrid articles={articles} navigate={navigate} />
          </TabsContent>
          <TabsContent value="submitted" className="mt-6">
            <ArticleGrid articles={articles} navigate={navigate} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Helper component for the article grid
const ArticleGrid = ({ articles, navigate }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <Card key={article.id}>
          <CardContent className="p-4">
            <div className="aspect-video mb-4">
              <img
                src={article.image_url || "/placeholder.svg"}
                alt={article.title}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <h3 className="font-semibold mb-2">{article.title}</h3>
            <p className="text-sm text-muted-foreground mb-2">
              {article.content.substring(0, 100)}...
            </p>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${
                article.status === 'published' ? 'text-green-600' : 
                article.status === 'submitted' ? 'text-blue-600' : 
                'text-yellow-600'
              }`}>
                {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/admin/news/${article.id}`)}
              >
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ManageNews;
