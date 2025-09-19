import { supabase } from '@/integrations/supabase/client';

export const setupAdminUser = async (email: string, password: string, displayName: string) => {
  try {
    // First, sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName
        }
      }
    });

    if (authError) {
      throw authError;
    }

    if (authData.user) {
      // Wait a moment for the profile to be created by the trigger
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update the user role to admin
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ role: 'admin' })
        .eq('user_id', authData.user.id);

      if (roleError) {
        console.error('Error setting admin role:', roleError);
        return { success: false, error: roleError };
      }

      return { success: true, user: authData.user };
    }

    return { success: false, error: new Error('User creation failed') };
  } catch (error) {
    console.error('Admin setup error:', error);
    return { success: false, error };
  }
};

export const checkIfAdminExists = async () => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin')
      .limit(1);

    if (error) {
      throw error;
    }

    return { exists: data && data.length > 0, error: null };
  } catch (error) {
    return { exists: false, error };
  }
};
