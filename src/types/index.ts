import { Tables } from "@/integrations/supabase/types";

export type CommentWithProfile = Tables<"comments"> & {
  profile?: Pick<Tables<"profiles">, "id" | "full_name">;
};