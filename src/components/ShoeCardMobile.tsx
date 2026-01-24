import { Heart, Eye, X, Check, Trash, Ruler } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Shoe, isNewArrival } from '@/types/shoe';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/format';
import StarRating from '@/components/StarRating';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';

interface ShoeCardMobileProps {
  shoe: Shoe;
  onWishlistClick: (shoe: Shoe) => void;
  isInWishlist?: boolean;
  onQuickView?: (shoe: Shoe) => void;
  rating?: number;
  totalReviews?: number;
  showRemoveButton?: boolean;
}

const ShoeCardMobile = ({
  shoe,
  onWishlistClick,
  isInWishlist = false,
  onQuickView,
  rating,
  totalReviews,
  showRemoveButton = false
}: ShoeCardMobileProps) => {
  const navigate = useNavigate();
  const isNew = isNewArrival(shoe);
  const isSoldOut = shoe.status === 'sold_out';

  // Swipe logic
  const x = useMotionValue(0);
  const opacityRight = useTransform(x, [50, 100], [0, 1]);
  const opacityLeft = useTransform(x, [-50, -100], [0, 1]);
  const bgLeft = useTransform(x, [-100, 0], ["rgb(239 68 68)", "rgb(255 255 255)"]); // Red to White
  const bgRight = useTransform(x, [0, 100], ["rgb(255 255 255)", "rgb(34 197 94)"]); // White to Green

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    // Don't navigate if we just dragged
    if (Math.abs(x.get()) > 5) return;
    navigate(`/product/${shoe.id}`);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      // Swiped Right -> Add to Wishlist
      if (!isInWishlist && !isSoldOut) {
        onWishlistClick(shoe);
      }
    } else if (info.offset.x < -100) {
      // Swiped Left -> Remove from Wishlist
      if (isInWishlist || showRemoveButton) {
        onWishlistClick(shoe);
      }
    }
  };

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Background Indicators */}
      <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
        <motion.div style={{ opacity: opacityRight }} className="flex items-center gap-2 text-green-600 font-bold bg-green-100/80 p-2 rounded-full z-10">
          <Check className="w-6 h-6" />
          <span>Add</span>
        </motion.div>
        <motion.div style={{ opacity: opacityLeft }} className="flex items-center gap-2 text-red-600 font-bold bg-red-100/80 p-2 rounded-full z-10">
          <span>Remove</span>
          <Trash className="w-6 h-6" />
        </motion.div>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        onClick={handleCardClick}
        style={{ x }}
        className={`group relative bg-secondary/30 border-[0.5px] border-gray-300 overflow-hidden transition-all cursor-pointer active:bg-secondary flex min-h-[140px] items-center z-20 ${isSoldOut ? 'opacity-60' : ''}`}
      >
        {/* Image Container - Left Side */}
        <div className="relative w-[140px] h-[140px] flex-shrink-0 overflow-hidden bg-secondary">
          <img
            src={shoe.image}
            alt={shoe.name}
            className="w-full h-full object-cover"
            draggable={false}
          />

          {/* NEW Badge */}
          {isNew && (
            <Badge className="absolute top-2 left-2 bg-red-600 hover:bg-red-600 text-white font-bold px-2 py-0.5 text-[10px]">
              NEW
            </Badge>
          )}

          {/* Wishlist Button on Image */}
          <Button
            size="icon"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              onWishlistClick(shoe);
            }}
            disabled={isSoldOut && !showRemoveButton}
            className={`absolute top-2 right-2 w-8 h-8 rounded-full border border-foreground/50 transition-all ${isInWishlist
              ? 'bg-accent text-accent-foreground'
              : 'bg-background/80'
              }`}
          >
            {showRemoveButton ? (
              <X className="h-4 w-4" />
            ) : (
              <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
            )}
          </Button>
        </div>

        {/* Info Container - Right Side */}
        <div className="flex-1 self-stretch p-3 flex flex-col justify-between min-w-0">
          {/* Top Section */}
          <div>
            {/* Brand */}
            <p className="text-[10px] text-muted-foreground font-bold tracking-wide mb-0.5">
              {shoe.brand.toUpperCase()}
            </p>

            {/* Name */}
            <h3 className="text-sm font-bold leading-tight line-clamp-2 mb-1">
              {shoe.name}
            </h3>

            {/* Rating */}
            {totalReviews && totalReviews > 0 && (
              <div className="mb-1">
                <StarRating rating={rating || 0} totalReviews={totalReviews} size="sm" />
              </div>
            )}

            {/* Sizes Preview */}
            <div className="flex flex-col gap-1 py-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Ruler className="w-3 h-3" />
                <span className="text-[10px] uppercase font-bold tracking-wide">Size</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {shoe.sizes.slice(0, 4).map((size) => (
                  <span
                    key={size}
                    className="text-xs bg-background/80 px-1.5 py-0.5 font-bold border border-foreground/10"
                  >
                    {size}
                  </span>
                ))}
                {shoe.sizes.length > 4 && (
                  <span className="text-xs bg-background/80 px-1.5 py-0.5 font-bold border border-foreground/10">
                    +{shoe.sizes.length - 4}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Section - Price & Status */}
          <div className="flex items-center justify-between pt-2 border-t border-border mt-auto">
            <p className="text-lg font-black">
              {formatPrice(shoe.price)}
            </p>
            {isSoldOut ? (
              <span className="text-[10px] font-bold text-red-600">
                Out of Stock
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-medium text-green-600">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                In Stock
              </span>
            )}
          </div>
        </div>

        {/* Quick View Button - Right Edge */}
        {onQuickView && (
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(shoe);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-background/80 border border-foreground/30 rounded-full"
          >
            <Eye className="h-4 w-4" />
          </Button>
        )}
      </motion.div>
    </div>
  );
};

export default ShoeCardMobile;
