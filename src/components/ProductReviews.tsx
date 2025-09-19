import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MessageCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_id: string;
  profiles: {
    display_name: string;
  };
}

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

const ProductReviews = ({ productId, productName }: ProductReviewsProps) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      // First, get reviews without join to avoid RLS issues
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          user_id
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (reviewsError) {
        console.error('Error fetching reviews:', reviewsError);
        throw reviewsError;
      }

      if (reviewsData && reviewsData.length > 0) {
        // Fetch profile display names separately
        const reviewsWithProfiles = await Promise.all(
          reviewsData.map(async (review) => {
            try {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('display_name')
                .eq('user_id', review.user_id)
                .maybeSingle();
              
              return {
                ...review,
                profiles: {
                  display_name: profileData?.display_name || 'Anonymous User'
                }
              };
            } catch (profileError) {
              console.error('Error fetching profile for review:', profileError);
              return {
                ...review,
                profiles: {
                  display_name: 'Anonymous User'
                }
              };
            }
          })
        );
        
        setReviews(reviewsWithProfiles);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error('Error in fetchReviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user.id);

      if (error) throw error;

      setReviews(prev => prev.filter(review => review.id !== reviewId));
      toast({
        title: "Success",
        description: "Review deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete review",
        variant: "destructive",
      });
    }
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };

  const averageRating = getAverageRating();

  if (loading) {
    return (
      <Card className="mt-8">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading reviews...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${theme === 'gold' ? 'text-gold-text' : 'text-slate-800'}`}>
          <MessageCircle className="h-5 w-5" />
          Customer Reviews
          {reviews.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <div className={`text-center py-8 ${theme === 'gold' ? 'text-gold-text/70' : 'text-slate-500'}`}>
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No reviews yet for this product.</p>
            <p className="text-sm mt-2">Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Average Rating */}
            <div className="text-center py-4 border-b border-border">
              <div className="text-3xl font-bold text-gold mb-2">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex items-center justify-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.round(averageRating) ? 'text-yellow-500 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className={`text-sm ${theme === 'gold' ? 'text-gold-text/70' : 'text-slate-500'}`}>
                Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Individual Reviews */}
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className={`p-4 rounded-lg border ${
                    theme === 'gold' ? 'border-gold/20 bg-gold-accent/20' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-semibold ${theme === 'gold' ? 'text-gold-text' : 'text-slate-800'}`}>
                          {review.profiles.display_name}
                        </span>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className={`text-xs ${theme === 'gold' ? 'text-gold-text/50' : 'text-slate-400'}`}>
                        {new Date(review.created_at).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    {user && user.id === review.user_id && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteReview(review.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className={`${theme === 'gold' ? 'text-gold-text/80' : 'text-slate-600'}`}>
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductReviews;
