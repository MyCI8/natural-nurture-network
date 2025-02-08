
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const response = await fetch(url);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    let title = '';
    let thumbnailUrl = '';

    // Try to get OpenGraph title and image
    const ogTitle = doc?.querySelector('meta[property="og:title"]')?.getAttribute('content');
    const ogImage = doc?.querySelector('meta[property="og:image"]')?.getAttribute('content');
    
    // Fallback to Twitter card data
    const twitterTitle = doc?.querySelector('meta[name="twitter:title"]')?.getAttribute('content');
    const twitterImage = doc?.querySelector('meta[name="twitter:image"]')?.getAttribute('content');
    
    // Further fallbacks
    const metaTitle = doc?.querySelector('meta[name="title"]')?.getAttribute('content');
    const htmlTitle = doc?.querySelector('title')?.textContent;

    // Get the best available title
    title = ogTitle || twitterTitle || metaTitle || htmlTitle || '';

    // Get the best available image
    thumbnailUrl = ogImage || twitterImage || '';

    // If no social media preview image is found, try to find the first image on the page
    if (!thumbnailUrl) {
      const firstImage = doc?.querySelector('img')?.getAttribute('src');
      if (firstImage) {
        // Convert relative URLs to absolute
        try {
          thumbnailUrl = new URL(firstImage, url).href;
        } catch {
          thumbnailUrl = firstImage;
        }
      }
    }

    return new Response(
      JSON.stringify({
        title,
        thumbnailUrl,
        url,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
