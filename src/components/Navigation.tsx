import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Menu, User, LogOut, Settings, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useCart } from '@/hooks/useCart';
import { supabase } from '@/integrations/supabase/client';

interface MetalRate {
  metal_type: string;
  rate_per_gram: number;
}

const Navigation = () => {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [metalRates, setMetalRates] = useState<MetalRate[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchMetalRates();
    if (user) {
      checkAdminStatus();
    }
  }, [user]);

  const fetchMetalRates = async () => {
    const { data } = await supabase
      .from('metal_rates')
      .select('metal_type, rate_per_gram')
      .order('metal_type');
    
    if (data) {
      setMetalRates(data);
    }
  };

  const checkAdminStatus = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();
    
    setIsAdmin(!!data);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const toggleTheme = () => {
    setTheme(theme === 'gold' ? 'silver' : 'gold');
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md transition-all duration-500 ${
      theme === 'gold' 
        ? 'bg-gradient-to-r from-amber-50/95 via-white/95 to-amber-50/95 border-amber-200/60' 
        : 'bg-gradient-to-r from-slate-50/95 via-white/95 to-slate-50/95 border-slate-200/60'
    } border-b shadow-lg`}>
      {/* Decorative top border */}
      <div className={`h-1 w-full ${
        theme === 'gold'
          ? 'bg-gradient-to-r from-transparent via-amber-400 to-transparent'
          : 'bg-gradient-to-r from-transparent via-slate-400 to-transparent'
      } opacity-60`}></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left Side: Logo and Full-Width Navigation */}
          <div className="flex items-center flex-1">
            {/* Enhanced Logo */}
            <Link to="/" className={`group text-2xl font-playfair font-bold transition-all duration-500 hover:scale-105 mr-8 ${
              theme === 'gold' 
                ? 'text-transparent bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 bg-clip-text' 
                : 'text-transparent bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text'
            }`}>
              <span className="relative">
                Gleam Haven
                {/* Sparkle effect */}
                <span className={`absolute -top-1 -right-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  theme === 'gold' ? 'text-amber-400' : 'text-slate-400'
                }`}>✨</span>
              </span>
            </Link>

            {/* Full-Width Navigation - spans across left side */}
            <div className="hidden lg:flex items-center flex-1">
              <div className={`flex items-center justify-between w-full max-w-2xl px-18 py-30 rounded-full backdrop-blur-sm ${
                theme === 'gold'
                  ? 'bg-gradient-to-r from-amber-100/50 to-yellow-100/50 border border-amber-200/40'
                  : 'bg-gradient-to-r from-slate-100/50 to-gray-100/50 border border-slate-200/40'
              } shadow-md`}>
                {[
                  { to: '/', label: 'Home', icon: '' },
                  { to: '/rings', label: 'Rings', icon: '💍' },
                  { to: '/necklaces', label: 'Necklaces', icon: '📿' },
                  { to: '/earrings', label: 'Earrings', icon: '👂' },
                  { to: '/our-story', label: 'Our_Story', icon: '' }
                ].map((item, index) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`group relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 hover:scale-105 ${
                      theme === 'gold'
                        ? 'text-amber-800 hover:text-amber-900 hover:bg-amber-200/60'
                        : 'text-slate-800 hover:text-slate-900 hover:bg-slate-200/60'
                    } hover:shadow-sm`}
                  >
                    <span className="flex items-center space-x-2">
                      <span className="text-base group-hover:animate-bounce" style={{ animationDuration: '0.6s' }}>
                        {item.icon}
                      </span>
                      <span className="relative">
                        {item.label}
                        {/* Underline effect */}
                        <span className={`absolute bottom-0 left-0 w-0 h-0.5 ${
                          theme === 'gold' ? 'bg-amber-500' : 'bg-slate-500'
                        } group-hover:w-full transition-all duration-300`}></span>
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Actions */}
          <div className="flex items-center space-x-3">
            {/* Creative Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className={`group relative overflow-hidden px-3 py-2 rounded-full transition-all duration-500 hover:scale-110 ${
                theme === 'gold'
                  ? 'text-amber-700 hover:bg-gradient-to-r hover:from-amber-100 hover:to-yellow-100 hover:shadow-md'
                  : 'text-slate-700 hover:bg-gradient-to-r hover:from-slate-100 hover:to-gray-100 hover:shadow-md'
              }`}
            >
              <span className="flex items-center space-x-1">
                <span className="text-lg group-hover:rotate-180 transition-transform duration-500">
                  {theme === 'gold' ? '🌟' : '💎'}
                </span>
                <span className="text-xs font-medium hidden sm:inline">
                  {theme === 'gold' ? 'Gold' : 'Silver'}
                </span>
              </span>
              
              {/* Magical particles */}
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {[...Array(3)].map((_, i) => (
                  <span
                    key={i}
                    className={`absolute w-1 h-1 rounded-full ${
                      theme === 'gold' ? 'bg-amber-400' : 'bg-slate-400'
                    } animate-ping`}
                    style={{
                      top: `${20 + i * 25}%`,
                      left: `${15 + i * 30}%`,
                      animationDelay: `${i * 200}ms`,
                      animationDuration: '1s'
                    }}
                  ></span>
                ))}
              </div>
            </Button>

            {/* Enhanced Cart */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/cart')}
              className={`group relative overflow-hidden p-3 rounded-full transition-all duration-300 hover:scale-110 ${
                theme === 'gold'
                  ? 'text-amber-700 hover:bg-gradient-to-r hover:from-emerald-100 hover:to-green-100 hover:shadow-md'
                  : 'text-slate-700 hover:bg-gradient-to-r hover:from-slate-100 hover:to-gray-100 hover:shadow-md'
              }`}
            >
              <ShoppingBag className="h-5 w-5 group-hover:animate-bounce" style={{ animationDuration: '0.6s' }} />
              {cartCount > 0 && (
                <Badge className={`absolute -top-1 -right-1 h-5 w-5 text-xs animate-pulse ${
                  theme === 'gold'
                    ? 'bg-gradient-to-r from-red-500 to-pink-500'
                    : 'bg-gradient-to-r from-slate-600 to-gray-600'
                } text-white shadow-lg`}>
                  {cartCount}
                </Badge>
              )}
              
              {/* Shopping sparkle */}
              <span className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className={`text-xs ${
                  theme === 'gold' ? 'text-emerald-500' : 'text-slate-500'
                }`}></span>
              </span>
            </Button>

            {/* Enhanced User Menu */}
            {user ? (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/profile')}
                  className={`group relative overflow-hidden px-3 py-2 rounded-full transition-all duration-300 hover:scale-105 ${
                    theme === 'gold'
                      ? 'text-amber-700 hover:bg-gradient-to-r hover:from-amber-100 hover:to-yellow-100 hover:shadow-md'
                      : 'text-slate-700 hover:bg-gradient-to-r hover:from-slate-100 hover:to-gray-100 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 group-hover:animate-pulse" />
                    <span className="font-medium">Profile</span>
                  </div>
                </Button>
                
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/admin')}
                    className={`group relative overflow-hidden px-3 py-2 rounded-full transition-all duration-300 hover:scale-105 ${
                      theme === 'gold'
                        ? 'text-amber-700 hover:bg-gradient-to-r hover:from-purple-100 hover:to-indigo-100 hover:shadow-md'
                        : 'text-slate-700 hover:bg-gradient-to-r hover:from-slate-100 hover:to-gray-100 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Settings className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                      <span className="font-medium">Admin</span>
                    </div>
                    {/* Admin crown */}
                    <span className="absolute -top-1 -right-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      👑
                    </span>
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className={`group relative overflow-hidden px-3 py-2 rounded-full transition-all duration-300 hover:scale-105 ${
                    theme === 'gold'
                      ? 'text-amber-700 hover:bg-gradient-to-r hover:from-red-100 hover:to-pink-100 hover:shadow-md'
                      : 'text-slate-700 hover:bg-gradient-to-r hover:from-slate-100 hover:to-gray-100 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <LogOut className="h-4 w-4 group-hover:animate-pulse" />
                    <span className="font-medium">Sign Out</span>
                  </div>
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => navigate('/auth')}
                className={`group relative overflow-hidden px-4 py-2 rounded-full font-medium transition-all duration-300 hover:scale-105 shadow-md ${
                  theme === 'gold'
                    ? 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700'
                    : 'bg-gradient-to-r from-slate-600 to-gray-600 hover:from-slate-700 hover:to-gray-700'
                } text-white hover:shadow-lg`}
              >
                <span className="relative z-10 flex items-center space-x-1">
                  <span>Sign In</span>
                  <span>Sign In</span>
                  <span className="group-hover:scale-110 transition-transform duration-300">→</span>
                </span>
              </Button>
            )}

            {/* Mobile Menu */}
            <Button 
              variant="ghost" 
              size="icon" 
              className={`lg:hidden group relative overflow-hidden p-3 rounded-full transition-all duration-300 hover:scale-110 ${
                theme === 'gold'
                  ? 'text-amber-700 hover:bg-gradient-to-r hover:from-amber-100 hover:to-yellow-100 hover:shadow-md'
                  : 'text-slate-700 hover:bg-gradient-to-r hover:from-slate-100 hover:to-gray-100 hover:shadow-md'
              }`}
            >
              <Menu className="h-5 w-5 group-hover:animate-pulse" />
            </Button>

            {/* Mobile Menu */}
            <Button 
              variant="ghost" 
              size="icon" 
              className={`lg:hidden group relative overflow-hidden p-3 rounded-full transition-all duration-300 hover:scale-110 ${
                theme === 'gold'
                  ? 'text-amber-700 hover:bg-gradient-to-r hover:from-amber-100 hover:to-yellow-100 hover:shadow-md'
                  : 'text-slate-700 hover:bg-gradient-to-r hover:from-slate-100 hover:to-gray-100 hover:shadow-md'
              }`}
            >
              <Menu className="h-5 w-5 group-hover:animate-pulse" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;