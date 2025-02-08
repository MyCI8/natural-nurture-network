
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SummaryInputProps {
  summary: string;
  setSummary: (value: string) => void;
}

export const SummaryInput = ({ summary, setSummary }: SummaryInputProps) => {
  return (
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
  );
};
