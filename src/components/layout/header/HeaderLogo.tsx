
import React from 'react';
import { Link } from "react-router-dom";
import { Leaf } from "lucide-react";

export const HeaderLogo = () => {
  return (
    <Link to="/" className="flex items-center" aria-label="Home">
      <Leaf className="h-6 w-6 text-primary" />
    </Link>
  );
};
