import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Suggestion {
  id: string;
  full_name: string;
  website: string;
  comment: string;
  image_url: string;
  status: string;
}

interface SuggestionsListProps {
  suggestions: Suggestion[];
  onApprove: (suggestion: Suggestion) => void;
  onReject: (suggestionId: string) => void;
}

const SuggestionsList = ({ suggestions, onApprove, onReject }: SuggestionsListProps) => {
  return (
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
            <TableRow key={suggestion.id}>
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
                  <>
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
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SuggestionsList;