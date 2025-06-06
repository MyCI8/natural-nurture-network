
import React from "react";
import { Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { PopoverContent } from "@/components/ui/popover";

interface HealthConcernPopoverProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filteredConcerns: string[];
  isNewConcern: boolean;
  onAddConcern: (concern: string) => void;
  onSuggestConcern: () => void;
  isPendingConcern: (concern: string) => boolean;
  isSubmitting: boolean;
}

export const HealthConcernPopover = ({
  searchValue,
  onSearchChange,
  filteredConcerns,
  isNewConcern,
  onAddConcern,
  onSuggestConcern,
  isPendingConcern,
  isSubmitting
}: HealthConcernPopoverProps) => {
  return (
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
          onValueChange={onSearchChange}
          className="bg-background"
        />
        <CommandList>
          <CommandEmpty className="py-6 text-center text-sm">
            {isNewConcern ? (
              <div className="space-y-3">
                <p>No matching health concerns found.</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onSuggestConcern}
                  disabled={isSubmitting}
                  className="text-xs bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {isSubmitting ? "Adding..." : `Add "${searchValue}" (pending approval)`}
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
                onSelect={() => onAddConcern(concern)}
                className="cursor-pointer bg-background hover:bg-accent"
              >
                <span className="flex-1">{concern}</span>
                {isPendingConcern(concern) && (
                  <Clock className="h-3 w-3 ml-2 text-blue-500" />
                )}
              </CommandItem>
            ))}
            {isNewConcern && filteredConcerns.length > 0 && (
              <CommandItem
                onSelect={onSuggestConcern}
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
  );
};
