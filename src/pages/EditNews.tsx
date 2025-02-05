import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Link as LinkIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import TextEditor from "@/components/ui/text-editor";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EditNews = () => {
  const { id } = useParams();
  const isNewArticle = id === 'new';
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [heading, setHeading] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [selectedExperts, setSelectedExperts] = useState<string[]>([]);
  const [relatedLinks, setRelatedLinks] = useState<{ title: string; url: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  // Fetch experts for the dropdown
  const { data: experts = [] } = useQuery({
    queryKey: ["experts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experts")
        .select("id, full_name");
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
      setSummary(article.summary || "");
      setContent(article.content);
      setImageUrl(article.image_url || "");
      setStatus(article.status as "draft" | "published");
      setSelectedExperts(article.related_experts || []);
      setRelatedLinks(article.news_article_links || []);
    }
  }, [article]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('news-images')
        .upload(fileName, file);

      if (uploadError) {
        toast({
          title: "Error",
          description: "Failed to upload image",
          variant: "destructive",
        });
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('news-images')
        .getPublicUrl(fileName);

      setImageUrl(publicUrl);
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const addRelatedLink = () => {
    setRelatedLinks([...relatedLinks, { title: "", url: "" }]);
  };

  const removeRelatedLink = (index: number) => {
    setRelatedLinks(relatedLinks.filter((_, i) => i !== index));
  };

  const updateRelatedLink = (index: number, field: 'title' | 'url', value: string) => {
    const updatedLinks = [...relatedLinks];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    setRelatedLinks(updatedLinks);
  };

  const handleSave = async () => {
    try {
      const articleData = {
        title: heading,
        summary,
        content,
        image_url: imageUrl,
        status,
        related_experts: selectedExperts,
        updated_at: new Date().toISOString(),
        published_at: status === 'published' ? new Date().toISOString() : null,
      };

      if (isNewArticle) {
        const { data: newArticle, error } = await supabase
          .from("news_articles")
          .insert([articleData])
          .select()
          .single();

        if (error) throw error;

        // Insert related links
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

        // Update related links
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
      toast({
        title: "Error",
        description: isNewArticle ? "Failed to create article" : "Failed to update article",
        variant: "destructive",
      });
    }
  };

  if (isLoading && !isNewArticle) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/news")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to News
        </Button>

        <div className="space-y-6">
          <div>
            <Label htmlFor="heading">Heading</Label>
            <Input
              id="heading"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="h-24"
            />
          </div>

          <div>
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(value: "draft" | "published") => setStatus(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Thumbnail</Label>
            <div className="mt-2 flex items-center gap-4">
              {imageUrl && (
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt="Thumbnail"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2"
                    onClick={() => setImageUrl("")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <Label
                htmlFor="thumbnail"
                className="cursor-pointer flex items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg hover:border-primary"
              >
                <input
                  type="file"
                  id="thumbnail"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                <Plus className="h-6 w-6 text-gray-400" />
              </Label>
            </div>
          </div>

          <div>
            <Label>Related Experts</Label>
            <Select
              value={selectedExperts[0] || ""}
              onValueChange={(value) => setSelectedExperts([value])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an expert" />
              </SelectTrigger>
              <SelectContent>
                {experts.map((expert) => (
                  <SelectItem key={expert.id} value={expert.id}>
                    {expert.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Related Links</Label>
            <div className="space-y-4">
              {relatedLinks.map((link, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="flex-1">
                    <Input
                      placeholder="Link title"
                      value={link.title}
                      onChange={(e) => updateRelatedLink(index, 'title', e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder="URL"
                      value={link.url}
                      onChange={(e) => updateRelatedLink(index, 'url', e.target.value)}
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removeRelatedLink(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={addRelatedLink}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Related Link
              </Button>
            </div>
          </div>

          <div>
            <Label>Content</Label>
            <TextEditor content={content} onChange={setContent} />
          </div>

          <Button onClick={handleSave} className="w-full">
            {isNewArticle ? "Create Article" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditNews;