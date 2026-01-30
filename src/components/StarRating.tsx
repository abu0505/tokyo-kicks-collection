import { Star, StarHalf } from 'lucide-react';
import { useState } from 'react';

interface StarRatingProps {
    rating: number;
    totalReviews?: number;
    size?: 'sm' | 'md' | 'lg';
    showCount?: boolean;
    interactive?: boolean;
    onRatingChange?: (rating: number) => void;
}

const StarRating = ({
    rating,
    totalReviews = 0,
    size = 'sm',
    showCount = true,
    interactive = false,
    onRatingChange
}: StarRatingProps) => {
    const [hoverRating, setHoverRating] = useState<number | null>(null);

    const sizeClasses = {
        sm: 'h-3.5 w-3.5',
        md: 'h-4 w-4',
        lg: 'h-5 w-5',
    };

    const textSizeClasses = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
    };

    const starSize = sizeClasses[size];
    const textSize = textSizeClasses[size];

    // Interactive mode
    if (interactive) {
        return (
            <div className="flex items-center gap-1">
                <div className="flex items-center" onMouseLeave={() => setHoverRating(null)}>
                    {[1, 2, 3, 4, 5].map((starValue) => (
                        <Star
                            key={starValue}
                            className={`${starSize} cursor-pointer transition-colors ${starValue <= (hoverRating ?? rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                                }`}
                            onClick={() => onRatingChange?.(starValue)}
                            onMouseEnter={() => setHoverRating(starValue)}
                        />
                    ))}
                </div>
            </div>
        );
    }

    // Read-only logic
    // Clamp rating between 0 and 5
    const clampedRating = Math.max(0, Math.min(5, rating));

    // Custom logic: if decimal <= 0.5 show half star, if > 0.5 show full star
    const rectRating = Math.floor(clampedRating);
    const decimal = clampedRating - rectRating;

    let fullStars = rectRating;
    let hasHalfStar = false;

    if (decimal > 0) {
        if (decimal <= 0.5) {
            hasHalfStar = true;
        } else {
            fullStars++;
        }
    }

    const emptyStars = Math.max(0, 5 - fullStars - (hasHalfStar ? 1 : 0));

    return (
        <div className="flex items-center gap-1">
            <div className="flex items-center">
                {/* Full Stars */}
                {Array.from({ length: fullStars }).map((_, i) => (
                    <Star
                        key={`full-${i}`}
                        className={`${starSize} fill-yellow-400 text-yellow-400`}
                    />
                ))}

                {/* Half Star */}
                {hasHalfStar && (
                    <div className="relative">
                        <Star className={`${starSize} text-gray-300`} />
                        <div className="absolute inset-0 overflow-hidden w-1/2">
                            <Star className={`${starSize} fill-yellow-400 text-yellow-400`} />
                        </div>
                    </div>
                )}

                {/* Empty Stars */}
                {Array.from({ length: emptyStars }).map((_, i) => (
                    <Star
                        key={`empty-${i}`}
                        className={`${starSize} text-gray-300`}
                    />
                ))}
            </div>

            {showCount && totalReviews > 0 && (
                <span className={`${textSize} text-muted-foreground font-medium`}>
                    {rating.toFixed(1)} <span className="text-muted-foreground/60">({totalReviews})</span>
                </span>
            )}
        </div>
    );
};

export default StarRating;
