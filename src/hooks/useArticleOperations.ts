
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { moveImageToPublicBucket } from "@/utils/imageUtils";

export const useArticleOperations = (id: string | undefined) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isNewArticle = id === 'new';

  const handleSave = async (
    articleData: {
      title: string;
      slug: string;
      summary: string;
      content: string;
      image_url: string;
      thumbnail_description: string;
      main_image_url: string;
      main_image_description: string;
      status: "draft" | "published";
      related_experts: string[];
      scheduled_publish_date?: string;
    },
    relatedLinks: { title: string; url: string }[],
    shouldPublish = false
  ) => {
    try {
      let finalThumbnailUrl = articleData.image_url;
      let finalMainImageUrl = articleData.main_image_url;

      if (shouldPublish) {
        if (articleData.image_url) {
          const publicThumbnailUrl = await moveImageToPublicBucket(articleData.image_url);
          if (publicThumbnailUrl) {
            finalThumbnailUrl = publicThumbnailUrl;
          }
        }

        if (articleData.main_image_url) {
          const publicMainImageUrl = await moveImageToPublicBucket(articleData.main_image_url);
          if (publicMainImageUrl) {
            finalMainImageUrl = publicMainImageUrl;
          }
        }
      }

      const finalArticleData = {
        ...articleData,
        image_url: finalThumbnailUrl,
        main_image_url: finalMainImageUrl || finalThumbnailUrl,
        status: shouldPublish ? "published" : articleData.status,
        updated_at: new Date().toISOString(),
        published_at: shouldPublish ? new Date().toISOString() : null,
        last_edited_by: (await supabase.auth.getUser()).data.user?.id,
      };

      if (isNewArticle) {
        const { data: newArticle, error } = await supabase
          .from("news_articles")
          .insert([finalArticleData])
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
          .update(finalArticleData)
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

  return { handleSave, isNewArticle };
};
