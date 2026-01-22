-- ============================================
-- FIX: Infinite Recursion in user_roles RLS Policies
-- ============================================
-- Run this in Supabase SQL Editor to fix admin access
-- ============================================

-- Step 1: Drop the problematic recursive policies
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- Step 2: Create fixed policies using has_role() function
-- This avoids infinite recursion because has_role() is SECURITY DEFINER

CREATE POLICY "Users can view own role"
ON public.user_roles FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
ON public.user_roles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Step 3: Verify admin assignment exists
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'admin@tokyoshoes.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================
-- Done! Now refresh your website and access /admin
-- ============================================
