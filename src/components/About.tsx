import { Award, Users, Gem, Clock } from "lucide-react";
import { useTheme } from '@/hooks/useTheme';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const features = [
  {
    icon: Gem,
    title: "Premium Quality",
    description: "Only the finest materials and gemstones make their way into our collections.",
  },
  {
    icon: Award,
    title: "Master Craftsmanship",
    description: "Each piece is meticulously crafted by our skilled artisans with decades of experience.",
  },
  {
    icon: Users,
    title: "Personal Service",
    description: "Our dedicated team provides personalized consultation for every customer.",
  },
  {
    icon: Clock,
    title: "Timeless Design",
    description: "Creating pieces that transcend trends and remain beautiful for generations.",
  },
];

const About = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  return (
    <section id="about" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <h2 className="text-4xl md:text-5xl font-playfair font-bold text-navy mb-6">
              Our Legacy of
              <span className={`block ${theme === 'gold' ? 'text-amber-600' : 'text-slate-600'}`}>Excellence</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              For over 25 years, Lumière has been creating extraordinary jewelry pieces 
              that celebrate life's most precious moments. Our commitment to exceptional 
              craftsmanship and timeless design has made us a trusted name in luxury jewelry.
            </p>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Every piece in our collection tells a story of passion, precision, and 
              artistic vision. From engagement rings that symbolize eternal love to 
              statement necklaces that capture individual style, we create jewelry 
              that becomes part of your personal legacy.
            </p>
            <Button 
              className="luxury-button px-8 py-3 text-lg"
              onClick={() => navigate('/our-story')}
            >
              Discover Our Story
            </Button>
          </div>

          {/* Features Grid */}
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center group">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full group-hover:scale-110 transition-all duration-300 mb-4 ${
                    theme === 'gold' 
                      ? 'bg-amber-100 group-hover:bg-amber-600' 
                      : 'bg-slate-100 group-hover:bg-slate-600'
                  }`}>
                    <feature.icon className={`h-8 w-8 transition-colors duration-300 ${
                      theme === 'gold'
                        ? 'text-amber-600 group-hover:text-white'
                        : 'text-slate-600 group-hover:text-white'
                    }`} />
                  </div>
                  <h3 className="text-lg font-playfair font-semibold text-navy mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 pt-20 border-t border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className={`text-4xl font-playfair font-bold mb-2 ${
                theme === 'gold' ? 'text-amber-600' : 'text-slate-600'
              }`}>25+</div>
              <div className="text-muted-foreground">Years of Excellence</div>
            </div>
            <div>
              <div className={`text-4xl font-playfair font-bold mb-2 ${
                theme === 'gold' ? 'text-amber-600' : 'text-slate-600'
              }`}>10K+</div>
              <div className="text-muted-foreground">Happy Customers</div>
            </div>
            <div>
              <div className={`text-4xl font-playfair font-bold mb-2 ${
                theme === 'gold' ? 'text-amber-600' : 'text-slate-600'
              }`}>500+</div>
              <div className="text-muted-foreground">Unique Designs</div>
            </div>
            <div>
              <div className={`text-4xl font-playfair font-bold mb-2 ${
                theme === 'gold' ? 'text-amber-600' : 'text-slate-600'
              }`}>99%</div>
              <div className="text-muted-foreground">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;