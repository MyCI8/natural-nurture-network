
export const detectUrls = (text: string): string[] => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
};

export const isValidUrl = (string: string): boolean => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

export const formatUrlForDisplay = (url: string, maxLength: number = 50): string => {
  if (url.length <= maxLength) return url;
  
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    const path = urlObj.pathname;
    
    if (domain.length + path.length <= maxLength) {
      return domain + path;
    }
    
    return domain + '...';
  } catch {
    return url.substring(0, maxLength) + '...';
  }
};
