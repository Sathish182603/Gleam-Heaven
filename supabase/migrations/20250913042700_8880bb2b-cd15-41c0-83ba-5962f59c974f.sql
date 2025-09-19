-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  theme_preference TEXT DEFAULT 'gold' CHECK (theme_preference IN ('gold', 'silver')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user roles table with enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('rings', 'necklaces', 'earrings')),
  metal_type TEXT NOT NULL CHECK (metal_type IN ('gold', 'silver')),
  price_per_gram DECIMAL(10,2) NOT NULL,
  weight_grams DECIMAL(8,2) NOT NULL,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rates table for live gold/silver rates
CREATE TABLE public.metal_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metal_type TEXT NOT NULL CHECK (metal_type IN ('gold', 'silver')),
  rate_per_gram DECIMAL(10,2) NOT NULL,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create likes table
CREATE TABLE public.likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metal_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_roles
CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own role" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

-- RLS Policies for products
CREATE POLICY "Products are viewable by everyone" 
ON public.products 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage products" 
ON public.products 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for metal_rates
CREATE POLICY "Metal rates are viewable by everyone" 
ON public.metal_rates 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can update metal rates" 
ON public.metal_rates 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for reviews
CREATE POLICY "Reviews are viewable by everyone" 
ON public.reviews 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create reviews" 
ON public.reviews 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" 
ON public.reviews 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" 
ON public.reviews 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for likes
CREATE POLICY "Users can view their own likes" 
ON public.likes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own likes" 
ON public.likes 
FOR ALL 
USING (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email)
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_metal_rates_updated_at
  BEFORE UPDATE ON public.metal_rates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial metal rates
INSERT INTO public.metal_rates (metal_type, rate_per_gram) VALUES 
('gold', 6500.00),
('silver', 85.00);

-- Insert sample products for rings
INSERT INTO public.products (name, description, category, metal_type, price_per_gram, weight_grams, is_featured) VALUES
-- Gold Rings
('Classic Gold Band', 'Elegant 18k gold wedding band', 'rings', 'gold', 6500.00, 4.5, true),
('Diamond Gold Ring', 'Stunning diamond solitaire in gold setting', 'rings', 'gold', 6500.00, 3.2, true),
('Gold Signet Ring', 'Traditional signet ring in pure gold', 'rings', 'gold', 6500.00, 8.0, false),
('Twisted Gold Band', 'Modern twisted design gold ring', 'rings', 'gold', 6500.00, 5.1, false),
('Gold Cocktail Ring', 'Statement cocktail ring with intricate design', 'rings', 'gold', 6500.00, 6.8, false),
('Vintage Gold Ring', 'Antique inspired gold ring with engravings', 'rings', 'gold', 6500.00, 4.2, false),
('Gold Pinky Ring', 'Delicate pinky ring in 22k gold', 'rings', 'gold', 6500.00, 2.8, false),
('Stackable Gold Rings', 'Set of three stackable gold bands', 'rings', 'gold', 6500.00, 7.5, false),
('Gold Promise Ring', 'Romantic promise ring with heart design', 'rings', 'gold', 6500.00, 3.5, false),
('Gold Eternity Band', 'Continuous diamond eternity band', 'rings', 'gold', 6500.00, 4.8, false),
('Gold Celtic Ring', 'Celtic knot design in yellow gold', 'rings', 'gold', 6500.00, 5.5, false),
('Gold Flower Ring', 'Delicate flower motif gold ring', 'rings', 'gold', 6500.00, 3.8, false),
('Gold Geometry Ring', 'Modern geometric design ring', 'rings', 'gold', 6500.00, 4.0, false),

-- Silver Rings
('Sterling Silver Band', 'Classic sterling silver wedding band', 'rings', 'silver', 85.00, 4.5, false),
('Silver Diamond Ring', 'Elegant diamond ring in silver setting', 'rings', 'silver', 85.00, 3.2, false),
('Silver Signet Ring', 'Traditional signet ring in pure silver', 'rings', 'silver', 85.00, 8.0, false),
('Twisted Silver Band', 'Modern twisted design silver ring', 'rings', 'silver', 85.00, 5.1, false),
('Silver Cocktail Ring', 'Statement cocktail ring in oxidized silver', 'rings', 'silver', 85.00, 6.8, false),
('Vintage Silver Ring', 'Antique inspired silver ring with patterns', 'rings', 'silver', 85.00, 4.2, false),
('Silver Pinky Ring', 'Delicate pinky ring in sterling silver', 'rings', 'silver', 85.00, 2.8, false),
('Stackable Silver Rings', 'Set of three stackable silver bands', 'rings', 'silver', 85.00, 7.5, false),
('Silver Promise Ring', 'Romantic promise ring with engraved hearts', 'rings', 'silver', 85.00, 3.5, false),
('Silver Eternity Band', 'Continuous cubic zirconia eternity band', 'rings', 'silver', 85.00, 4.8, false),
('Silver Celtic Ring', 'Celtic knot design in oxidized silver', 'rings', 'silver', 85.00, 5.5, false),
('Silver Flower Ring', 'Delicate flower motif silver ring', 'rings', 'silver', 85.00, 3.8, false),
('Silver Geometry Ring', 'Modern geometric design in silver', 'rings', 'silver', 85.00, 4.0, false);

-- Insert sample products for necklaces
INSERT INTO public.products (name, description, category, metal_type, price_per_gram, weight_grams, is_featured) VALUES
-- Gold Necklaces
('Gold Chain Necklace', 'Classic 18k gold chain necklace', 'necklaces', 'gold', 6500.00, 15.5, true),
('Gold Pendant Necklace', 'Elegant pendant on gold chain', 'necklaces', 'gold', 6500.00, 12.3, false),
('Gold Choker', 'Modern choker in yellow gold', 'necklaces', 'gold', 6500.00, 8.7, false),
('Gold Locket', 'Traditional heart-shaped gold locket', 'necklaces', 'gold', 6500.00, 10.2, false),
('Gold Statement Necklace', 'Bold statement piece in gold', 'necklaces', 'gold', 6500.00, 25.8, false),
('Gold Tennis Necklace', 'Diamond tennis necklace in gold', 'necklaces', 'gold', 6500.00, 18.5, false),
('Gold Layered Necklace', 'Multi-layer chain necklace set', 'necklaces', 'gold', 6500.00, 22.1, false),
('Gold Pearl Necklace', 'Classic pearl strand with gold clasp', 'necklaces', 'gold', 6500.00, 14.3, false),
('Gold Coin Necklace', 'Ancient coin replica pendant', 'necklaces', 'gold', 6500.00, 16.7, false),
('Gold Bar Necklace', 'Minimalist gold bar pendant', 'necklaces', 'gold', 6500.00, 9.4, false),
('Gold Cross Necklace', 'Religious cross pendant in gold', 'necklaces', 'gold', 6500.00, 11.8, false),
('Gold Infinity Necklace', 'Infinity symbol pendant', 'necklaces', 'gold', 6500.00, 8.2, false),
('Gold Tassel Necklace', 'Bohemian tassel design necklace', 'necklaces', 'gold', 6500.00, 19.6, false),

-- Silver Necklaces
('Silver Chain Necklace', 'Classic sterling silver chain', 'necklaces', 'silver', 85.00, 15.5, false),
('Silver Pendant Necklace', 'Elegant pendant on silver chain', 'necklaces', 'silver', 85.00, 12.3, false),
('Silver Choker', 'Modern choker in sterling silver', 'necklaces', 'silver', 85.00, 8.7, false),
('Silver Locket', 'Traditional heart-shaped silver locket', 'necklaces', 'silver', 85.00, 10.2, false),
('Silver Statement Necklace', 'Bold statement piece in oxidized silver', 'necklaces', 'silver', 85.00, 25.8, false),
('Silver Tennis Necklace', 'Cubic zirconia tennis necklace', 'necklaces', 'silver', 85.00, 18.5, false),
('Silver Layered Necklace', 'Multi-layer chain necklace set', 'necklaces', 'silver', 85.00, 22.1, false),
('Silver Pearl Necklace', 'Classic pearl strand with silver clasp', 'necklaces', 'silver', 85.00, 14.3, false),
('Silver Coin Necklace', 'Vintage coin replica pendant', 'necklaces', 'silver', 85.00, 16.7, false),
('Silver Bar Necklace', 'Minimalist silver bar pendant', 'necklaces', 'silver', 85.00, 9.4, false),
('Silver Cross Necklace', 'Religious cross pendant in silver', 'necklaces', 'silver', 85.00, 11.8, false),
('Silver Infinity Necklace', 'Infinity symbol pendant', 'necklaces', 'silver', 85.00, 8.2, false),
('Silver Tassel Necklace', 'Bohemian tassel design necklace', 'necklaces', 'silver', 85.00, 19.6, false);

-- Insert sample products for earrings
INSERT INTO public.products (name, description, category, metal_type, price_per_gram, weight_grams, is_featured) VALUES
-- Gold Earrings
('Gold Stud Earrings', 'Classic diamond stud earrings in gold', 'earrings', 'gold', 6500.00, 2.8, true),
('Gold Hoop Earrings', 'Medium sized gold hoop earrings', 'earrings', 'gold', 6500.00, 4.2, false),
('Gold Drop Earrings', 'Elegant drop earrings with gemstones', 'earrings', 'gold', 6500.00, 6.5, false),
('Gold Chandelier Earrings', 'Statement chandelier earrings', 'earrings', 'gold', 6500.00, 8.9, false),
('Gold Huggie Earrings', 'Small huggie hoop earrings', 'earrings', 'gold', 6500.00, 3.1, false),
('Gold Pearl Earrings', 'Classic pearl drop earrings', 'earrings', 'gold', 6500.00, 5.7, false),
('Gold Climber Earrings', 'Modern ear climber design', 'earrings', 'gold', 6500.00, 4.8, false),
('Gold Tassel Earrings', 'Bohemian tassel drop earrings', 'earrings', 'gold', 6500.00, 7.3, false),
('Gold Geometric Earrings', 'Modern geometric shaped earrings', 'earrings', 'gold', 6500.00, 5.2, false),
('Gold Flower Earrings', 'Delicate flower motif earrings', 'earrings', 'gold', 6500.00, 3.9, false),
('Gold Dangle Earrings', 'Long dangle earrings with chains', 'earrings', 'gold', 6500.00, 6.8, false),
('Gold Cuff Earrings', 'Ear cuff style earrings', 'earrings', 'gold', 6500.00, 4.5, false),
('Gold Jhumka Earrings', 'Traditional Indian jhumka style', 'earrings', 'gold', 6500.00, 9.2, false),

-- Silver Earrings
('Silver Stud Earrings', 'Classic cubic zirconia stud earrings', 'earrings', 'silver', 85.00, 2.8, false),
('Silver Hoop Earrings', 'Medium sized silver hoop earrings', 'earrings', 'silver', 85.00, 4.2, false),
('Silver Drop Earrings', 'Elegant drop earrings with stones', 'earrings', 'silver', 85.00, 6.5, false),
('Silver Chandelier Earrings', 'Statement chandelier in oxidized silver', 'earrings', 'silver', 85.00, 8.9, false),
('Silver Huggie Earrings', 'Small huggie hoop earrings', 'earrings', 'silver', 85.00, 3.1, false),
('Silver Pearl Earrings', 'Classic pearl drop earrings', 'earrings', 'silver', 85.00, 5.7, false),
('Silver Climber Earrings', 'Modern ear climber design', 'earrings', 'silver', 85.00, 4.8, false),
('Silver Tassel Earrings', 'Bohemian tassel drop earrings', 'earrings', 'silver', 85.00, 7.3, false),
('Silver Geometric Earrings', 'Modern geometric shaped earrings', 'earrings', 'silver', 85.00, 5.2, false),
('Silver Flower Earrings', 'Delicate flower motif earrings', 'earrings', 'silver', 85.00, 3.9, false),
('Silver Dangle Earrings', 'Long dangle earrings with chains', 'earrings', 'silver', 85.00, 6.8, false),
('Silver Cuff Earrings', 'Ear cuff style earrings', 'earrings', 'silver', 85.00, 4.5, false),
('Silver Jhumka Earrings', 'Traditional Indian jhumka style', 'earrings', 'silver', 85.00, 9.2, false);