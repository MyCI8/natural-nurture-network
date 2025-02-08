
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

    console.log('Fetching preview for URL:', url);

    const response = await fetch(url);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    let title = '';
    let thumbnailUrl = '';

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
      { itemprop: 'image' },
      // Additional selectors for specific sites
      { property: 'og:image:secure' },
      { name: 'image' },
      { property: 'image' }
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

    // Then try to get the best image
    // First check meta tags
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
            }
          } catch (e) {
            console.error('Error parsing JSON-LD:', e);
          }
        }
      }
    }

    // If still no image found, look for the largest image that's likely to be a preview
    if (!thumbnailUrl) {
      const images = Array.from(doc?.querySelectorAll('img') || []);
      let bestImage = null;
      let bestScore = 0;

      for (const img of images) {
        const src = img.getAttribute('src');
        if (!src || !isValidImageUrl(src)) continue;

        // Convert relative URLs to absolute
        const absoluteSrc = new URL(src, url).href;
        
        // Calculate image score based on attributes and position
        const width = parseInt(img.getAttribute('width') || '0');
        const height = parseInt(img.getAttribute('height') || '0');
        const area = width * height;
        
        // Scoring factors
        let score = 0;
        
        // Prefer larger images
        if (area > 10000) score += area / 10000;
        
        // Prefer images higher in the document
        const position = images.indexOf(img);
        score += (images.length - position) / images.length * 10;
        
        // Avoid small icons and common UI elements
        if (width < 100 || height < 100) score -= 50;
        if (src.toLowerCase().includes('logo')) score -= 30;
        if (src.toLowerCase().includes('icon')) score -= 30;
        
        // Prefer images with descriptive attributes
        if (img.getAttribute('alt')) score += 10;
        if (img.getAttribute('title')) score += 10;

        // Boost score for images in main content area
        const parent = img.parentElement;
        if (parent) {
          const parentClasses = parent.getAttribute('class') || '';
          if (parentClasses.includes('content') || parentClasses.includes('main')) {
            score += 20;
          }
        }

        if (score > bestScore) {
          bestScore = score;
          bestImage = absoluteSrc;
        }
      }

      if (bestImage) {
        thumbnailUrl = bestImage;
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

    console.log('Preview results:', { title, thumbnailUrl, url });

    return new Response(
      JSON.stringify({
        title,
        thumbnailUrl,
        url,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating preview:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Helper function to validate image URLs
function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  
  // Check if it's a data URL for an image
  if (url.startsWith('data:image/')) return true;
  
  // Check if it has a valid image extension
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const lowercaseUrl = url.toLowerCase();
  return imageExtensions.some(ext => lowercaseUrl.endsWith(ext)) ||
    // Also allow URLs that might be dynamic but contain image-related keywords
    lowercaseUrl.includes('/image') ||
    lowercaseUrl.includes('/photo') ||
    lowercaseUrl.includes('/picture');
}
