-- =============================================
-- TOKYO Shoes Store - Add Missing check_is_admin RPC Function
-- Run this in Supabase SQL Editor
-- =============================================
-- This function is called by useAuth.ts to check if a user is an admin.
-- It's a SECURITY DEFINER function which bypasses RLS to avoid recursion.
-- =============================================

-- Create the check_is_admin function
CREATE OR REPLACE FUNCTION public.check_is_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = check_user_id
      AND role = 'admin'
  )
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.check_is_admin(UUID) TO authenticated;

-- =============================================
-- VERIFICATION: After running this script, test with:
-- SELECT public.check_is_admin('your-user-uuid-here');
-- =============================================
