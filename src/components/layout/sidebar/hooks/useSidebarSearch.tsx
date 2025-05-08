
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useSidebarSearch = (onSearchComplete?: () => void) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      if (onSearchComplete) {
        onSearchComplete();
      }
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    handleSearch
  };
};
