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
import { Youtube, Linkedin, Twitter, Instagram, Globe, Plus } from "lucide-react";

export const SuggestExpertModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [activeField, setActiveField] = useState<string | null>(null);
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

  const socialIcons = [
    { name: 'youtube', icon: Youtube, label: 'YouTube Channel' },
    { name: 'linkedin', icon: Linkedin, label: 'LinkedIn Profile' },
    { name: 'twitter', icon: Twitter, label: 'Twitter Profile' },
    { name: 'instagram', icon: Instagram, label: 'Instagram Profile' },
    { name: 'website', icon: Globe, label: 'Website' }
  ];

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

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData({
      ...formData,
      social_links: {
        ...formData.social_links,
        [platform]: value,
      },
    });
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
              <Label>Social Links</Label>
              <div className="flex gap-4 items-center mt-2">
                {socialIcons.map(({ name, icon: Icon, label }) => (
                  <div key={name} className="relative">
                    <button
                      type="button"
                      onClick={() => setActiveField(activeField === name ? null : name)}
                      className={`p-2 rounded-full transition-colors ${
                        formData.social_links[name] 
                          ? 'bg-primary text-white' 
                          : 'bg-secondary hover:bg-primary/10'
                      }`}
                      title={label}
                    >
                      <Icon className="h-5 w-5" />
                    </button>
                    {activeField === name && (
                      <div className="absolute z-50 top-12 left-1/2 transform -translate-x-1/2 w-64 bg-white p-4 rounded-lg shadow-lg border animate-fadeIn">
                        <Label htmlFor={name}>{label}</Label>
                        <Input
                          id={name}
                          value={formData.social_links[name] || ''}
                          onChange={(e) => handleSocialLinkChange(name, e.target.value)}
                          placeholder={`Enter ${label} URL`}
                          className="mt-1"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
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