
/**
 * Returns a CDN-ready URL for a given resource path.
 * This centralizes URL construction, making it easy to switch to a different CDN
 * or add transformations in the future.
 *
 * Supabase URLs are already served via CDN, so this acts as a future-proof abstraction.
 *
 * @param path - The full URL or relative path to the resource.
 * @returns The full, CDN-ready URL, or null if the input is empty.
 */
export const getCdnUrl = (path: string | null | undefined): string | null => {
  if (!path) {
    return null;
  }

  // For now, we assume the path is the full public URL from Supabase.
  // In the future, we could add logic here for custom domains or transformations.
  // Example: return `https://cdn.myapp.com/${path.split('/').slice(-2).join('/')}`;
  return path;
};
