
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface PublishingOptionsSectionProps {
  status: "draft" | "published";
  setStatus: (value: "draft" | "published") => void;
  scheduledDate: Date | undefined;
  setScheduledDate: (date: Date | undefined) => void;
  lastEditedAt?: string;
}

export const PublishingOptionsSection = ({
  status,
  setStatus,
  scheduledDate,
  setScheduledDate,
  lastEditedAt,
}: PublishingOptionsSectionProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Publishing Options</h3>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="published"
          checked={status === "published"}
          onCheckedChange={(checked) => setStatus(checked ? "published" : "draft")}
          className="touch-manipulation"
        />
        <Label htmlFor="published">
          {status === "published" ? "Published" : "Draft"}
        </Label>
      </div>

      <div className="space-y-2">
        <Label>Schedule Publish Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal touch-manipulation",
                !scheduledDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-background" align="start">
            <Calendar
              mode="single"
              selected={scheduledDate}
              onSelect={setScheduledDate}
              initialFocus
              className="touch-manipulation"
            />
          </PopoverContent>
        </Popover>
      </div>

      {lastEditedAt && (
        <div className="text-sm text-muted-foreground">
          Last edited: {format(new Date(lastEditedAt), "PPP 'at' p")}
        </div>
      )}
    </div>
  );
};
