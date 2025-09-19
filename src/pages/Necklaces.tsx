import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Star, ShoppingCart, Plus } from 'lucide-react';
import Navigation from '@/components/Navigation';
import ProductReviews from '@/components/ProductReviews';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  metal_type: string;
  price_per_gram: number;
  weight_grams: number;
  image_url?: string;
  is_featured: boolean;
}

interface Review {
  rating: number;
  comment: string;
  product_id: string;
}

const Necklaces = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<'all' | 'gold' | 'silver'>('all');
  const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set());
  const [reviews, setReviews] = useState<{ [key: string]: Review[] }>({});
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchProducts();
    if (user) {
      fetchLikedProducts();
      checkAdminStatus();
    }
    fetchReviews();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();
      
      setIsAdmin(!!data);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const addNecklaceCollection = async () => {
    if (!user || !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You must be logged in as an admin to add necklace collections",
        variant: "destructive",
      });
      return;
    }
    
    // Sample necklace collection - 5 gold + 5 silver
    const necklaceCollection = [
      // Gold Necklaces
      {
        name: "Classic Gold Chain Necklace",
        description: "Beautiful 22k gold chain necklace with traditional Indian design patterns and smooth finish",
        category: "necklaces" as const,
        metal_type: "gold" as const,
        weight_grams: 15.2,
        image_url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400",
        is_featured: false
      },
      {
        name: "Gold Statement Necklace",
        description: "Bold and beautiful gold statement necklace with geometric patterns and modern appeal",
        category: "necklaces" as const,
        metal_type: "gold" as const,
        weight_grams: 25.6,
        image_url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400",
        is_featured: true
      },
      {
        name: "Gold Choker Necklace",
        description: "Elegant gold choker necklace with intricate craftsmanship and traditional motifs",
        category: "necklaces" as const,
        metal_type: "gold" as const,
        weight_grams: 18.7,
        image_url: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400",
        is_featured: true
      },
      {
        name: "Gold Pendant Necklace",
        description: "Delicate gold pendant necklace with precious stone centerpiece and fine chain",
        category: "necklaces" as const,
        metal_type: "gold" as const,
        weight_grams: 12.3,
        image_url: "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=400",
        is_featured: false
      },
      {
        name: "Gold Layered Necklace Set",
        description: "Trendy layered gold necklace set with multiple chains and contemporary design",
        category: "necklaces" as const,
        metal_type: "gold" as const,
        weight_grams: 22.8,
        image_url: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400",
        is_featured: true
      },
      
      // Silver Necklaces
      {
        name: "Silver Infinity Necklace",
        description: "Elegant silver necklace with infinity symbol pendant, symbolizing eternal love",
        category: "necklaces" as const,
        metal_type: "silver" as const,
        weight_grams: 8.9,
        image_url: "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=400",
        is_featured: true
      },
      {
        name: "Silver Chain Necklace",
        description: "Classic sterling silver chain necklace with polished finish and modern appeal",
        category: "necklaces" as const,
        metal_type: "silver" as const,
        weight_grams: 14.5,
        image_url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400",
        is_featured: false
      },
      {
        name: "Silver Vintage Necklace",
        description: "Antique-inspired silver necklace with intricate filigree work and vintage charm",
        category: "necklaces" as const,
        metal_type: "silver" as const,
        weight_grams: 19.2,
        image_url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400",
        is_featured: false
      },
      {
        name: "Silver Pearl Necklace",
        description: "Sophisticated silver necklace with cultured pearls and elegant clasp design",
        category: "necklaces" as const,
        metal_type: "silver" as const,
        weight_grams: 16.7,
        image_url: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400",
        is_featured: true
      },
      {
        name: "Silver Minimalist Necklace",
        description: "Simple yet elegant minimalist silver necklace perfect for everyday wear",
        category: "necklaces" as const,
        metal_type: "silver" as const,
        weight_grams: 6.4,
        image_url: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=400",
        is_featured: false
      }
    ];

    try {
      // Get current metal rates
      const { data: metalRates } = await supabase
        .from('metal_rates')
        .select('*');
      
      if (!metalRates || metalRates.length === 0) {
        toast({
          title: "Error",
          description: "Please set metal rates first in the Admin panel",
          variant: "destructive",
        });
        return;
      }
      
      const goldRate = metalRates.find(rate => rate.metal_type === 'gold');
      const silverRate = metalRates.find(rate => rate.metal_type === 'silver');
      
      if (!goldRate || !silverRate) {
        toast({
          title: "Error",
          description: "Both gold and silver rates are required",
          variant: "destructive",
        });
        return;
      }

      // Prepare products with current rates
      const productsToInsert = necklaceCollection.map(product => ({
        ...product,
        price_per_gram: product.metal_type === 'gold' ? goldRate.rate_per_gram : silverRate.rate_per_gram
      }));

      const { error } = await supabase
        .from('products')
        .insert(productsToInsert);
      
      if (error) throw error;
      
      toast({
        title: "🎉 Necklace Collection Added!",
        description: `Successfully added ${necklaceCollection.length} necklaces (5 gold + 5 silver) to your collection`,
        duration: 6000,
      });
      
      await fetchProducts();
    } catch (error: any) {
      console.error('Error adding necklace collection:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add necklace collection",
        variant: "destructive",
      });
    }
  };

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('category', 'necklaces')
      .order('is_featured', { ascending: false })
      .order('name');
    
    if (data) {
      setProducts(data);
    }
  };

  const fetchLikedProducts = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('likes')
      .select('product_id')
      .eq('user_id', user.id);
    
    if (data) {
      setLikedProducts(new Set(data.map(like => like.product_id)));
    }
  };

  const fetchReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('rating, comment, product_id')
      .order('created_at', { ascending: false });
    
    if (data) {
      const reviewsByProduct = data.reduce((acc, review) => {
        if (!acc[review.product_id]) {
          acc[review.product_id] = [];
        }
        acc[review.product_id].push(review);
        return acc;
      }, {} as { [key: string]: Review[] });
      
      setReviews(reviewsByProduct);
    }
  };

  const toggleLike = async (productId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add favorites",
        variant: "destructive",
      });
      return;
    }

    const isLiked = likedProducts.has(productId);
    
    if (isLiked) {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
      
      if (!error) {
        setLikedProducts(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
        toast({
          title: "Removed from Favorites",
          description: "Item removed from your favorites",
        });
      }
    } else {
      const { error } = await supabase
        .from('likes')
        .insert({
          user_id: user.id,
          product_id: productId
        });
      
      if (!error) {
        setLikedProducts(prev => new Set([...prev, productId]));
        toast({
          title: "Added to Favorites",
          description: "Item added to your favorites",
        });
      }
    }
  };

  const handleAddToCart = async (productId: string) => {
    await addToCart(productId, 1);
  };

  const filteredProducts = (() => {
    let result = [];
    
    if (filter === 'all') {
      // Show exactly 5 gold and 5 silver products only (total 10)
      const goldProducts = products.filter(p => p.metal_type === 'gold').slice(0, 5);
      const silverProducts = products.filter(p => p.metal_type === 'silver').slice(0, 5);
      result = [...goldProducts, ...silverProducts];
    } else {
      // Show only the selected metal type (limit to 5)
      result = products.filter(p => p.metal_type === filter).slice(0, 5);
    }
    
    return result;
  })();

  const getAverageRating = (productId: string) => {
    const productReviews = reviews[productId] || [];
    if (productReviews.length === 0) return 0;
    const sum = productReviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / productReviews.length;
  };

  return (
    <div className={`min-h-screen ${theme === 'gold' ? 'bg-gold-bg' : 'bg-slate-50'}`}>
      <Navigation />
      <div className="container mx-auto px-166 pt-24 pb-10">
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-playfair font-bold ${theme === 'gold' ? 'text-gold-text' : 'text-slate-800'} mb-4`}>
            Necklaces Collection
          </h1>
          <p className={`text-lg ${theme === 'gold' ? 'text-gold-text/80' : 'text-slate-600'} max-w-2xl mx-auto`}>
            Elegant necklaces crafted with precision in gold and silver
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
          <div className="flex gap-4">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className={theme === 'gold' ? 'bg-gold hover:bg-gold/90' : 'bg-slate-600 hover:bg-slate-700'}
            >
              All Necklaces
            </Button>
            <Button
              variant={filter === 'gold' ? 'default' : 'outline'}
              onClick={() => setFilter('gold')}
              className={theme === 'gold' ? 'bg-gold hover:bg-gold/90' : 'bg-slate-600 hover:bg-slate-700'}
            >
              Gold Necklaces
            </Button>
            <Button
              variant={filter === 'silver' ? 'default' : 'outline'}
              onClick={() => setFilter('silver')}
              className={theme === 'gold' ? 'bg-gold hover:bg-gold/90' : 'bg-slate-600 hover:bg-slate-700'}
            >
              Silver Necklaces
            </Button>
          </div>
          
          {/* Admin Add Collection Button */}
          {isAdmin && products.length === 0 && (
            <Button
              onClick={addNecklaceCollection}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Necklace Collection (5 Gold + 5 Silver)
            </Button>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const averageRating = getAverageRating(product.id);
            const reviewCount = reviews[product.id]?.length || 0;
            
            return (
              <Card 
                key={product.id} 
                className="jewelry-card-enhanced group"
              >
                <CardContent className="p-6">
                  <div className="relative mb-4">
                    <div className="product-image-container aspect-square flex items-center justify-center">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : (
                        <div className={`${theme === 'gold' ? 'text-gold-text' : 'text-slate-600'} text-4xl`}>📿</div>
                      )}
                    </div>
                    
                    {/* Floating Action Buttons */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-100 group-hover:opacity-100 transition-all duration-500 z-20">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleLike(product.id);
                        }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${
                          likedProducts.has(product.id) 
                            ? 'text-red-500 bg-white/90 hover:bg-red-50' 
                            : theme === 'gold' 
                              ? 'text-amber-600 bg-white/90 hover:bg-amber-50' 
                              : 'text-slate-600 bg-white/90 hover:bg-slate-50'
                        } shadow-lg border border-white/20 cursor-pointer`}
                        title="Add to Favorites"
                      >
                        <Heart className={`h-4 w-4 ${likedProducts.has(product.id) ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAddToCart(product.id);
                        }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${
                          theme === 'gold' 
                            ? 'text-amber-600 bg-white/90 hover:bg-amber-50' 
                            : 'text-slate-600 bg-white/90 hover:bg-slate-50'
                        } shadow-lg border border-white/20 cursor-pointer`}
                        title="Add to Cart"
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 product-text-visible">
                    <h3 className={`font-semibold text-visible ${theme === 'gold' ? 'text-gold-text' : 'text-slate-800'}`}>{product.name}</h3>
                    <p className={`text-sm text-visible ${theme === 'gold' ? 'text-gold-text/70' : 'text-slate-600'}`}>{product.description}</p>
                    
                    <div className="flex gap-2">
                      <Badge 
                        variant="secondary" 
                        className={`${
                          product.metal_type === 'gold' 
                            ? theme === 'gold' 
                              ? 'bg-gold/20 text-gold-dark' 
                              : 'bg-yellow-100 text-yellow-800'
                            : theme === 'gold'
                              ? 'bg-gold/10 text-gold-text'
                              : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {product.metal_type}
                      </Badge>
                      {product.is_featured && (
                        <Badge variant="default" className={theme === 'gold' ? 'bg-gold text-white' : 'bg-slate-600 text-white'}>
                          Featured
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {averageRating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className={`text-sm ${theme === 'gold' ? 'text-gold-text' : 'text-slate-600'}`}>
                            {averageRating.toFixed(1)} ({reviewCount})
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className={`pt-4 border-t text-visible ${theme === 'gold' ? 'border-gold/20' : 'border-slate-200'}`}>
                      <div className={`text-sm text-visible ${theme === 'gold' ? 'text-gold-text/70' : 'text-slate-500'} mb-2`}>
                        Weight: {product.weight_grams}g
                      </div>
                      <div className="flex items-center justify-between mb-4 text-visible">
                        <div className="price-tag text-visible">
                          ₹{(product.price_per_gram * product.weight_grams).toLocaleString('en-IN')}
                        </div>
                        <div className={`text-xs text-visible ${theme === 'gold' ? 'text-gold-text/50' : 'text-slate-400'}`}>
                          ₹{product.price_per_gram}/gram
                        </div>
                      </div>
                      
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className={theme === 'gold' ? 'text-gold-text/70' : 'text-slate-500'}>No necklaces found for the selected filter.</p>
            {isAdmin && products.length === 0 && (
              <div className="mt-6">
                <Button
                  onClick={addNecklaceCollection}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 mx-auto"
                >
                  <Plus className="h-4 w-4" />
                  Add Necklace Collection (5 Gold + 5 Silver)
                </Button>
                <p className={`text-sm mt-2 ${theme === 'gold' ? 'text-gold-text/60' : 'text-slate-400'}`}>
                  Add a sample necklace collection to get started
                </p>
              </div>
            )}
          </div>
        )}

        {/* Reviews Section */}
        {filteredProducts.length > 0 && (
          <div className="mt-12">
            <ProductReviews 
              productId={filteredProducts[0].id} 
              productName={filteredProducts[0].name}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Necklaces;