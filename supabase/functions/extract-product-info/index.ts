
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.35-alpha/deno-dom-wasm.ts";

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
    const { url } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Extracting product info from: ${url}`);
    
    // Resolve the URL (follow redirects if it's a short URL)
    const resolvedUrl = await resolveUrl(url);
    console.log(`Resolved URL: ${resolvedUrl}`);
    
    // Extract product information from the resolved URL
    const productInfo = await extractProductInfo(resolvedUrl);
    
    return new Response(
      JSON.stringify(productInfo),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error extracting product info:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to extract product information',
        title: "Amazon Product", // Fallback title
        image_url: null,
        price: null,
        description: "Product information could not be extracted automatically."
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Function to resolve URLs (follow redirects)
async function resolveUrl(url: string): Promise<string> {
  try {
    // Handle Amazon short links
    if (url.includes('a.co/') || url.includes('amzn.to/')) {
      console.log("Following Amazon short URL redirect:", url);
      
      // Use fetch with HEAD method to follow redirects
      const response = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });
      
      // Return the final URL after redirects
      console.log("Resolved to:", response.url);
      return response.url;
    }
    
    // If it's not a short URL, return it as is
    return url;
  } catch (error) {
    console.error('Error resolving URL:', error);
    // If resolution fails, return the original URL
    return url;
  }
}

// Function to extract product information from a URL
async function extractProductInfo(url: string) {
  try {
    console.log("Fetching page content from:", url);
    
    // Fetch the page content
    const response = await fetch(url, {
      headers: {
        // Simulate a browser request to avoid being blocked
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    console.log("Page content length:", html.length);
    
    // Parse the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    if (!doc) {
      throw new Error('Failed to parse HTML');
    }
    
    // Extract product information from meta tags
    const productInfo = {
      title: extractMetaContent(doc, 'og:title') || 
             extractMetaContent(doc, 'twitter:title') ||
             extractTitle(doc) || 
             "Amazon Product",
      image_url: extractMetaContent(doc, 'og:image') || 
                 extractMetaContent(doc, 'twitter:image') ||
                 extractAmazonProductImage(doc, html),
      description: extractMetaContent(doc, 'og:description') || 
                   extractMetaContent(doc, 'twitter:description') ||
                   extractMetaContent(doc, 'description') ||
                   "Product from Amazon",
      price: extractPrice(doc, html),
      url: url
    };
    
    console.log('Extracted product info:', productInfo);
    
    return productInfo;
  } catch (error) {
    console.error('Error in extractProductInfo:', error);
    
    // If all extraction methods fail, return a basic object with the URL
    return {
      title: "Amazon Product",
      image_url: null,
      description: "Product information could not be extracted automatically.",
      price: null,
      url: url,
      error: error.message
    };
  }
}

// Helper function to extract content from meta tags
function extractMetaContent(doc: Document, property: string): string | null {
  // Check for Open Graph and other meta tags
  const metaTag = doc.querySelector(`meta[property="${property}"], meta[name="${property}"]`);
  return metaTag ? metaTag.getAttribute('content') : null;
}

// Helper function to extract the title
function extractTitle(doc: Document): string | null {
  const titleElement = doc.querySelector('title');
  if (titleElement && titleElement.textContent) {
    // Clean up the title (remove "Amazon.com:" prefix if present)
    let title = titleElement.textContent.trim();
    if (title.startsWith("Amazon.com:")) {
      title = title.substring("Amazon.com:".length).trim();
    }
    return title;
  }
  return null;
}

// Helper function to extract Amazon product images
function extractAmazonProductImage(doc: Document, html: string): string | null {
  try {
    // Try various selectors that might contain the product image
    const imgSelectors = [
      '#landingImage',
      '#imgBlkFront',
      '#main-image',
      '.a-dynamic-image',
      '#ebooksImgBlkFront'
    ];
    
    for (const selector of imgSelectors) {
      const img = doc.querySelector(selector);
      if (img && img.getAttribute('src')) {
        return img.getAttribute('src');
      }
    }
    
    // Try to find image URL in the JSON data that Amazon embeds in the page
    const imgJsonRegex = /"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/;
    const imgMatch = html.match(imgJsonRegex);
    if (imgMatch && imgMatch[1]) {
      return imgMatch[1];
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting Amazon product image:', error);
    return null;
  }
}

// Helper function to extract the price
function extractPrice(doc: Document, html: string): number | null {
  try {
    // Try to find price in specific spans that Amazon usually uses
    const priceElements = doc.querySelectorAll('.a-price .a-offscreen, #priceblock_ourprice, #priceblock_dealprice, .a-color-price');
    
    for (let i = 0; i < priceElements.length; i++) {
      const priceText = priceElements[i].textContent;
      if (priceText) {
        // Extract the number from the price text (remove currency symbols, commas, etc.)
        const priceMatch = priceText.match(/[\d,.]+/);
        if (priceMatch) {
          // Parse the price as a float, removing any non-numeric characters except decimal points
          return parseFloat(priceMatch[0].replace(/[^\d.]/g, ''));
        }
      }
    }
    
    // If the above methods fail, try to find price using regex in the raw HTML
    const pricePatterns = [
      /"price":\s*([\d.]+)/,
      /"amount":\s*"([\d.]+)"/,
      /priceAmount.*?([\d.]+)/
    ];
    
    for (const pattern of pricePatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        return parseFloat(match[1]);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting price:', error);
    return null;
  }
}
