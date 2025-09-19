import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { TrendingUp, TrendingDown, Plus, Edit, Trash2, Package } from 'lucide-react';

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

const Admin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [metalRates, setMetalRates] = useState<MetalRate[]>([]);
  const [newRates, setNewRates] = useState({ gold: '', silver: '' });
  
  // Product management state
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'rings' | 'necklaces' | 'earrings'>('all');
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
      
      const isUserAdmin = !!data;
      setIsAdmin(isUserAdmin);
      setLoading(false);
    } catch (error) {
      console.error('Error checking admin status:', error);
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
    <div className="min-h-screen bg-gold-bg">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-6xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="font-playfair text-gold-text">Admin Dashboard</CardTitle>
              <CardDescription>Manage products and metal rates</CardDescription>
            </CardHeader>
          </Card>

          <Tabs defaultValue="products" className="w-full relative">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="products" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Product Management
              </TabsTrigger>
              <TabsTrigger value="rates" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Metal Rates
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="space-y-6">
              {/* Product Form */}
              <Card className={editingProduct ? "border-blue-300 shadow-lg" : ""}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-gold-text">
                      {editingProduct ? (
                        <>
                          ✏️ Edit Product: "{editingProduct.name}"
                        </>
                      ) : (
                        'Add New Product'
                      )}
                    </CardTitle>
                    {editingProduct && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                        Edit Mode
                      </span>
                    )}
                  </div>
                  <CardDescription>
                    {editingProduct 
                      ? `Updating details for "${editingProduct.name}" - Make your changes below and click "Update Product"`
                      : 'Create a new product for your jewelry store'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProductSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="product-name" className="text-gold-text">
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
                        <Label htmlFor="product-category" className="text-gold-text">
                          Category
                        </Label>
                        <select
                          id="product-category"
                          value={productForm.category}
                          onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value as 'rings' | 'necklaces' | 'earrings' }))}
                          className="w-full px-3 py-2 border border-gold/20 rounded-md bg-white text-gold-text focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                          required
                        >
                          <option value="rings">Rings</option>
                          <option value="necklaces">Necklaces</option>
                          <option value="earrings">Earrings</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="product-description" className="text-gold-text">
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
                        <Label htmlFor="metal-type" className="text-gold-text">
                          Metal Type
                        </Label>
                        <select
                          id="metal-type"
                          value={productForm.metal_type}
                          onChange={(e) => setProductForm(prev => ({ ...prev, metal_type: e.target.value as 'gold' | 'silver' }))}
                          className="w-full px-3 py-2 border border-gold/20 rounded-md bg-white text-gold-text focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                          required
                        >
                          <option value="gold">Gold</option>
                          <option value="silver">Silver</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="weight" className="text-gold-text">
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

                    <div className="space-y-2">
                      <Label htmlFor="image-url" className="text-gold-text">
                        Image URL (optional)
                      </Label>
                      <Input
                        id="image-url"
                        placeholder="Enter image URL"
                        value={productForm.image_url}
                        onChange={(e) => setProductForm(prev => ({ ...prev, image_url: e.target.value }))}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is-featured"
                        checked={productForm.is_featured}
                        onChange={(e) => setProductForm(prev => ({ ...prev, is_featured: e.target.checked }))}
                        className="rounded border-gold focus:ring-gold"
                      />
                      <Label htmlFor="is-featured" className="text-gold-text">
                        Featured Product
                      </Label>
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="bg-gold hover:bg-gold/90">
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

              {/* Products List */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-gold-text">Products ({filteredProducts.length})</CardTitle>
                      <CardDescription>
                        Manage all products in your jewelry store
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="category-filter" className="text-gold-text text-sm whitespace-nowrap">
                        Filter by Category:
                      </Label>
                      <select
                        id="category-filter"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value as 'all' | 'rings' | 'necklaces' | 'earrings')}
                        className="min-w-[140px] px-3 py-2 border border-gold/20 rounded-md bg-white text-gold-text focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold text-sm"
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
                    <div className="text-center py-8 text-gold-text/70">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No products found. Add your first product above.</p>
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-8 text-gold-text/70">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No {categoryFilter} products found.</p>
                      <p className="text-sm mt-2">Try selecting a different category or add new products.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Category info */}
                      <div className="flex items-center justify-between p-3 bg-gold-accent/10 rounded-lg">
                        <span className="text-gold-text font-medium">
                          {categoryFilter === 'all' 
                            ? `Showing all ${filteredProducts.length} products`
                            : `Showing ${filteredProducts.length} ${categoryFilter} ${filteredProducts.length === 1 ? 'product' : 'products'}`
                          }
                        </span>
                        <span className="text-gold-text/70 text-sm">
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
              {/* Current Rates Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {metalRates.map((rate) => (
                  <Card key={rate.id} className="border-gold/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gold-text capitalize">
                            {rate.metal_type} Rate
                          </h3>
                          <p className="text-2xl font-bold text-gold-dark">
                            ₹{rate.rate_per_gram.toLocaleString('en-IN')}/gram
                          </p>
                          <p className="text-sm text-gold-text/70">
                            Last updated: {new Date(rate.updated_at).toLocaleString('en-IN')}
                          </p>
                        </div>
                        <div className={`p-3 rounded-full ${
                          rate.metal_type === 'gold' 
                            ? 'bg-yellow-100 text-yellow-600' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {rate.metal_type === 'gold' ? <TrendingUp /> : <TrendingDown />}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Update Rates Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-gold-text">Update Metal Rates</CardTitle>
                  <CardDescription>
                    Update the current gold and silver rates per gram (in Indian Rupees)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gold-rate" className="text-gold-text">
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
                      <Label htmlFor="silver-rate" className="text-gold-text">
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
                    className="w-full bg-gold hover:bg-gold/90"
                    disabled={!newRates.gold && !newRates.silver}
                  >
                    Update Rates
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Admin;