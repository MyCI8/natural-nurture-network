
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, ExternalLink, DollarSign } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { ProductLink } from '@/types/video';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface ProductLinksEditorProps {
  videoId: string;
}

const ProductLinksEditor: React.FC<ProductLinksEditorProps> = ({ videoId }) => {
  const [links, setLinks] = useState<ProductLink[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newLink, setNewLink] = useState<Partial<ProductLink>>({
    title: '',
    url: '',
    price: null,
    position_x: 50,
    position_y: 50,
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
          position_x: newLink.position_x,
          position_y: newLink.position_y,
        })
        .select();
        
      if (error) throw error;
      
      setLinks([...links, data[0]]);
      setNewLink({
        title: '',
        url: '',
        price: null,
        position_x: 50,
        position_y: 50,
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

  const extractAmazonMetadata = async () => {
    if (!newLink.url || !newLink.url.includes('amazon.com')) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid Amazon product URL.',
        variant: 'destructive',
      });
      return;
    }
    
    // This is a placeholder for an API that would extract metadata
    // In a real implementation, you would call a backend service
    toast({
      title: 'Extracting product information',
      description: 'This would connect to an API to extract Amazon product metadata.',
    });
    
    // Simulate extraction delay
    setTimeout(() => {
      // Example placeholder metadata
      const title = 'Amazon Product ' + Math.floor(Math.random() * 1000);
      const price = (Math.random() * 100).toFixed(2);
      
      setNewLink({
        ...newLink,
        title: title,
        price: parseFloat(price),
      });
      
      toast({
        title: 'Product information extracted',
        description: 'Product title and price have been populated.',
      });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Product Link</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-3">
                <Label htmlFor="product-url">Amazon Product URL</Label>
                <div className="flex mt-1">
                  <Input
                    id="product-url"
                    placeholder="https://www.amazon.com/product/..."
                    value={newLink.url || ''}
                    onChange={(e) => handleInputChange('url', e.target.value)}
                    className="flex-grow"
                  />
                  <Button 
                    className="ml-2"
                    variant="outline"
                    onClick={extractAmazonMetadata}
                    type="button"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Extract
                  </Button>
                </div>
              </div>
              
              <div className="col-span-2">
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
                <Label htmlFor="position-x">Position X (%)</Label>
                <Input
                  id="position-x"
                  type="number"
                  placeholder="50"
                  min={0}
                  max={100}
                  value={newLink.position_x || 50}
                  onChange={(e) => handleInputChange('position_x', parseInt(e.target.value) || 50)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="position-y">Position Y (%)</Label>
                <Input
                  id="position-y"
                  type="number"
                  placeholder="50"
                  min={0}
                  max={100}
                  value={newLink.position_y || 50}
                  onChange={(e) => handleInputChange('position_y', parseInt(e.target.value) || 50)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddLink} className="w-full">
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
                    <div>
                      <h4 className="font-medium">{link.title}</h4>
                      <p className="text-sm text-muted-foreground truncate">{link.url}</p>
                      <div className="flex items-center mt-1">
                        {link.price && (
                          <span className="text-sm mr-3">${link.price.toFixed(2)}</span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          Position: {link.position_x}%, {link.position_y}%
                        </span>
                      </div>
                    </div>
                    <div className="flex">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(link.url, '_blank')}
                        className="h-8 w-8"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteLink(link.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
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
