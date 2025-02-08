
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SlugInputProps {
  slug: string;
  setSlug: (value: string) => void;
}

export const SlugInput = ({ slug, setSlug }: SlugInputProps) => {
  return (
    <div>
      <Label htmlFor="slug">Slug</Label>
      <Input
        id="slug"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        placeholder="auto-generated-from-title"
      />
    </div>
  );
};
