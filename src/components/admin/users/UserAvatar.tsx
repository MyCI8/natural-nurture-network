
import { Avatar } from "@/components/ui/avatar";

interface UserAvatarProps {
  avatarUrl: string | null;
  fullName: string | null;
}

export const UserAvatar = ({ avatarUrl, fullName }: UserAvatarProps) => {
  return (
    <Avatar className="h-10 w-10">
      {avatarUrl ? (
        <img src={avatarUrl} alt={fullName || ""} />
      ) : (
        <div className="bg-primary/10 w-full h-full flex items-center justify-center text-primary font-semibold">
          {(fullName || "U")[0]}
        </div>
      )}
    </Avatar>
  );
};
