
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client for caching
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

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

    console.log('Fetching preview for URL:', url);

    // Check cache first
    const { data: cachedData } = await supabase
      .from('link_previews_cache')
      .select('*')
      .eq('url', url)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (cachedData) {
      console.log('Cache hit for URL:', url);
      if (cachedData.success) {
        return new Response(
          JSON.stringify({
            title: cachedData.title,
            description: cachedData.description,
            thumbnailUrl: cachedData.thumbnail_url,
            url: cachedData.url,
            price: cachedData.price
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // Return cached error but with shorter TTL
        return new Response(
          JSON.stringify({ error: cachedData.error_message || 'Failed to fetch preview' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    }

    console.log('Cache miss, fetching fresh data for:', url);

    // Enhanced user agents for better success rates
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ];
    
    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

    const options = {
      headers: {
        'User-Agent': randomUserAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    };

    let response;
    let html;
    let errorMessage = '';

    try {
      response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      html = await response.text();
      
      // Check for Cloudflare or other bot protection
      if (html.includes('Just a moment...') || 
          html.includes('cloudflare') || 
          html.includes('Checking your browser') ||
          html.includes('Please wait while we verify')) {
        throw new Error('Site is protected by bot detection');
      }
      
    } catch (error) {
      errorMessage = error.message;
      console.error('Error fetching URL:', error);
      
      // Cache the error with shorter TTL (1 hour)
      await supabase
        .from('link_previews_cache')
        .upsert({
          url,
          success: false,
          error_message: errorMessage,
          expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
        });

      return new Response(
        JSON.stringify({ error: errorMessage }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    let title = '';
    let description = '';
    let thumbnailUrl = '';
    let price = null;

    // Get meta tags (including OpenGraph and Twitter Card)
    const metaTags = doc?.querySelectorAll('meta');
    
    // Enhanced meta selectors for thumbnails
    const possibleMetaSelectors = [
      { property: 'og:image:secure_url' },
      { property: 'og:image' },
      { name: 'twitter:image' },
      { property: 'og:image:url' },
      { property: 'twitter:image:src' },
      { name: 'thumbnail' },
      { itemprop: 'image' }
    ];

    // Description selectors
    const descriptionSelectors = [
      { property: 'og:description' },
      { name: 'twitter:description' },
      { name: 'description' },
      { itemprop: 'description' }
    ];

    // First try to get the best title
    const titleSelectors = [
      { selector: 'meta[property="og:title"]', attr: 'content' },
      { selector: 'meta[name="twitter:title"]', attr: 'content' },
      { selector: 'meta[name="title"]', attr: 'content' },
      { selector: 'title', attr: 'textContent' }
    ];

    for (const { selector, attr } of titleSelectors) {
      const element = doc?.querySelector(selector);
      const value = element?.[attr] || element?.getAttribute(attr);
      if (value) {
        title = value.trim();
        break;
      }
    }

    // Try to get description
    for (const metaConfig of descriptionSelectors) {
      const [property, value] = Object.entries(metaConfig)[0];
      const tag = Array.from(metaTags || []).find(meta => 
        meta.getAttribute(property) === value
      );
      
      if (tag) {
        const content = tag.getAttribute('content');
        if (content) {
          description = content.trim();
          break;
        }
      }
    }

    // Try to get the best image
    for (const metaConfig of possibleMetaSelectors) {
      const [property, value] = Object.entries(metaConfig)[0];
      const tag = Array.from(metaTags || []).find(meta => 
        meta.getAttribute(property) === value
      );
      
      if (tag) {
        const content = tag.getAttribute('content');
        if (content && isValidImageUrl(content)) {
          thumbnailUrl = content;
          break;
        }
      }
    }

    // If no meta image found, look for JSON-LD data
    if (!thumbnailUrl) {
      const jsonLdScripts = doc?.querySelectorAll('script[type="application/ld+json"]');
      if (jsonLdScripts) {
        for (const script of Array.from(jsonLdScripts)) {
          try {
            const jsonLd = JSON.parse(script.textContent || '');
            const image = jsonLd.image || 
                         (jsonLd['@graph']?.[0]?.image) ||
                         (jsonLd.thumbnailUrl);
            
            if (image && typeof image === 'string' && isValidImageUrl(image)) {
              thumbnailUrl = image;
              break;
            } else if (image && Array.isArray(image) && image.length > 0) {
              const firstImage = typeof image[0] === 'string' ? image[0] : image[0]?.url;
              if (firstImage && isValidImageUrl(firstImage)) {
                thumbnailUrl = firstImage;
                break;
              }
            }
          } catch (e) {
            console.error('Error parsing JSON-LD:', e);
          }
        }
      }
    }

    // Make sure the URL is absolute
    if (thumbnailUrl) {
      try {
        thumbnailUrl = new URL(thumbnailUrl, url).href;
      } catch (error) {
        console.error('Error converting thumbnail URL to absolute:', error);
      }
    }

    console.log('Preview results:', { title, description, thumbnailUrl, url, price });

    // Cache successful result for 24 hours
    await supabase
      .from('link_previews_cache')
      .upsert({
        url,
        title,
        description,
        thumbnail_url: thumbnailUrl,
        price,
        success: true,
        error_message: null,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      });

    return new Response(
      JSON.stringify({
        title,
        description,
        thumbnailUrl,
        url,
        price
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating preview:', error);
    
    // Cache generic error
    if (req.json) {
      const { url } = await req.json();
      if (url) {
        await supabase
          .from('link_previews_cache')
          .upsert({
            url,
            success: false,
            error_message: error.message,
            expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
          });
      }
    }
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  
  if (url.startsWith('data:image/')) return true;
  
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const lowercaseUrl = url.toLowerCase();
  
  const hasImageExtension = imageExtensions.some(ext => lowercaseUrl.endsWith(ext));
  
  const hasImagePattern = 
    lowercaseUrl.includes('/image') ||
    lowercaseUrl.includes('/photo') ||
    lowercaseUrl.includes('/picture') ||
    lowercaseUrl.includes('/images/') ||
    lowercaseUrl.includes('/img/');
    
  return hasImageExtension || hasImagePattern;
}
