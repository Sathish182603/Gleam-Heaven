-- MANUAL FIX FOR AUTHENTICATION AND PROFILE ACCESS ISSUES
-- Execute this script in Supabase SQL Editor to fix 406 and 400 errors

-- ===== STEP 1: FIX PROFILES RLS POLICIES =====
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create new, more permissive policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- CRITICAL: This policy allows anyone to read display names for reviews/comments
CREATE POLICY "Anyone can view profile display names for reviews" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- ===== STEP 2: IMPROVE USER CREATION FUNCTION =====
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile with better error handling and conflict resolution
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1), 'User')
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = CASE 
      WHEN profiles.display_name IS NULL OR profiles.display_name = '' 
      THEN EXCLUDED.display_name 
      ELSE profiles.display_name 
    END;
  
  -- Insert user role with conflict resolution
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- ===== STEP 3: ADD PERFORMANCE INDEXES =====
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON public.profiles(display_name);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);

-- ===== STEP 4: GRANT PROPER PERMISSIONS =====
-- Allow authenticated users to read profiles
GRANT SELECT ON public.profiles TO authenticated;
GRANT INSERT, UPDATE ON public.profiles TO authenticated;

-- Allow anonymous users to read profile display names (for reviews)
GRANT SELECT (display_name, user_id) ON public.profiles TO anon;

-- ===== STEP 5: FIX AUTH CONFIGURATION =====
-- Update auth configuration to be more permissive
-- Note: This would typically be done in the Supabase dashboard under Authentication settings

-- ===== STEP 6: VERIFICATION QUERIES =====
-- Run these to verify the fixes work:

-- Test profile display name access (should work for all users)
-- SELECT display_name FROM public.profiles LIMIT 5;

-- Test reviews with profile data (should work without 406 errors)
-- SELECT r.id, r.rating, r.comment, p.display_name 
-- FROM public.reviews r 
-- LEFT JOIN public.profiles p ON r.user_id = p.user_id 
-- LIMIT 5;

-- ===== IMPORTANT NOTES =====
/*
1. After running this script, restart your application
2. Clear browser cache and localStorage 
3. Try signing up/in again
4. The 406 errors should be resolved
5. Profile display names should show in reviews/comments
6. If issues persist, check Supabase dashboard Auth settings:
   - Confirm email disabled (for testing)
   - Auto-confirm users enabled (for development)
   - Email redirect URLs properly configured
*/