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
CREATE POLICY "Users can view their own design requests" ON custom_design_requests
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy for users to insert their own design requests
CREATE POLICY "Users can create their own design requests" ON custom_design_requests
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own design requests (limited fields)
CREATE POLICY "Users can update their own design requests" ON custom_design_requests
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND 
    -- Users can only update these fields, not admin fields
    (OLD.status = NEW.status OR NEW.status = 'cancelled') AND
    OLD.admin_notes = NEW.admin_notes AND
    OLD.estimated_price = NEW.estimated_price AND
    OLD.estimated_completion_date = NEW.estimated_completion_date);

-- Policy for admins to view all design requests
CREATE POLICY "Admins can view all design requests" ON custom_design_requests
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policy for admins to update design requests (all fields)
CREATE POLICY "Admins can update all design requests" ON custom_design_requests
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
CREATE TRIGGER update_custom_design_requests_updated_at 
  BEFORE UPDATE ON custom_design_requests 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add some helpful comments
COMMENT ON TABLE custom_design_requests IS 'Stores customer requests for custom jewelry designs';
COMMENT ON COLUMN custom_design_requests.design_type IS 'Type of jewelry: ring, necklace, earrings, etc.';
COMMENT ON COLUMN custom_design_requests.material_preference IS 'Preferred material: gold-24k, silver-925, platinum, etc.';
COMMENT ON COLUMN custom_design_requests.budget_range IS 'Budget range: under-50k, 50k-100k, etc.';
COMMENT ON COLUMN custom_design_requests.status IS 'Request status: pending, in_review, approved, in_progress, completed, cancelled';