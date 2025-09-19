# Create Test User for Gleam Haven

## 🧪 **Quick Test User Creation**

Since the specific email format is being rejected, here are working alternatives:

### **Option 1: Use Standard Email Formats**
Try these email formats that Supabase typically accepts:
- `test@gmail.com`
- `user@example.com`
- `admin@test.com`
- `sathish@gmail.com`

### **Option 2: Create Admin User First**
1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **"Add User"**
3. Create user with:
   - Email: `admin@gleamhaven.com`
   - Password: `admin123456`
   - Auto-confirm: Yes

### **Option 3: Disable Email Validation Temporarily**
1. **Supabase Dashboard** → **Authentication** → **Settings**
2. **Disable** "Confirm email"
3. **Enable** "Auto-confirm users"
4. Set **Site URL**: `http://localhost:8081`
5. **Redirect URLs**: Add `http://localhost:8081/`

### **Option 4: Manual SQL User Creation**
Execute in Supabase SQL Editor:

```sql
-- Create a test user directly in the auth.users table
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  role
) VALUES (
  gen_random_uuid(),
  'test@gmail.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"display_name": "Test User"}',
  'authenticated'
);
```

## 🔍 **Debugging Steps**

1. **Check Current Server**: Make sure you're using `http://localhost:8081` (not 8080)
2. **Clear Browser Data**: Clear localStorage, cookies, and cache
3. **Check Console**: Look for any additional error messages
4. **Try Different Email**: Use `test@gmail.com` instead of the institutional email

## ✅ **Expected Results After Fixes**

- ✅ Better error messages for invalid emails
- ✅ Proper validation before sending requests
- ✅ Correct redirect URLs
- ✅ Form validation and user feedback
- ✅ Auto-complete attributes for better UX

## 🚀 **Next Steps**

1. **Apply Supabase settings** (Option 3 above)
2. **Test with standard email** (e.g., `test@gmail.com`)
3. **Create admin user** through dashboard if needed
4. **Verify authentication** works for both signup and signin

After applying these fixes, the authentication should work much better!