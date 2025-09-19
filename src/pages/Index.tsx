import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Crown, Sparkles, Star, Diamond } from 'lucide-react';
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Reviews from "@/components/Reviews";
import About from "@/components/About";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen luxury-section">
      <Navigation />
      <Hero />
      <Reviews />
      <About />
      <Footer />
    </div>
  );
};

export default Index;