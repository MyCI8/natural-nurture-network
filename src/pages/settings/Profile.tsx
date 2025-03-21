import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, User, Mail, UserCheck, Upload, Trash } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  fullName: z.string().min(2).max(100),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional().or(z.literal(''))
});

type ProfileFormValues = z.infer<typeof formSchema>;

export default function ProfileSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const [user, setUser] = useState({
    id: "user-123",
    username: "johndoe",
    email: "john.doe@example.com",
    full_name: "John Doe",
    bio: "",
    avatar_url: "https://github.com/shadcn.png",
    created_at: "2023-01-01",
    account_status: "active",
    failed_login_attempts: 0,
    last_failed_login_at: "",
    last_login_at: "2023-06-01",
    phone_number: "",
    role: "user",
    updated_at: "2023-06-01"
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      bio: user.bio,
      avatarUrl: user.avatar_url
    }
  });

  useEffect(() => {
    if (user) {
      form.reset({
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        bio: user.bio,
        avatarUrl: user.avatar_url
      });
    }
  }, [user, form]);

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  }

  function onSubmit(data: ProfileFormValues) {
    setLoading(true);
    
    setTimeout(() => {
      console.log("Profile form submitted:", data);
      
      setUser({
        ...user,
        username: data.username,
        email: data.email,
        full_name: data.fullName,
        bio: data.bio || "",
        avatar_url: avatarPreview || data.avatarUrl || ""
      });
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully."
      });
      
      setLoading(false);
    }, 1000);
  }

  function removeAvatar() {
    setAvatarFile(null);
    setAvatarPreview(null);
    form.setValue("avatarUrl", "");
  }

  return (
    <div className="container max-w-4xl py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" className="mr-2">
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
                    <AvatarFallback className="text-2xl">{user.full_name[0]}</AvatarFallback>
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
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <div className="flex items-center space-x-2">
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input className="pl-9" placeholder="johndoe" {...field} />
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
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <div className="flex items-center space-x-2">
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input className="pl-9" type="email" placeholder="john.doe@example.com" {...field} />
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
                  
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <div className="flex items-center space-x-2">
                          <FormControl>
                            <div className="relative">
                              <UserCheck className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input className="pl-9" placeholder="John Doe" {...field} />
                            </div>
                          </FormControl>
                        </div>
                        <FormDescription>
                          How your name will appear to other users.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
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
