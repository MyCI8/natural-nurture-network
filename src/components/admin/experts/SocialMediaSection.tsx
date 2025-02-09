
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SocialMediaLinks {
  youtube: string;
  linkedin: string;
  twitter: string;
  instagram: string;
  website: string;
  wikipedia: string;
}

interface SocialMediaSectionProps {
  socialMedia: SocialMediaLinks;
  onSocialMediaChange: (platform: keyof SocialMediaLinks, value: string) => void;
}

export const SocialMediaSection = ({
  socialMedia,
  onSocialMediaChange,
}: SocialMediaSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Social Media Links</h3>
      {Object.entries(socialMedia).map(([platform, url]) => (
        <div key={platform}>
          <Label htmlFor={platform} className="capitalize">
            {platform}
          </Label>
          <Input
            id={platform}
            value={url}
            onChange={(e) => onSocialMediaChange(platform as keyof SocialMediaLinks, e.target.value)}
            placeholder={`${platform} URL`}
            className="bg-background"
          />
        </div>
      ))}
    </div>
  );
};
