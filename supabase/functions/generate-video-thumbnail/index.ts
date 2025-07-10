
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoId, videoUrl } = await req.json();
    
    if (!videoId || !videoUrl) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: videoId and videoUrl" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating thumbnail for video ${videoId} from URL: ${videoUrl}`);
    
    // Check if it's a YouTube video
    const isYoutubeVideo = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
    
    if (isYoutubeVideo) {
      // Extract YouTube video ID and use YouTube thumbnail
      const videoId = extractYoutubeVideoId(videoUrl);
      if (videoId) {
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        return new Response(
          JSON.stringify({
            success: true,
            thumbnailUrl: thumbnailUrl,
            message: "Generated YouTube thumbnail"
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else if (videoUrl.includes('supabase.co/storage')) {
      // For uploaded videos in Supabase storage
      // Get Supabase client
      const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
      
      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error("Missing Supabase credentials");
      }
      
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Generate a thumbnail filename
      const timestamp = new Date().getTime();
      const thumbnailFilename = `thumbnail_${videoId}_${timestamp}.jpg`;
      
      // Create a unique URL for the video thumbnail
      const { data: publicUrlData } = supabase.storage
        .from('video-media')
        .getPublicUrl(thumbnailFilename);
        
      const thumbnailUrl = publicUrlData.publicUrl;
      
      // In a real implementation, we would:
      // 1. Download the video
      // 2. Extract the first frame using FFmpeg or similar
      // 3. Upload the frame to storage
      // 4. Return the URL
      
      // For now, we'll generate a unique placeholder based on the video ID
      // In a production environment, this would be replaced with actual frame extraction
      const placeholderThumbnail = `https://picsum.photos/seed/${videoId}/800/450`;
      
      return new Response(
        JSON.stringify({
          success: true,
          thumbnailUrl: placeholderThumbnail,
          message: "Generated placeholder thumbnail. In production, this function would extract the first frame."
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Default placeholder if we can't determine the type or extract a thumbnail
    const placeholderThumbnail = `https://picsum.photos/seed/${videoId}/800/450`;
    
    return new Response(
      JSON.stringify({
        success: true,
        thumbnailUrl: placeholderThumbnail,
        message: "Generated default placeholder thumbnail."
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in generate-video-thumbnail function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to extract YouTube video ID
function extractYoutubeVideoId(url: string): string | null {
  try {
    // Match both youtube.com/watch?v= and youtu.be/ formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  } catch (e) {
    console.error("Error parsing YouTube URL:", e);
    return null;
  }
}
