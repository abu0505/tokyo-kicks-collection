-- ============================================
-- REMOVE ORDER INQUIRIES FEATURE
-- ============================================
-- This script removes the order_inquiries table and all related objects
-- Run this in your Supabase SQL Editor
-- ============================================

-- Drop RLS policies first
DROP POLICY IF EXISTS "Anyone can create inquiries" ON public.order_inquiries;
DROP POLICY IF EXISTS "Admins can view all inquiries" ON public.order_inquiries;
DROP POLICY IF EXISTS "Admins can manage inquiries" ON public.order_inquiries;
DROP POLICY IF EXISTS "Admins can delete inquiries" ON public.order_inquiries;

-- Drop index
DROP INDEX IF EXISTS idx_order_inquiries_created_at;

-- Drop the table
DROP TABLE IF EXISTS public.order_inquiries CASCADE;

-- ============================================
-- DONE! Order inquiries feature removed.
-- ============================================
