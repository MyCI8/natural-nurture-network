
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Database } from "@/integrations/supabase/types";

type SymptomType = Database['public']['Enums']['symptom_type'];

const defaultSymptoms: SymptomType[] = [
  'Cough', 'Cold', 'Sore Throat', 'Cancer', 'Stress', 
  'Anxiety', 'Depression', 'Insomnia', 'Headache', 'Joint Pain',
  'Digestive Issues', 'Fatigue', 'Skin Irritation', 'High Blood Pressure', 'Allergies',
  'Weak Immunity', 'Back Pain', 'Poor Circulation', 'Hair Loss', 'Eye Strain'
];

interface RemedySymptomSectionProps {
  symptoms: SymptomType[];
  onSymptomsChange: (symptoms: SymptomType[]) => void;
}

export const RemedySymptomSection = ({
  symptoms,
  onSymptomsChange,
}: RemedySymptomSectionProps) => {
  return (
    <div>
      <Label>Symptoms</Label>
      <Select
        value={symptoms[symptoms.length - 1] || "select-symptom"}
        onValueChange={(value) => {
          if (value !== "select-symptom" && !symptoms.includes(value as SymptomType)) {
            onSymptomsChange([...symptoms, value as SymptomType]);
          }
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select symptoms" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="select-symptom">Select a symptom</SelectItem>
          {defaultSymptoms.map((symptom) => (
            <SelectItem key={symptom} value={symptom}>
              {symptom}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="mt-2 flex flex-wrap gap-2">
        {symptoms.map((symptom, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="flex items-center gap-1"
          >
            {symptom}
            <X
              className="h-3 w-3 cursor-pointer"
              onClick={() => onSymptomsChange(symptoms.filter((_, i) => i !== index))}
            />
          </Badge>
        ))}
      </div>
    </div>
  );
};
