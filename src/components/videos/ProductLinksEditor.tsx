
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, ExternalLink, DollarSign, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { ProductLink } from '@/types/video';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

interface ProductLinksEditorProps {
  videoId: string;
}

const ProductLinksEditor: React.FC<ProductLinksEditorProps> = ({ videoId }) => {
  const [links, setLinks] = useState<ProductLink[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [newLink, setNewLink] = useState<Partial<ProductLink>>({
    title: '',
    url: '',
    price: null,
    image_url: '',
    description: ''
  });

  // Fetch existing product links for the video
  useEffect(() => {
    if (!videoId) return;
    
    const fetchProductLinks = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('video_product_links')
          .select('*')
          .eq('video_id', videoId);
          
        if (error) throw error;
        setLinks(data || []);
      } catch (error) {
        console.error('Error fetching product links:', error);
        toast({
          title: 'Failed to load product links',
          description: 'There was an error loading the product links for this video.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProductLinks();
  }, [videoId]);

  const handleAddLink = async () => {
    if (!videoId || !newLink.title || !newLink.url) {
      toast({
        title: 'Missing information',
        description: 'Please provide a title and URL for the product link.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('video_product_links')
        .insert({
          video_id: videoId,
          title: newLink.title,
          url: newLink.url,
          price: newLink.price,
          image_url: newLink.image_url,
          description: newLink.description
        })
        .select();
        
      if (error) throw error;
      
      setLinks([...links, data[0]]);
      setNewLink({
        title: '',
        url: '',
        price: null,
        image_url: '',
        description: ''
      });
      
      toast({
        title: 'Product link added',
        description: 'The product link has been added to the video.',
      });
    } catch (error) {
      console.error('Error adding product link:', error);
      toast({
        title: 'Failed to add product link',
        description: 'There was an error adding the product link.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteLink = async (id: string) => {
    try {
      const { error } = await supabase
        .from('video_product_links')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setLinks(links.filter(link => link.id !== id));
      toast({
        title: 'Product link deleted',
        description: 'The product link has been removed from the video.',
      });
    } catch (error) {
      console.error('Error deleting product link:', error);
      toast({
        title: 'Failed to delete product link',
        description: 'There was an error deleting the product link.',
        variant: 'destructive',
      });
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setNewLink({ ...newLink, [field]: value });
  };

  const handleUrlChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    handleInputChange('url', url);
    
    // Auto-extract product info if it's an Amazon link
    if (url && (url.includes('amazon.com') || url.includes('amzn.to/') || url.includes('a.co/'))) {
      // Only auto-extract if the URL looks good
      if (url.startsWith('http') && url.length > 10) {
        extractAmazonMetadata(url);
      }
    }
  };

  const extractAmazonMetadata = async (url = newLink.url) => {
    if (!url) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter an Amazon product URL.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsExtracting(true);
    
    try {
      console.log("Extracting metadata for:", url);
      
      // Call our Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('extract-product-info', {
        body: { url }
      });
      
      if (error) throw error;
      
      console.log("Extraction result:", data);
      
      if (data) {
        // Update the form with extracted data
        setNewLink({
          ...newLink,
          url: url,
          title: data.title || newLink.title || '',
          price: data.price || newLink.price || null,
          image_url: data.image_url || newLink.image_url || '',
          description: data.description || newLink.description || ''
        });
        
        toast({
          title: 'Product information extracted',
          description: 'Product details have been populated from Amazon.',
        });
      }
    } catch (error) {
      console.error('Error extracting product metadata:', error);
      toast({
        title: 'Extraction failed',
        description: 'Could not extract product information. Please enter details manually.',
        variant: 'destructive',
      });
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Product Link</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="product-url">Amazon Product URL</Label>
                <div className="flex mt-1">
                  <Input
                    id="product-url"
                    placeholder="https://www.amazon.com/product/... or https://a.co/d/..."
                    value={newLink.url || ''}
                    onChange={handleUrlChange}
                    className="flex-grow"
                  />
                  <Button 
                    className="ml-2 flex-shrink-0 touch-manipulation"
                    variant="outline"
                    onClick={() => extractAmazonMetadata()}
                    type="button"
                    disabled={isExtracting}
                  >
                    {isExtracting ? (
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Extracting...
                      </div>
                    ) : (
                      <>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Extract
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="product-title">Product Title</Label>
                <Input
                  id="product-title"
                  placeholder="Product name"
                  value={newLink.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="product-price">Price ($)</Label>
                <div className="relative mt-1">
                  <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="product-price"
                    type="number"
                    placeholder="0.00"
                    value={newLink.price || ''}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || null)}
                    className="pl-8"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="product-image">Product Image URL</Label>
                <Input
                  id="product-image"
                  placeholder="https://example.com/product-image.jpg"
                  value={newLink.image_url || ''}
                  onChange={(e) => handleInputChange('image_url', e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="product-description">Product Description</Label>
                <Textarea
                  id="product-description"
                  placeholder="Short product description..."
                  value={newLink.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              {newLink.image_url && (
                <div className="mt-2">
                  <Label className="mb-2 block">Image Preview</Label>
                  <div className="w-24 h-24 border rounded overflow-hidden bg-gray-100 dark:bg-dm-mist">
                    <img 
                      src={newLink.image_url} 
                      alt="Product preview" 
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x200/f3f3f3/444444?text=Error';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddLink} className="w-full touch-manipulation">
            <Plus className="h-4 w-4 mr-2" /> Add Product Link
          </Button>
        </CardFooter>
      </Card>

      <div>
        <h3 className="text-lg font-medium mb-4">Existing Product Links</h3>
        {isLoading ? (
          <p className="text-center text-muted-foreground">Loading product links...</p>
        ) : links.length === 0 ? (
          <p className="text-center text-muted-foreground">No product links added yet.</p>
        ) : (
          <div className="space-y-3">
            {links.map((link) => (
              <Card key={link.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-start gap-3">
                      {link.image_url ? (
                        <div className="w-14 h-14 flex-shrink-0">
                          <img 
                            src={link.image_url} 
                            alt={link.title} 
                            className="w-full h-full object-contain rounded border dark:border-dm-mist"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200/f3f3f3/444444?text=NA';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-14 flex-shrink-0 bg-gray-100 dark:bg-dm-mist rounded border dark:border-dm-mist flex items-center justify-center text-xs text-gray-500">
                          No image
                        </div>
                      )}
                      <div className="flex-grow min-w-0">
                        <h4 className="font-medium">{link.title}</h4>
                        <p className="text-sm text-muted-foreground truncate">{link.url}</p>
                        {link.price && (
                          <p className="text-sm mt-1">${link.price.toFixed(2)}</p>
                        )}
                        {link.description && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">{link.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(link.url, '_blank')}
                        className="h-8 w-8 touch-manipulation"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteLink(link.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10 touch-manipulation"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductLinksEditor;
