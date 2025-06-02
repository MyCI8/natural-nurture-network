
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, Plus, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface RemedyExpertsSectionProps {
  selectedExperts: string[];
  onChange: (experts: string[]) => void;
}

export const RemedyExpertsSection = ({ selectedExperts, onChange }: RemedyExpertsSectionProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const { data: experts } = useQuery({
    queryKey: ['experts', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('experts')
        .select('id, name, image_url')
        .order('name');

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      const { data, error } = await query.limit(10);
      if (error) throw error;
      return data || [];
    },
    enabled: showSearch && searchTerm.length > 0,
  });

  const { data: selectedExpertDetails } = useQuery({
    queryKey: ['selectedExperts', selectedExperts],
    queryFn: async () => {
      if (selectedExperts.length === 0) return [];
      const { data, error } = await supabase
        .from('experts')
        .select('id, name, image_url')
        .in('id', selectedExperts);
      if (error) throw error;
      return data || [];
    },
    enabled: selectedExperts.length > 0,
  });

  const addExpert = (expertId: string) => {
    if (!selectedExperts.includes(expertId)) {
      onChange([...selectedExperts, expertId]);
    }
    setSearchTerm('');
    setShowSearch(false);
  };

  const removeExpert = (expertId: string) => {
    onChange(selectedExperts.filter(id => id !== expertId));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Related Experts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selected Experts */}
        {selectedExpertDetails && selectedExpertDetails.length > 0 && (
          <div className="space-y-2">
            {selectedExpertDetails.map((expert) => (
              <div key={expert.id} className="flex items-center justify-between p-2 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={expert.image_url || ''} alt={expert.name} />
                    <AvatarFallback>{expert.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{expert.name}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExpert(expert.id)}
                  className="h-8 w-8 p-0 touch-manipulation"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add Expert */}
        <div className="space-y-2">
          {!showSearch ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSearch(true)}
              className="w-full touch-manipulation"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Expert
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search experts..."
                  className="pl-10 touch-manipulation"
                  autoFocus
                />
              </div>
              
              {experts && experts.length > 0 && (
                <div className="border rounded-lg p-2 bg-background max-h-40 overflow-y-auto">
                  {experts.map((expert) => (
                    <Button
                      key={expert.id}
                      type="button"
                      variant="ghost"
                      onClick={() => addExpert(expert.id)}
                      className="w-full justify-start text-left p-2 h-auto touch-manipulation"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={expert.image_url || ''} alt={expert.name} />
                          <AvatarFallback>{expert.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span>{expert.name}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
              
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowSearch(false);
                  setSearchTerm('');
                }}
                className="w-full touch-manipulation"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
