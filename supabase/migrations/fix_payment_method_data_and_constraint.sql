-- Fix: Cleanup invalid payment_method data before applying the constraint.
-- This ensures that all existing rows meet the new requirement (payment_method must be 'card' or 'cod').

-- 1. Update any existing rows with invalid or NULL payment methods to a default 'card'
-- This fixes the "check constraint violated by some row" error.
UPDATE public.orders
SET payment_method = 'card'
WHERE payment_method IS NULL OR payment_method NOT IN ('card', 'cod');

-- 2. Drop the existing constraint if it exists
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;

-- 3. Add the new constraint with 'cod' included
ALTER TABLE public.orders ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method IN ('card', 'cod'));
