
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ArticleGrid from "./ArticleGrid";
import ArticleFilters from "./ArticleFilters";

const ArticleManagement = () => {
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

      if (error) {throw error;}
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage News Articles</h2>
        <Button onClick={() => navigate("/admin/news/new")}>
          <Plus className="mr-2 h-4 w-4" /> Create Article
        </Button>
      </div>

      <ArticleFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      {isLoading ? (
        <div className="flex justify-center py-8">
          <p>Loading articles...</p>
        </div>
      ) : (
        <ArticleGrid articles={articles} />
      )}
    </div>
  );
};

export default ArticleManagement;
