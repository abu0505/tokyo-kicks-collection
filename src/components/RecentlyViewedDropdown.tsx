import { History, X, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockShoes } from '@/types/shoe';
import { formatPrice } from '@/lib/format';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface RecentlyViewedDropdownProps {
  recentlyViewedIds: string[];
  onRemoveItem?: (id: string) => void;
  onClearAll?: () => void;
}

const RecentlyViewedDropdown = ({
  recentlyViewedIds,
  onRemoveItem,
  onClearAll
}: RecentlyViewedDropdownProps) => {
  const recentShoes = recentlyViewedIds
    .slice(0, 4)
    .map(id => mockShoes.find(shoe => shoe.id === id))
    .filter(Boolean);

  if (recentShoes.length === 0) {
    return null;
  }

  const handleRemoveItem = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    onRemoveItem?.(id);
  };

  const handleClearAll = () => {
    onClearAll?.();
  };

  const scrollToCatalog = () => {
    const catalogElement = document.getElementById('catalog');
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative p-2 hover:bg-accent/10 rounded-lg transition-colors group flex items-center gap-1.5">
          <History className="w-5 h-5" />
          <span className="text-xs font-bold tracking-wide hidden sm:inline">RECENT</span>
          <span className="absolute -top-1 -right-1 bg-accent text-background text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {recentShoes.length}
          </span>
          <span className="sr-only">Recently viewed</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0 border-2 border-foreground bg-background"
        align="end"
        sideOffset={8}
      >
        <div className="p-3 border-b-2 border-foreground flex items-center justify-between">
          <span className="text-sm font-bold tracking-wide">RECENTLY VIEWED</span>
          {onClearAll && recentShoes.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Clear All
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {recentShoes.map((shoe) => (
            <div key={shoe!.id} className="relative group/item">
              <Link
                to={`/product/${shoe!.id}`}
                className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors border-b border-muted last:border-b-0 pr-10"
              >
                <img
                  src={shoe!.image}
                  alt={shoe!.name}
                  className="w-14 h-14 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{shoe!.name}</p>
                  <p className="text-xs text-muted-foreground">{shoe!.brand}</p>
                  <p className="text-sm font-bold text-accent mt-1">
                    {formatPrice(shoe!.price)}
                  </p>
                </div>
              </Link>
              {onRemoveItem && (
                <button
                  onClick={(e) => handleRemoveItem(e, shoe!.id)}
                  className="absolute top-3 right-3 w-6 h-6 rounded-full bg-muted/80 hover:bg-destructive hover:text-destructive-foreground 
                             flex items-center justify-center transition-colors opacity-0 group-hover/item:opacity-100"
                  title="Remove from recently viewed"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={scrollToCatalog}
          className="block w-full p-3 text-center text-sm font-bold border-t-2 border-foreground hover:bg-accent hover:text-background transition-colors"
        >
          VIEW ALL PRODUCTS →
        </button>
      </PopoverContent>
    </Popover>
  );
};

export default RecentlyViewedDropdown;
