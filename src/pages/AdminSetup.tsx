import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { setupAdminUser, checkIfAdminExists } from '@/utils/adminSetup';
import { Crown, Shield, CheckCircle } from 'lucide-react';

const AdminSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [adminExists, setAdminExists] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkAdminExists();
  }, []);

  const checkAdminExists = async () => {
    const { exists, error } = await checkIfAdminExists();
    if (error) {
      console.error('Error checking admin:', error);
    }
    setAdminExists(exists);
    setChecking(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { success, error } = await setupAdminUser(
        formData.email,
        formData.password,
        formData.displayName
      );

      if (success) {
        toast({
          title: "Success",
          description: "Admin user created successfully! You can now sign in.",
        });
        navigate('/auth');
      } else {
        toast({
          title: "Error",
          description: error?.message || "Failed to create admin user",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gold-bg flex items-center justify-center">
        <div className="text-gold-text">Checking admin status...</div>
      </div>
    );
  }

  if (adminExists) {
    return (
      <div className="min-h-screen bg-gold-bg flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gold-text mb-2">Admin Already Exists</h2>
            <p className="text-gold-text/70 mb-4">
              An admin user has already been set up for this application.
            </p>
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-gold hover:bg-gold/90"
            >
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gold-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Crown className="h-8 w-8 text-gold mr-2" />
            <Shield className="h-8 w-8 text-gold" />
          </div>
          <CardTitle className="text-2xl font-playfair text-gold-text">Admin Setup</CardTitle>
          <CardDescription>
            Create the first admin user for your jewelry store
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-gold-text">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Enter your name"
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gold-text">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter admin email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gold-text">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
                minLength={6}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gold-text">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                required
                minLength={6}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gold hover:bg-gold/90"
              disabled={loading}
            >
              {loading ? 'Creating Admin...' : 'Create Admin User'}
            </Button>
          </form>
          
          <div className="mt-6 text-sm text-gold-text/70 bg-gold-accent p-4 rounded-lg">
            <p className="font-semibold mb-2">Admin Privileges:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Update gold and silver rates</li>
              <li>Manage product inventory</li>
              <li>View customer data and analytics</li>
              <li>Access admin dashboard</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSetup;
