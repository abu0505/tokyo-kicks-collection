-- Fix: Allow 'cod' as a valid payment method in the orders table.
-- The existing constraint only allows 'card', causing COD orders to fail.

-- Drop the existing constraint
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;

-- Re-add the constraint with 'cod' included
ALTER TABLE public.orders ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method IN ('card', 'cod'));
