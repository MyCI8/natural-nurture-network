
import React from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export const HeaderSearch = () => {
  return (
    <Link to="/search" aria-label="Search">
      <Button 
        variant="ghost" 
        size="icon" 
        className="rounded-full h-10 w-10 flex items-center justify-center touch-manipulation active:scale-95 transition-transform"
      >
        <Search className="h-5 w-5" />
      </Button>
    </Link>
  );
};
