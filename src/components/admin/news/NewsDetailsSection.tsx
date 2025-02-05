import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface NewsDetailsSectionProps {
  heading: string;
  setHeading: (value: string) => void;
  slug: string;
  setSlug: (value: string) => void;
  summary: string;
  setSummary: (value: string) => void;
}

export const NewsDetailsSection = ({
  heading,
  setHeading,
  slug,
  setSlug,
  summary,
  setSummary,
}: NewsDetailsSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">News Details</h3>
      <div>
        <Label htmlFor="heading">Heading</Label>
        <Input
          id="heading"
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
          className="text-lg"
        />
      </div>
      <div>
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="auto-generated-from-title"
        />
      </div>
      <div>
        <Label htmlFor="summary">Summary</Label>
        <Textarea
          id="summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="h-24"
          placeholder="Brief description of the article"
        />
      </div>
    </div>
  );
};