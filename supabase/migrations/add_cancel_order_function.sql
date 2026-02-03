-- Create a secure function to handle order cancellation and stock restocking
CREATE OR REPLACE FUNCTION cancel_order_atomic(p_order_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order_status text;
    v_item record;
BEGIN
    -- Check order status
    SELECT status INTO v_order_status
    FROM orders
    WHERE id = p_order_id;

    IF v_order_status IS NULL THEN
        RAISE EXCEPTION 'Order not found';
    END IF;

    IF v_order_status != 'pending' THEN
        RAISE EXCEPTION 'Only pending orders can be cancelled';
    END IF;

    -- Update order status
    UPDATE orders
    SET status = 'cancelled'
    WHERE id = p_order_id;

    -- Restock inventory
    FOR v_item IN
        SELECT shoe_id, size, quantity
        FROM order_items
        WHERE order_id = p_order_id
    LOOP
        UPDATE shoe_sizes
        SET quantity = quantity + v_item.quantity
        WHERE shoe_id = v_item.shoe_id AND size = v_item.size;
    END LOOP;

    RETURN true;
END;
$$;
