
import { User, UserRole } from "@/types/user";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserCog, UserMinus, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";

interface UserTableProps {
  users: User[];
  onEditUser: (userId: string) => void;
  onDeactivateUser: (userId: string) => void;
}

export const UserTable = ({ users, onEditUser, onDeactivateUser }: UserTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Full Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.full_name || "N/A"}</TableCell>
              <TableCell>{user.email || "N/A"}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {user.role || "user"}
                </Badge>
              </TableCell>
              <TableCell>{user.last_login_at || "Never"}</TableCell>
              <TableCell>
                {user.account_status === "active" ? (
                  <Badge className="bg-green-500">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Active
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="mr-1 h-3 w-3" />
                    Inactive
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditUser(user.id)}
                  >
                    <UserCog className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeactivateUser(user.id)}
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
