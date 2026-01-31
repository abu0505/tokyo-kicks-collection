-- Create cancel_order RPC function
CREATE OR REPLACE FUNCTION cancel_order(p_order_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order_status text;
    v_user_id uuid;
    v_item record;
BEGIN
    -- Check if order exists and belongs to the user
    SELECT status, user_id INTO v_order_status, v_user_id
    FROM orders
    WHERE id = p_order_id;

    IF v_order_status IS NULL THEN
        RAISE EXCEPTION 'Order not found';
    END IF;

    -- Verify ownership (auth.uid() is the logged-in user)
    IF v_user_id != auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    -- Check if order is pending
    IF v_order_status != 'pending' THEN
        RAISE EXCEPTION 'Only pending orders can be cancelled';
    END IF;

    -- Update order status
    UPDATE orders
    SET status = 'cancelled'
    WHERE id = p_order_id;

    -- Restock items
    FOR v_item IN
        SELECT shoe_id, size, quantity
        FROM order_items
        WHERE order_id = p_order_id
    LOOP
        -- Increment quantity in shoe_sizes
        -- We use ON CONFLICT DO NOTHING purely as a safeguard, but validation logic ensures row exists
        -- Actually, simplified update is better since we know rows exist (referential integrity)
        UPDATE shoe_sizes
        SET quantity = quantity + v_item.quantity
        WHERE shoe_id = v_item.shoe_id AND size = v_item.size;
    END LOOP;
END;
$$;
