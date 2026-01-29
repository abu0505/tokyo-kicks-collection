import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';

// Types
export type Order = Tables<'orders'>;
export type OrderStatus = 'pending' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderWithItemCount extends Order {
    item_count: number;
    product_image?: string | null;
    product_name?: string;
}

export interface OrdersResponse {
    orders: OrderWithItemCount[];
    totalCount: number;
}

export interface OrderStats {
    totalOrders: number;
    pendingOrders: number;
    totalRevenue: number;
}

export interface UseAdminOrdersOptions {
    page: number;
    pageSize: number;
    search: string;
    statusFilter: OrderStatus | 'all';
    dateRange?: {
        from?: Date;
        to?: Date;
    };
}

// Fetch orders with pagination and filtering
const fetchOrders = async ({
    page,
    pageSize,
    search,
    statusFilter,
    dateRange,
}: UseAdminOrdersOptions): Promise<OrdersResponse> => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Build query
    let query = supabase
        .from('orders')
        .select('*, order_items(id, shoes(name, image_url))', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

    // Apply status filter
    if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
    }

    // Apply date range filter
    if (dateRange?.from) {
        query = query.gte('created_at', dateRange.from.toISOString());
    }
    if (dateRange?.to) {
        // To include the whole 'to' day, we can set it to the end of the day or just let Supabase handle it if it's an ISO string
        query = query.lte('created_at', dateRange.to.toISOString());
    }

    // Apply search filter (order_code, email, or last_name)
    if (search.trim()) {
        const searchTerm = `%${search.trim()}%`;
        query = query.or(
            `order_code.ilike.${searchTerm},email.ilike.${searchTerm},last_name.ilike.${searchTerm}`
        );
    }

    const { data, error, count } = await query;

    if (error) {
        throw error;
    }

    // Map data to include item count and product info
    const orders: OrderWithItemCount[] = (data || []).map((order: any) => {
        const firstItem = order.order_items?.[0];
        const product = firstItem?.shoes;

        return {
            ...order,
            item_count: order.order_items?.length || 0,
            product_image: product?.image_url,
            product_name: product?.name,
            order_items: undefined, // Remove the nested array
        };
    });

    return {
        orders,
        totalCount: count || 0,
    };
};

// Fetch order stats
const fetchOrderStats = async (): Promise<OrderStats> => {
    // Get total count
    const { count: totalOrders, error: countError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    // Get pending count
    const { count: pendingOrders, error: pendingError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

    if (pendingError) throw pendingError;

    // Get total revenue
    const { data: revenueData, error: revenueError } = await supabase
        .from('orders')
        .select('total');

    if (revenueError) throw revenueError;

    const totalRevenue = (revenueData || []).reduce(
        (sum, order) => sum + (order.total || 0),
        0
    );

    return {
        totalOrders: totalOrders || 0,
        pendingOrders: pendingOrders || 0,
        totalRevenue,
    };
};

// Update order status
const updateOrderStatus = async ({
    orderId,
    status,
}: {
    orderId: string;
    status: OrderStatus;
}) => {
    const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

    if (error) {
        throw error;
    }
};

// Hook exports
export const useAdminOrders = (options: UseAdminOrdersOptions) => {
    return useQuery({
        queryKey: ['admin-orders', options],
        queryFn: () => fetchOrders(options),
        placeholderData: (previousData) => previousData,
    });
};

export const useOrderStats = () => {
    return useQuery({
        queryKey: ['admin-order-stats'],
        queryFn: fetchOrderStats,
    });
};

export const useUpdateOrderStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateOrderStatus,
        onSuccess: () => {
            // Invalidate orders queries to refetch
            queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
            queryClient.invalidateQueries({ queryKey: ['admin-order-stats'] });
            toast.success('Order status updated');
        },
        onError: (error: Error) => {
            toast.error(`Failed to update status: ${error.message}`);
        },
    });
};
