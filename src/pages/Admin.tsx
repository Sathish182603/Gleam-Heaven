import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { TrendingUp, TrendingDown, Plus, Edit, Trash2, Package, Upload } from 'lucide-react';

interface MetalRate {
  id: string;
  metal_type: string;
  rate_per_gram: number;
  updated_at: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  category: 'rings' | 'necklaces' | 'earrings';
  metal_type: 'gold' | 'silver';
  price_per_gram: number;
  weight_grams: number;
  image_url?: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

interface CustomDesignRequest {
  id: string;
  user_id: string;
  design_type: string;
  material_preference: string | null;
  budget_range: string | null;
  description: string;
  special_requirements: string | null;
  contact_phone: string | null;
  preferred_contact_time: string | null;
  status: string;
  admin_notes: string | null;
  estimated_price: number | null;
  estimated_completion_date: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    display_name: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null;
}

const Admin = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [metalRates, setMetalRates] = useState<MetalRate[]>([]);
  const [newRates, setNewRates] = useState({ gold: '', silver: '' });
  
  // Product management state
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'rings' | 'necklaces' | 'earrings'>('all');
  
  // Custom Design Requests state
  const [customRequests, setCustomRequests] = useState<CustomDesignRequest[]>([]);
  const [requestStatusFilter, setRequestStatusFilter] = useState<'all' | 'pending' | 'in_review' | 'approved' | 'in_progress' | 'completed' | 'cancelled'>('all');
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [dbHealthStatus, setDbHealthStatus] = useState<'unknown' | 'healthy' | 'needs_migration' | 'permission_error'>('unknown');
  const [requestsError, setRequestsError] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: 'rings' as 'rings' | 'necklaces' | 'earrings',
    metal_type: 'gold' as 'gold' | 'silver',
    weight_grams: '',
    image_url: '',
    is_featured: false
  });

  useEffect(() => {
    if (user) {
      checkAdminStatus();
      fetchMetalRates();
      fetchProducts();
      checkDatabaseHealth().then((status) => {
        if (status === 'healthy') {
          fetchCustomRequests();
        }
      });
    }
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();
      
      if (error) {
        console.error('Error checking admin status:', error);
        // If there's an error (like table doesn't exist), we can still continue
        // but assume user is not admin
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      
      const isUserAdmin = !!data;
      setIsAdmin(isUserAdmin);
      setLoading(false);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      setLoading(false);
    }
  };

  const fetchMetalRates = async () => {
    const { data } = await supabase
      .from('metal_rates')
      .select('*')
      .order('metal_type');
    
    if (data) {
      setMetalRates(data);
      const goldRate = data.find(rate => rate.metal_type === 'gold');
      const silverRate = data.find(rate => rate.metal_type === 'silver');
      
      setNewRates({
        gold: goldRate?.rate_per_gram.toString() || '',
        silver: silverRate?.rate_per_gram.toString() || '',
      });
    }
  };

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .in('category', ['rings', 'necklaces', 'earrings'])
      .order('created_at', { ascending: false });
    
    if (data) {
      const typedProducts = data.map(product => ({
        ...product,
        category: product.category as 'rings' | 'necklaces' | 'earrings',
        metal_type: product.metal_type as 'gold' | 'silver'
      }));
      
      setProducts(typedProducts);
    }
  };

  const fetchCustomRequests = async () => {
    setLoadingRequests(true);
    setRequestsError(null);
    try {
      // First, let's try a simple query without joins to see if the table exists
      const { data: testData, error: testError } = await supabase
        .from('custom_design_requests')
        .select('id, user_id, design_type, status, created_at')
        .limit(1);

      if (testError) {
        console.error('Error testing custom_design_requests table:', testError);
        
        // If the table doesn't exist, show a helpful message
        if (testError.code === 'PGRST116' || testError.message.includes('does not exist')) {
          setRequestsError("The custom_design_requests table doesn't exist. Please run the database setup.");
          setDbHealthStatus('needs_migration');
          toast({
            title: "Database Setup Required",
            description: "The custom design requests table hasn't been created yet. Click 'Quick Setup' below for instructions.",
            variant: "destructive"
          });
          setCustomRequests([]);
          return;
        }

        // Handle permission errors
        if (testError.code === 'PGRST301' || testError.message.includes('permission')) {
          setRequestsError("Permission denied. You need admin role to view custom design requests.");
          setDbHealthStatus('permission_error');
          toast({
            title: "Permission Error",
            description: "You don't have permission to view custom design requests. Please check your admin role.",
            variant: "destructive"
          });
          setCustomRequests([]);
          return;
        }

        throw testError;
      }

      // If basic query works, try the full query with joins
      const { data, error } = await supabase
        .from('custom_design_requests')
        .select(`
          *,
          profiles (
            display_name,
            email,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching custom requests with profiles:', error);
        
        // Try without profiles join as fallback
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('custom_design_requests')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (fallbackError) {
          throw fallbackError;
        }
        
        if (fallbackData) {
          console.warn('Using fallback query without profiles join');
          setCustomRequests(fallbackData as unknown as CustomDesignRequest[]);
          toast({
            title: "Partial Data Loaded",
            description: "Custom requests loaded but user profile information is not available.",
            variant: "default"
          });
        }
        return;
      }
      
      if (data) {
        setCustomRequests(data as unknown as CustomDesignRequest[]);
        setDbHealthStatus('healthy');
        setRequestsError(null);
      }
    } catch (err) {
      console.error('Unexpected error fetching custom requests:', err);
      setRequestsError(`Failed to load custom design requests: ${err instanceof Error ? err.message : 'Unknown error'}`);
      toast({
        title: "Error",
        description: `Failed to load custom design requests: ${err instanceof Error ? err.message : 'Unknown error'}`,
        variant: "destructive"
      });
      setCustomRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  const checkDatabaseHealth = async () => {
    try {
      // Test basic table access
      const { error } = await supabase
        .from('custom_design_requests')
        .select('id')
        .limit(1);

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          setDbHealthStatus('needs_migration');
          return 'needs_migration';
        }
        if (error.code === 'PGRST301' || error.message.includes('permission')) {
          setDbHealthStatus('permission_error');
          return 'permission_error';
        }
        console.error('Database health check failed:', error);
        setDbHealthStatus('needs_migration');
        return 'needs_migration';
      }

      setDbHealthStatus('healthy');
      return 'healthy';
    } catch (err) {
      console.error('Database health check error:', err);
      setDbHealthStatus('needs_migration');
      return 'needs_migration';
    }
  };

  const createCustomRequestsTable = async () => {
    try {
      // Import the setup utilities
      const { getSetupInstructions, testCustomDesignTable } = await import('@/utils/databaseSetup');
      
      // Test if table exists
      const tableTest = await testCustomDesignTable();
      
      if (tableTest.exists) {
        toast({
          title: "✅ Table Already Exists!",
          description: "The custom_design_requests table is already set up. Try refreshing the page.",
        });
        
        // Refresh data
        setTimeout(() => {
          fetchCustomRequests();
        }, 1000);
        
        return;
      }

      // Show setup instructions
      const instructions = getSetupInstructions();
      console.log(instructions);
      
      toast({
        title: "🛠️ Manual Setup Required",
        description: "Check the browser console for detailed SQL setup instructions. Copy and paste the SQL commands in your Supabase dashboard.",
        duration: 15000,
      });

      // Also show a more detailed alert
      alert(`DATABASE SETUP REQUIRED

The custom_design_requests table needs to be created manually.

STEPS:
1. Open browser console (F12) 
2. Copy the SQL commands shown there
3. Go to your Supabase dashboard → SQL Editor
4. Paste and run the SQL commands
5. Refresh this page

Check the console now for the complete SQL script!`);

    } catch (err) {
      console.error('Setup error:', err);
      toast({
        title: "Setup Error", 
        description: "Please check the console for manual setup instructions.",
        variant: "destructive"
      });
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      category: 'rings',
      metal_type: 'gold',
      weight_grams: '',
      image_url: '',
      is_featured: false
    });
    setEditingProduct(null);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file (JPG, PNG, GIF, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setImageUploading(true);

    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `product-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `product-images/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      // Update the form with the uploaded image URL
      setProductForm(prev => ({ ...prev, image_url: publicUrl }));

      toast({
        title: "✅ Image Uploaded!",
        description: "Image has been successfully uploaded and added to your product",
        duration: 4000,
      });

    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setImageUploading(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You must be logged in as an admin to add products",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    if (!productForm.name.trim() || !productForm.description.trim() || !productForm.weight_grams || parseFloat(productForm.weight_grams) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Get current metal rate
    const currentRate = metalRates.find(rate => rate.metal_type === productForm.metal_type);
    if (!currentRate) {
      toast({
        title: "Error",
        description: `Current ${productForm.metal_type} rate not found. Please update metal rates first.`,
        variant: "destructive",
      });
      return;
    }

    try {
      const productData = {
        name: productForm.name.trim(),
        description: productForm.description.trim(),
        category: productForm.category,
        metal_type: productForm.metal_type,
        price_per_gram: currentRate.rate_per_gram,
        weight_grams: parseFloat(productForm.weight_grams),
        image_url: productForm.image_url.trim() || null,
        is_featured: productForm.is_featured
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        
        if (error) throw error;
        
        toast({
          title: "✅ Success!",
          description: `Product "${productData.name}" updated successfully`,
          duration: 5000,
        });
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);
        
        if (error) throw error;
        
        toast({
          title: "🎉 Product Added Successfully!",
          description: `"${productData.name}" has been added to your ${productData.category} collection`,
          duration: 5000,
        });
      }
      
      resetProductForm();
      await fetchProducts();
      
    } catch (error: any) {
      console.error('Error saving product:', error);
      
      toast({
        title: "Error",
        description: error.message || "Failed to save product",
        variant: "destructive",
      });
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      category: product.category,
      metal_type: product.metal_type,
      weight_grams: product.weight_grams.toString(),
      image_url: product.image_url || '',
      is_featured: product.is_featured
    });
    
    toast({
      title: "✏️ Edit Mode Activated!",
      description: `Now editing "${product.name}". Update the form above and click "Update Product".`,
      duration: 4000,
    });
    
    setTimeout(() => {
      const productForm = document.querySelector('form');
      if (productForm) {
        productForm.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 100);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!user || !isAdmin) return;
    
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      
      if (error) throw error;
      
      toast({
        title: "✅ Success!",
        description: "Product deleted successfully",
        duration: 3000,
      });
      
      await fetchProducts();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: "❌ Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const updateRates = async () => {
    if (!user || !isAdmin) return;
    
    try {
      if (newRates.gold) {
        await supabase
          .from('metal_rates')
          .update({ 
            rate_per_gram: parseFloat(newRates.gold),
            updated_by: user.id 
          })
          .eq('metal_type', 'gold');
      }
      
      if (newRates.silver) {
        await supabase
          .from('metal_rates')
          .update({ 
            rate_per_gram: parseFloat(newRates.silver),
            updated_by: user.id 
          })
          .eq('metal_type', 'silver');
      }
      
      toast({
        title: "Success",
        description: "Metal rates updated successfully",
      });
      
      fetchMetalRates();
      fetchProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update rates",
        variant: "destructive",
      });
    }
  };

  // Filter products based on category
  const filteredProducts = categoryFilter === 'all' 
    ? products 
    : products.filter(product => product.category === categoryFilter);

  // Filter custom requests based on status
  const filteredCustomRequests = requestStatusFilter === 'all' 
    ? customRequests 
    : customRequests.filter(request => request.status === requestStatusFilter);

  // Function to update custom request status
  const updateRequestStatus = async (requestId: string, status: string, adminNotes?: string, estimatedPrice?: number, estimatedDate?: string) => {
    try {
      const updates: any = { status };
      if (adminNotes !== undefined) updates.admin_notes = adminNotes;
      if (estimatedPrice !== undefined) updates.estimated_price = estimatedPrice;
      if (estimatedDate !== undefined) updates.estimated_completion_date = estimatedDate;

      const { error } = await supabase
        .from('custom_design_requests')
        .update(updates)
        .eq('id', requestId);

      if (error) {
        console.error('Error updating request status:', error);
        toast({
          title: "Error",
          description: "Failed to update request status",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Request status updated successfully"
      });

      fetchCustomRequests();
    } catch (err) {
      console.error('Unexpected error updating request:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
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
      <div className="min-h-screen bg-gold-bg">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gold-text">Please sign in to access admin panel</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gold-bg">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <Card>
            <CardContent className="p-6 text-center">
              <h2 className="text-2xl font-bold text-gold-text mb-4">Access Denied</h2>
              <p className="text-gold-text/70">You don't have permission to access the admin panel.</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${
      theme === 'gold' 
        ? 'bg-gradient-to-br from-amber-50 via-white to-yellow-50' 
        : 'bg-gradient-to-br from-slate-50 via-white to-gray-50'
    }`}>
      {/* Content */}
      <div className="relative z-10">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 pb-8">
          <div className="max-w-6xl mx-auto">
            {/* Enhanced Header Card */}
            <Card className={`mb-8 bg-white/80 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] ${
              theme === 'gold'
                ? 'border-2 border-amber-200/50'
                : 'border-2 border-slate-200/50'
            }`}>
              <CardHeader className="relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 ${
                  theme === 'gold'
                    ? 'bg-gradient-to-br from-amber-400/20 to-yellow-400/20'
                    : 'bg-gradient-to-br from-slate-400/20 to-gray-400/20'
                }`}></div>
                <div className="relative">
                  <CardTitle className={`font-playfair text-3xl mb-2 flex items-center gap-3 ${
                    theme === 'gold' ? 'text-amber-800' : 'text-slate-800'
                  }`}>
                    <div className={`p-3 rounded-xl text-white shadow-lg hover:scale-110 transition-transform duration-300 ${
                      theme === 'gold'
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500'
                        : 'bg-gradient-to-r from-slate-500 to-gray-500'
                    }`}>
                      👑
                    </div>
                    Admin Dashboard
                  </CardTitle>
                  <CardDescription className={`text-lg ${
                    theme === 'gold' ? 'text-amber-700/80' : 'text-slate-700/80'
                  }`}>
                    Manage your jewelry empire with style and precision
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>

          <Tabs defaultValue="products" className="w-full relative">
            {/* Enhanced Tab List */}
            <TabsList className={`grid w-full grid-cols-3 bg-white/90 backdrop-blur-sm shadow-lg rounded-xl p-1 mb-8 h-14 ${
              theme === 'gold'
                ? 'border-2 border-amber-200/50'
                : 'border-2 border-slate-200/50'
            }`}>
              <TabsTrigger 
                value="products" 
                className={`flex items-center gap-2 transition-all duration-300 rounded-lg font-medium py-2 px-4 h-12 ${
                  theme === 'gold'
                    ? 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-yellow-500 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-amber-100/50'
                    : 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-500 data-[state=active]:to-gray-500 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-slate-100/50'
                }`}
              >
                <Package className="h-4 w-4" />
                <span className="text-sm">Products</span>
              </TabsTrigger>
              <TabsTrigger 
                value="rates" 
                className={`flex items-center gap-2 transition-all duration-300 rounded-lg font-medium py-2 px-4 h-12 ${
                  theme === 'gold'
                    ? 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-yellow-500 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-amber-100/50'
                    : 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-500 data-[state=active]:to-gray-500 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-slate-100/50'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Metal Rates</span>
              </TabsTrigger>
              <TabsTrigger 
                value="custom-requests" 
                className={`flex items-center gap-2 transition-all duration-300 rounded-lg font-medium py-2 px-4 h-12 ${
                  theme === 'gold'
                    ? 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-yellow-500 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-amber-100/50'
                    : 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-500 data-[state=active]:to-gray-500 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-slate-100/50'
                }`}
              >
                <span className="text-base">🎨</span>
                <span className="text-sm">Custom Requests</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="space-y-6">
              {/* Enhanced Product Form */}
              <Card className={`${
                editingProduct 
                  ? "border-blue-400 shadow-2xl bg-blue-50/30 backdrop-blur-sm hover:shadow-blue-200/50" 
                  : `bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl ${
                      theme === 'gold'
                        ? 'border-2 border-amber-200/50'
                        : 'border-2 border-slate-200/50'
                    }`
              } transition-all duration-500 hover:scale-[1.01] relative overflow-hidden`}>
                {/* Decorative elements */}
                <div className={`absolute top-0 right-0 w-20 h-20 rounded-full -mr-10 -mt-10 ${
                  theme === 'gold'
                    ? 'bg-gradient-to-br from-amber-300/20 to-yellow-300/20'
                    : 'bg-gradient-to-br from-slate-300/20 to-gray-300/20'
                }`}></div>
                <div className={`absolute bottom-0 left-0 w-16 h-16 rounded-full -ml-8 -mb-8 ${
                  theme === 'gold'
                    ? 'bg-gradient-to-tr from-amber-400/15 to-yellow-400/15'
                    : 'bg-gradient-to-tr from-slate-400/15 to-gray-400/15'
                }`}></div>
                <CardHeader className="relative">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl text-white shadow-lg transition-all duration-300 hover:scale-110 ${
                      editingProduct 
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                        : 'bg-gradient-to-r from-amber-500 to-yellow-500'
                    }`}>
                      {editingProduct ? '✏️' : '✨'}
                    </div>
                    <div>
                      <CardTitle className={`text-xl flex items-center gap-2 ${
                        theme === 'gold' ? 'text-amber-800' : 'text-slate-800'
                      }`}>
                        {editingProduct ? (
                          <>
                            Edit Product: "{editingProduct.name}"
                          </>
                        ) : (
                          'Add New Product'
                        )}
                      </CardTitle>
                      {editingProduct && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium ml-2 animate-pulse">
                          Edit Mode Active
                        </span>
                      )}
                    </div>
                  </div>
                  <CardDescription className={`mt-3 ${
                    theme === 'gold' ? 'text-amber-700/80' : 'text-slate-700/80'
                  }`}>
                    {editingProduct 
                      ? `Updating details for "${editingProduct.name}" - Make your changes below and click "Update Product"`
                      : 'Create a stunning new piece for your jewelry collection'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProductSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="product-name" className={`${
                          theme === 'gold' ? 'text-amber-800' : 'text-slate-800'
                        }`}>
                          Product Name
                        </Label>
                        <Input
                          id="product-name"
                          placeholder="Enter product name"
                          value={productForm.name}
                          onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="product-category" className={`${
                          theme === 'gold' ? 'text-amber-800' : 'text-slate-800'
                        }`}>
                          Category
                        </Label>
                        <select
                          id="product-category"
                          value={productForm.category}
                          onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value as 'rings' | 'necklaces' | 'earrings' }))}
                          className={`w-full px-3 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 ${
                            theme === 'gold'
                              ? 'border-amber-300 text-amber-800 focus:ring-amber-500 focus:border-amber-500'
                              : 'border-slate-300 text-slate-800 focus:ring-slate-500 focus:border-slate-500'
                          }`}
                          required
                        >
                          <option value="rings">Rings</option>
                          <option value="necklaces">Necklaces</option>
                          <option value="earrings">Earrings</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="product-description" className={`${
                        theme === 'gold' ? 'text-amber-800' : 'text-slate-800'
                      }`}>
                        Description
                      </Label>
                      <Textarea
                        id="product-description"
                        placeholder="Enter product description"
                        value={productForm.description}
                        onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                        required
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="metal-type" className={`${
                          theme === 'gold' ? 'text-amber-800' : 'text-slate-800'
                        }`}>
                          Metal Type
                        </Label>
                        <select
                          id="metal-type"
                          value={productForm.metal_type}
                          onChange={(e) => setProductForm(prev => ({ ...prev, metal_type: e.target.value as 'gold' | 'silver' }))}
                          className={`w-full px-3 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 ${
                            theme === 'gold'
                              ? 'border-amber-300 text-amber-800 focus:ring-amber-500 focus:border-amber-500'
                              : 'border-slate-300 text-slate-800 focus:ring-slate-500 focus:border-slate-500'
                          }`}
                          required
                        >
                          <option value="gold">Gold</option>
                          <option value="silver">Silver</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="weight" className={`${
                          theme === 'gold' ? 'text-amber-800' : 'text-slate-800'
                        }`}>
                          Weight (grams)
                        </Label>
                        <Input
                          id="weight"
                          type="number"
                          placeholder="Enter weight"
                          value={productForm.weight_grams}
                          onChange={(e) => setProductForm(prev => ({ ...prev, weight_grams: e.target.value }))}
                          step="0.01"
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className={`text-base font-medium ${
                        theme === 'gold' ? 'text-amber-800' : 'text-slate-800'
                      }`}>
                        Product Image
                      </Label>
                      
                      {/* Image Upload Section */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <Label htmlFor="image-upload" className={`text-sm ${
                              theme === 'gold' ? 'text-amber-800' : 'text-slate-800'
                            }`}>
                              Upload Image File
                            </Label>
                            <div className="mt-1">
                              <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={imageUploading}
                                className={`block w-full text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:cursor-pointer ${
                                  theme === 'gold'
                                    ? 'text-amber-800 file:bg-amber-500 file:text-white hover:file:bg-amber-600'
                                    : 'text-slate-800 file:bg-slate-500 file:text-white hover:file:bg-slate-600'
                                }`}
                              />
                            </div>
                            {imageUploading && (
                              <p className={`text-sm mt-1 flex items-center gap-2 ${
                                theme === 'gold' ? 'text-amber-700/60' : 'text-slate-700/60'
                              }`}>
                                <span className="animate-spin">⏳</span>
                                Uploading image...
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className={`flex items-center gap-4 ${
                          theme === 'gold' ? 'text-amber-700/60' : 'text-slate-700/60'
                        }`}>
                          <div className={`flex-1 h-px ${
                            theme === 'gold' ? 'bg-amber-300/20' : 'bg-slate-300/20'
                          }`}></div>
                          <span className="text-sm">OR</span>
                          <div className={`flex-1 h-px ${
                            theme === 'gold' ? 'bg-amber-300/20' : 'bg-slate-300/20'
                          }`}></div>
                        </div>
                        
                        {/* Image URL Section */}
                        <div>
                          <Label htmlFor="image-url" className={`text-sm ${
                            theme === 'gold' ? 'text-amber-800' : 'text-slate-800'
                          }`}>
                            Image URL
                          </Label>
                          <Input
                            id="image-url"
                            placeholder="Enter image URL (https://...)"
                            value={productForm.image_url}
                            onChange={(e) => setProductForm(prev => ({ ...prev, image_url: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                        
                        {/* Image Preview */}
                        {productForm.image_url && (
                          <div className="mt-3">
                            <Label className={`text-sm ${
                              theme === 'gold' ? 'text-amber-800' : 'text-slate-800'
                            }`}>Preview:</Label>
                            <div className={`mt-1 border rounded-lg p-3 ${
                              theme === 'gold'
                                ? 'border-amber-300/20 bg-amber-50/50'
                                : 'border-slate-300/20 bg-slate-50/50'
                            }`}>
                              <img 
                                src={productForm.image_url} 
                                alt="Product preview"
                                className="w-32 h-32 object-cover rounded-md mx-auto"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                              <div className={`hidden text-center text-sm mt-2 ${
                                theme === 'gold' ? 'text-amber-700/60' : 'text-slate-700/60'
                              }`}>
                                Failed to load image
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is-featured"
                        checked={productForm.is_featured}
                        onChange={(e) => setProductForm(prev => ({ ...prev, is_featured: e.target.checked }))}
                        className="rounded border-gold focus:ring-gold"
                      />
                      <Label htmlFor="is-featured" className={`${
                        theme === 'gold' ? 'text-amber-800' : 'text-slate-800'
                      }`}>
                        Featured Product
                      </Label>
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className={`${
                        theme === 'gold'
                          ? 'bg-amber-500 hover:bg-amber-600'
                          : 'bg-slate-500 hover:bg-slate-600'
                      } text-white`}>
                        <Plus className="h-4 w-4 mr-2" />
                        {editingProduct ? 'Update Product' : 'Add Product'}
                      </Button>
                      {editingProduct && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={resetProductForm}
                        >
                          Cancel Edit
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Enhanced Products List */}
              <Card className={`bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden ${
                theme === 'gold'
                  ? 'border-2 border-amber-200/50'
                  : 'border-2 border-slate-200/50'
              }`}>
                {/* Decorative background pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className={`absolute top-4 left-4 w-8 h-8 border-2 rounded rotate-45 ${
                    theme === 'gold' ? 'border-amber-400' : 'border-slate-400'
                  }`}></div>
                  <div className={`absolute top-12 right-8 w-6 h-6 rounded-full ${
                    theme === 'gold' ? 'bg-amber-300' : 'bg-slate-300'
                  }`}></div>
                  <div className={`absolute bottom-8 left-12 w-4 h-4 ${
                    theme === 'gold' ? 'bg-yellow-400' : 'bg-gray-400'
                  }`}></div>
                  <div className={`absolute bottom-4 right-4 w-10 h-10 border rounded-full ${
                    theme === 'gold' ? 'border-amber-300' : 'border-slate-300'
                  }`}></div>
                </div>
                <CardHeader className="relative">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl text-white shadow-lg hover:scale-110 transition-transform duration-300 ${
                        theme === 'gold'
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-500'
                          : 'bg-gradient-to-r from-slate-500 to-gray-500'
                      }`}>
                        📦
                      </div>
                      <div>
                        <CardTitle className={`text-xl ${
                          theme === 'gold' ? 'text-amber-800' : 'text-slate-800'
                        }`}>Products ({filteredProducts.length})</CardTitle>
                        <CardDescription className={`${
                          theme === 'gold' ? 'text-amber-700/80' : 'text-slate-700/80'
                        }`}>
                          Manage your exquisite jewelry collection
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="category-filter" className={`text-sm whitespace-nowrap ${
                        theme === 'gold' ? 'text-amber-800' : 'text-slate-800'
                      }`}>
                        Filter by Category:
                      </Label>
                      <select
                        id="category-filter"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value as 'all' | 'rings' | 'necklaces' | 'earrings')}
                        className={`min-w-[140px] px-3 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 text-sm ${
                          theme === 'gold'
                            ? 'border-amber-300 text-amber-800 focus:ring-amber-500 focus:border-amber-500'
                            : 'border-slate-300 text-slate-800 focus:ring-slate-500 focus:border-slate-500'
                        }`}
                      >
                        <option value="all">📋 All Categories</option>
                        <option value="rings">💍 Rings</option>
                        <option value="necklaces">💿 Necklaces</option>
                        <option value="earrings">👂 Earrings</option>
                      </select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {products.length === 0 ? (
                    <div className={`text-center py-8 ${
                      theme === 'gold' ? 'text-amber-700/70' : 'text-slate-700/70'
                    }`}>
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No products found. Add your first product above.</p>
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className={`text-center py-8 ${
                      theme === 'gold' ? 'text-amber-700/70' : 'text-slate-700/70'
                    }`}>
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No {categoryFilter} products found.</p>
                      <p className="text-sm mt-2">Try selecting a different category or add new products.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Category info */}
                      <div className={`flex items-center justify-between p-3 rounded-lg ${
                        theme === 'gold'
                          ? 'bg-amber-100/10'
                          : 'bg-slate-100/10'
                      }`}>
                        <span className={`font-medium ${
                          theme === 'gold' ? 'text-amber-800' : 'text-slate-800'
                        }`}>
                          {categoryFilter === 'all' 
                            ? `Showing all ${filteredProducts.length} products`
                            : `Showing ${filteredProducts.length} ${categoryFilter} ${filteredProducts.length === 1 ? 'product' : 'products'}`
                          }
                        </span>
                        <span className={`text-sm ${
                          theme === 'gold' ? 'text-amber-700/70' : 'text-slate-700/70'
                        }`}>
                          {categoryFilter === 'all' ? '📋 All Categories' : 
                           categoryFilter === 'rings' ? '💍 Rings' :
                           categoryFilter === 'necklaces' ? '💿 Necklaces' : '👂 Earrings'}
                        </span>
                      </div>
                      
                      {/* Products grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredProducts.map((product) => {
                          const totalPrice = product.price_per_gram * product.weight_grams;
                          return (
                            <Card key={product.id} className="border-gold/20">
                              <CardContent className="p-4">
                                {product.image_url && (
                                  <img 
                                    src={product.image_url} 
                                    alt={product.name}
                                    className="w-full h-32 object-cover rounded-lg mb-3"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                )}
                                <div className="space-y-2">
                                  <div className="flex items-start justify-between">
                                    <h3 className="font-semibold text-gold-text">{product.name}</h3>
                                    {product.is_featured && (
                                      <span className="bg-gold text-gold-bg text-xs px-2 py-1 rounded">
                                        Featured
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gold-text/70 line-clamp-2">
                                    {product.description}
                                  </p>
                                  <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gold-text/70">Category:</span>
                                      <span className="text-gold-text capitalize">{product.category}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gold-text/70">Metal:</span>
                                      <span className="text-gold-text capitalize">{product.metal_type}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gold-text/70">Weight:</span>
                                      <span className="text-gold-text">{product.weight_grams}g</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gold-text/70">Rate:</span>
                                      <span className="text-gold-text">₹{product.price_per_gram}/g</span>
                                    </div>
                                    <div className="flex justify-between font-semibold text-gold-dark">
                                      <span>Total Price:</span>
                                      <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                                    </div>
                                  </div>
                                  <div className="flex gap-2 pt-2">
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      onClick={() => handleEditProduct(product)}
                                      className="flex-1"
                                    >
                                      <Edit className="h-3 w-3 mr-1" />
                                      Edit
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="destructive" 
                                      onClick={() => handleDeleteProduct(product.id)}
                                      className="flex-1"
                                    >
                                      <Trash2 className="h-3 w-3 mr-1" />
                                      Delete
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rates" className="space-y-6">
              {/* Enhanced Current Rates Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {metalRates.map((rate, index) => (
                  <Card key={rate.id} className="bg-white/80 backdrop-blur-sm border-2 border-amber-200/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 relative overflow-hidden group">
                    {/* Animated background */}
                    <div className={`absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500 ${
                      rate.metal_type === 'gold' 
                        ? 'bg-gradient-to-br from-yellow-300 to-amber-400'
                        : 'bg-gradient-to-br from-gray-300 to-slate-400'
                    }`}></div>
                                  
                    {/* Floating particles */}
                    <div className="absolute top-2 right-2 w-3 h-3 bg-amber-400/30 rounded-full animate-ping"></div>
                    <div className="absolute bottom-3 left-3 w-2 h-2 bg-yellow-400/40 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                    <CardContent className="p-6 relative">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-amber-800 capitalize flex items-center gap-2">
                            <span className="text-2xl">{rate.metal_type === 'gold' ? '🌟' : '💎'}</span>
                            {rate.metal_type} Rate
                          </h3>
                          <p className="text-3xl font-bold text-amber-900 mt-2 group-hover:scale-110 transition-transform duration-300">
                            ₹{rate.rate_per_gram.toLocaleString('en-IN')}/gram
                          </p>
                          <p className="text-sm text-amber-700/70 mt-2">
                            Last updated: {new Date(rate.updated_at).toLocaleString('en-IN')}
                          </p>
                        </div>
                        <div className={`p-4 rounded-2xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 ${
                          rate.metal_type === 'gold' 
                            ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white' 
                            : 'bg-gradient-to-br from-gray-400 to-slate-500 text-white'
                        }`}>
                          {rate.metal_type === 'gold' ? <TrendingUp className="h-8 w-8" /> : <TrendingDown className="h-8 w-8" />}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Enhanced Update Rates Form */}
              <Card className="bg-white/80 backdrop-blur-sm border-2 border-amber-200/50 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-300/20 to-yellow-300/20 rounded-full -mr-12 -mt-12"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-amber-400/15 to-yellow-400/15 rounded-full -ml-10 -mb-10"></div>
                                
                <CardHeader className="relative">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-xl text-white shadow-lg hover:scale-110 transition-transform duration-300">
                      💰
                    </div>
                    <div>
                      <CardTitle className="text-amber-800 text-xl">Update Metal Rates</CardTitle>
                      <CardDescription className="text-amber-700/80">
                        Set the latest gold and silver rates per gram (in Indian Rupees)
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gold-rate" className={`${
                        theme === 'gold' ? 'text-amber-800' : 'text-slate-800'
                      }`}>
                        Gold Rate (₹/gram)
                      </Label>
                      <Input
                        id="gold-rate"
                        type="number"
                        placeholder="Enter gold rate"
                        value={newRates.gold}
                        onChange={(e) => setNewRates(prev => ({ ...prev, gold: e.target.value }))}
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="silver-rate" className={`${
                        theme === 'gold' ? 'text-amber-800' : 'text-slate-800'
                      }`}>
                        Silver Rate (₹/gram)
                      </Label>
                      <Input
                        id="silver-rate"
                        type="number"
                        placeholder="Enter silver rate"
                        value={newRates.silver}
                        onChange={(e) => setNewRates(prev => ({ ...prev, silver: e.target.value }))}
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    onClick={updateRates} 
                    className={`w-full text-white ${
                      theme === 'gold'
                        ? 'bg-amber-500 hover:bg-amber-600'
                        : 'bg-slate-500 hover:bg-slate-600'
                    }`}
                    disabled={!newRates.gold && !newRates.silver}
                  >
                    Update Rates
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Custom Design Requests Tab */}
            <TabsContent value="custom-requests" className="space-y-6">
              <Card className={`bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden ${
                theme === 'gold'
                  ? 'border-2 border-amber-200/50'
                  : 'border-2 border-slate-200/50'
              }`}>
                <CardHeader className="relative">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl text-white shadow-lg hover:scale-110 transition-transform duration-300 ${
                        theme === 'gold'
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-500'
                          : 'bg-gradient-to-r from-slate-500 to-gray-500'
                      }`}>
                        🎨
                      </div>
                      <div>
                        <CardTitle className={`text-xl ${
                          theme === 'gold' ? 'text-amber-800' : 'text-slate-800'
                        }`}>Customer Design Requests ({filteredCustomRequests.length})</CardTitle>
                        <CardDescription className={`${
                          theme === 'gold' ? 'text-amber-700/80' : 'text-slate-700/80'
                        }`}>
                          Manage custom jewelry design requests from customers
                        </CardDescription>
                        {/* Database Status Indicator */}
                        {dbHealthStatus !== 'unknown' && (
                          <div className="mt-2 flex items-center gap-2">
                            {dbHealthStatus === 'healthy' ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ✅ Database Ready
                              </span>
                            ) : dbHealthStatus === 'needs_migration' ? (
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  ⚠️ Setup Required
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={createCustomRequestsTable}
                                  className="text-xs"
                                >
                                  Quick Setup
                                </Button>
                              </div>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                ❌ Permission Error
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="status-filter" className={`text-sm whitespace-nowrap ${
                        theme === 'gold' ? 'text-amber-800' : 'text-slate-800'
                      }`}>
                        Filter by Status:
                      </Label>
                      <select
                        id="status-filter"
                        value={requestStatusFilter}
                        onChange={(e) => setRequestStatusFilter(e.target.value as any)}
                        className={`min-w-[140px] px-3 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 text-sm ${
                          theme === 'gold'
                            ? 'border-amber-300 text-amber-800 focus:ring-amber-500 focus:border-amber-500'
                            : 'border-slate-300 text-slate-800 focus:ring-slate-500 focus:border-slate-500'
                        }`}
                      >
                        <option value="all">📋 All Status</option>
                        <option value="pending">⏰ Pending</option>
                        <option value="in_review">👀 In Review</option>
                        <option value="approved">✅ Approved</option>
                        <option value="in_progress">🔨 In Progress</option>
                        <option value="completed">🎉 Completed</option>
                        <option value="cancelled">❌ Cancelled</option>
                      </select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingRequests ? (
                    <div className={`text-center py-8 ${
                      theme === 'gold' ? 'text-amber-700/70' : 'text-slate-700/70'
                    }`}>
                      <div className="text-4xl mb-4 animate-spin">⏳</div>
                      <p className="text-lg">Loading custom design requests...</p>
                    </div>
                  ) : requestsError ? (
                    <div className={`text-center py-8 ${
                      theme === 'gold' ? 'text-red-700' : 'text-red-600'
                    }`}>
                      <div className="text-6xl mb-4">⚠️</div>
                      <p className="text-lg mb-4 font-medium">Database Setup Required</p>
                      <div className={`max-w-md mx-auto p-4 rounded-lg border-2 ${
                        theme === 'gold' 
                          ? 'bg-red-50 border-red-200 text-red-800' 
                          : 'bg-red-50 border-red-200 text-red-800'
                      }`}>
                        <p className="text-sm mb-3">{requestsError}</p>
                        <div className="space-y-2">
                          <Button
                            onClick={createCustomRequestsTable}
                            size="sm"
                            className={`w-full ${
                              theme === 'gold'
                                ? 'bg-amber-600 hover:bg-amber-700'
                                : 'bg-slate-600 hover:bg-slate-700'
                            } text-white`}
                          >
                            📋 Show Setup Instructions
                          </Button>
                          <p className="text-xs text-gray-600">
                            This will show you the SQL commands to run in your Supabase dashboard
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : customRequests.length === 0 ? (
                    <div className={`text-center py-8 ${
                      theme === 'gold' ? 'text-amber-700/70' : 'text-slate-700/70'
                    }`}>
                      <div className="text-6xl mb-4">🎨</div>
                      <p className="text-lg mb-2">No custom design requests yet</p>
                      <p className="text-sm">Customer design requests will appear here when submitted</p>
                    </div>
                  ) : filteredCustomRequests.length === 0 ? (
                    <div className={`text-center py-8 ${
                      theme === 'gold' ? 'text-amber-700/70' : 'text-slate-700/70'
                    }`}>
                      <div className="text-6xl mb-4">🔍</div>
                      <p className="text-lg mb-2">No {requestStatusFilter} requests found</p>
                      <p className="text-sm">Try selecting a different status filter</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredCustomRequests.map((request) => (
                        <Card key={request.id} className={`transition-all duration-300 hover:shadow-lg ${
                          theme === 'gold'
                            ? 'bg-gradient-to-r from-amber-50/50 to-yellow-50/50 border-amber-200/60 hover:border-amber-300'
                            : 'bg-gradient-to-r from-slate-50/50 to-gray-50/50 border-slate-200/60 hover:border-slate-300'
                        }`}>
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className={`text-lg flex items-center gap-2 ${
                                  theme === 'gold' ? 'text-amber-800' : 'text-slate-800'
                                }`}>
                                  <span className="text-2xl">
                                    {request.design_type === 'ring' ? '💍' :
                                     request.design_type === 'necklace' ? '📿' :
                                     request.design_type === 'earrings' ? '👂' :
                                     request.design_type === 'bracelet' ? '💫' :
                                     request.design_type === 'pendant' ? '✨' : '🎨'}
                                  </span>
                                  {request.design_type.charAt(0).toUpperCase() + request.design_type.slice(1)} Design Request
                                </CardTitle>
                                <div className="flex items-center gap-4 mt-2 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage 
                                        src={request.profiles?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(request.profiles?.display_name || request.profiles?.email || 'User')}&backgroundColor=f59e0b`}
                                        alt={request.profiles?.display_name || 'User Avatar'} 
                                      />
                                      <AvatarFallback className={`text-xs ${
                                        theme === 'gold' 
                                          ? 'bg-amber-100 text-amber-800' 
                                          : 'bg-slate-100 text-slate-800'
                                      }`}>
                                        {(request.profiles?.display_name || request.profiles?.email || 'U').charAt(0).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className={`${
                                      theme === 'gold' ? 'text-amber-700' : 'text-slate-700'
                                    }`}>
                                      {request.profiles?.display_name || request.profiles?.email || 'Unknown User'}
                                    </span>
                                  </div>
                                  <span className={`${
                                    theme === 'gold' ? 'text-amber-600' : 'text-slate-600'
                                  }`}>
                                    📅 {new Date(request.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  request.status === 'in_review' ? 'bg-blue-100 text-blue-800' :
                                  request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                  request.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
                                  request.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {request.status.replace('_', ' ').toUpperCase()}
                                </span>
                                {request.estimated_price && (
                                  <span className={`text-sm font-semibold ${
                                    theme === 'gold' ? 'text-amber-700' : 'text-slate-700'
                                  }`}>
                                    Est: ₹{request.estimated_price.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className={`text-sm font-semibold ${
                                  theme === 'gold' ? 'text-amber-700' : 'text-slate-700'
                                }`}>Description:</Label>
                                <p className={`text-sm mt-1 ${
                                  theme === 'gold' ? 'text-amber-800' : 'text-slate-800'
                                }`}>{request.description}</p>
                              </div>
                              <div className="space-y-2">
                                {request.material_preference && (
                                  <div>
                                    <span className={`text-sm font-semibold ${
                                      theme === 'gold' ? 'text-amber-700' : 'text-slate-700'
                                    }`}>Material: </span>
                                    <span className={`text-sm ${
                                      theme === 'gold' ? 'text-amber-800' : 'text-slate-800'
                                    }`}>{request.material_preference}</span>
                                  </div>
                                )}
                                {request.budget_range && (
                                  <div>
                                    <span className={`text-sm font-semibold ${
                                      theme === 'gold' ? 'text-amber-700' : 'text-slate-700'
                                    }`}>Budget: </span>
                                    <span className={`text-sm ${
                                      theme === 'gold' ? 'text-amber-800' : 'text-slate-800'
                                    }`}>{request.budget_range}</span>
                                  </div>
                                )}
                                {request.contact_phone && (
                                  <div>
                                    <span className={`text-sm font-semibold ${
                                      theme === 'gold' ? 'text-amber-700' : 'text-slate-700'
                                    }`}>Phone: </span>
                                    <span className={`text-sm ${
                                      theme === 'gold' ? 'text-amber-800' : 'text-slate-800'
                                    }`}>{request.contact_phone}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Enhanced Special Requirements Section */}
                            {request.special_requirements && (
                              <div className={`p-4 rounded-lg border-l-4 ${
                                theme === 'gold' 
                                  ? 'bg-amber-50 border-l-amber-400' 
                                  : 'bg-blue-50 border-l-blue-400'
                              }`}>
                                <Label className={`text-base font-semibold flex items-center gap-2 ${
                                  theme === 'gold' ? 'text-amber-800' : 'text-blue-800'
                                }`}>
                                  📋 Special Requirements
                                </Label>
                                <p className={`text-sm mt-2 font-medium leading-relaxed ${
                                  theme === 'gold' ? 'text-amber-900' : 'text-blue-900'
                                }`}>{request.special_requirements}</p>
                              </div>
                            )}

                            {/* Enhanced Description Section for Reference Photos */}
                            {request.description && (
                              <div className={`p-4 rounded-lg border-l-4 ${
                                theme === 'gold' 
                                  ? 'bg-emerald-50 border-l-emerald-400' 
                                  : 'bg-green-50 border-l-green-400'
                              }`}>
                                <Label className={`text-base font-semibold flex items-center gap-2 ${
                                  theme === 'gold' ? 'text-emerald-800' : 'text-green-800'
                                }`}>
                                  💎 Design Description & Reference Materials
                                </Label>
                                <div className={`text-sm mt-2 font-medium leading-relaxed whitespace-pre-line ${
                                  theme === 'gold' ? 'text-emerald-900' : 'text-green-900'
                                }`}>
                                  {request.description.split('\n\n').map((paragraph, index) => (
                                    <div key={index} className={index > 0 ? 'mt-3' : ''}>
                                      {paragraph.includes('📸 Reference Photos') ? (
                                        <div className={`p-2 rounded ${
                                          theme === 'gold' ? 'bg-amber-100' : 'bg-yellow-100'
                                        }`}>
                                          <span className="font-bold text-orange-700">
                                            {paragraph}
                                          </span>
                                        </div>
                                      ) : (
                                        paragraph
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {request.admin_notes && (
                              <div className={`p-3 rounded-lg ${
                                theme === 'gold' ? 'bg-amber-100/50' : 'bg-slate-100/50'
                              }`}>
                                <Label className={`text-sm font-semibold ${
                                  theme === 'gold' ? 'text-amber-700' : 'text-slate-700'
                                }`}>Admin Notes:</Label>
                                <p className={`text-sm mt-1 ${
                                  theme === 'gold' ? 'text-amber-800' : 'text-slate-800'
                                }`}>{request.admin_notes}</p>
                              </div>
                            )}

                            <div className="flex flex-wrap gap-2 pt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateRequestStatus(request.id, 'in_review')}
                                className={`${
                                  theme === 'gold'
                                    ? 'border-blue-400 text-blue-700 hover:bg-blue-50'
                                    : 'border-blue-400 text-blue-700 hover:bg-blue-50'
                                }`}
                                disabled={request.status === 'in_review'}
                              >
                                👀 Review
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateRequestStatus(request.id, 'approved')}
                                className={`${
                                  theme === 'gold'
                                    ? 'border-green-400 text-green-700 hover:bg-green-50'
                                    : 'border-green-400 text-green-700 hover:bg-green-50'
                                }`}
                                disabled={request.status === 'approved' || request.status === 'completed'}
                              >
                                ✅ Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateRequestStatus(request.id, 'completed')}
                                className={`${
                                  theme === 'gold'
                                    ? 'border-emerald-400 text-emerald-700 hover:bg-emerald-50'
                                    : 'border-emerald-400 text-emerald-700 hover:bg-emerald-50'
                                }`}
                                disabled={request.status === 'completed'}
                              >
                                🎉 Complete
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
};

export default Admin;