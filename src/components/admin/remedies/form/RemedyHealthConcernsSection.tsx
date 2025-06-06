
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { healthConcerns } from "./HealthConcernsData";
import { useHealthConcernSuggestions } from "./useHealthConcernSuggestions";
import { HealthConcernBadge } from "./HealthConcernBadge";
import { HealthConcernPopover } from "./HealthConcernPopover";

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

  const {
    pendingSuggestions,
    suggestConcernMutation,
    isPendingConcern,
    setLocalPendingConcerns
  } = useHealthConcernSuggestions(selectedConcerns, onConcernsChange);

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
    setLocalPendingConcerns(prev => prev.filter(concern => concern !== concernToRemove));
  };

  const handleOpenChange = (newOpen: boolean) => {
    console.log("Popover open state changing:", newOpen);
    setOpen(newOpen);
  };

  const handleSuggestConcern = () => {
    if (searchValue.trim()) {
      suggestConcernMutation.mutate(searchValue.trim());
      setSearchValue("");
      setOpen(false);
    }
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
        
        <HealthConcernPopover
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          filteredConcerns={filteredConcerns}
          isNewConcern={isNewConcern}
          onAddConcern={addConcern}
          onSuggestConcern={handleSuggestConcern}
          isPendingConcern={isPendingConcern}
          isSubmitting={suggestConcernMutation.isPending}
        />
      </Popover>

      {selectedConcerns.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedConcerns.map((concern, index) => (
            <HealthConcernBadge
              key={index}
              concern={concern}
              index={index}
              isPending={isPendingConcern(concern)}
              onRemove={removeConcern}
            />
          ))}
        </div>
      )}
    </div>
  );
};
