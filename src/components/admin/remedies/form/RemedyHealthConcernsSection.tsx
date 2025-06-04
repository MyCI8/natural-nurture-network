
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { X, Plus, Clock } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Comprehensive health concerns covering symptoms, conditions, health goals, and body systems
const healthConcerns = [
  // Symptoms
  'Cough', 'Cold', 'Sore Throat', 'Headache', 'Joint Pain', 'Back Pain', 'Eye Strain', 'Fatigue',
  'Skin Irritation', 'Hair Loss', 'Insomnia', 'Nausea', 'Fever', 'Muscle Pain', 'Bloating',
  
  // Conditions
  'Cancer', 'High Blood Pressure', 'Diabetes', 'Arthritis', 'Asthma', 'Allergies', 'Eczema',
  'Acne', 'Migraine', 'Fibromyalgia', 'IBS', 'GERD', 'UTI', 'Sinusitis', 'Bronchitis',
  
  // Mental Health & Wellness
  'Stress', 'Anxiety', 'Depression', 'Mental Clarity', 'Memory Support', 'Focus Enhancement',
  'Mood Balance', 'Emotional Wellness', 'Sleep Quality', 'Relaxation',
  
  // Health Goals
  'Immunity Support', 'Weight Management', 'Energy Boost', 'Detoxification', 'Anti-Aging',
  'Skin Health', 'Hair Growth', 'Teeth Whitening', 'Breath Freshening', 'Circulation Improvement',
  'Metabolism Boost', 'Hormone Balance', 'Blood Sugar Control', 'Cholesterol Management',
  
  // Body Systems
  'Digestive Health', 'Cardiovascular Health', 'Respiratory Health', 'Immune System',
  'Nervous System', 'Reproductive Health', 'Bone Health', 'Liver Health', 'Kidney Health',
  'Thyroid Support', 'Adrenal Support', 'Gut Health', 'Brain Health', 'Heart Health'
];

interface RemedyHealthConcernsSectionProps {
  selectedConcerns: string[];
  onConcernsChange: (concerns: string[]) => void;
}

interface PendingConcern {
  id: string;
  concern_name: string;
  status: 'pending' | 'approved' | 'rejected';
}

export const RemedyHealthConcernsSection = ({
  selectedConcerns,
  onConcernsChange,
}: RemedyHealthConcernsSectionProps) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's pending health concern suggestions
  const { data: pendingSuggestions = [] } = useQuery({
    queryKey: ["health-concern-suggestions"],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];
        
        const { data, error } = await supabase
          .from("health_concern_suggestions" as any)
          .select("*")
          .eq("suggested_by", user.id)
          .eq("status", "pending");
        
        if (error) throw error;
        return (data || []) as PendingConcern[];
      } catch (error) {
        console.error("Error fetching pending suggestions:", error);
        return [];
      }
    },
  });

  // Mutation to suggest a new health concern
  const suggestConcernMutation = useMutation({
    mutationFn: async (concernName: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase
        .from("health_concern_suggestions" as any)
        .insert({
          concern_name: concernName,
          suggested_by: user.id,
          status: "pending"
        } as any);

      if (error) throw error;
      return concernName;
    },
    onSuccess: (concernName) => {
      toast({
        title: "Suggestion submitted",
        description: `"${concernName}" has been submitted for review`,
      });
      queryClient.invalidateQueries({ queryKey: ["health-concern-suggestions"] });
      addConcern(concernName, true);
      setSearchValue("");
      setOpen(false);
    },
    onError: (error) => {
      console.error("Error suggesting concern:", error);
      toast({
        title: "Error",
        description: "Failed to submit suggestion",
        variant: "destructive",
      });
    },
  });

  console.log("RemedyHealthConcernsSection render", { selectedConcerns, open });

  // Combine regular concerns with pending suggestions
  const allConcerns = [...healthConcerns, ...pendingSuggestions.map(s => s.concern_name)];
  
  const filteredConcerns = (allConcerns || []).filter(concern =>
    concern.toLowerCase().includes(searchValue.toLowerCase()) &&
    !selectedConcerns.includes(concern)
  );

  // Check if search value would create a new concern
  const isNewConcern = searchValue.length > 2 && 
    !allConcerns.some(concern => concern.toLowerCase() === searchValue.toLowerCase());

  const addConcern = (concern: string, isPending = false) => {
    console.log("Adding concern:", concern, "isPending:", isPending);
    if (!selectedConcerns.includes(concern)) {
      onConcernsChange([...selectedConcerns, concern]);
    }
    if (!isPending) {
      setSearchValue("");
      setOpen(false);
    }
  };

  const removeConcern = (concernToRemove: string) => {
    console.log("Removing concern:", concernToRemove);
    onConcernsChange(selectedConcerns.filter(concern => concern !== concernToRemove));
  };

  const handleOpenChange = (newOpen: boolean) => {
    console.log("Popover open state changing:", newOpen);
    setOpen(newOpen);
  };

  const isPendingConcern = (concern: string) => {
    return pendingSuggestions.some(s => s.concern_name === concern);
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Applicable For</Label>
      <p className="text-xs text-muted-foreground">
        Select health concerns, conditions, goals, or body systems this remedy addresses
      </p>
      
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start text-left font-normal bg-background hover:bg-accent"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("Button clicked, current open state:", open);
              setOpen(!open);
            }}
          >
            {selectedConcerns.length > 0 
              ? `${selectedConcerns.length} concern(s) selected` 
              : "Search and select health concerns..."
            }
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-80 p-0 bg-background border shadow-md z-50" 
          align="start"
          side="bottom"
          sideOffset={4}
        >
          <Command className="bg-background">
            <CommandInput 
              placeholder="Search health concerns..." 
              value={searchValue}
              onValueChange={setSearchValue}
              className="bg-background"
            />
            <CommandList>
              <CommandEmpty className="py-6 text-center text-sm">
                {isNewConcern ? (
                  <div className="space-y-2">
                    <p>No matching health concerns found.</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => suggestConcernMutation.mutate(searchValue)}
                      disabled={suggestConcernMutation.isPending}
                      className="text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add "{searchValue}" (pending approval)
                    </Button>
                  </div>
                ) : (
                  "No health concerns found."
                )}
              </CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto bg-background">
                {filteredConcerns.map((concern) => (
                  <CommandItem
                    key={concern}
                    onSelect={(value) => {
                      console.log("CommandItem selected:", value, concern);
                      addConcern(concern);
                    }}
                    className="cursor-pointer bg-background hover:bg-accent"
                  >
                    <span className="flex-1">{concern}</span>
                    {isPendingConcern(concern) && (
                      <Clock className="h-3 w-3 ml-2 text-muted-foreground" />
                    )}
                  </CommandItem>
                ))}
                {isNewConcern && filteredConcerns.length > 0 && (
                  <CommandItem
                    onSelect={() => suggestConcernMutation.mutate(searchValue)}
                    className="cursor-pointer bg-background hover:bg-accent border-t"
                  >
                    <Plus className="h-3 w-3 mr-2" />
                    Add "{searchValue}" (pending approval)
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedConcerns.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedConcerns.map((concern, index) => {
            const isPending = isPendingConcern(concern);
            return (
              <Badge
                key={index}
                variant={isPending ? "outline" : "secondary"}
                className={`flex items-center gap-1 ${isPending ? 'border-dashed border-orange-300 text-orange-600' : ''}`}
              >
                {concern}
                {isPending && (
                  <Clock className="h-3 w-3" />
                )}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeConcern(concern);
                  }}
                />
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};
