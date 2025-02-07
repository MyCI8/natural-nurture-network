import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Save, Eye, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import TextEditor from "@/components/ui/text-editor";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { NewsDetailsSection } from "@/components/admin/news/NewsDetailsSection";
import { ImageManagementSection } from "@/components/admin/news/ImageManagementSection";
import { PublishingOptionsSection } from "@/components/admin/news/PublishingOptionsSection";
import { RelatedLinksSection } from "@/components/admin/news/RelatedLinksSection";
import { ExpertsSection } from "@/components/admin/news/ExpertsSection";

const EditNews = () => {
  const { id } = useParams();
  const isNewArticle = id === 'new';
  const navigate = useNavigate();
  const { toast } = useToast();
  
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

  useEffect(() => {
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

  const moveImageToPublicBucket = async (imageUrl: string): Promise<string | null> => {
    if (!imageUrl || !imageUrl.includes('news-images-draft')) return imageUrl;
    
    try {
      // Extract the file name from the URL
      const fileName = imageUrl.split('/').pop();
      if (!fileName) return null;

      // Download the file from the draft bucket
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('news-images-draft')
        .download(fileName);

      if (downloadError) {
        console.error('Error downloading file:', downloadError);
        return null;
      }

      // Upload to the public bucket
      const { error: uploadError } = await supabase.storage
        .from('news-images')
        .upload(fileName, fileData, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Error uploading to public bucket:', uploadError);
        return null;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('news-images')
        .getPublicUrl(fileName);

      // Delete from draft bucket
      await supabase.storage
        .from('news-images-draft')
        .remove([fileName]);

      return publicUrl;
    } catch (error) {
      console.error('Error moving image:', error);
      return null;
    }
  };

  const handleSave = async (shouldPublish = false) => {
    try {
      let finalThumbnailUrl = thumbnailUrl;
      let finalMainImageUrl = mainImageUrl;

      if (shouldPublish) {
        if (thumbnailUrl) {
          const publicThumbnailUrl = await moveImageToPublicBucket(thumbnailUrl);
          if (publicThumbnailUrl) {
            finalThumbnailUrl = publicThumbnailUrl;
          }
        }

        if (mainImageUrl) {
          const publicMainImageUrl = await moveImageToPublicBucket(mainImageUrl);
          if (publicMainImageUrl) {
            finalMainImageUrl = publicMainImageUrl;
          }
        }
      }

      const articleData = {
        title: heading,
        slug,
        summary,
        content,
        image_url: finalThumbnailUrl,
        thumbnail_description: thumbnailDescription,
        main_image_url: finalMainImageUrl || finalThumbnailUrl,
        main_image_description: mainImageDescription,
        status: shouldPublish ? "published" : status,
        related_experts: selectedExperts,
        scheduled_publish_date: scheduledDate?.toISOString(),
        updated_at: new Date().toISOString(),
        published_at: shouldPublish ? new Date().toISOString() : null,
        last_edited_by: (await supabase.auth.getUser()).data.user?.id,
      };

      if (isNewArticle) {
        const { data: newArticle, error } = await supabase
          .from("news_articles")
          .insert([articleData])
          .select()
          .single();

        if (error) throw error;

        if (relatedLinks.length > 0) {
          const { error: linksError } = await supabase
            .from("news_article_links")
            .insert(
              relatedLinks.map(link => ({
                article_id: newArticle.id,
                title: link.title,
                url: link.url
              }))
            );

          if (linksError) throw linksError;
        }

        toast({
          title: "Success",
          description: "Article created successfully",
        });
      } else {
        const { error } = await supabase
          .from("news_articles")
          .update(articleData)
          .eq("id", id);

        if (error) throw error;

        await supabase
          .from("news_article_links")
          .delete()
          .eq("article_id", id);

        if (relatedLinks.length > 0) {
          await supabase
            .from("news_article_links")
            .insert(
              relatedLinks.map(link => ({
                article_id: id,
                title: link.title,
                url: link.url
              }))
            );
        }

        toast({
          title: "Success",
          description: "Article updated successfully",
        });
      }
      
      navigate("/admin/news");
    } catch (error) {
      console.error('Error saving article:', error);
      toast({
        title: "Error",
        description: isNewArticle ? "Failed to create article" : "Failed to update article",
        variant: "destructive",
      });
    }
  };

  const handlePreview = () => {
    toast({
      title: "Info",
      description: "Preview functionality coming soon",
    });
  };

  if (isLoading && !isNewArticle) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/news")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to News
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button variant="outline" onClick={() => handleSave(false)}>
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
            <Button onClick={() => handleSave(true)}>
              <Send className="mr-2 h-4 w-4" />
              Publish
            </Button>
          </div>
        </div>

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
