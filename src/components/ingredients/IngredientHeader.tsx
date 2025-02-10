
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Expert } from "@/types/expert";

interface IngredientHeaderProps {
  name: string;
  briefDescription: string | null;
  remedyCount: number;
  experts: Expert[];
}

export const IngredientHeader = ({ 
  name, 
  briefDescription, 
  remedyCount, 
  experts 
}: IngredientHeaderProps) => {
  return (
    <>
      <h1 className="text-3xl font-bold">{name}</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Summary</TableHead>
            <TableHead>Used in Remedies</TableHead>
            <TableHead>Recommended by Experts</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">{name}</TableCell>
            <TableCell>{briefDescription || 'No summary available'}</TableCell>
            <TableCell>{remedyCount} remedies</TableCell>
            <TableCell>
              <div className="flex -space-x-2">
                {experts.map((expert) => (
                  <Avatar
                    key={expert.id}
                    className="border-2 border-background"
                    title={expert.full_name}
                  >
                    <AvatarImage src={expert.image_url || undefined} />
                    <AvatarFallback>
                      {expert.full_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </>
  );
};
