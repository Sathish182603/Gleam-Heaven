import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from './ui/card';
import { Star } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles: {
    display_name: string;
  };
  products: {
    name: string;
    category: string;
  };
}

const Reviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          user_id,
          product_id
        `)
        .order('created_at', { ascending: false })
        .limit(6);
      
      if (error) {
        console.error('Error fetching reviews:', error);
        return;
      }
      
      if (data) {
        // Fetch profiles and products separately with better error handling
        const reviewsWithDetails = await Promise.all(
          data.map(async (review) => {
            try {
              const [profileResult, productResult] = await Promise.all([
                supabase.from('profiles').select('display_name').eq('user_id', review.user_id).maybeSingle(),
                supabase.from('products').select('name, category').eq('id', review.product_id).maybeSingle()
              ]);
              
              return {
                ...review,
                profiles: profileResult.data || { display_name: 'Anonymous User' },
                products: productResult.data || { name: 'Product', category: 'jewelry' }
              };
            } catch (err) {
              console.error('Error fetching review details:', err);
              return {
                ...review,
                profiles: { display_name: 'Anonymous User' },
                products: { name: 'Product', category: 'jewelry' }
              };
            }
          })
        );
        
        setReviews(reviewsWithDetails);
      }
    } catch (error) {
      console.error('Error in fetchReviews:', error);
      setReviews([]);
    }
  };

  if (reviews.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gold-accent/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-playfair font-bold text-gold-text mb-4">
            Customer Reviews
          </h2>
          <p className="text-lg text-gold-text/80 max-w-2xl mx-auto">
            See what our customers are saying about our jewelry
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <Card key={review.id} className="border-gold/20 bg-background/95">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                
                <p className="text-gold-text/80 mb-4 leading-relaxed">
                  "{review.comment}"
                </p>
                
                <div className="border-t border-gold/20 pt-4">
                  <p className="font-semibold text-gold-text">
                    {review.profiles.display_name}
                  </p>
                  <p className="text-sm text-gold-text/60">
                    {review.products.name} • {review.products.category}
                  </p>
                  <p className="text-xs text-gold-text/50 mt-1">
                    {new Date(review.created_at).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reviews;