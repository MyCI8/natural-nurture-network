
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useState } from "react";

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

export const RemedyHealthConcernsSection = ({
  selectedConcerns,
  onConcernsChange,
}: RemedyHealthConcernsSectionProps) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  console.log("RemedyHealthConcernsSection render", { selectedConcerns, open });

  const filteredConcerns = healthConcerns.filter(concern =>
    concern.toLowerCase().includes(searchValue.toLowerCase()) &&
    !selectedConcerns.includes(concern)
  );

  const addConcern = (concern: string) => {
    console.log("Adding concern:", concern);
    if (!selectedConcerns.includes(concern)) {
      onConcernsChange([...selectedConcerns, concern]);
    }
    setSearchValue("");
    setOpen(false);
  };

  const removeConcern = (concernToRemove: string) => {
    console.log("Removing concern:", concernToRemove);
    onConcernsChange(selectedConcerns.filter(concern => concern !== concernToRemove));
  };

  const handleOpenChange = (newOpen: boolean) => {
    console.log("Popover open state changing:", newOpen);
    setOpen(newOpen);
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
            <CommandEmpty className="py-6 text-center text-sm">
              No health concerns found.
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
                  {concern}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedConcerns.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedConcerns.map((concern, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {concern}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeConcern(concern);
                }}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
