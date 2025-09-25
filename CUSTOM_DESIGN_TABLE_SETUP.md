# Database Setup Instructions

## Custom Design Requests Table Missing

Your application is trying to access the `custom_design_requests` table, but it doesn't exist in your Supabase database. Follow these steps to create it:

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase dashboard
2. Navigate to "SQL Editor" in the left sidebar
3. Click "New query"

### Step 2: Run This SQL Command

Copy and paste this entire SQL script into the SQL editor and run it:

```sql
-- Create custom_design_requests table for storing customer jewelry design requests
CREATE TABLE IF NOT EXISTS custom_design_requests (
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS custom_design_requests_user_id_idx ON custom_design_requests(user_id);
CREATE INDEX IF NOT EXISTS custom_design_requests_status_idx ON custom_design_requests(status);
CREATE INDEX IF NOT EXISTS custom_design_requests_created_at_idx ON custom_design_requests(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE custom_design_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for custom_design_requests
-- Policy for users to view their own design requests
CREATE POLICY IF NOT EXISTS "Users can view their own design requests" ON custom_design_requests
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy for users to insert their own design requests
CREATE POLICY IF NOT EXISTS "Users can create their own design requests" ON custom_design_requests
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy for admins to view all design requests
CREATE POLICY IF NOT EXISTS "Admins can view all design requests" ON custom_design_requests
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policy for admins to update design requests (all fields)
CREATE POLICY IF NOT EXISTS "Admins can update all design requests" ON custom_design_requests
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_custom_design_requests_updated_at ON custom_design_requests;
CREATE TRIGGER update_custom_design_requests_updated_at 
  BEFORE UPDATE ON custom_design_requests 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

### Step 3: Verify Table Creation

After running the SQL, you should see a success message. You can verify the table was created by:

1. Going to "Table Editor" in the Supabase dashboard
2. Looking for the `custom_design_requests` table in the list

### Step 4: Refresh Your Application

1. Go back to your admin panel
2. Refresh the page
3. The custom design requests should now work properly

## Troubleshooting

If you still see errors:

1. **Check your user_roles table**: Make sure you have admin privileges
2. **Verify RLS policies**: Ensure the Row Level Security policies are active
3. **Check auth.users**: Make sure user authentication is working

## What This Table Does

The `custom_design_requests` table stores:
- Customer jewelry design requests
- Contact information
- Design preferences
- Status tracking
- Admin notes and estimates

Once created, customers can submit custom design requests through the website, and admins can manage them through the admin panel.