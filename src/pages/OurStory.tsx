import React, { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Crown, Gem, Sparkles, Star, Heart, Shield, Award, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import Navigation from '../components/Navigation';

const OurStory: React.FC = () => {
  const { theme } = useTheme();
  const [currentImageIndexes, setCurrentImageIndexes] = useState<{[key: number]: number}>({});

  // Initialize carousel indexes
  useEffect(() => {
    const initialIndexes: {[key: number]: number} = {};
    for (let i = 1; i <= 4; i++) {
      initialIndexes[i] = 0;
    }
    setCurrentImageIndexes(initialIndexes);
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndexes(prev => {
        const newIndexes = { ...prev };
        for (let i = 1; i <= 4; i++) {
          newIndexes[i] = (prev[i] + 1) % 3; // 3 images per section
        }
        return newIndexes;
      });
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, []);

  const storySections = [
    {
      id: 1,
      title: "The Golden Beginning",
      subtitle: "Where Dreams Meet Craftsmanship",
      icon: <Crown className="h-8 w-8" />,
      content: "In the heart of India's jewelry capital, our journey began with a simple yet profound vision: to create jewelry that tells stories. Our master craftsmen, with generations of expertise, started with pure 24-karat gold, handcrafting each piece with the precision of a surgeon and the passion of an artist.",
      images: [
        "https://www.tanishq.co.in/dw/image/v2/BKCK_PRD/on/demandware.static/-/Sites-Tanishq-product-catalog/default/dw275bf2db/images/hi-res/511098FLCAA00_1.jpg?sw=640&sh=640",
        "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&h=400&fit=crop",
        "https://rubans.in/cdn/shop/files/rubans-18k-gold-plated-light-gold-crystal-beaded-cubic-zirconia-statement-necklace-set-necklace-set-1143859916.jpg?v=1755714486"
      ],
      highlights: ["24-Karat Gold", "Handcrafted", "Generational Expertise", "Pure Artistry"]
    },
    {
      id: 2,
      title: "The Silver Renaissance",
      subtitle: "Modern Elegance Meets Timeless Beauty",
      icon: <Gem className="h-8 w-8" />,
      content: "As the world evolved, so did our craft. We embraced the ethereal beauty of sterling silver, creating contemporary designs that speak to the modern soul while maintaining the traditional essence that makes Indian jewelry legendary.",
      images: [
        "https://southpawonline.com/cdn/shop/files/Silver-stacking-ring-set-thin-stackable-925-sterling-silver-dainty-pinky-thumb-knuckle-rings-minimalist-Ring-Pick-1_1598x1598.jpg",
        "https://aadyaa.com/cdn/shop/products/silver_necklace_chain_pendant_infinity_3.jpg?v=1747052997&width=3380",
        "https://neshe.in/cdn/shop/products/ER-1056-antique_silver_metal_drop_leaves_tassel_earring2_1024x.jpg?v=1567834147"
      ],
      highlights: ["Sterling Silver", "Contemporary Design", "Modern Soul", "Traditional Essence"]
    },
    {
      id: 3,
      title: "The Art of Creation",
      subtitle: "Where Every Piece Tells a Story",
      icon: <Sparkles className="h-8 w-8" />,
      content: "Each piece in our collection is born from inspiration - the delicate curve of a lotus petal, the intricate patterns of traditional Indian architecture, or the gentle flow of the Ganges. Our artisans spend weeks perfecting every detail, ensuring that every creation is a masterpiece.",
      images: [
        "https://www.tanishq.co.in/dw/image/v2/BKCK_PRD/on/demandware.static/-/Sites-Tanishq-product-catalog/default/dwf5e206bc/images/hi-res/513319NHCAA00_1.jpg?sw=480&sh=480",
        "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=400&fit=crop"
      ],
      highlights: ["Inspired Design", "Masterpiece Quality", "Weeks of Crafting", "Perfect Details"]
    },
    {
      id: 4,
      title: "The Legacy Continues",
      subtitle: "Passing Down the Art Through Generations",
      icon: <Star className="h-8 w-8" />,
      content: "Today, we continue the legacy of our forefathers while embracing innovation. Our workshops blend traditional techniques with modern technology, creating jewelry that honors the past while celebrating the future. Every piece carries the soul of India and the dreams of tomorrow.",
      images: [
        "https://www.zalkari.com/cdn/shop/files/ZLP-1043.jpg?v=1752233386",
        "https://karatcart.com/cdn/shop/files/partnerimages_2Fa167c3f3_33027486_1.jpg?v=1726051772",
        "https://5.imimg.com/data5/RS/SB/MY-1107937/silver-promise-rings-500x500.jpg"
      ],
      highlights: ["Generational Legacy", "Innovation", "Traditional Techniques", "Modern Technology"]
    }
  ];

  const achievements = [
    { icon: <Award className="h-6 w-6" />, title: "50+ Years", subtitle: "of Excellence" },
    { icon: <Heart className="h-6 w-6" />, title: "1M+", subtitle: "Happy Customers" },
    { icon: <Shield className="h-6 w-6" />, title: "100%", subtitle: "Authentic Gold" },
    { icon: <Zap className="h-6 w-6" />, title: "24/7", subtitle: "Customer Support" }
  ];

  const values = [
    {
      title: "Authenticity",
      description: "Every piece is certified pure gold and silver, with detailed certificates of authenticity.",
      color: "gold"
    },
    {
      title: "Craftsmanship",
      description: "Handcrafted by master artisans with decades of experience in traditional techniques.",
      color: "silver"
    },
    {
      title: "Innovation",
      description: "Blending traditional designs with contemporary aesthetics for modern jewelry lovers.",
      color: "gold"
    },
    {
      title: "Heritage",
      description: "Preserving and celebrating the rich cultural heritage of Indian jewelry making.",
      color: "silver"
    }
  ];

  return (
    <div className={`min-h-screen story-section ${theme === 'gold' ? 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 pattern-waves' : 'bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 pattern-waves'}`}>
      <Navigation />
      {/* Floating Particles */}
      <div className="floating-particles">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="particle"></div>
        ))}
      </div>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className={`absolute inset-0 ${theme === 'gold' ? 'bg-gradient-to-r from-amber-400/20 to-yellow-400/20' : 'bg-gradient-to-r from-slate-400/20 to-gray-400/20'}`}></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          <div className="text-center">
            <h1 className={`text-5xl md:text-7xl font-playfair font-bold mb-6 ${theme === 'gold' ? 'text-amber-950' : 'text-slate-950'}`}>
              Our <span className={`gradient-text-story ${theme === 'gold' ? 'text-amber-800' : 'text-slate-800'}`}>Story</span>
            </h1>
            <p className={`text-xl md:text-2xl max-w-3xl mx-auto ${theme === 'gold' ? 'text-amber-900' : 'text-slate-900'}`}>
              A journey of passion, craftsmanship, and timeless beauty that spans generations
            </p>
          </div>
        </div>
      </div>

      {/* Story Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {storySections.map((section, index) => (
          <div key={section.id} className={`mb-20 ${index % 2 === 0 ? '' : 'lg:flex-row-reverse'} lg:flex items-center gap-12`}>
            <div className="lg:w-1/2">
              <Card className={`jewelry-card-enhanced story-card ${theme === 'gold' ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200' : 'bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200'}`}>
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`p-3 rounded-full icon-bounce ${theme === 'gold' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                      {section.icon}
                    </div>
                    <div>
                      <h3 className={`text-3xl font-playfair font-bold ${theme === 'gold' ? 'text-amber-950' : 'text-slate-950'}`}>
                        {section.title}
                      </h3>
                      <p className={`text-lg ${theme === 'gold' ? 'text-amber-800' : 'text-slate-800'}`}>
                        {section.subtitle}
                      </p>
                    </div>
                  </div>
                  
                  <p className={`text-lg leading-relaxed mb-6 ${theme === 'gold' ? 'text-amber-950' : 'text-slate-900'}`}>
                    {section.content}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {section.highlights.map((highlight, idx) => (
                      <Badge 
                        key={idx}
                        variant="secondary" 
                        className={`${theme === 'gold' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-slate-100 text-slate-800 border-slate-200'}`}
                      >
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:w-1/2 mt-8 lg:mt-0">
              <div className="relative rounded-2xl overflow-hidden">
                {/* Simple Carousel Container */}
                <div className="relative h-80">
                  <div 
                    className="flex transition-transform duration-500 ease-in-out h-full"
                    style={{ transform: `translateX(-${currentImageIndexes[section.id] * 100}%)` }}
                  >
                    {section.images.map((image, imgIndex) => (
                      <div key={imgIndex} className="w-full h-full flex-shrink-0">
                        <img 
                          src={image} 
                          alt={`${section.title} - Image ${imgIndex + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 pointer-events-none ${
                    theme === 'gold' 
                      ? 'bg-gradient-to-t from-amber-900/20 to-transparent' 
                      : 'bg-gradient-to-t from-slate-900/20 to-transparent'
                  }`}></div>
                </div>

                {/* Simple Progress Dots */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {section.images.map((_, imgIndex) => (
                    <button
                      key={imgIndex}
                      onClick={() => setCurrentImageIndexes(prev => ({ ...prev, [section.id]: imgIndex }))}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        currentImageIndexes[section.id] === imgIndex
                          ? theme === 'gold' 
                            ? 'bg-amber-400 scale-110 shadow-lg' 
                            : 'bg-slate-400 scale-110 shadow-lg'
                          : 'bg-white/60 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>

                {/* Image Counter */}
                <div className="absolute top-4 right-4">
                  <div className={`px-2 py-1 rounded-md backdrop-blur-sm text-xs font-medium ${
                    theme === 'gold' 
                      ? 'bg-amber-900/60 text-white border border-amber-700/30' 
                      : 'bg-slate-900/60 text-white border border-slate-700/30'
                  }`}>
                    {currentImageIndexes[section.id] + 1}/{section.images.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Achievements Section */}
      <div className={`py-20 ${theme === 'gold' ? 'bg-gradient-to-r from-amber-100 to-yellow-100' : 'bg-gradient-to-r from-slate-100 to-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-playfair font-bold mb-4 ${theme === 'gold' ? 'text-amber-950' : 'text-slate-950'}`}>
              Our Achievements
            </h2>
            <p className={`text-xl ${theme === 'gold' ? 'text-amber-900' : 'text-slate-900'}`}>
              Numbers that speak of our commitment to excellence
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <Card key={index} className={`text-center p-6 jewelry-card-enhanced ${theme === 'gold' ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200' : 'bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200'}`}>
                <CardContent className="p-0">
                  <div className={`inline-flex p-4 rounded-full mb-4 ${theme === 'gold' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                    {achievement.icon}
                  </div>
                  <h3 className={`text-3xl font-bold mb-2 ${theme === 'gold' ? 'text-amber-950' : 'text-slate-950'}`}>
                    {achievement.title}
                  </h3>
                  <p className={`text-lg ${theme === 'gold' ? 'text-amber-800' : 'text-slate-800'}`}>
                    {achievement.subtitle}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-playfair font-bold mb-4 ${theme === 'gold' ? 'text-amber-950' : 'text-slate-950'}`}>
              Our Values
            </h2>
            <p className={`text-xl ${theme === 'gold' ? 'text-amber-900' : 'text-slate-900'}`}>
              The principles that guide every piece we create
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className={`jewelry-card-enhanced ${theme === 'gold' ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200' : 'bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200'}`}>
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${value.color === 'gold' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                    <Star className="h-8 w-8" />
                  </div>
                  <h3 className={`text-xl font-bold mb-3 ${theme === 'gold' ? 'text-amber-950' : 'text-slate-950'}`}>
                    {value.title}
                  </h3>
                  <p className={`${theme === 'gold' ? 'text-amber-900' : 'text-slate-900'}`}>
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className={`py-20 ${theme === 'gold' ? 'bg-gradient-to-r from-amber-200 to-yellow-200' : 'bg-gradient-to-r from-slate-200 to-gray-200'}`}>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className={`text-4xl md:text-5xl font-playfair font-bold mb-6 ${theme === 'gold' ? 'text-amber-950' : 'text-slate-950'}`}>
            Be Part of Our Story
          </h2>
          <p className={`text-xl mb-8 ${theme === 'gold' ? 'text-amber-900' : 'text-slate-900'}`}>
            Discover the beauty of authentic Indian jewelry and create your own story with our exquisite collections.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className={`story-button ${theme === 'gold' ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-slate-600 hover:bg-slate-700 text-white'} px-8 py-3 text-lg`}
            >
              Explore Collections
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className={`story-button ${theme === 'gold' ? 'border-amber-600 text-amber-600 hover:bg-amber-50' : 'border-slate-600 text-slate-600 hover:bg-slate-50'} px-8 py-3 text-lg`}
            >
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurStory;