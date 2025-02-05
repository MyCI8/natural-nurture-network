import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ExpertDetailsSectionProps {
  fullName: string;
  setFullName: (value: string) => void;
  title: string;
  setTitle: (value: string) => void;
  bio: string;
  setBio: (value: string) => void;
}

export const ExpertDetailsSection = ({
  fullName,
  setFullName,
  title,
  setTitle,
  bio,
  setBio,
}: ExpertDetailsSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Expert Details</h3>
      <div>
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="text-lg"
        />
      </div>
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Medical Doctor, Herbalist"
        />
      </div>
      <div>
        <Label htmlFor="bio">Biography</Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="h-48"
          placeholder="Expert's biography and credentials"
        />
      </div>
    </div>
  );
};