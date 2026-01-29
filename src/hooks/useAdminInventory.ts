import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DbShoe } from '@/types/database';

export interface ShoesResponse {
    shoes: DbShoe[];
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
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) {
        throw error;
    }

    return {
        shoes: (data as DbShoe[]) || [],
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
