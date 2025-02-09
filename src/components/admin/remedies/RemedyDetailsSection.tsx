
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface RemedyDetailsSectionProps {
  name: string;
  setName: (value: string) => void;
  summary: string;
  setSummary: (value: string) => void;
}

export const RemedyDetailsSection = ({
  name,
  setName,
  summary,
  setSummary,
}: RemedyDetailsSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Remedy Details</h3>
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-background"
        />
      </div>
      <div>
        <Label htmlFor="summary">Summary</Label>
        <Textarea
          id="summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="bg-background min-h-[100px]"
        />
      </div>
    </div>
  );
};
