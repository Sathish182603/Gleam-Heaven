import { supabase } from '@/integrations/supabase/client';

export const testCustomDesignTable = async () => {
  try {
    console.log('🧪 Testing custom_design_requests table...');
    
    const { data, error } = await supabase
      .from('custom_design_requests')
      .select('id')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        console.log('❌ Table does not exist');
        return { exists: false, error: 'TABLE_NOT_EXISTS' };
      }
      console.log('❌ Permission or other error:', error);
      return { exists: false, error: error.message };
    }
    
    console.log('✅ Table exists and accessible');
    return { exists: true, error: null };
  } catch (error) {
    console.error('Test error:', error);
    return { exists: false, error: 'UNKNOWN_ERROR' };
  }
};

export const getSetupInstructions = () => {
  return `
🛠️  MANUAL DATABASE SETUP REQUIRED

The custom_design_requests table doesn't exist yet. Follow these steps:

📋 STEP 1: Open Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Select your project: Gleam-Heaven  
3. Click "SQL Editor" in the left sidebar

📋 STEP 2: Copy and Run This SQL
Copy this ENTIRE SQL block and run it:

----------------------------------------
-- CREATE CUSTOM DESIGN REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.custom_design_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  design_type text NOT NULL,
  material_preference text,
  budget_range text,
  description text NOT NULL,
  special_requirements text,
  contact_phone text,
  preferred_contact_time text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'in_progress', 'completed', 'cancelled')),
  admin_notes text,
  estimated_price decimal(10,2),
  estimated_completion_date date,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ENABLE SECURITY
ALTER TABLE public.custom_design_requests ENABLE ROW LEVEL SECURITY;

-- DROP EXISTING POLICIES (if they exist)
DROP POLICY IF EXISTS "Users can view own requests" ON public.custom_design_requests;
DROP POLICY IF EXISTS "Users can create requests" ON public.custom_design_requests;
DROP POLICY IF EXISTS "Admins view all" ON public.custom_design_requests;
DROP POLICY IF EXISTS "Admins update all" ON public.custom_design_requests;

-- POLICIES FOR USERS
CREATE POLICY "Users can view own requests" 
ON public.custom_design_requests FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create requests" 
ON public.custom_design_requests FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- POLICIES FOR ADMINS (requires user_roles table)
CREATE POLICY "Admins view all" 
ON public.custom_design_requests FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins update all" 
ON public.custom_design_requests FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- ADD AVATAR SUPPORT TO PROFILES TABLE
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;

-- Update RLS policies to allow avatar access
DROP POLICY IF EXISTS "Users can view profile display names" ON public.profiles;
CREATE POLICY "Users can view profile display names" 
ON public.profiles FOR SELECT 
USING (display_name IS NOT NULL OR avatar_url IS NOT NULL);

-- Grant permissions for avatar_url access
GRANT SELECT (display_name, user_id, avatar_url, email) ON public.profiles TO authenticated;
GRANT SELECT (display_name, user_id, avatar_url, email) ON public.profiles TO anon;
----------------------------------------

📋 STEP 3: Verify Setup
1. Click "Run" button in SQL Editor
2. You should see "Success. No rows returned"
3. Go to "Table Editor" and verify "custom_design_requests" table exists
4. Refresh your jewelry website

🎉 After this, customers can submit design requests and admins can view them!
  `;
};