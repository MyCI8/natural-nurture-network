
import { useNavigate } from "react-router-dom";
import { Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { Expert } from "@/types/expert";

interface ExpertListProps {
  experts: Expert[];
  isLoading: boolean;
  onDelete: (expertId: string) => void;
}

const ExpertList = ({ experts, isLoading, onDelete }: ExpertListProps) => {
  const navigate = useNavigate();

  const handleExpertClick = (expertId: string) => {
    navigate(`/experts/${expertId}`);
  };

  const handleEditClick = (expertId: string) => {
    navigate(`/admin/manage-experts/${expertId}`);
  };

  if (isLoading) {
    return (
      <div className="rounded-md border mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Expertise</TableHead>
              <TableHead className="text-center">Remedies</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-12 w-12 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[200px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[150px]" />
                </TableCell>
                <TableCell className="text-center">
                  <Skeleton className="h-4 w-8 mx-auto" />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (experts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No experts found. Try adjusting your filters or add a new expert.
      </div>
    );
  }

  return (
    <div className="rounded-md border mt-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Expertise</TableHead>
            <TableHead className="text-center">Remedies</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {experts.map((expert) => (
            <TableRow key={expert.id}>
              <TableCell>
                <img
                  src={expert.image_url || "/placeholder.svg"}
                  alt={expert.full_name}
                  className="w-12 h-12 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => handleExpertClick(expert.id)}
                />
              </TableCell>
              <TableCell 
                className="font-medium cursor-pointer hover:text-primary transition-colors"
                onClick={() => handleExpertClick(expert.id)}
              >
                {expert.full_name}
              </TableCell>
              <TableCell>{expert.field_of_expertise}</TableCell>
              <TableCell className="text-center">
                {expert.expert_remedies?.[0]?.count || 0}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditClick(expert.id)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Expert</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {expert.full_name}? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(expert.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ExpertList;
