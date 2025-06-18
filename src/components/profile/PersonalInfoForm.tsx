
import React from "react";
import { useForm } from "react-hook-form";
import { User, Mail, UserCheck, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { ProfileImageUpload } from "@/components/profile/ProfileImageUpload";
import { ProfileFormValues } from "@/hooks/use-profile-form";

interface PersonalInfoFormProps {
  form: ReturnType<typeof useForm<ProfileFormValues>>;
  userId: string;
  avatarUrl: string;
  fullName: string;
  onAvatarUpdate: (url: string) => void;
  onSubmit: (values: ProfileFormValues) => Promise<void>;
  loading: boolean;
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
  form,
  userId,
  avatarUrl,
  fullName,
  onAvatarUpdate,
  onSubmit,
  loading
}) => {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex flex-col md:flex-row gap-8">
        <ProfileImageUpload
          userId={userId}
          avatarUrl={avatarUrl}
          fullName={fullName}
          onImageUpdate={onAvatarUpdate}
        />
        
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
                          "w-full pl-3 text-left font-normal touch-manipulation min-h-[44px]",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                        {field.value ? (
                          format(field.value, "MMMM dd, yyyy")
                        ) : (
                          <span>Select your date of birth</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-background" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                      defaultMonth={field.value || new Date(1990, 0, 1)}
                      captionLayout="dropdown"
                      fromYear={1900}
                      toYear={new Date().getFullYear()}
                      className="p-3 pointer-events-auto touch-manipulation"
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
          className="touch-manipulation min-h-[44px]"
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
};
