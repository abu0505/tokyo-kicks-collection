
// Cache mobile detection at module level to avoid repeated DOM access
const mobileQuery = typeof window !== 'undefined' ? window.matchMedia('(max-width: 639px)') : null;

/**
 * Get the optimized image URL with mobile-specific constraints
 * For mobile screens (< 640px), caps at 600px width with quality 60
 */
export const getOptimizedImageUrl = (url: string, width: number, quality: number = 80): string => {
    const supabaseDomain = "qdbvxznnzukdwooziqmd.supabase.co";

    if (!url || !url.includes(supabaseDomain)) {
        return url;
    }

    // Mobile optimization: use cached matchMedia result
    const isMobile = mobileQuery?.matches ?? false;
    const optimizedWidth = isMobile ? Math.min(width, 600) : width;
    const optimizedQuality = isMobile ? Math.min(quality, 60) : quality;

    try {
        const urlObj = new URL(url);
        urlObj.searchParams.set("width", optimizedWidth.toString());
        urlObj.searchParams.set("format", "webp");
        urlObj.searchParams.set("quality", optimizedQuality.toString());
        urlObj.searchParams.set("resize", "contain");
        return urlObj.toString();
    } catch (e) {
        return url;
    }
};
