
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface HeadingInputProps {
  heading: string;
  setHeading: (value: string) => void;
}

export const HeadingInput = ({ heading, setHeading }: HeadingInputProps) => {
  return (
    <div>
      <Label htmlFor="heading">Heading</Label>
      <Input
        id="heading"
        value={heading}
        onChange={(e) => setHeading(e.target.value)}
        className="text-lg"
      />
    </div>
  );
};
