
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArticleActionButtons } from "@/components/admin/news/ArticleActionButtons";
import { EditNewsForm } from "@/components/admin/news/edit/EditNewsForm";
import { useArticleOperations } from "@/hooks/useArticleOperations";
import { useState } from "react";

const EditNews = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { handleSave, isNewArticle } = useArticleOperations(id);
  const [formData, setFormData] = useState<any>(null);
  const [relatedLinks, setRelatedLinks] = useState<any[]>([]);

  // Fetch experts for the dropdown
  const { data: experts = [], refetch: refetchExperts } = useQuery({
    queryKey: ["experts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experts")
        .select("id, full_name, title");
      if (error) throw error;
      return data;
    },
  });

  // Fetch article data if editing
  const { data: article, isLoading } = useQuery({
    queryKey: ["news-article", id],
    queryFn: async () => {
      if (isNewArticle) return null;
      
      const { data, error } = await supabase
        .from("news_articles")
        .select(`
          *,
          news_article_links (
            id,
            title,
            url,
            thumbnail_url
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !isNewArticle,
  });

  if (isLoading && !isNewArticle) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto p-6">
        <ArticleActionButtons
          onBack={() => navigate("/admin/news")}
          onSave={handleSave}
          formData={formData}
          relatedLinks={relatedLinks}
        />
        
        <EditNewsForm
          article={article}
          experts={experts}
          onExpertAdded={refetchExperts}
          onSave={handleSave}
          onFormDataChange={setFormData}
          onRelatedLinksChange={setRelatedLinks}
        />
      </div>
    </div>
  );
};

export default EditNews;
