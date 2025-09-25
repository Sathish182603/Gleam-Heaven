import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Star, Trash2, User, Settings, BookOpen, Crown, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

interface LikedProduct {
  id: string;
  name: string;
  category: string;
  metal_type: string;
  price_per_gram: number;
  weight_grams: number;
}

interface UserReview {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  products: {
    name: string;
  };
}

interface UserCustomDesign {
  id: string;
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
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [likedProducts, setLikedProducts] = useState<LikedProduct[]>([]);
  const [userReviews, setUserReviews] = useState<UserReview[]>([]);
  const [userCustomDesigns, setUserCustomDesigns] = useState<UserCustomDesign[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '', productId: '' });
  const [products, setProducts] = useState<any[]>([]);
  const [profile, setProfile] = useState({ display_name: '', email: '' });
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchLikedProducts();
      fetchUserReviews();
      fetchUserCustomDesigns();
      fetchProducts();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        // If profile doesn't exist, create a default one
        if (error.code === 'PGRST116') {
          await supabase
            .from('profiles')
            .insert({
              user_id: user.id,
              email: user.email || '',
              display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User'
            });
        }
        return;
      }
      
      if (data) {
        setProfile({
          display_name: data.display_name || '',
          email: data.email || ''
        });
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
    }
  };

  const fetchLikedProducts = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('likes')
      .select(`
        id,
        products (
          id,
          name,
          category,
          metal_type,
          price_per_gram,
          weight_grams
        )
      `)
      .eq('user_id', user.id);
    
    if (data) {
      setLikedProducts(data.map(like => like.products).filter(Boolean));
    }
  };

  const fetchUserReviews = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        comment,
        created_at,
        products (name)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (data) {
      setUserReviews(data);
    }
  };

  const fetchUserCustomDesigns = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('custom_design_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (data) {
      setUserCustomDesigns(data as UserCustomDesign[]);
    }
  };

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('id, name, category, metal_type')
      .order('name');
    
    if (data) {
      setProducts(data);
    }
  };



  const removeLikedProduct = async (productId: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);
    
    if (!error) {
      setLikedProducts(prev => prev.filter(p => p.id !== productId));
      toast({
        title: "Success",
        description: "Product removed from favorites",
      });
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newReview.productId) return;
    
    const { error } = await supabase
      .from('reviews')
      .insert({
        user_id: user.id,
        product_id: newReview.productId,
        rating: newReview.rating,
        comment: newReview.comment
      });
    
    if (!error) {
      toast({
        title: "Success",
        description: "Review submitted successfully",
      });
      setNewReview({ rating: 5, comment: '', productId: '' });
      fetchUserReviews();
    } else {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)
      .eq('user_id', user.id);
    
    if (!error) {
      setUserReviews(prev => prev.filter(r => r.id !== reviewId));
      toast({
        title: "Success",
        description: "Review deleted successfully",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Success",
      description: "Signed out successfully",
    });
  };

  if (!user) {
    return <div>Please sign in to view your profile.</div>;
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      

      
      <div className="relative container mx-auto px-4 pt-20 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="text-center mb-12">
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${
              theme === 'gold' ? 'bg-yellow-500' : 'bg-gray-500'
            }`}>
              <User className="h-12 w-12 text-white" />
            </div>
            <h1 className={`text-4xl font-bold mb-2 ${
              theme === 'gold' ? 'text-yellow-600' : 'text-gray-600'
            }`}>
              Welcome, {profile.display_name || 'User'}
            </h1>
            <p className="text-gray-600 text-lg">Manage your jewelry collection and preferences</p>
          </div>
          
          {/* Profile Settings Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800">
                <div className={`p-2 rounded-lg ${
                  theme === 'gold' ? 'bg-yellow-500' : 'bg-gray-500'
                }`}>
                  <Settings className="h-6 w-6 text-white" />
                </div>
                Profile Settings
              </CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Manage your account and customize your experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700">Display Name</Label>
                  <Input 
                    value={profile.display_name} 
                    readOnly 
                    className="bg-gray-50 border-gray-200 py-3 cursor-not-allowed" 
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700">Email Address</Label>
                  <Input 
                    value={profile.email} 
                    readOnly 
                    className="bg-gray-50 border-gray-200 py-3 cursor-not-allowed" 
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <Label className="text-sm font-semibold text-gray-700">Theme Preference</Label>
                <div className="flex gap-4">
                  <Button
                    variant={theme === 'gold' ? 'default' : 'outline'}
                    onClick={() => setTheme('gold')}
                    className={`px-6 py-3 rounded-lg font-medium ${
                      theme === 'gold' 
                        ? 'bg-yellow-500 text-white' 
                        : 'border-2 border-yellow-500 text-yellow-600'
                    }`}
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Gold Theme
                  </Button>
                  <Button
                    variant={theme === 'silver' ? 'default' : 'outline'}
                    onClick={() => setTheme('silver')}
                    className={`px-6 py-3 rounded-lg font-medium ${
                      theme === 'silver' 
                        ? 'bg-gray-500 text-white' 
                        : 'border-2 border-gray-500 text-gray-600'
                    }`}
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Silver Theme
                  </Button>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <Button 
                  onClick={handleSignOut} 
                  variant="destructive"
                  className="px-6 py-3 text-white rounded-lg font-medium"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Profile Tabs */}
          <Tabs defaultValue="favorites" className="w-full">
            <TabsList className={`grid w-full grid-cols-4 p-1 rounded-lg ${
              theme === 'gold' ? 'bg-yellow-50' : 'bg-gray-50'
            }`}>
              <TabsTrigger 
                value="favorites" 
                className={`font-medium ${
                  theme === 'gold' 
                    ? 'data-[state=active]:bg-yellow-500 data-[state=active]:text-white hover:bg-yellow-100' 
                    : 'data-[state=active]:bg-gray-500 data-[state=active]:text-white hover:bg-gray-100'
                }`}
              >
                <Heart className="h-4 w-4 mr-2" />
                Favorites
              </TabsTrigger>
              <TabsTrigger 
                value="reviews" 
                className={`font-medium ${
                  theme === 'gold' 
                    ? 'data-[state=active]:bg-yellow-500 data-[state=active]:text-white hover:bg-yellow-100' 
                    : 'data-[state=active]:bg-gray-500 data-[state=active]:text-white hover:bg-gray-100'
                }`}
              >
                <Star className="h-4 w-4 mr-2" />
                My Reviews
              </TabsTrigger>
              <TabsTrigger 
                value="custom-designs" 
                className={`font-medium ${
                  theme === 'gold' 
                    ? 'data-[state=active]:bg-yellow-500 data-[state=active]:text-white hover:bg-yellow-100' 
                    : 'data-[state=active]:bg-gray-500 data-[state=active]:text-white hover:bg-gray-100'
                }`}
              >
                <span className="text-sm mr-2">🎨</span>
                My Designs
              </TabsTrigger>
              <TabsTrigger 
                value="add-review" 
                className={`font-medium ${
                  theme === 'gold' 
                    ? 'data-[state=active]:bg-yellow-500 data-[state=active]:text-white hover:bg-yellow-100' 
                    : 'data-[state=active]:bg-gray-500 data-[state=active]:text-white hover:bg-gray-100'
                }`}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Add Review
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="favorites" className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800">
                    <div className={`p-2 rounded-lg ${
                      theme === 'gold' ? 'bg-yellow-500' : 'bg-gray-500'
                    }`}>
                      <Heart className="h-5 w-5 text-white" />
                    </div>
                    Favorite Products
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {likedProducts.length === 0 ? (
                    <div className="text-center py-12">
                      <Heart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500 text-lg">No favorite products yet.</p>
                      <p className="text-gray-400 text-sm mt-2">Start browsing our collection to add favorites!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {likedProducts.map((product) => (
                        <Card key={product.id}>
                          <CardContent className="p-6">
                            <h3 className="font-bold text-lg text-gray-800 mb-3">{product.name}</h3>
                            <div className="flex items-center gap-2 mb-4">
                              <Badge variant="secondary" className={`font-medium ${
                                theme === 'gold' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {product.category}
                              </Badge>
                              <Badge variant="outline" className={`font-medium ${
                                theme === 'gold' ? 'border-yellow-300 text-yellow-700' : 'border-gray-300 text-gray-700'
                              }`}>
                                {product.metal_type}
                              </Badge>
                            </div>
                            <p className="text-xl font-bold text-gray-900 mb-4">
                              ₹{(product.price_per_gram * product.weight_grams).toLocaleString('en-IN')}
                            </p>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeLikedProduct(product.id)}
                              className="w-full"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove from Favorites
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className={`h-5 w-5 ${
                      theme === 'gold' ? 'text-yellow-500' : 'text-gray-500'
                    }`} />
                    My Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userReviews.length === 0 ? (
                    <p className="text-muted-foreground">No reviews yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {userReviews.map((review) => (
                        <Card key={review.id} className={`${
                          theme === 'gold' ? 'border-yellow-200' : 'border-gray-200'
                        }`}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold">{review.products.name}</h4>
                                <div className="flex items-center gap-1 mt-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < review.rating 
                                          ? (theme === 'gold' ? 'text-yellow-500 fill-current' : 'text-gray-500 fill-current')
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
                                <p className="text-xs text-muted-foreground mt-2">
                                  {new Date(review.created_at).toLocaleDateString('en-IN')}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteReview(review.id)}
                              >
                                <Trash2 className="h-4 w-4" />
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
            
            <TabsContent value="add-review">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Review</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={submitReview} className="space-y-4">
                    <div>
                      <Label>Product</Label>
                      <select
                        className="w-full border rounded-md p-2"
                        value={newReview.productId}
                        onChange={(e) => setNewReview(prev => ({ ...prev, productId: e.target.value }))}
                        required
                      >
                        <option value="">Select a product</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} ({product.category} - {product.metal_type})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <Label>Rating</Label>
                      <div className="flex gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => setNewReview(prev => ({ ...prev, rating }))}
                            className="p-1"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                rating <= newReview.rating 
                                  ? (theme === 'gold' ? 'text-yellow-500 fill-current' : 'text-gray-500 fill-current')
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label>Comment</Label>
                      <Textarea
                        placeholder="Write your review..."
                        value={newReview.comment}
                        onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <Button type="submit" className={`w-full ${
                      theme === 'gold' 
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                        : 'bg-gray-500 hover:bg-gray-600 text-white'
                    }`}>
                      Submit Review
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Custom Designs Tab */}
            <TabsContent value="custom-designs" className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800">
                    <span className="text-2xl">🎨</span>
                    My Custom Design Requests
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Track the status of your custom jewelry design requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userCustomDesigns.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">💎</div>
                      <p className="text-gray-600 mb-4">No custom design requests yet</p>
                      <p className="text-sm text-gray-500 mb-6">Create your own unique jewelry design and let our craftsmen bring it to life!</p>
                      <Button 
                        onClick={() => window.location.href = '/custom-design'}
                        className={`${
                          theme === 'gold' 
                            ? 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white' 
                            : 'bg-gradient-to-r from-gray-500 to-slate-500 hover:from-gray-600 hover:to-slate-600 text-white'
                        } px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300`}
                      >
                        <span className="mr-2">🎨</span>
                        Create Your Design
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userCustomDesigns.map((design) => (
                        <Card key={design.id} className={`transition-all duration-300 hover:shadow-lg ${
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
                                    {design.design_type === 'ring' ? '💍' :
                                     design.design_type === 'necklace' ? '📿' :
                                     design.design_type === 'earrings' ? '👂' :
                                     design.design_type === 'bracelet' ? '💫' :
                                     design.design_type === 'pendant' ? '✨' : '🎨'}
                                  </span>
                                  {design.design_type.charAt(0).toUpperCase() + design.design_type.slice(1)} Design
                                </CardTitle>
                                <div className="flex items-center gap-4 mt-2 text-sm">
                                  <span className={`${
                                    theme === 'gold' ? 'text-amber-600' : 'text-slate-600'
                                  }`}>
                                    📅 Submitted: {new Date(design.created_at).toLocaleDateString()}
                                  </span>
                                  {design.estimated_completion_date && (
                                    <span className={`${
                                      theme === 'gold' ? 'text-amber-600' : 'text-slate-600'
                                    }`}>
                                      🎯 Expected: {new Date(design.estimated_completion_date).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <Badge className={`${
                                  design.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                                  design.status === 'in_review' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                                  design.status === 'approved' ? 'bg-green-100 text-green-800 border-green-300' :
                                  design.status === 'in_progress' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                                  design.status === 'completed' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                                  'bg-red-100 text-red-800 border-red-300'
                                } px-3 py-1 font-semibold`}>
                                  {design.status === 'pending' ? '⏰ Pending Review' :
                                   design.status === 'in_review' ? '👀 Under Review' :
                                   design.status === 'approved' ? '✅ Approved' :
                                   design.status === 'in_progress' ? '🔨 In Progress' :
                                   design.status === 'completed' ? '🎉 Completed' :
                                   '❌ Cancelled'}
                                </Badge>
                                {design.estimated_price && (
                                  <span className={`text-sm font-semibold ${
                                    theme === 'gold' ? 'text-amber-700' : 'text-slate-700'
                                  }`}>
                                    💰 Est: ₹{design.estimated_price.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <Label className={`text-sm font-semibold ${
                                theme === 'gold' ? 'text-amber-700' : 'text-slate-700'
                              }`}>Your Design Description:</Label>
                              <p className={`text-sm mt-1 p-3 rounded-lg ${
                                theme === 'gold' ? 'bg-amber-50 text-amber-800' : 'bg-slate-50 text-slate-800'
                              }`}>{design.description}</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              {design.material_preference && (
                                <div>
                                  <span className={`font-semibold ${
                                    theme === 'gold' ? 'text-amber-700' : 'text-slate-700'
                                  }`}>Material: </span>
                                  <span className={`${
                                    theme === 'gold' ? 'text-amber-800' : 'text-slate-800'
                                  }`}>{design.material_preference}</span>
                                </div>
                              )}
                              {design.budget_range && (
                                <div>
                                  <span className={`font-semibold ${
                                    theme === 'gold' ? 'text-amber-700' : 'text-slate-700'
                                  }`}>Budget: </span>
                                  <span className={`${
                                    theme === 'gold' ? 'text-amber-800' : 'text-slate-800'
                                  }`}>{design.budget_range}</span>
                                </div>
                              )}
                              {design.contact_phone && (
                                <div>
                                  <span className={`font-semibold ${
                                    theme === 'gold' ? 'text-amber-700' : 'text-slate-700'
                                  }`}>Phone: </span>
                                  <span className={`${
                                    theme === 'gold' ? 'text-amber-800' : 'text-slate-800'
                                  }`}>{design.contact_phone}</span>
                                </div>
                              )}
                              {design.preferred_contact_time && (
                                <div>
                                  <span className={`font-semibold ${
                                    theme === 'gold' ? 'text-amber-700' : 'text-slate-700'
                                  }`}>Contact Time: </span>
                                  <span className={`${
                                    theme === 'gold' ? 'text-amber-800' : 'text-slate-800'
                                  }`}>{design.preferred_contact_time}</span>
                                </div>
                              )}
                            </div>

                            {design.special_requirements && (
                              <div>
                                <Label className={`text-sm font-semibold ${
                                  theme === 'gold' ? 'text-amber-700' : 'text-slate-700'
                                }`}>Special Requirements:</Label>
                                <p className={`text-sm mt-1 p-2 rounded ${
                                  theme === 'gold' ? 'bg-amber-50/50 text-amber-800' : 'bg-slate-50/50 text-slate-800'
                                }`}>{design.special_requirements}</p>
                              </div>
                            )}

                            {design.admin_notes && (
                              <div className={`p-3 rounded-lg ${
                                theme === 'gold' ? 'bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-200' : 'bg-gradient-to-r from-slate-100 to-gray-100 border border-slate-200'
                              }`}>
                                <Label className={`text-sm font-semibold flex items-center gap-2 ${
                                  theme === 'gold' ? 'text-amber-700' : 'text-slate-700'
                                }`}>
                                  💬 Message from our team:
                                </Label>
                                <p className={`text-sm mt-2 ${
                                  theme === 'gold' ? 'text-amber-800' : 'text-slate-800'
                                }`}>{design.admin_notes}</p>
                              </div>
                            )}

                            {design.status === 'pending' && (
                              <div className={`text-center p-4 rounded-lg ${
                                theme === 'gold' ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50 border border-gray-200'
                              }`}>
                                <p className={`text-sm ${
                                  theme === 'gold' ? 'text-yellow-800' : 'text-gray-800'
                                }`}>
                                  ⏳ Your design request is being reviewed. We'll contact you within 24 hours!
                                </p>
                              </div>
                            )}

                            {design.status === 'completed' && (
                              <div className="text-center p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200">
                                <p className="text-sm text-emerald-800">
                                  🎉 Congratulations! Your custom design has been completed. Please contact us to arrange pickup or delivery.
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                      
                      <div className="text-center pt-4">
                        <Button 
                          onClick={() => window.location.href = '/custom-design'}
                          variant="outline"
                          className={`${
                            theme === 'gold' 
                              ? 'border-amber-400 text-amber-700 hover:bg-amber-50' 
                              : 'border-slate-400 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="mr-2">➕</span>
                          Create Another Design
                        </Button>
                      </div>
                    </div>
                  )}
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

export default Profile;