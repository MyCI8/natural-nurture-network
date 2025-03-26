
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { Edit, Grid, Bookmark } from 'lucide-react';
import { UserVideoGrid } from '@/components/profile/UserVideoGrid';
import { SavedVideos } from '@/components/profile/SavedVideos';
import type { User } from '@/types/user';
import { useIsMobile } from '@/hooks/use-mobile';

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState('posts');
  const isMobile = useIsMobile();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.user || null;
    },
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      console.log("Fetched user profile:", data);
      return data as User;
    },
  });

  const isOwnProfile = currentUser?.id === id;

  if (isLoading) {
    return (
      <div className="pt-6 sm:pt-12">
        <div className="max-w-[800px] mx-auto px-4">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="pt-6 sm:pt-12">
        <div className="max-w-[800px] mx-auto px-4">
          <p>Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-6 sm:pt-12">
      <div className="max-w-[800px] mx-auto px-4">
        {/* Profile Header */}
        <div className="py-4 sm:py-8 text-center">
          <Avatar className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4">
            {profile?.avatar_url ? (
              <AvatarImage 
                src={profile.avatar_url} 
                alt={profile.full_name || 'Profile'} 
              />
            ) : (
              <AvatarFallback className="bg-primary/10 text-primary text-xl sm:text-2xl">
                {profile?.full_name?.[0] || '?'}
              </AvatarFallback>
            )}
          </Avatar>
          
          <h1 className="text-xl sm:text-2xl font-semibold mb-2">{profile.full_name}</h1>
          {profile.bio && (
            <p className="text-sm sm:text-base text-muted-foreground mb-4 max-w-md mx-auto">
              {profile.bio}
            </p>
          )}

          {/* Stats */}
          <div className="flex justify-center space-x-6 sm:space-x-8 mb-6">
            <div className="text-center">
              <div className="font-semibold">{profile.posts_count || 0}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">posts</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">{profile.followers_count || 0}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">followers</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">{profile.following_count || 0}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">following</div>
            </div>
          </div>

          {/* Action Buttons */}
          {isOwnProfile ? (
            <Button 
              variant="outline" 
              onClick={() => navigate(`/settings/profile`)}
              className="w-full sm:w-auto py-3 sm:py-2"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <Button 
              className="w-full sm:w-auto py-3 sm:py-2"
              onClick={() => {
                if (!currentUser) {
                  navigate('/auth');
                  return;
                }
                toast({
                  title: "Coming Soon",
                  description: "Following feature will be available soon!",
                });
              }}
            >
              Follow
            </Button>
          )}
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="posts" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="posts" className="flex items-center py-3 sm:py-2">
              <Grid className="w-4 h-4 mr-2" />
              Posts
            </TabsTrigger>
            {isOwnProfile && (
              <TabsTrigger value="saved" className="flex items-center py-3 sm:py-2">
                <Bookmark className="w-4 h-4 mr-2" />
                Saved
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="posts" className="mt-4 sm:mt-6">
            <UserVideoGrid userId={profile.id} />
          </TabsContent>
          
          {isOwnProfile && (
            <TabsContent value="saved" className="mt-4 sm:mt-6">
              <SavedVideos userId={profile.id} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default UserProfile;
