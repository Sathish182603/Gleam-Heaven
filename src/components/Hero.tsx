import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, TrendingUp, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/integrations/supabase/client';
import heroImage from "@/assets/hero-jewelry.jpg";

interface MetalRate {
  metal_type: string;
  rate_per_gram: number;
}

const Hero = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [metalRates, setMetalRates] = useState<MetalRate[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Array of jewelry images for carousel - Gold and Silver focus
  const carouselImages = [
    {
      url: "https://www.tanishq.co.in/dw/image/v2/BKCK_PRD/on/demandware.static/-/Sites-Tanishq-product-catalog/default/dwb1e62a11/images/Mia/hi-res/3025HAU.jpg?sw=480&sh=480",
      alt: "Gold Dangle Earrings"
    },
    {
      url: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=400",
      alt: "Gold Hoop Earrings"
    },
    {
      url: "https://www.tanishq.co.in/dw/image/v2/BKCK_PRD/on/demandware.static/-/Sites-Tanishq-product-catalog/default/dwf5e206bc/images/hi-res/513319NHCAA00_1.jpg?sw=480&sh=480",
      alt: "Gold Statement Necklace"
    },
    {
      url: "https://www.zalkari.com/cdn/shop/files/ZLP-1043.jpg?v=1752233386",
      alt: "Silver Minimalist Necklace"
    },
    {
      url: "https://karatcart.com/cdn/shop/files/partnerimages_2Fa167c3f3_33027486_1.jpg?v=1726051772",
      alt: "Silver Hoop Earrings"
    }
  ];

  useEffect(() => {
    fetchMetalRates();
    
    // Auto-advance carousel every 4 seconds
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % carouselImages.length
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [carouselImages.length]);

  const fetchMetalRates = async () => {
    const { data } = await supabase
      .from('metal_rates')
      .select('metal_type, rate_per_gram')
      .order('metal_type');
    
    if (data) {
      setMetalRates(data);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      (prevIndex + 1) % carouselImages.length
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? carouselImages.length - 1 : prevIndex - 1
    );
  };

  return (
    <section id="home" className="hero-section relative min-h-screen pt-0 flex items-center justify-center overflow-hidden">
      {/* Animated Background Shapes */}
      <div className="floating-shapes">
        <div className="shape"></div>
        <div className="shape"></div>
        <div className="shape"></div>
        <div className="shape"></div>
      </div>

      {/* Background with Enhanced Overlay */}
      <div className="absolute inset-0 z-0">
        <div className={`absolute inset-0 ${
          theme === 'gold' 
            ? 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50' 
            : 'bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50'
        }`}></div>
        <div className={`absolute inset-0 ${
          theme === 'gold'
            ? 'bg-gradient-to-br from-gold/10 via-transparent to-gold/5'
            : 'bg-gradient-to-br from-slate-400/10 via-transparent to-slate-400/5'
        }`}></div>
      </div>

      {/* Hero Content */}
      <div className="hero-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Carousel */}
          <div className="relative order-2 lg:order-1">
            <div className="relative overflow-hidden">
              {/* Main Carousel Container */}
              <div className="relative w-full h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                {/* Carousel Images */}
                <div 
                  className="flex transition-transform duration-500 ease-in-out h-full"
                  style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
                >
                  {carouselImages.map((image, index) => (
                    <div key={index} className="w-full h-full flex-shrink-0 relative">
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="w-full h-full object-cover"
                        loading={index === 0 ? "eager" : "lazy"}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                      {/* Image Overlay Info */}
                      <div className="absolute bottom-4 left-4 text-white">
                        <p className="text-sm font-elegant opacity-90">{image.alt}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Navigation Arrows */}
                <button
                  onClick={prevImage}
                  className={`absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 ${
                    theme === 'gold' 
                      ? 'bg-amber-900/80 hover:bg-amber-800/90 text-white' 
                      : 'bg-slate-900/80 hover:bg-slate-800/90 text-white'
                  }`}
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextImage}
                  className={`absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 ${
                    theme === 'gold' 
                      ? 'bg-amber-900/80 hover:bg-amber-800/90 text-white' 
                      : 'bg-slate-900/80 hover:bg-slate-800/90 text-white'
                  }`}
                >
                  <ChevronRight className="h-6 w-6" />
                </button>

                {/* Carousel Indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {carouselImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentImageIndex
                          ? theme === 'gold'
                            ? 'bg-amber-400 scale-125'
                            : 'bg-slate-300 scale-125'
                          : 'bg-white/50 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>

                {/* Live Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm animate-pulse ${
                    theme === 'gold'
                      ? 'bg-amber-600/90 text-white'
                      : 'bg-slate-600/90 text-white'
                  }`}>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                      LIVE
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Text Content */}
          <div className="text-center lg:text-left order-1 lg:order-2">
            {/* Trust Badge */}
            <div className="mb-8 flex items-center justify-center lg:justify-start space-x-3">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-5 w-5 animate-pulse ${
                    theme === 'gold' ? 'fill-gold text-gold' : 'fill-slate-400 text-slate-400'
                  }`} style={{animationDelay: `${i * 0.1}s`}} />
                ))}
              </div>
              <span className={`text-lg font-elegant ml-3 ${theme === 'gold' ? 'text-amber-900' : 'text-slate-900'}`}>
                Trusted by 10,000+ Indian families
              </span>
            </div>

            {/* Main Heading with Enhanced Typography */}
            <div className="mb-8">
              <h1 className={`text-4xl md:text-6xl lg:text-7xl font-luxury mb-4 leading-tight ${theme === 'gold' ? 'text-amber-950' : 'text-slate-950'}`}>
                <span className={`block ${theme === 'gold' ? 'text-amber-950' : 'text-slate-950'}`}>Exquisite</span>
                <span className={`block font-great-vibes text-5xl md:text-7xl lg:text-8xl mt-6 ${theme === 'gold' ? 'text-amber-800' : 'text-slate-800'}`}>
                  Indian Jewelry
                </span>
              </h1>
              
              {/* Decorative Line */}
              <div className="flex items-center justify-center lg:justify-start space-x-4 my-6">
                <div className={`w-16 h-0.5 ${
                  theme === 'gold' 
                    ? 'bg-gradient-to-r from-transparent to-gold' 
                    : 'bg-gradient-to-r from-transparent to-slate-400'
                }`}></div>
                <div className={`w-2 h-2 rounded-full ${
                  theme === 'gold' ? 'bg-gold' : 'bg-slate-400'
                }`}></div>
                <div className={`w-16 h-0.5 ${
                  theme === 'gold' 
                    ? 'bg-gradient-to-l from-transparent to-gold' 
                    : 'bg-gradient-to-l from-transparent to-slate-400'
                }`}></div>
              </div>
            </div>

            {/* Enhanced Description */}
            <p className={`text-lg md:text-xl mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-elegant ${theme === 'gold' ? 'text-amber-900' : 'text-slate-900'}`}>
              Discover our handcrafted pieces that celebrate India's rich heritage. 
              Each design tells a story of tradition, elegance, and timeless beauty.
            </p>

            {/* Enhanced Live Rates Display */}
            <div className={`mb-8 creative-card backdrop-blur-md rounded-2xl p-4 max-w-md mx-auto lg:mx-0 ${
              theme === 'gold'
                ? 'bg-amber-50/30 border border-amber-300/20'
                : 'bg-slate-100/30 border border-slate-300/20'
            }`}>
              <div className="flex items-center justify-center lg:justify-start space-x-3 mb-3">
                <TrendingUp className={`h-5 w-5 animate-bounce ${
                  theme === 'gold' ? 'text-amber-600' : 'text-slate-600'
                }`} />
                <span className={`font-luxury text-lg ${theme === 'gold' ? 'text-amber-900' : 'text-slate-900'}`}>Live Metal Rates</span>
                <Sparkles className={`h-4 w-4 animate-pulse ${
                  theme === 'gold' ? 'text-amber-600' : 'text-slate-600'
                }`} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {metalRates.map((rate) => (
                  <div key={rate.metal_type} className="text-center">
                    <div className={`font-elegant text-sm capitalize mb-1 ${theme === 'gold' ? 'text-amber-900' : 'text-slate-900'}`}>{rate.metal_type}</div>
                    <div className={`font-luxury text-lg font-bold ${theme === 'gold' ? 'text-amber-950' : 'text-slate-950'}`}>
                      ₹{rate.rate_per_gram.toLocaleString('en-IN')}/g
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mb-8">
              <Button 
                className={`creative-button text-white px-8 py-4 text-lg font-luxury rounded-full ${theme === 'gold' ? 'bg-amber-800 hover:bg-amber-900' : 'bg-slate-800 hover:bg-slate-900'}`}
                onClick={() => navigate('/rings')}
              >
                Explore Collection
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                className={`border-2 px-8 py-4 text-lg font-luxury rounded-full backdrop-blur-sm ${theme === 'gold' ? 'border-amber-800 text-amber-900 hover:bg-amber-800 hover:text-white' : 'border-slate-800 text-slate-900 hover:bg-slate-800 hover:text-white'}`}
                onClick={() => navigate('/our-story')}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Our Story
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
          <div className={`creative-card text-center p-4 backdrop-blur-sm ${
            theme === 'gold' ? 'bg-amber-50/20' : 'bg-slate-100/20'
          }`}>
            <div className={`text-3xl md:text-4xl font-luxury font-bold mb-2 text-glow ${theme === 'gold' ? 'text-amber-800' : 'text-slate-800'}`}>25+</div>
            <div className={`font-elegant text-sm ${theme === 'gold' ? 'text-amber-900' : 'text-slate-900'}`}>Years of Excellence</div>
          </div>
          <div className={`creative-card text-center p-4 backdrop-blur-sm ${
            theme === 'gold' ? 'bg-amber-50/20' : 'bg-slate-100/20'
          }`}>
            <div className={`text-3xl md:text-4xl font-luxury font-bold mb-2 text-glow ${theme === 'gold' ? 'text-amber-800' : 'text-slate-800'}`}>500+</div>
            <div className={`font-elegant text-sm ${theme === 'gold' ? 'text-amber-900' : 'text-slate-900'}`}>Unique Designs</div>
          </div>
          <div className={`creative-card text-center p-4 backdrop-blur-sm ${
            theme === 'gold' ? 'bg-amber-50/20' : 'bg-slate-100/20'
          }`}>
            <div className={`text-3xl md:text-4xl font-luxury font-bold mb-2 text-glow ${theme === 'gold' ? 'text-amber-800' : 'text-slate-800'}`}>10K+</div>
            <div className={`font-elegant text-sm ${theme === 'gold' ? 'text-amber-900' : 'text-slate-900'}`}>Happy Customers</div>
          </div>
        </div>
      </div>

      {/* Enhanced Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className={`w-8 h-12 border-2 rounded-full flex justify-center items-start pt-2 ${theme === 'gold' ? 'border-amber-800' : 'border-slate-800'}`}>
          <div className={`w-1 h-4 rounded-full animate-pulse ${theme === 'gold' ? 'bg-amber-800' : 'bg-slate-800'}`}></div>
        </div>
        <div className={`text-sm font-elegant mt-2 ${theme === 'gold' ? 'text-amber-900' : 'text-slate-900'}`}>Scroll to explore</div>
      </div>
    </section>
  );
};

export default Hero;