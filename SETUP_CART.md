# Cart Setup Guide

## The Issue
The cart functionality is failing because the `cart` table doesn't exist in your Supabase database yet. The likes/favorites work because those tables were created in the initial migration.

## Solution

### Step 1: Create the Cart Table
1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the following SQL code:

```sql
-- Simple Cart Setup for Supabase
-- Run this in your Supabase SQL Editor

-- Create cart table
CREATE TABLE IF NOT EXISTS public.cart (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own cart" ON public.cart FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cart" ON public.cart FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cart" ON public.cart FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cart" ON public.cart FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.cart TO authenticated;
GRANT ALL ON public.cart TO service_role;
```

4. Click "Run" to execute the SQL

### Step 2: Fix Reviews Table (Optional)
If you're also getting review errors, run this additional SQL:

```sql
-- Fix reviews table foreign key
ALTER TABLE public.reviews 
ADD CONSTRAINT IF NOT EXISTS reviews_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
```

### Step 3: Test the Application
1. Refresh your application
2. Try adding items to cart - it should work now
3. The cart icon should show the number of items
4. Click the cart icon to view your cart

## What This Fixes
- ✅ Cart functionality will work
- ✅ Add to cart buttons will work
- ✅ Cart page will load properly
- ✅ Cart count will show in navigation
- ✅ Reviews will load properly

## Alternative: Use Local Storage (Temporary)
If you want to test the cart functionality immediately without setting up the database table, I can modify the code to use local storage as a temporary solution. Let me know if you'd prefer this approach.

## Verification
After running the SQL:
1. Check that the `cart` table appears in your Supabase Tables section
2. Try adding a product to cart
3. Check that the cart count updates in the navigation
4. Visit the cart page to see your items

The application should now work perfectly with full cart functionality!
