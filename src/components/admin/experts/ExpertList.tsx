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

interface Expert {
  id: string;
  full_name: string;
  image_url: string;
  field_of_expertise: string;
  expert_remedies: { count: number }[];
}

interface ExpertListProps {
  experts: Expert[];
  onDelete: (expertId: string) => void;
}

const ExpertList = ({ experts, onDelete }: ExpertListProps) => {
  const navigate = useNavigate();

  const handleExpertClick = (expertId: string) => {
    navigate(`/experts/${expertId}`);
  };

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
                  onClick={() => navigate(`/admin/manage-experts/${expert.id}`)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(expert.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ExpertList;