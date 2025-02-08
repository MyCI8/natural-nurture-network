
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const FIRECRAWL_API_ENDPOINT = 'https://api.firecrawl.ai/v1'

interface SearchResult {
  success: boolean;
  data?: {
    name?: string;
    biography?: string;
    image?: string;
    socialLinks?: {
      wikipedia?: string;
      linkedin?: string;
      twitter?: string;
      website?: string;
    };
    credentials?: string[];
  };
  error?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { searchQuery } = await req.json()
    
    // Get the API key from Supabase secrets
    const apiKey = Deno.env.get('FIRECRAWL_API_KEY')
    if (!apiKey) {
      throw new Error('Firecrawl API key not configured')
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    console.log('Searching for expert:', searchQuery)

    // Make request to Firecrawl API
    const response = await fetch(`${FIRECRAWL_API_ENDPOINT}/experts/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query: searchQuery,
        options: {
          sources: ['wikipedia', 'linkedin', 'professional_websites'],
          includeImages: true,
          includeSocialLinks: true,
        },
      }),
    })

    const result = await response.json()
    console.log('Firecrawl API response:', result)

    if (!response.ok) {
      throw new Error(result.error || 'Failed to search for expert')
    }

    // Store the search result in Supabase
    const { error: insertError } = await supabaseClient
      .from('expert_searches')
      .insert({
        name: result.data?.name,
        biography: result.data?.biography,
        image_url: result.data?.image,
        social_links: result.data?.socialLinks,
        credentials: result.data?.credentials,
      })

    if (insertError) {
      console.error('Error storing search result:', insertError)
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Error in searchExperts function:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
