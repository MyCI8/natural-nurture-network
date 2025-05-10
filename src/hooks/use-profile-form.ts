
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Form schema definition
export const profileFormSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  bio: z.string().max(500).optional().or(z.literal('')),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  dob: z.date().optional()
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Define an interface for user settings to properly type the JSON data
export interface UserSettings {
  bio?: string;
  dob?: string;
  [key: string]: any; // Allow for other settings properties
}

export interface ProfileUser {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  avatar_url: string;
  created_at: string;
  account_status: string;
  failed_login_attempts: number;
  last_failed_login_at: string;
  last_login_at: string;
  updated_at: string;
}

export function useProfileForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<ProfileUser>({
    id: "",
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    full_name: "",
    avatar_url: "",
    created_at: "",
    account_status: "active",
    failed_login_attempts: 0,
    last_failed_login_at: "",
    last_login_at: "",
    updated_at: ""
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      bio: "",
      avatarUrl: "",
      dob: undefined
    }
  });
  
  const fetchUserProfile = async () => {
    setLoading(true);
    
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        navigate('/auth');
        return;
      }
      
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }
      
      if (profileData) {
        const userData = {
          id: profileData.id || '',
          username: profileData.username || '',
          email: authUser.email || '',
          first_name: profileData.full_name?.split(' ')[0] || '',
          last_name: profileData.full_name?.split(' ')[1] || '',
          full_name: profileData.full_name || '',
          avatar_url: profileData.avatar_url || '',
          created_at: profileData.created_at || '',
          account_status: profileData.account_status || 'active',
          failed_login_attempts: profileData.failed_login_attempts || 0,
          last_failed_login_at: profileData.last_failed_login_at || '',
          last_login_at: profileData.last_login_at || '',
          updated_at: profileData.updated_at || ''
        };
        
        setUser(userData);
        
        // Safely extract bio and dob from settings JSON
        let bio = "";
        let dob: Date | undefined = undefined;
        
        if (profileData.settings) {
          // Check if settings is an object and has properties
          const settings = profileData.settings as UserSettings;
          if (typeof settings === 'object' && settings !== null) {
            bio = settings.bio || "";
            
            // Parse date of birth if it exists
            if (settings.dob) {
              try {
                dob = new Date(settings.dob);
                // Check if date is valid
                if (isNaN(dob.getTime())) {
                  dob = undefined;
                }
              } catch (e) {
                console.error("Error parsing date:", e);
                dob = undefined;
              }
            }
          }
        }
        
        form.reset({
          username: userData.username,
          email: userData.email,
          firstName: userData.first_name,
          lastName: userData.last_name,
          bio: bio,
          avatarUrl: userData.avatar_url,
          dob: dob
        });
      }
    } catch (error) {
      console.error("Failed to load user profile:", error);
      toast({
        title: "Error",
        description: "Failed to load your profile information.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpdate = (url: string) => {
    setUser({
      ...user,
      avatar_url: url
    });
    form.setValue("avatarUrl", url);
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setLoading(true);
    
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to update your profile.",
          variant: "destructive"
        });
        navigate('/auth');
        return;
      }
      
      if (data.email !== user.email) {
        const { error: updateEmailError } = await supabase.auth.updateUser({ 
          email: data.email 
        });
        
        if (updateEmailError) {
          throw updateEmailError;
        }
      }
      
      // Create a proper settings object
      const settings: UserSettings = { 
        bio: data.bio || "",
        dob: data.dob ? format(data.dob, 'yyyy-MM-dd') : undefined
      };
      
      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({
          username: data.username,
          full_name: `${data.firstName} ${data.lastName}`,
          settings: settings,
          avatar_url: data.avatarUrl
        })
        .eq('id', authUser.id);
      
      if (updateProfileError) {
        throw updateProfileError;
      }
      
      setUser({
        ...user,
        username: data.username,
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        full_name: `${data.firstName} ${data.lastName}`,
        avatar_url: data.avatarUrl || ""
      });
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully."
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: error.message || "An error occurred while updating your profile.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    user,
    loading,
    setUser,
    fetchUserProfile,
    handleAvatarUpdate,
    onSubmit
  };
}
