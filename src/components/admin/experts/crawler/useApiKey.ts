
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useApiKey = () => {
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('key_value')
        .eq('name', 'firecrawl')
        .maybeSingle();

      if (data?.key_value) {
        setApiKey(data.key_value);
      }
    } catch (error) {
      console.error('Error loading API key:', error);
    }
  };

  const saveApiKey = async (key: string) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .upsert({ 
          name: 'firecrawl', 
          key_value: key 
        }, { 
          onConflict: 'name'
        });

      if (error) {
        console.error('Error saving API key:', error);
        toast({
          title: "Error",
          description: "Failed to save API key",
          variant: "destructive",
        });
        return false;
      }
      setApiKey(key);
      setShowApiKeyDialog(false);
      toast({
        title: "Success",
        description: "API key saved successfully",
      });
      return true;
    } catch (error) {
      console.error('Error saving API key:', error);
      toast({
        title: "Error",
        description: "Failed to save API key",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    apiKey,
    setApiKey,
    showApiKeyDialog,
    setShowApiKeyDialog,
    saveApiKey,
  };
};
