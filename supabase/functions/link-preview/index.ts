
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

    // Add user agent to mimic a browser request
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml'
      }
    };

    const response = await fetch(url, options);
    const html = await response.text();
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
      { itemprop: 'image' },
      // Additional selectors for specific sites
      { property: 'og:image:secure' },
      { name: 'image' },
      { property: 'image' }
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
            } else if (image && Array.isArray(image) && image.length > 0) {
              // Some sites provide image as an array
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

    // Amazon-specific image extraction if needed
    if (!thumbnailUrl && (url.includes('amazon.com') || url.includes('amzn.to') || url.includes('a.co'))) {
      // Try to find the main product image
      const mainImage = doc?.querySelector('#landingImage, #imgBlkFront, #ebooksImgBlkFront');
      if (mainImage) {
        const src = mainImage.getAttribute('src') || mainImage.getAttribute('data-old-hires') || mainImage.getAttribute('data-a-dynamic-image');
        if (src && isValidImageUrl(src)) {
          thumbnailUrl = src;
        } else if (src && src.startsWith('{')) {
          // Handle the data-a-dynamic-image JSON string
          try {
            const imageData = JSON.parse(src);
            const imageUrl = Object.keys(imageData)[0]; // Get the first URL
            if (imageUrl && isValidImageUrl(imageUrl)) {
              thumbnailUrl = imageUrl;
            }
          } catch (e) {
            console.error('Error parsing Amazon image JSON:', e);
          }
        }
      }
    }

    // If still no image found, look for the largest image that's likely to be a preview
    if (!thumbnailUrl) {
      const images = Array.from(doc?.querySelectorAll('img') || [])
        .filter(img => {
          const src = img.getAttribute('src');
          return src && isValidImageUrl(src) && !src.includes('logo') && !src.includes('icon');
        })
        .map(img => {
          const src = img.getAttribute('src');
          // Convert relative URLs to absolute
          const absoluteSrc = src ? new URL(src, url).href : '';
          const width = parseInt(img.getAttribute('width') || '0');
          const height = parseInt(img.getAttribute('height') || '0');
          const alt = img.getAttribute('alt') || '';
          
          // Calculate score based on size and position
          let score = 0;
          if (width > 100 && height > 100) {
            score += (width * height) / 5000; // Prefer larger images
          }
          // Boost score for images that might be product-related
          if (alt && !alt.toLowerCase().includes('logo') && !alt.toLowerCase().includes('icon')) {
            score += 20;
          }
          
          return { src: absoluteSrc, score, width, height };
        })
        .sort((a, b) => b.score - a.score); // Sort by score descending
      
      if (images.length > 0) {
        thumbnailUrl = images[0].src;
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

    // Extract product price if available (for Amazon specifically)
    if (url.includes('amazon.com') || url.includes('amzn.to/') || url.includes('a.co/')) {
      // Try various price selectors specific to Amazon
      const priceSelectors = [
        '#priceblock_ourprice',
        '#priceblock_dealprice',
        '.a-price .a-offscreen',
        '#corePrice_desktop .a-price .a-offscreen',
        '.a-price .a-price-whole',
        '.a-price',
        '#tp_price_block_total_price_ww .a-offscreen'
      ];
      
      for (const selector of priceSelectors) {
        const priceElement = doc?.querySelector(selector);
        if (priceElement) {
          const priceText = priceElement.textContent || priceElement.getAttribute('content') || '';
          // Extract digits and decimal point only
          const priceMatch = priceText.match(/(\d+([.,]\d+)?)/);
          if (priceMatch) {
            price = parseFloat(priceMatch[0].replace(',', '.'));
            break;
          }
        }
      }
    }

    console.log('Preview results:', { title, description, thumbnailUrl, url, price });

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
  
  // First check for common image extensions
  const hasImageExtension = imageExtensions.some(ext => lowercaseUrl.endsWith(ext));
  
  // Then check for additional image-related patterns in the URL
  const hasImagePattern = 
    lowercaseUrl.includes('/image') ||
    lowercaseUrl.includes('/photo') ||
    lowercaseUrl.includes('/picture') ||
    lowercaseUrl.includes('/images/') ||
    lowercaseUrl.includes('/img/');
    
  return hasImageExtension || hasImagePattern;
}
