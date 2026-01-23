import { useQuery } from '@tanstack/react-query';
import { Shoe } from '@/types/shoe';
import ShoeCard from './ShoeCard';
import { supabase } from '@/integrations/supabase/client';
import { DbShoe } from '@/types/database';

interface RecentlyViewedProps {
  recentlyViewedIds: string[];
  onWishlistClick: (shoe: Shoe) => void;
  wishlistIds: string[];
}

const RecentlyViewed = ({ recentlyViewedIds, onWishlistClick, wishlistIds }: RecentlyViewedProps) => {
  const { data: recentlyViewedShoes = [] } = useQuery({
    queryKey: ['recently-viewed', recentlyViewedIds],
    queryFn: async () => {
      if (recentlyViewedIds.length === 0) return [];

      const { data, error } = await supabase
        .from('shoes')
        .select('*')
        .in('id', recentlyViewedIds);

      if (error) throw error;

      // Sort by the order of IDs in recentlyViewedIds to maintain "recent" order
      const shoes = (data as DbShoe[]).map(shoe => ({
        id: shoe.id,
        name: shoe.name,
        brand: shoe.brand,
        price: shoe.price,
        image: shoe.image_url || '',
        sizes: shoe.sizes,
        status: shoe.status,
        createdAt: new Date(shoe.created_at)
      })) as Shoe[];

      return recentlyViewedIds
        .map(id => shoes.find(s => s.id === id))
        .filter((s): s is Shoe => s !== undefined);
    },
    enabled: recentlyViewedIds.length > 0,
  });

  if (recentlyViewedShoes.length === 0) return null;

  return (
    <section className="py-16 bg-secondary">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black tracking-tight">
            RECENTLY VIEWED
          </h2>
          <span className="text-sm text-muted-foreground">
            {recentlyViewedShoes.length} items
          </span>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
          {recentlyViewedShoes.map((shoe) => (
            <div key={shoe.id} className="min-w-[280px] max-w-[280px]">
              <ShoeCard
                shoe={shoe}
                onWishlistClick={onWishlistClick}
                isInWishlist={wishlistIds.includes(shoe.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;
