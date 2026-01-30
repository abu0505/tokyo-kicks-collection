import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DbShoe, DbShoeSize } from '@/types/database';

export interface ShoeWithSizes extends DbShoe {
    shoe_sizes: DbShoeSize[];
}

export interface ShoesResponse {
    shoes: ShoeWithSizes[];
    totalCount: number;
}

export interface UseAdminInventoryOptions {
    page: number;
    pageSize: number;
}

const fetchShoes = async ({ page, pageSize }: UseAdminInventoryOptions): Promise<ShoesResponse> => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count, error } = await supabase
        .from('shoes')
        .select('*, shoe_sizes(*)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) {
        throw error;
    }

    return {
        shoes: (data as unknown as ShoeWithSizes[]) || [],
        totalCount: count || 0,
    };
};

export const useAdminInventory = (options: UseAdminInventoryOptions) => {
    return useQuery({
        queryKey: ['admin-shoes', options],
        queryFn: () => fetchShoes(options),
        placeholderData: (previousData) => previousData,
    });
};
