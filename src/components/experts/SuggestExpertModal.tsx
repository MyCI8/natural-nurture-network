import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ImageManagementSection } from "@/components/admin/experts/ImageManagementSection";
import { supabase } from "@/integrations/supabase/client";

export const SuggestExpertModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [formData, setFormData] = useState({
    full_name: "",
    website: "",
    comment: "",
    social_links: {
      twitter: "",
      linkedin: "",
      instagram: "",
      youtube: "",
    },
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("expert_suggestions").insert([
        {
          ...formData,
          image_url: imageUrl,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your expert suggestion has been submitted for review.",
      });
      setIsOpen(false);
      setFormData({
        full_name: "",
        website: "",
        comment: "",
        social_links: {
          twitter: "",
          linkedin: "",
          instagram: "",
          youtube: "",
        },
      });
      setImageUrl("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit expert suggestion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Suggest an Expert</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Suggest an Expert</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="comment">Comment</Label>
              <Textarea
                id="comment"
                value={formData.comment}
                onChange={(e) =>
                  setFormData({ ...formData, comment: e.target.value })
                }
                placeholder="Tell us why you're suggesting this expert..."
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Social Links</h3>
              {Object.keys(formData.social_links).map((platform) => (
                <div key={platform}>
                  <Label htmlFor={platform} className="capitalize">
                    {platform}
                  </Label>
                  <Input
                    id={platform}
                    value={formData.social_links[platform]}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        social_links: {
                          ...formData.social_links,
                          [platform]: e.target.value,
                        },
                      })
                    }
                    placeholder={`${platform} profile URL`}
                  />
                </div>
              ))}
            </div>

            <ImageManagementSection
              imageUrl={imageUrl}
              setImageUrl={setImageUrl}
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Suggestion"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};