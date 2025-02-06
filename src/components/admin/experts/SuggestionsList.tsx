import { Check, X, Edit } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExpertForm } from "@/components/admin/experts/ExpertForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Json } from "@/integrations/supabase/types";

interface Suggestion {
  id: string;
  full_name: string;
  website: string | null;
  comment: string | null;
  image_url: string | null;
  status: string;
  social_links: Json;
  created_at: string | null;
  updated_at: string | null;
  submitted_by: string | null;
}

interface SuggestionsListProps {
  suggestions: Suggestion[];
  onApprove: (suggestion: Suggestion) => void;
  onReject: (suggestionId: string) => void;
}

const SuggestionsList = ({ suggestions, onApprove, onReject }: SuggestionsListProps) => {
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditClick = (suggestion: Suggestion) => {
    setSelectedSuggestion(suggestion);
    setIsEditModalOpen(true);
  };

  const transformSocialLinks = (socialLinks: Json) => {
    const defaultLinks = {
      youtube: '',
      linkedin: '',
      twitter: '',
      instagram: '',
      website: '',
      wikipedia: ''
    };

    if (socialLinks && typeof socialLinks === 'object' && !Array.isArray(socialLinks)) {
      return { ...defaultLinks, ...socialLinks as Record<string, string> };
    }
    
    return defaultLinks;
  };

  // ... keep existing code (JSX for the table)

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Website</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suggestions.map((suggestion) => (
              <TableRow 
                key={suggestion.id}
                className={suggestion.status === 'pending' ? 'cursor-pointer hover:bg-muted/50' : ''}
                onClick={() => suggestion.status === 'pending' && handleEditClick(suggestion)}
              >
                <TableCell>
                  <img
                    src={suggestion.image_url || "/placeholder.svg"}
                    alt={suggestion.full_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {suggestion.full_name}
                </TableCell>
                <TableCell>
                  {suggestion.website && (
                    <a
                      href={suggestion.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Visit website
                    </a>
                  )}
                </TableCell>
                <TableCell>{suggestion.comment}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    suggestion.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : suggestion.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {suggestion.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {suggestion.status === "pending" && (
                    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onApprove(suggestion)}
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onReject(suggestion.id)}
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(suggestion);
                        }}
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Expert Suggestion</DialogTitle>
          </DialogHeader>
          {selectedSuggestion && (
            <ExpertForm 
              initialData={{
                full_name: selectedSuggestion.full_name,
                image_url: selectedSuggestion.image_url || undefined,
                bio: selectedSuggestion.comment || undefined,
                social_media: transformSocialLinks(selectedSuggestion.social_links),
                website: selectedSuggestion.website || undefined,
              }}
              onSuccess={() => {
                setIsEditModalOpen(false);
                setSelectedSuggestion(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SuggestionsList;
