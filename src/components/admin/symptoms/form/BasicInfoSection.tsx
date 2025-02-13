
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import TextEditor from "@/components/ui/text-editor";
import { UseFormReturn } from "react-hook-form";

interface BasicInfoSectionProps {
  form: UseFormReturn<any>;
}

export const BasicInfoSection = ({ form }: BasicInfoSectionProps) => {
  const symptomValue = form.watch('symptom');
  console.log('Current symptom value:', symptomValue);
  
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="symptom"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Symptom Name</FormLabel>
            <FormControl>
              <Input 
                {...field} 
                value={field.value || ''} 
                className="max-w-xl" 
                placeholder="Enter symptom name"
              />
            </FormControl>
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
