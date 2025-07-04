import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@/test/utils/test-utils';
import { LazyImage } from '@/components/optimized/LazyImage';

describe('LazyImage', () => {
  it('renders with loading state initially', () => {
    render(
      <LazyImage
        src="https://example.com/image.jpg"
        alt="Test image"
      />
    );
    
    expect(screen.getByText('Failed to load image')).not.toBeInTheDocument();
  });

  it('shows error state when image fails to load', async () => {
    render(
      <LazyImage
        src="https://invalid-url.com/image.jpg"
        alt="Test image"
      />
    );

    const img = screen.getByRole('img');
    
    // Simulate image load error
    vi.waitFor(() => {
      img.dispatchEvent(new Event('error'));
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to load image')).toBeInTheDocument();
    });
  });

  it('uses fallback image when provided and primary fails', async () => {
    render(
      <LazyImage
        src="https://invalid-url.com/image.jpg"
        alt="Test image"
        fallbackSrc="https://example.com/fallback.jpg"
      />
    );

    const img = screen.getByRole('img');
    
    // Simulate image load error
    vi.waitFor(() => {
      img.dispatchEvent(new Event('error'));
    });

    await waitFor(() => {
      expect(img).toHaveAttribute('src', expect.stringContaining('fallback.jpg'));
    });
  });

  it('applies correct aspect ratio class', () => {
    const { container } = render(
      <LazyImage
        src="https://example.com/image.jpg"
        alt="Test image"
        aspectRatio="aspect-square"
      />
    );
    
    expect(container.firstChild).toHaveClass('aspect-square');
  });
});