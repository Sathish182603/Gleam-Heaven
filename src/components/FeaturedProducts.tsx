import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Eye, Plus } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

const products = [
  // Gold Collection
  {
    id: "1",
    name: "Classic Gold Ring",
    price: 125000, // ₹1,25,000
    originalPrice: 150000, // ₹1,50,000
    image: "/src/assets/ring-diamond.jpg",
    category: "Rings",
    rating: 5,
    isNew: true,
    metal_type: "gold",
    weight_grams: 8.5,
    price_per_gram: 14700,
  },
  {
    id: "2", 
    name: "Golden Elegance Necklace",
    price: 157500, // ₹1,57,500
    image: "/src/assets/necklace-gold.jpg",
    category: "Necklaces",
    rating: 5,
    isBestseller: true,
    metal_type: "gold",
    weight_grams: 25.0,
    price_per_gram: 6300,
  },
  {
    id: "3",
    name: "Gold Pearl Earrings", 
    price: 74500, // ₹74,500
    image: "/src/assets/earrings-pearl.jpg",
    category: "Earrings",
    rating: 5,
    metal_type: "gold",
    weight_grams: 8.5,
    price_per_gram: 8765,
  },
  {
    id: "4",
    name: "Vintage Gold Band",
    price: 107500, // ₹1,07,500
    image: "/src/assets/ring-diamond.jpg",
    category: "Rings", 
    rating: 5,
    metal_type: "gold",
    weight_grams: 4.8,
    price_per_gram: 22400,
  },
  // Silver Collection
  {
    id: "5",
    name: "Elegant Silver Ring",
    price: 18500, // ₹18,500
    image: "/src/assets/ring-diamond.jpg",
    category: "Rings",
    rating: 5,
    isNew: true,
    metal_type: "silver",
    weight_grams: 6.2,
    price_per_gram: 2980,
  },
  {
    id: "6",
    name: "Silver Chain Necklace",
    price: 22500, // ₹22,500
    image: "/src/assets/necklace-gold.jpg",
    category: "Necklaces",
    rating: 5,
    isBestseller: true,
    metal_type: "silver",
    weight_grams: 18.0,
    price_per_gram: 1250,
  },
  {
    id: "7",
    name: "Silver Pearl Earrings",
    price: 12500, // ₹12,500
    image: "/src/assets/earrings-pearl.jpg",
    category: "Earrings",
    rating: 5,
    metal_type: "silver",
    weight_grams: 4.2,
    price_per_gram: 2980,
  },
  {
    id: "8",
    name: "Classic Silver Band",
    price: 15200, // ₹15,200
    image: "/src/assets/ring-diamond.jpg",
    category: "Rings",
    rating: 5,
    metal_type: "silver",
    weight_grams: 5.1,
    price_per_gram: 2980,
  },
  {
    id: "9",
    name: "Gold Traditional Bracelet",
    price: 89500, // ₹89,500
    image: "/src/assets/necklace-gold.jpg",
    category: "Bracelets",
    rating: 5,
    isLimited: true,
    metal_type: "gold",
    weight_grams: 12.5,
    price_per_gram: 7160,
  },
  {
    id: "10",
    name: "Silver Traditional Bracelet",
    price: 18500, // ₹18,500
    image: "/src/assets/earrings-pearl.jpg",
    category: "Bracelets",
    rating: 5,
    metal_type: "silver",
    weight_grams: 6.2,
    price_per_gram: 2980,
  },
];

const FeaturedProducts = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { theme } = useTheme();
  const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set());

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleLike = async (productId: string) => {
    console.log('Like button clicked for product:', productId);
    
    if (!user) {
      console.log('User not signed in');
      toast({
        title: "Please sign in",
        description: "You need to be signed in to like products.",
        variant: "destructive",
      });
      return;
    }

    try {
      const isLiked = likedProducts.has(productId);
      console.log('Is liked:', isLiked);
      
      if (isLiked) {
        // Remove from likes
        console.log('Removing from likes...');
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
        
        if (error) throw error;
        
        setLikedProducts(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
        
        toast({
          title: "Removed from Favorites",
          description: "Product removed from your favorites.",
        });
      } else {
        // Add to likes
        console.log('Adding to likes...');
        const { error } = await supabase
          .from('likes')
          .insert({
            user_id: user.id,
            product_id: productId,
          });
        
        if (error) throw error;
        
        setLikedProducts(prev => new Set(prev).add(productId));
        
        toast({
          title: "Added to Favorites",
          description: "Product added to your favorites.",
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddToCart = async (product: any) => {
    console.log('Add to cart button clicked for product:', product);
    
    if (!user) {
      console.log('User not signed in for cart');
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to cart.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Adding to cart...');
      await addToCart(product.id, 1);
      console.log('Successfully added to cart');
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <section 
      id="collections" 
      className={`py-20 ${
        theme === 'gold' 
          ? 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50' 
          : 'bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50'
      } relative overflow-hidden`}
    >
      {/* Floating Elements */}
      <div className="floating-elements">
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-amber-200 to-yellow-300 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-r from-slate-300 to-gray-400 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-gradient-to-r from-orange-200 to-amber-300 rounded-full opacity-25 animate-ping"></div>
        <div className="absolute bottom-40 right-1/3 w-14 h-14 bg-gradient-to-r from-gray-200 to-slate-300 rounded-full opacity-20 animate-pulse"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Enhanced Header */}
        <div className="text-center mb-20">
          <div className="inline-block">
            <h2 className={`text-5xl md:text-7xl font-luxury font-bold mb-6 text-glow ${
              theme === 'gold' 
                ? 'text-gold-text' 
                : 'text-slate-800'
            }`}>
              Gold & Silver Collection
            </h2>
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className={`w-20 h-0.5 rounded-full ${
                theme === 'gold' 
                  ? 'bg-gradient-to-r from-transparent to-gold' 
                  : 'bg-gradient-to-r from-transparent to-slate-400'
              }`}></div>
              <div className={`w-3 h-3 rounded-full ${
                theme === 'gold' ? 'bg-gold' : 'bg-slate-400'
              }`}></div>
              <div className={`w-20 h-0.5 rounded-full ${
                theme === 'gold' 
                  ? 'bg-gradient-to-l from-transparent to-gold' 
                  : 'bg-gradient-to-l from-transparent to-slate-400'
              }`}></div>
            </div>
          </div>
          <p className={`text-2xl max-w-3xl mx-auto mt-6 font-elegant ${
            theme === 'gold' ? 'text-amber-700' : 'text-slate-700'
          }`}>
            Discover our exquisite collection of gold and silver jewelry, crafted with 
            traditional Indian techniques and modern elegance. Each piece reflects the 
            timeless beauty of precious metals.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <Card key={product.id} className="creative-card group glass-morphism hover:neon-glow transition-all duration-500">
              <CardContent className="p-0">
                {/* Image Container */}
                <div className="product-image-container relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Shimmer Effect */}
                  <div className="shimmer-effect"></div>
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                    {/* Metal Type Badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      product.metal_type === 'gold' 
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-amber-900' 
                        : 'bg-gradient-to-r from-slate-500 to-gray-500 text-slate-100'
                    } shadow-lg`}>
                      {product.metal_type === 'gold' ? 'Gold' : 'Silver'}
                    </span>
                    {product.isNew && (
                      <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                        New
                      </span>
                    )}
                    {product.isBestseller && (
                      <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                        Bestseller
                      </span>
                    )}
                    {product.isLimited && (
                      <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                        Limited
                      </span>
                    )}
                  </div>

                  {/* Floating Action Buttons */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-100 group-hover:opacity-100 transition-all duration-500 z-20">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleLike(product.id);
                      }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${
                        likedProducts.has(product.id) 
                          ? 'text-red-500 bg-white/90 hover:bg-red-50' 
                          : theme === 'gold' 
                            ? 'text-amber-600 bg-white/90 hover:bg-amber-50' 
                            : 'text-slate-600 bg-white/90 hover:bg-slate-50'
                      } shadow-lg border border-white/20`}
                      title="Add to Favorites"
                    >
                      <Heart className={`h-4 w-4 ${likedProducts.has(product.id) ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Quick view functionality can be added here
                      }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${
                        theme === 'gold' 
                          ? 'text-amber-600 bg-white/90 hover:bg-amber-50' 
                          : 'text-slate-600 bg-white/90 hover:bg-slate-50'
                      } shadow-lg border border-white/20`}
                      title="Quick View"
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${
                        theme === 'gold' 
                          ? 'text-amber-600 bg-white/90 hover:bg-amber-50' 
                          : 'text-slate-600 bg-white/90 hover:bg-slate-50'
                      } shadow-lg border border-white/20`}
                      title="Add to Cart"
                    >
                        <ShoppingCart className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6 product-text-visible">
                  <div className={`text-sm font-medium mb-2 text-visible ${
                    theme === 'gold' ? 'text-amber-600' : 'text-slate-600'
                  }`}>
                    {product.category}
                  </div>
                  <h3 className={`text-xl font-playfair font-semibold mb-3 text-visible ${
                    theme === 'gold' ? 'text-amber-900' : 'text-slate-900'
                  }`}>
                    {product.name}
                  </h3>
                  
                  {/* Price Section */}
                  <div className="flex items-center justify-between mb-4 text-visible">
                    <div className="flex items-center space-x-2 text-visible">
                      <span className={`text-2xl font-bold text-visible ${
                        theme === 'gold' ? 'text-amber-800' : 'text-slate-800'
                      }`}>
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className={`text-lg line-through text-visible ${
                          theme === 'gold' ? 'text-amber-400' : 'text-slate-400'
                        }`}>
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-visible">
                      {[...Array(product.rating)].map((_, i) => (
                        <span key={i} className={`text-sm text-visible ${
                          theme === 'gold' ? 'text-amber-400' : 'text-slate-400'
                        }`}>★</span>
                      ))}
                    </div>
                  </div>

                  {/* Weight and Price per Gram */}
                  <div className={`text-xs mb-4 text-visible ${
                    theme === 'gold' ? 'text-amber-500' : 'text-slate-500'
                  }`}>
                    Weight: {product.weight_grams}g • {formatPrice(product.price_per_gram)}/g
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleAddToCart(product)}
                      className={`flex-1 ${
                        theme === 'gold' 
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-amber-900 font-semibold' 
                          : 'bg-gradient-to-r from-slate-500 to-gray-500 hover:from-slate-600 hover:to-gray-600 text-slate-100 font-semibold'
                      } transition-all duration-300 transform hover:scale-105 shadow-lg`}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                    <Button 
                      onClick={() => handleLike(product.id)}
                      variant="outline"
                      size="icon"
                      className={`${
                        likedProducts.has(product.id) 
                          ? 'text-red-500 border-red-500 hover:bg-red-50' 
                          : theme === 'gold' 
                            ? 'text-amber-600 border-amber-600 hover:bg-amber-50' 
                            : 'text-slate-600 border-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${likedProducts.has(product.id) ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-16">
          <Button 
            variant="outline" 
            className={`px-8 py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
              theme === 'gold' 
                ? 'border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400' 
                : 'border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400'
            }`}
          >
            View All Products
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;