import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string) {
  if (!dateString) {return "";}
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {return "";}
  
  // Format: "Aug 31, 2023"
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
