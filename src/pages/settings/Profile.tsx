
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, User, Mail, UserCheck, Upload, Trash, CalendarIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  bio: z.string().max(500).optional().or(z.literal('')),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  dob: z.date().optional()
});

type ProfileFormValues = z.infer<typeof formSchema>;

// Define an interface for user settings to properly type the JSON data
interface UserSettings {
  bio?: string;
  dob?: string;
  [key: string]: any; // Allow for other settings properties
}

export default function ProfileSettings() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [user, setUser] = useState({
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
    resolver: zodResolver(formSchema),
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

  useEffect(() => {
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

    fetchUserProfile();
  }, [navigate, toast, form]);

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  }

  async function onSubmit(data: ProfileFormValues) {
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
          avatar_url: avatarPreview || data.avatarUrl || ""
        })
        .eq('id', authUser.id);
      
      if (updateProfileError) {
        throw updateProfileError;
      }
      
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${authUser.id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile);
        
        if (uploadError) {
          console.error("Error uploading avatar:", uploadError);
        } else {
          const { data: publicUrlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);
          
          if (publicUrlData) {
            await supabase
              .from('profiles')
              .update({
                avatar_url: publicUrlData.publicUrl
              })
              .eq('id', authUser.id);
          }
        }
      }
      
      setUser({
        ...user,
        username: data.username,
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        full_name: `${data.firstName} ${data.lastName}`,
        avatar_url: avatarPreview || data.avatarUrl || ""
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
  }

  function removeAvatar() {
    setAvatarFile(null);
    setAvatarPreview(null);
    form.setValue("avatarUrl", "");
  }

  function goBack() {
    navigate(-1);
  }

  if (loading && !user.id) {
    return (
      <div className="container max-w-4xl py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" className="mr-2" onClick={goBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
        </div>
        <Card>
          <CardContent className="p-8 flex justify-center items-center">
            <p>Loading profile information...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" className="mr-2" onClick={goBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your profile information visible to other users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex flex-col items-center space-y-3">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={avatarPreview || user.avatar_url} />
                    <AvatarFallback className="text-2xl">{user.first_name ? user.first_name[0] : ''}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex flex-col items-center space-y-2">
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" className="flex gap-1" asChild>
                        <label>
                          <Upload className="h-4 w-4" />
                          <span>Change</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleAvatarChange}
                          />
                        </label>
                      </Button>
                      
                      {(avatarPreview || user.avatar_url) && (
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm"
                          className="flex gap-1 text-destructive"
                          onClick={removeAvatar}
                        >
                          <Trash className="h-4 w-4" />
                          <span>Remove</span>
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      JPG, GIF or PNG. Max size 3MB.
                    </p>
                  </div>
                </div>
                
                <div className="flex-1 space-y-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem className="text-left">
                        <FormLabel>Username</FormLabel>
                        <div className="flex items-center space-x-2">
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input className="pl-9" placeholder="username" {...field} />
                            </div>
                          </FormControl>
                        </div>
                        <FormDescription>
                          Your unique username will be used as your profile URL.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="text-left">
                        <FormLabel>Email</FormLabel>
                        <div className="flex items-center space-x-2">
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input className="pl-9" type="email" placeholder="email@example.com" {...field} />
                            </div>
                          </FormControl>
                        </div>
                        <FormDescription>
                          Your email address is used for notifications and account recovery.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem className="text-left">
                          <FormLabel>First Name</FormLabel>
                          <div className="flex items-center space-x-2">
                            <FormControl>
                              <div className="relative">
                                <UserCheck className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input className="pl-9" placeholder="First Name" {...field} />
                              </div>
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem className="text-left">
                          <FormLabel>Last Name</FormLabel>
                          <div className="flex items-center space-x-2">
                            <FormControl>
                              <Input placeholder="Last Name" {...field} />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                      <FormItem className="text-left">
                        <FormLabel>Date of Birth</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Your date of birth is used for age verification and personalized experiences.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem className="text-left">
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us a bit about yourself"
                            className="resize-none"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          A brief description about yourself shown on your profile.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-end">
                <Button 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
