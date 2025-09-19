import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ShoppingBag, Plus, Minus, Trash2, ShoppingCart, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';

const Cart = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { cartItems, cartCount, updateQuantity, removeFromCart, clearCart, loading } = useCart();
  const { toast } = useToast();

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const itemPrice = item.products.price_per_gram * item.products.weight_grams;
      return total + (itemPrice * item.quantity);
    }, 0);
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    toast({
      title: "Checkout",
      description: "Checkout functionality will be implemented soon!",
    });
  };

  if (!user) {
    return (
      <div className={`min-h-screen ${theme === 'gold' ? 'bg-gold-bg' : 'bg-slate-50'}`}>
        <Navigation />
        <div className="container mx-auto px-4 pt-28 pb-8 flex justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
              <p className="text-muted-foreground mb-4">
                Please sign in to view your cart
              </p>
              <Button 
                onClick={() => window.location.href = '/auth'}
                className="bg-gold hover:bg-gold/90"
              >
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${theme === 'gold' ? 'bg-gold-bg' : 'bg-slate-50'}`}>
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
            <p className={theme === 'gold' ? 'text-gold-text' : 'text-slate-600'}>Loading cart...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'gold' ? 'bg-gold-bg' : 'bg-slate-50'}`}>
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className={`text-4xl font-playfair font-bold ${theme === 'gold' ? 'text-gold-text' : 'text-slate-800'} mb-2`}>
              Shopping Cart
            </h1>
            <p className={`text-lg ${theme === 'gold' ? 'text-gold-text/80' : 'text-slate-600'}`}>
              {cartCount} item{cartCount !== 1 ? 's' : ''} in your cart
            </p>
          </div>

          {cartItems.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
                <p className="text-muted-foreground mb-6">
                  Add some beautiful jewelry to get started
                </p>
                <div className="flex gap-4 justify-center">
                  <Button 
                    onClick={() => window.location.href = '/rings'}
                    className="bg-gold hover:bg-gold/90"
                  >
                    Browse Rings
                  </Button>
                  <Button 
                    onClick={() => window.location.href = '/necklaces'}
                    variant="outline"
                  >
                    Browse Necklaces
                  </Button>
                  <Button 
                    onClick={() => window.location.href = '/earrings'}
                    variant="outline"
                  >
                    Browse Earrings
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.id} className={`${theme === 'gold' ? 'border-gold/20 bg-background/95' : 'border-slate-200 bg-white'}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Product Image */}
                        <div className={`w-20 h-20 ${theme === 'gold' ? 'bg-gold-accent' : 'bg-slate-100'} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <div className={`text-2xl ${theme === 'gold' ? 'text-gold-text' : 'text-slate-600'}`}>
                            {item.products.category === 'rings' ? '💍' : 
                             item.products.category === 'necklaces' ? '📿' : '👂'}
                          </div>
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-semibold ${theme === 'gold' ? 'text-gold-text' : 'text-slate-800'} mb-1`}>
                            {item.products.name}
                          </h3>
                          <p className={`text-sm ${theme === 'gold' ? 'text-gold-text/70' : 'text-slate-600'} mb-2`}>
                            {item.products.description}
                          </p>
                          
                          <div className="flex items-center gap-2 mb-2">
                            <Badge 
                              variant="secondary"
                              className={`${
                                item.products.metal_type === 'gold' 
                                  ? theme === 'gold' 
                                    ? 'bg-gold/20 text-gold-dark' 
                                    : 'bg-yellow-100 text-yellow-800'
                                  : theme === 'gold'
                                    ? 'bg-gold/10 text-gold-text'
                                    : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {item.products.metal_type}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {item.products.category}
                            </Badge>
                          </div>

                          <div className={`text-sm ${theme === 'gold' ? 'text-gold-text/70' : 'text-slate-500'}`}>
                            Weight: {item.products.weight_grams}g
                          </div>
                        </div>

                        {/* Quantity and Price */}
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.product_id, parseInt(e.target.value) || 0)}
                              className="w-16 h-8 text-center"
                              min="1"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className={`text-lg font-bold ${theme === 'gold' ? 'text-gold-text' : 'text-slate-800'}`}>
                            ₹{((item.products.price_per_gram * item.products.weight_grams) * item.quantity).toLocaleString('en-IN')}
                          </div>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromCart(item.product_id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle className={`${theme === 'gold' ? 'text-gold-text' : 'text-slate-800'}`}>
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className={theme === 'gold' ? 'text-gold-text/70' : 'text-slate-600'}>
                        Subtotal ({cartCount} items)
                      </span>
                      <span className={`font-semibold ${theme === 'gold' ? 'text-gold-text' : 'text-slate-800'}`}>
                        ₹{calculateTotal().toLocaleString('en-IN')}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className={theme === 'gold' ? 'text-gold-text/70' : 'text-slate-600'}>
                        Shipping
                      </span>
                      <span className={`font-semibold ${theme === 'gold' ? 'text-gold-text' : 'text-slate-800'}`}>
                        Free
                      </span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between text-lg">
                      <span className={`font-bold ${theme === 'gold' ? 'text-gold-text' : 'text-slate-800'}`}>
                        Total
                      </span>
                      <span className={`font-bold ${theme === 'gold' ? 'text-gold-text' : 'text-slate-800'}`}>
                        ₹{calculateTotal().toLocaleString('en-IN')}
                      </span>
                    </div>
                    
                    <Button 
                      onClick={handleCheckout}
                      className="w-full bg-gold hover:bg-gold/90 text-white py-6 text-lg"
                    >
                      <ShoppingBag className="mr-2 h-5 w-5" />
                      Proceed to Checkout
                    </Button>
                    
                    <Button 
                      onClick={clearCart}
                      variant="outline"
                      className="w-full"
                    >
                      Clear Cart
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
