import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from "lucide-react";
import { useTheme } from '@/hooks/useTheme';

const Footer = () => {
  const { theme } = useTheme();
  
  return (
    <footer className="bg-navy text-pearl">
      {/* Newsletter Section */}
      <div className="border-b border-navy-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h3 className="text-3xl font-playfair font-bold mb-4">
              Stay in Touch
            </h3>
            <p className="text-pearl/80 mb-8 max-w-2xl mx-auto">
              Be the first to know about our latest collections, exclusive offers, 
              and jewelry care tips.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className={`flex-1 px-4 py-3 rounded-lg bg-navy-light border border-pearl/20 text-pearl placeholder-pearl/60 focus:outline-none focus:ring-2 ${
                  theme === 'gold' ? 'focus:ring-amber-400' : 'focus:ring-slate-400'
                }`}
              />
              <Button className="luxury-button px-8 py-3">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-playfair font-bold mb-4">Lumière</h3>
            <p className="text-pearl/80 mb-6">
              Creating timeless jewelry pieces that celebrate life's most precious moments 
              for over 25 years.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className={`transition-colors duration-300 ${
                theme === 'gold' 
                  ? 'hover:bg-amber-600 hover:text-white' 
                  : 'hover:bg-slate-600 hover:text-white'
              }`}>
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className={`transition-colors duration-300 ${
                theme === 'gold' 
                  ? 'hover:bg-amber-600 hover:text-white' 
                  : 'hover:bg-slate-600 hover:text-white'
              }`}>
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className={`transition-colors duration-300 ${
                theme === 'gold' 
                  ? 'hover:bg-amber-600 hover:text-white' 
                  : 'hover:bg-slate-600 hover:text-white'
              }`}>
                <Twitter className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-playfair font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="#home" className={`text-pearl/80 transition-colors ${
                theme === 'gold' ? 'hover:text-amber-400' : 'hover:text-slate-400'
              }`}>Home</a></li>
              <li><a href="#collections" className={`text-pearl/80 transition-colors ${
                theme === 'gold' ? 'hover:text-amber-400' : 'hover:text-slate-400'
              }`}>Collections</a></li>
              <li><a href="#rings" className={`text-pearl/80 transition-colors ${
                theme === 'gold' ? 'hover:text-amber-400' : 'hover:text-slate-400'
              }`}>Rings</a></li>
              <li><a href="#necklaces" className={`text-pearl/80 transition-colors ${
                theme === 'gold' ? 'hover:text-amber-400' : 'hover:text-slate-400'
              }`}>Necklaces</a></li>
              <li><a href="#earrings" className={`text-pearl/80 transition-colors ${
                theme === 'gold' ? 'hover:text-amber-400' : 'hover:text-slate-400'
              }`}>Earrings</a></li>
              <li><a href="#about" className={`text-pearl/80 transition-colors ${
                theme === 'gold' ? 'hover:text-amber-400' : 'hover:text-slate-400'
              }`}>About Us</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-playfair font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-3">
              <li><a href="#" className={`text-pearl/80 transition-colors ${
                theme === 'gold' ? 'hover:text-amber-400' : 'hover:text-slate-400'
              }`}>Size Guide</a></li>
              <li><a href="#" className={`text-pearl/80 transition-colors ${
                theme === 'gold' ? 'hover:text-amber-400' : 'hover:text-slate-400'
              }`}>Jewelry Care</a></li>
              <li><a href="#" className={`text-pearl/80 transition-colors ${
                theme === 'gold' ? 'hover:text-amber-400' : 'hover:text-slate-400'
              }`}>Shipping & Returns</a></li>
              <li><a href="#" className={`text-pearl/80 transition-colors ${
                theme === 'gold' ? 'hover:text-amber-400' : 'hover:text-slate-400'
              }`}>Warranty</a></li>
              <li><a href="#" className={`text-pearl/80 transition-colors ${
                theme === 'gold' ? 'hover:text-amber-400' : 'hover:text-slate-400'
              }`}>Custom Orders</a></li>
              <li><a href="#" className={`text-pearl/80 transition-colors ${
                theme === 'gold' ? 'hover:text-amber-400' : 'hover:text-slate-400'
              }`}>Contact Us</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-playfair font-semibold mb-4">Contact Info</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <MapPin className={`h-5 w-5 ${
                  theme === 'gold' ? 'text-amber-400' : 'text-slate-400'
                }`} />
                <span className="text-pearl/80">123 Luxury Ave, New York, NY 10001</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className={`h-5 w-5 ${
                  theme === 'gold' ? 'text-amber-400' : 'text-slate-400'
                }`} />
                <span className="text-pearl/80">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className={`h-5 w-5 ${
                  theme === 'gold' ? 'text-amber-400' : 'text-slate-400'
                }`} />
                <span className="text-pearl/80">hello@lumiere.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-navy-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-pearl/60 text-sm">
              © 2024 Lumière. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className={`text-pearl/60 text-sm transition-colors ${
                theme === 'gold' ? 'hover:text-amber-400' : 'hover:text-slate-400'
              }`}>
                Privacy Policy
              </a>
              <a href="#" className={`text-pearl/60 text-sm transition-colors ${
                theme === 'gold' ? 'hover:text-amber-400' : 'hover:text-slate-400'
              }`}>
                Terms of Service
              </a>
              <a href="#" className={`text-pearl/60 text-sm transition-colors ${
                theme === 'gold' ? 'hover:text-amber-400' : 'hover:text-slate-400'
              }`}>
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;