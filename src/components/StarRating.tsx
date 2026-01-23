import { Star, StarHalf } from 'lucide-react';

interface StarRatingProps {
    rating: number;
    totalReviews?: number;
    size?: 'sm' | 'md' | 'lg';
    showCount?: boolean;
}

const StarRating = ({
    rating,
    totalReviews = 0,
    size = 'sm',
    showCount = true
}: StarRatingProps) => {
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

    // Clamp rating between 0 and 5
    const clampedRating = Math.max(0, Math.min(5, rating));
    const fullStars = Math.floor(clampedRating);
    const hasHalfStar = clampedRating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

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
                    ({totalReviews})
                </span>
            )}
        </div>
    );
};

export default StarRating;
