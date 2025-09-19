import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { UserPlus, Shield, Users, Trash2 } from 'lucide-react';

interface User {
  id: string;
  email: string;
  display_name: string;
  roles: { role: string }[];
}

const AdminManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    }
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const checkAdminStatus = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();
    
    setIsAdmin(!!data);
    setLoading(false);
  };

  const fetchUsers = async () => {
    try {
      // First get all profiles with error handling
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, email, display_name');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }
      
      if (!profiles) return;

      // Then get all user roles with error handling
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        console.error('Error fetching user roles:', rolesError);
        return;
      }

      // Combine the data
      const formattedUsers = profiles.map(profile => {
        const roles = userRoles?.filter(role => role.user_id === profile.user_id) || [];
        return {
          id: profile.user_id,
          email: profile.email || '',
          display_name: profile.display_name || '',
          roles: roles.map(r => ({ role: r.role }))
        };
      });
      
      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error in fetchUsers:', error);
    }
  };

  const promoteToAdmin = async (userId: string) => {
    try {
      // Use INSERT ... ON CONFLICT to handle duplicates gracefully
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'admin'
        });

      // Check if it's a duplicate key error (user already has admin role)
      if (error && error.code === '23505') {
        toast({
          title: "Info",
          description: "User is already an admin",
          variant: "default",
        });
        return;
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: "User promoted to admin successfully",
      });

      fetchUsers();
    } catch (error) {
      console.error('Error promoting user:', error);
      toast({
        title: "Error",
        description: "Failed to promote user to admin",
        variant: "destructive",
      });
    }
  };

  const removeAdminRole = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'admin');

      if (error) throw error;

      toast({
        title: "Success",
        description: "Admin role removed successfully",
      });

      fetchUsers();
    } catch (error) {
      console.error('Error removing admin role:', error);
      toast({
        title: "Error",
        description: "Failed to remove admin role",
        variant: "destructive",
      });
    }
  };

  const addAdminByEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim()) return;

    try {
      // Find user by email with better error handling
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', newAdminEmail.trim())
        .maybeSingle();

      if (profileError) {
        console.error('Error finding user profile:', profileError);
        toast({
          title: "Error",
          description: "Failed to search for user profile",
          variant: "destructive",
        });
        return;
      }

      if (!profile) {
        toast({
          title: "Error",
          description: "User with this email not found",
          variant: "destructive",
        });
        return;
      }

      await promoteToAdmin(profile.user_id);
      setNewAdminEmail('');
    } catch (error) {
      console.error('Error finding user:', error);
      toast({
        title: "Error",
        description: "Failed to find user or add admin role",
        variant: "destructive",
      });
    }
  };

  const isUserAdmin = (userRoles: { role: string }[]) => {
    return userRoles.some(r => r.role === 'admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gold-bg flex items-center justify-center">
        <div className="text-gold-text">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gold-bg flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gold-text">Please sign in to access admin management</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gold-bg">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 pb-8 flex items-center justify-center">
          <Card>
            <CardContent className="p-6 text-center">
              <h2 className="text-2xl font-bold text-gold-text mb-4">Access Denied</h2>
              <p className="text-gold-text/70">You don't have permission to access admin management.</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gold-bg">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="font-playfair text-gold-text flex items-center gap-2">
                <Shield className="h-6 w-6" />
                Admin Management
              </CardTitle>
              <CardDescription>Manage admin users and permissions</CardDescription>
            </CardHeader>
          </Card>

          {/* Add Admin by Email */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-gold-text flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Promote User to Admin
              </CardTitle>
              <CardDescription>
                Add admin role to an existing user by their email address
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={addAdminByEmail} className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="admin-email" className="text-gold-text">
                    User Email
                  </Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="Enter user email to make admin"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="flex items-end">
                  <Button type="submit" className="bg-gold hover:bg-gold/90">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Make Admin
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Users List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-gold-text flex items-center gap-2">
                <Users className="h-5 w-5" />
                All Users ({users.length})
              </CardTitle>
              <CardDescription>
                Manage user roles and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <div className="text-center py-8 text-gold-text/70">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No users found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {users.map((userData) => (
                    <Card key={userData.id} className="border-gold/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div>
                                <h3 className="font-semibold text-gold-text">
                                  {userData.display_name || 'No Name'}
                                </h3>
                                <p className="text-sm text-gold-text/70">{userData.email}</p>
                              </div>
                              <div className="flex gap-1">
                                {isUserAdmin(userData.roles) ? (
                                  <Badge variant="default" className="bg-gold text-white">
                                    <Shield className="h-3 w-3 mr-1" />
                                    Admin
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="bg-gold/10 text-gold-text">
                                    User
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            {isUserAdmin(userData.roles) ? (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => removeAdminRole(userData.id)}
                                disabled={userData.id === user?.id} // Prevent self-demotion
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Remove Admin
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => promoteToAdmin(userData.id)}
                                className="border-gold text-gold-text hover:bg-gold/10"
                              >
                                <Shield className="h-3 w-3 mr-1" />
                                Make Admin
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminManagement;