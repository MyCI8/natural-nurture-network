
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TextEditor from "@/components/ui/text-editor";
import { UseFormReturn } from "react-hook-form";
import { Database } from "@/integrations/supabase/types";

type SymptomType = Database["public"]["Enums"]["symptom_type"];

const SYMPTOM_TYPES: SymptomType[] = [
  "Cough", "Cold", "Sore Throat", "Cancer", "Stress", 
  "Anxiety", "Depression", "Insomnia", "Headache", 
  "Joint Pain", "Digestive Issues", "Fatigue", 
  "Skin Irritation", "High Blood Pressure", "Allergies",
  "Weak Immunity", "Back Pain", "Poor Circulation",
  "Hair Loss", "Eye Strain"
];

interface BasicInfoSectionProps {
  form: UseFormReturn<any>;
}

export const BasicInfoSection = ({ form }: BasicInfoSectionProps) => {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="symptom"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Symptom Type</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              value={field.value}
            >
              <FormControl>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select a symptom type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-popover/100 border shadow-lg">
                {SYMPTOM_TYPES.map((type) => (
                  <SelectItem 
                    key={type} 
                    value={type}
                    className="hover:bg-accent focus:bg-accent"
                  >
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="brief_description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Brief Description</FormLabel>
            <FormControl>
              <Input 
                {...field} 
                value={field.value || ''} 
                className="max-w-xl" 
                placeholder="Enter a brief description"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Full Description</FormLabel>
            <FormControl>
              <TextEditor
                content={field.value || ''}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
