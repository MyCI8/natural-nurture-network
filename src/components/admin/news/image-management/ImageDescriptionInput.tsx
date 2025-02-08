
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ImageDescriptionInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
}

export const ImageDescriptionInput = ({
  id,
  value,
  onChange,
  label,
  placeholder,
}: ImageDescriptionInputProps) => {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
};
