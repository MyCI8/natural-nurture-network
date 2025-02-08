
import { useState, useEffect } from "react";
import { NewsDetailsSection } from "@/components/admin/news/NewsDetailsSection";
import { ImageManagementSection } from "@/components/admin/news/ImageManagementSection";
import { PublishingOptionsSection } from "@/components/admin/news/PublishingOptionsSection";
import { RelatedLinksSection } from "@/components/admin/news/RelatedLinksSection";
import { VideoLinksSection } from "@/components/admin/news/VideoLinksSection";
import { ExpertsSection } from "@/components/admin/news/ExpertsSection";
import { ArticleContentSection } from "./ArticleContentSection";

interface VideoLink {
  title: string;
  url: string;
}

interface EditNewsFormProps {
  article: any;
  experts: any[];
  onExpertAdded: () => void;
  onSave: (articleData: any, relatedLinks: any[], shouldPublish: boolean) => Promise<void>;
  onFormDataChange: (formData: any) => void;
  onRelatedLinksChange: (links: any[]) => void;
}

export const EditNewsForm = ({
  article,
  experts,
  onExpertAdded,
  onSave,
  onFormDataChange,
  onRelatedLinksChange,
}: EditNewsFormProps) => {
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
  const [relatedLinks, setRelatedLinks] = useState<{ title: string; url: string; thumbnail_url?: string }[]>([]);
  const [videoLinks, setVideoLinks] = useState<VideoLink[]>([]);
  const [videoDescription, setVideoDescription] = useState("");

  useEffect(() => {
    if (article) {
      setHeading(article.title || "");
      setSlug(article.slug || "");
      setSummary(article.summary || "");
      setContent(article.content || "");
      setThumbnailUrl(article.image_url || "");
      setThumbnailDescription(article.thumbnail_description || "");
      setMainImageUrl(article.main_image_url || "");
      setMainImageDescription(article.main_image_description || "");
      setStatus(article.status as "draft" | "published");
      setScheduledDate(article.scheduled_publish_date ? new Date(article.scheduled_publish_date) : undefined);
      setSelectedExperts(article.related_experts || []);
      
      if (article.news_article_links) {
        const links = article.news_article_links.map((link: any) => ({
          title: link.title,
          url: link.url,
          thumbnail_url: link.thumbnail_url
        }));
        setRelatedLinks(links);
        onRelatedLinksChange(links);
      }
      
      const transformedVideoLinks = Array.isArray(article.video_links) 
        ? article.video_links.map((link: any) => ({
            title: typeof link.title === 'string' ? link.title : '',
            url: typeof link.url === 'string' ? link.url : ''
          }))
        : [];
      setVideoLinks(transformedVideoLinks);
      setVideoDescription(article.video_description || "");
    }
  }, [article, onRelatedLinksChange]);

  useEffect(() => {
    const formData = {
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
      video_links: videoLinks,
      video_description: videoDescription,
    };
    onFormDataChange(formData);
  }, [
    heading, slug, summary, content, thumbnailUrl, thumbnailDescription,
    mainImageUrl, mainImageDescription, status, selectedExperts,
    scheduledDate, videoLinks, videoDescription, onFormDataChange
  ]);

  useEffect(() => {
    onRelatedLinksChange(relatedLinks);
  }, [relatedLinks, onRelatedLinksChange]);

  return (
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

        <ArticleContentSection content={content} onChange={setContent} />

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

        <VideoLinksSection
          videoLinks={videoLinks}
          setVideoLinks={setVideoLinks}
          videoDescription={videoDescription}
          setVideoDescription={setVideoDescription}
        />

        <ExpertsSection
          experts={experts}
          selectedExperts={selectedExperts}
          setSelectedExperts={setSelectedExperts}
          onExpertAdded={onExpertAdded}
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
  );
};
