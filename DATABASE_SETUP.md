# Database Setup Instructions

## Custom Design Requests Setup

If you're seeing errors related to custom design requests in the admin panel, follow these steps:

### 1. Check Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to "SQL Editor"
3. Run the migration from `supabase/migrations/20250920000000_create_custom_design_requests.sql`

### 2. Verify Table Creation
Run this query to check if the table exists:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'custom_design_requests';
```

### 3. Check RLS Policies
Make sure Row Level Security policies are properly set up:
```sql
SELECT * FROM pg_policies WHERE tablename = 'custom_design_requests';
```

### 4. Verify Admin Role
Ensure your user has the admin role:
```sql
SELECT * FROM user_roles WHERE role = 'admin';
```

### 5. Manual Table Creation (if needed)
If the migration doesn't work, you can manually create the table by copying and running the SQL from the migration file.

## Common Issues

### Error: "relation custom_design_requests does not exist"
- The migration hasn't been applied
- Run the migration SQL manually in Supabase dashboard

### Error: "permission denied for relation custom_design_requests"
- RLS policies aren't set up correctly
- Your user doesn't have the admin role
- Check the user_roles table

### Error: "relation profiles does not exist"
- The profiles table setup is incomplete
- This is handled by the Auth system, check your Supabase Auth settings