
import { useEffect } from "react";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useProfileForm } from "@/hooks/use-profile-form";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PersonalInfoForm } from "@/components/profile/PersonalInfoForm";

export default function ProfileSettings() {
  const {
    form,
    user,
    loading,
    fetchUserProfile,
    handleAvatarUpdate,
    onSubmit
  } = useProfileForm();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  if (loading && !user.id) {
    return (
      <div className="container max-w-4xl py-6">
        <ProfileHeader title="Profile Settings" />
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
      <ProfileHeader title="Profile Settings" />
      
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your profile information visible to other users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <PersonalInfoForm
              form={form}
              userId={user.id}
              avatarUrl={user.avatar_url}
              fullName={user.full_name}
              onAvatarUpdate={handleAvatarUpdate}
              onSubmit={onSubmit}
              loading={loading}
            />
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
