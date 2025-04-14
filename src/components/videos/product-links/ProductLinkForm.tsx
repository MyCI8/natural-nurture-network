
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, ExternalLink, Loader2, DollarSign } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ProductLink } from '@/types/video';

interface ProductLinkFormProps {
  onAddLink: (productLink: Omit<ProductLink, 'id' | 'created_at'>) => Promise<void>;
}

const ProductLinkForm: React.FC<ProductLinkFormProps> = ({ onAddLink }) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [newLink, setNewLink] = useState<Partial<ProductLink>>({
    title: '',
    url: '',
    price: null,
    image_url: '',
    description: ''
  });

  const handleInputChange = (field: string, value: any) => {
    setNewLink({ ...newLink, [field]: value });
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    handleInputChange('url', url);
  };

  const extractAmazonMetadata = async (url = newLink.url) => {
    if (!url) {
      toast.error('Please enter an Amazon product URL.');
      return;
    }
    
    setIsExtracting(true);
    
    try {
      console.log("Extracting metadata for:", url);
      
      // Call our Supabase Edge Function for link preview
      const { data, error } = await supabase.functions.invoke('link-preview', {
        body: { url }
      });
      
      if (error) throw error;
      
      console.log("Link preview result:", data);
      
      if (data) {
        // Update the form with extracted data
        setNewLink({
          ...newLink,
          title: data.title || newLink.title || '',
          image_url: data.thumbnailUrl || newLink.image_url || '',
          description: data.description || newLink.description || '',
          price: data.price || newLink.price || null,
          url: url
        });
        
        toast.success('Product information extracted successfully!');
      }
    } catch (error: any) {
      console.error('Error extracting product metadata:', error);
      toast.error(`Extraction failed: ${error.message}`);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = async () => {
    if (!newLink.title || !newLink.url) {
      toast.error('Please provide a title and URL for the product link.');
      return;
    }

    try {
      await onAddLink({
        title: newLink.title || '',
        url: newLink.url || '',
        price: newLink.price || null,
        image_url: newLink.image_url || '',
        description: newLink.description || '',
        video_id: '',
        position_x: null,
        position_y: null
      });

      // Reset the form
      setNewLink({
        title: '',
        url: '',
        price: null,
        image_url: '',
        description: ''
      });
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  return (
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
                  className="flex-grow touch-manipulation"
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
                className="mt-1 touch-manipulation"
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
                  className="pl-8 touch-manipulation"
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
                className="mt-1 touch-manipulation"
              />
            </div>
            
            <div>
              <Label htmlFor="product-description">Product Description</Label>
              <Textarea
                id="product-description"
                placeholder="Short product description..."
                value={newLink.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="mt-1 touch-manipulation"
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
        <Button 
          onClick={handleSubmit} 
          className="w-full touch-manipulation"
          type="button"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Product Link
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductLinkForm;
