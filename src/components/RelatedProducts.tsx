import { useQuery } from '@tanstack/react-query';
import { Shoe } from '@/types/shoe';
import ShoeCard from './ShoeCard';
import { supabase } from '@/integrations/supabase/client';
import { DbShoe } from '@/types/database';

interface RelatedProductsProps {
  currentShoe: Shoe;
  onWishlistClick: (shoe: Shoe) => void;
  wishlistIds: string[];
}

const RelatedProducts = ({ currentShoe, onWishlistClick, wishlistIds }: RelatedProductsProps) => {
  const { data: relatedShoes = [] } = useQuery({
    queryKey: ['related-shoes', currentShoe.id, currentShoe.brand],
    queryFn: async () => {
      // 1. Fetch sales from same brand
      const { data: sameBrandData, error: sameBrandError } = await supabase
        .from('shoes')
        .select('*')
        .eq('brand', currentShoe.brand)
        .neq('id', currentShoe.id)
        .limit(4);

      if (sameBrandError) throw sameBrandError;

      let combinedShoes: DbShoe[] = sameBrandData || [];

      // 2. If less than 4, fetch others to fill
      if (combinedShoes.length < 4) {
        const { data: otherData, error: otherError } = await supabase
          .from('shoes')
          .select('*')
          .neq('brand', currentShoe.brand)
          .neq('id', currentShoe.id)
          .order('status', { ascending: true }) // In stock first (text sort but 'in_stock' < 'sold_out')
          .limit(4 - combinedShoes.length);

        if (!otherError && otherData) {
          combinedShoes = [...combinedShoes, ...otherData];
        }
      }

      // Map to Shoe interface
      return combinedShoes.map(shoe => ({
        id: shoe.id,
        name: shoe.name,
        brand: shoe.brand,
        price: shoe.price,
        image: shoe.image_url || '',
        sizes: shoe.sizes,
        status: shoe.status,
        createdAt: new Date(shoe.created_at)
      })) as Shoe[];
    },
    enabled: !!currentShoe.id,
  });

  if (relatedShoes.length === 0) return null;

  return (
    <section className="py-16 border-t-2 border-foreground/10">
      <div className="container">
        <h2 className="text-3xl font-black mb-8 tracking-tight">
          YOU MAY ALSO LIKE
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedShoes.map((shoe) => (
            <ShoeCard
              key={shoe.id}
              shoe={shoe}
              onWishlistClick={onWishlistClick}
              isInWishlist={wishlistIds.includes(shoe.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedProducts;
