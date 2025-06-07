
import { Check, X, Clock } from "lucide-react";

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4 text-orange-500" />;
    case 'approved':
      return <Check className="h-4 w-4 text-green-500" />;
    case 'rejected':
      return <X className="h-4 w-4 text-red-500" />;
    default:
      return null;
  }
};

export const getStatusVariant = (status: string) => {
  switch (status) {
    case 'pending':
      return 'default';
    case 'approved':
      return 'default';
    case 'rejected':
      return 'destructive';
    default:
      return 'secondary';
  }
};
