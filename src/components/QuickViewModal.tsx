import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Heart } from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/format';
import { DbShoe } from '@/types/database';

interface QuickViewModalProps {
  shoe: DbShoe | null;
  open: boolean;
  onClose: () => void;
  onWishlistClick?: (shoe: DbShoe) => void;
  isInWishlist?: boolean;
}

const QuickViewModal = ({
  shoe,
  open,
  onClose,
  onWishlistClick,
  isInWishlist = false
}: QuickViewModalProps) => {
  const [selectedSize, setSelectedSize] = useState<number | null>(null);

  if (!shoe) return null;

  const isSoldOut = shoe.status === 'sold_out';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl border-0 p-0 overflow-hidden bg-white text-gray-900 [&>button]:hidden">
        <div className="grid md:grid-cols-2 min-h-[450px]">
          {/* Image - Full height and width */}
          <div className="relative bg-gray-100 flex items-center justify-center">
            <img
              src={shoe.image_url || '/placeholder.svg'}
              alt={shoe.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Info */}
          <div className="p-6 flex flex-col relative">
            {/* Close Button - Only one, top right of info section */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center z-10"
            >
              <X className="h-4 w-4 text-gray-700" />
            </button>

            {/* Brand */}
            <p className="text-sm text-emerald-600 font-bold tracking-widest mb-2">
              {shoe.brand.toUpperCase()}
            </p>

            {/* Name */}
            <h2 className="text-2xl font-black leading-tight mb-4 text-gray-900 pr-10">
              {shoe.name}
            </h2>

            {/* Price */}
            <p className="text-3xl font-black mb-6 text-gray-900">
              {formatPrice(shoe.price)}
            </p>

            {/* Size Selection */}
            <div className="mb-6">
              <h4 className="font-bold text-xs tracking-wider mb-3 text-gray-500">SELECT SIZE</h4>
              <div className="flex flex-wrap gap-2">
                {shoe.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => !isSoldOut && setSelectedSize(size)}
                    disabled={isSoldOut}
                    className={`w-12 h-10 border text-sm font-bold transition-all rounded ${selectedSize === size
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-300 text-gray-700 hover:border-gray-500'
                      } ${isSoldOut ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="mb-6">
              <span className={`text-sm font-bold flex items-center gap-2 ${isSoldOut ? 'text-red-500' : 'text-emerald-600'}`}>
                <span className={`w-2 h-2 rounded-full ${isSoldOut ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                {isSoldOut ? 'Sold Out' : 'In Stock'}
              </span>
            </div>

            {/* Actions */}
            <div className="mt-auto flex gap-3">
              <Link
                to={`/product/${shoe.id}`}
                onClick={onClose}
                className="flex-1"
              >
                <Button className="w-full bg-red-500 hover:bg-red-600 text-white font-bold h-12 rounded-lg">
                  View Full Details
                </Button>
              </Link>

              {onWishlistClick && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onWishlistClick(shoe)}
                  disabled={isSoldOut}
                  className={`h-12 w-12 rounded-lg border-2 ${isInWishlist
                      ? 'border-red-500 bg-red-50 text-red-500 hover:bg-red-100'
                      : 'border-gray-300 text-gray-700 hover:border-gray-500 hover:bg-gray-100'
                    }`}
                >
                  <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickViewModal;
