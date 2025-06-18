import React from "react";
import { useForm } from "react-hook-form";
import { User, Mail, UserCheck } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  // Generate arrays for dropdowns
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    { value: 0, label: "January" },
    { value: 1, label: "February" },
    { value: 2, label: "March" },
    { value: 3, label: "April" },
    { value: 4, label: "May" },
    { value: 5, label: "June" },
    { value: 6, label: "July" },
    { value: 7, label: "August" },
    { value: 8, label: "September" },
    { value: 9, label: "October" },
    { value: 10, label: "November" },
    { value: 11, label: "December" }
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  // Get current date values
  const currentDate = form.watch("dob");
  const currentDay = currentDate?.getDate();
  const currentMonth = currentDate?.getMonth();
  const currentYear = currentDate?.getFullYear();

  // Handle date component changes
  const updateDate = (day?: number, month?: number, year?: number) => {
    const newDay = day ?? currentDay ?? 1;
    const newMonth = month ?? currentMonth ?? 0;
    const newYear = year ?? currentYear ?? 1990;
    
    // Create new date and set it
    const newDate = new Date(newYear, newMonth, newDay);
    form.setValue("dob", newDate);
  };

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
                <div className="grid grid-cols-3 gap-3">
                  {/* Day Selector */}
                  <div>
                    <Select
                      value={currentDay ? currentDay.toString() : ""}
                      onValueChange={(value) => updateDate(parseInt(value), currentMonth, currentYear)}
                    >
                      <SelectTrigger className="touch-manipulation min-h-[44px]">
                        <SelectValue placeholder="DD" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 overflow-auto">
                        {days.map((day) => (
                          <SelectItem key={day} value={day.toString()}>
                            {day.toString().padStart(2, '0')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Month Selector */}
                  <div>
                    <Select
                      value={currentMonth !== undefined ? currentMonth.toString() : ""}
                      onValueChange={(value) => updateDate(currentDay, parseInt(value), currentYear)}
                    >
                      <SelectTrigger className="touch-manipulation min-h-[44px]">
                        <SelectValue placeholder="MM" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 overflow-auto">
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value.toString()}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Year Selector */}
                  <div>
                    <Select
                      value={currentYear ? currentYear.toString() : ""}
                      onValueChange={(value) => updateDate(currentDay, currentMonth, parseInt(value))}
                    >
                      <SelectTrigger className="touch-manipulation min-h-[44px]">
                        <SelectValue placeholder="YYYY" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 overflow-auto">
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
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
