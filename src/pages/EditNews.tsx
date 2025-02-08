
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import TextEditor from "@/components/ui/text-editor";
import { NewsDetailsSection } from "@/components/admin/news/NewsDetailsSection";
import { ImageManagementSection } from "@/components/admin/news/ImageManagementSection";
import { PublishingOptionsSection } from "@/components/admin/news/PublishingOptionsSection";
import { RelatedLinksSection } from "@/components/admin/news/RelatedLinksSection";
import { ExpertsSection } from "@/components/admin/news/ExpertsSection";
import { ArticleActionButtons } from "@/components/admin/news/ArticleActionButtons";
import { useArticleOperations } from "@/hooks/useArticleOperations";

const EditNews = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [heading, setHeading] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [thumbnailDescription, setThumbnailDescription] = useState("");
  const [mainImageUrl, setMainImageUrl] = useState("");
  const [mainImageDescription, setMainImageDescription] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [selectedExperts, setSelectedExperts] = useState<string[]>([]);
  const [relatedLinks, setRelatedLinks] = useState<{ title: string; url: string }[]>([]);

  const { handleSave, isNewArticle } = useArticleOperations(id);

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
        .select("*, news_article_links(*)")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !isNewArticle,
  });

  // Set initial form data when article is loaded
  useState(() => {
    if (article) {
      setHeading(article.title);
      setSlug(article.slug || "");
      setSummary(article.summary || "");
      setContent(article.content);
      setThumbnailUrl(article.image_url || "");
      setThumbnailDescription(article.thumbnail_description || "");
      setMainImageUrl(article.main_image_url || "");
      setMainImageDescription(article.main_image_description || "");
      setStatus(article.status as "draft" | "published");
      setScheduledDate(article.scheduled_publish_date ? new Date(article.scheduled_publish_date) : undefined);
      setSelectedExperts(article.related_experts || []);
      setRelatedLinks(article.news_article_links || []);
    }
  }, [article]);

  const handleSubmit = async (shouldPublish: boolean) => {
    const articleData = {
      title: heading,
      slug,
      summary,
      content,
      image_url: thumbnailUrl,
      thumbnail_description: thumbnailDescription,
      main_image_url: mainImageUrl,
      main_image_description: mainImageDescription,
      status,
      related_experts: selectedExperts,
      scheduled_publish_date: scheduledDate?.toISOString(),
    };

    await handleSave(articleData, relatedLinks, shouldPublish);
  };

  if (isLoading && !isNewArticle) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto p-6">
        <ArticleActionButtons
          onBack={() => navigate("/admin/news")}
          onSave={handleSubmit}
        />

        <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            <NewsDetailsSection
              heading={heading}
              setHeading={setHeading}
              slug={slug}
              setSlug={setSlug}
              summary={summary}
              setSummary={setSummary}
            />

            <div>
              <h3 className="text-lg font-semibold mb-4">Content</h3>
              <TextEditor content={content} onChange={setContent} />
            </div>

            <RelatedLinksSection
              relatedLinks={relatedLinks}
              setRelatedLinks={setRelatedLinks}
            />
          </div>

          <div className="space-y-6">
            <ImageManagementSection
              thumbnailUrl={thumbnailUrl}
              setThumbnailUrl={setThumbnailUrl}
              thumbnailDescription={thumbnailDescription}
              setThumbnailDescription={setThumbnailDescription}
              mainImageUrl={mainImageUrl}
              setMainImageUrl={setMainImageUrl}
              mainImageDescription={mainImageDescription}
              setMainImageDescription={setMainImageDescription}
            />

            <ExpertsSection
              experts={experts}
              selectedExperts={selectedExperts}
              setSelectedExperts={setSelectedExperts}
              onExpertAdded={refetchExperts}
            />

            <PublishingOptionsSection
              status={status}
              setStatus={setStatus}
              scheduledDate={scheduledDate}
              setScheduledDate={setScheduledDate}
              lastEditedAt={article?.updated_at}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditNews;
