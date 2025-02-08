
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey: string;
  onApiKeyChange: (value: string) => void;
  onSave: (key: string) => void;
}

export const ApiKeyDialog = ({
  open,
  onOpenChange,
  apiKey,
  onApiKeyChange,
  onSave,
}: ApiKeyDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Firecrawl API Key</DialogTitle>
          <DialogDescription>
            Enter your Firecrawl API key to enable expert search functionality.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            type="password"
            placeholder="Enter your Firecrawl API key"
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
          />
          <Button 
            onClick={() => onSave(apiKey)}
            className="w-full"
          >
            Save API Key
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
