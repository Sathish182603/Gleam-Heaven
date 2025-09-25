import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, Palette, Gem, Star, ArrowLeft, Send, Camera, X, User } from "lucide-react";
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const CustomDesign = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [userProfile, setUserProfile] = useState<{
    display_name?: string;
    email?: string;
    avatar_url?: string;
  }>({});
  
  const [formData, setFormData] = useState({
    design_type: '',
    material_preference: '',
    budget_range: '',
    description: '',
    special_requirements: '',
    contact_phone: '',
    preferred_contact_time: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  // Fetch user profile information
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('display_name, email, avatar_url')
          .eq('user_id', user.id)
          .single();
        
        if (data) {
          setUserProfile(data);
        } else if (error && error.code === 'PGRST116') {
          // Profile doesn't exist, use auth data
          setUserProfile({
            display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
            email: user.email || '',
            avatar_url: user.user_metadata?.avatar_url || ''
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files).slice(0, 5 - uploadedPhotos.length); // Max 5 photos
      
      // Create preview URLs
      const newUrls = newFiles.map(file => URL.createObjectURL(file));
      
      setUploadedPhotos(prev => [...prev, ...newFiles]);
      setPhotoUrls(prev => [...prev, ...newUrls]);
    }
  };

  const removePhoto = (index: number) => {
    // Revoke the object URL to free memory
    URL.revokeObjectURL(photoUrls[index]);
    
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit a custom design request.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    if (!formData.design_type || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in the required fields (Design Type and Description).",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare special requirements with photo information
      let updatedSpecialRequirements = formData.special_requirements;
      if (uploadedPhotos.length > 0) {
        const photoInfo = `\n\n📸 Reference Photos: ${uploadedPhotos.length} photo(s) uploaded for reference (${uploadedPhotos.map(f => f.name).join(', ')})`;
        updatedSpecialRequirements = (formData.special_requirements + photoInfo).trim();
      }

      const { error } = await supabase
        .from('custom_design_requests')
        .insert([{
          user_id: user.id,
          design_type: formData.design_type,
          material_preference: formData.material_preference,
          budget_range: formData.budget_range,
          description: formData.description,
          special_requirements: updatedSpecialRequirements,
          contact_phone: formData.contact_phone,
          preferred_contact_time: formData.preferred_contact_time,
          status: 'pending'
        }]);

      if (error) throw error;

      toast({
        title: "Design Request Submitted! ✨",
        description: `We'll review your custom design request${uploadedPhotos.length > 0 ? ` and your ${uploadedPhotos.length} reference photo(s)` : ''} and contact you within 24 hours.`,
      });

      // Reset form and photos
      setFormData({
        design_type: '',
        material_preference: '',
        budget_range: '',
        description: '',
        special_requirements: '',
        contact_phone: '',
        preferred_contact_time: ''
      });

      // Clear uploaded photos and revoke URLs
      photoUrls.forEach(url => URL.revokeObjectURL(url));
      setUploadedPhotos([]);
      setPhotoUrls([]);

      // Navigate to profile to see the request
      setTimeout(() => navigate('/profile'), 2000);

    } catch (error) {
      console.error('Error submitting design request:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen ${
      theme === 'gold'
        ? 'bg-gradient-to-br from-amber-50 via-white to-yellow-50'
        : 'bg-gradient-to-br from-slate-50 via-white to-gray-50'
    }`}>
      <Navigation />
      
      {/* Hero Section */}
      <div className={`relative ${
        theme === 'gold'
          ? 'bg-gradient-to-r from-amber-900 via-yellow-800 to-amber-900'
          : 'bg-gradient-to-r from-slate-800 via-gray-700 to-slate-800'
      } text-white overflow-hidden`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,_white_1px,_transparent_1px)] bg-[length:20px_20px]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_white_1px,_transparent_1px)] bg-[length:30px_30px]"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-16">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-8 text-white hover:bg-white/20 transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Palette className={`w-12 h-12 ${
                theme === 'gold' ? 'text-yellow-300' : 'text-slate-300'
              } animate-pulse`} />
              <h1 className={`text-5xl md:text-6xl font-bold ${
                theme === 'gold'
                  ? 'bg-gradient-to-r from-yellow-200 to-amber-200'
                  : 'bg-gradient-to-r from-slate-200 to-gray-200'
              } bg-clip-text text-transparent`}>
                Design
              </h1>
              <Star className={`w-12 h-12 ${
                theme === 'gold' ? 'text-yellow-300' : 'text-slate-300'
              } animate-bounce`} />
            </div>
            <p className={`text-xl md:text-2xl ${
              theme === 'gold' ? 'text-amber-100' : 'text-slate-100'
            } leading-relaxed`}>
              Bring your vision to life with our bespoke jewelry design service. 
              Create something uniquely yours with our master craftsmen.
            </p>
            <div className="mt-8 flex justify-center items-center gap-2">
              <Gem className={`w-6 h-6 ${
                theme === 'gold' ? 'text-yellow-300' : 'text-slate-300'
              }`} />
              <span className={`${
                theme === 'gold' ? 'text-amber-200' : 'text-slate-200'
              } font-medium`}>Crafted with Excellence Since 1985</span>
              <Gem className={`w-6 h-6 ${
                theme === 'gold' ? 'text-yellow-300' : 'text-slate-300'
              }`} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* User Profile Section */}
          {user && (
            <Card className={`shadow-xl border-0 ${
              theme === 'gold'
                ? 'bg-gradient-to-br from-white to-amber-50'
                : 'bg-gradient-to-br from-white to-slate-50'
            } hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`}>
              <CardHeader className={`${
                theme === 'gold'
                  ? 'bg-gradient-to-r from-amber-100 to-yellow-100'
                  : 'bg-gradient-to-r from-slate-100 to-gray-100'
              } rounded-t-lg`}>
                <CardTitle className={`flex items-center gap-3 text-2xl ${
                  theme === 'gold' ? 'text-amber-800' : 'text-slate-800'
                }`}>
                  <User className={`w-6 h-6 ${
                    theme === 'gold' ? 'text-amber-600' : 'text-slate-600'
                  }`} />
                  Your Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-amber-200">
                    <AvatarImage 
                      src={userProfile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userProfile.display_name || userProfile.email || 'User')}&backgroundColor=f59e0b`} 
                      alt={userProfile.display_name || 'User Avatar'} 
                    />
                    <AvatarFallback className={`text-xl font-bold ${
                      theme === 'gold' 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {(userProfile.display_name || userProfile.email || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className={`text-xl font-semibold ${
                      theme === 'gold' ? 'text-amber-900' : 'text-slate-900'
                    }`}>
                      {userProfile.display_name || 'Anonymous User'}
                    </h3>
                    <p className={`${
                      theme === 'gold' ? 'text-amber-700' : 'text-slate-700'
                    }`}>
                      {userProfile.email}
                    </p>
                    <Badge className={`mt-2 ${
                      theme === 'gold'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-slate-100 text-slate-800 border-slate-300'
                    }`}>
                      ✨ Valued Customer
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Design Type Selection */}
          <Card className={`shadow-xl border-0 ${
            theme === 'gold'
              ? 'bg-gradient-to-br from-white to-amber-50'
              : 'bg-gradient-to-br from-white to-slate-50'
          } hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`}>
            <CardHeader className={`${
              theme === 'gold'
                ? 'bg-gradient-to-r from-amber-100 to-yellow-100'
                : 'bg-gradient-to-r from-slate-100 to-gray-100'
            } rounded-t-lg`}>
              <CardTitle className={`flex items-center gap-3 text-2xl ${
                theme === 'gold' ? 'text-amber-800' : 'text-slate-800'
              }`}>
                <Gem className={`w-6 h-6 ${
                  theme === 'gold' ? 'text-amber-600' : 'text-slate-600'
                }`} />
                Design Type *
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                <Label htmlFor="design-type" className={`text-lg font-medium ${
                  theme === 'gold' ? 'text-amber-900' : 'text-slate-900'
                }`}>Design Type *</Label>
                <select
                  id="design-type"
                  value={formData.design_type}
                  onChange={(e) => handleInputChange('design_type', e.target.value)}
                  className={`w-full px-4 py-3 border-2 ${
                    theme === 'gold'
                      ? 'border-amber-200 focus:ring-amber-400 focus:border-amber-400 text-amber-900'
                      : 'border-slate-200 focus:ring-slate-400 focus:border-slate-400 text-slate-900'
                  } rounded-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 transition-all duration-300 font-medium`}
                  required
                >
                  <option value="">Choose jewelry type</option>
                  <option value="ring">💍 Ring</option>
                  <option value="necklace">📿 Necklace</option>
                  <option value="earrings">💎 Earrings</option>
                  <option value="bracelet">⚜️ Bracelet</option>
                  <option value="pendant">🔮 Pendant</option>
                  <option value="brooch">✨ Brooch</option>
                  <option value="other">🎨 Other</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Material Preference */}
          <Card className={`shadow-xl border-0 ${
            theme === 'gold'
              ? 'bg-gradient-to-br from-white to-yellow-50'
              : 'bg-gradient-to-br from-white to-slate-50'
          } hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`}>
            <CardHeader className={`${
              theme === 'gold'
                ? 'bg-gradient-to-r from-yellow-100 to-amber-100'
                : 'bg-gradient-to-r from-slate-100 to-gray-100'
            } rounded-t-lg`}>
              <CardTitle className={`flex items-center gap-3 text-2xl ${
                theme === 'gold' ? 'text-amber-800' : 'text-slate-800'
              }`}>
                <Upload className={`w-6 h-6 ${
                  theme === 'gold' ? 'text-amber-600' : 'text-slate-600'
                }`} />
                Material Preference
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                <Label htmlFor="material-preference" className={`text-lg font-medium ${
                  theme === 'gold' ? 'text-amber-900' : 'text-slate-900'
                }`}>Material Preference</Label>
                <select
                  id="material-preference"
                  value={formData.material_preference}
                  onChange={(e) => handleInputChange('material_preference', e.target.value)}
                  className={`w-full px-4 py-3 border-2 ${
                    theme === 'gold'
                      ? 'border-amber-200 focus:ring-amber-400 focus:border-amber-400 text-amber-900'
                      : 'border-slate-200 focus:ring-slate-400 focus:border-slate-400 text-slate-900'
                  } rounded-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 transition-all duration-300 font-medium`}
                >
                  <option value="">Select material</option>
                  <option value="gold-24k">✨ 24K Gold (Pure Gold)</option>
                  <option value="gold-22k">🌟 22K Gold (Premium)</option>
                  <option value="gold-18k">💫 18K Gold (Classic)</option>
                  <option value="silver-925">🥈 925 Sterling Silver</option>
                  <option value="platinum">💎 Platinum (Luxury)</option>
                  <option value="mixed">🎨 Mixed Metals</option>
                  <option value="no-preference">🤷 No Preference</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Budget Range */}
          <Card className={`shadow-xl border-0 ${
            theme === 'gold'
              ? 'bg-gradient-to-br from-white to-green-50'
              : 'bg-gradient-to-br from-white to-slate-50'
          } hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`}>
            <CardHeader className={`${
              theme === 'gold'
                ? 'bg-gradient-to-r from-green-100 to-emerald-100'
                : 'bg-gradient-to-r from-slate-100 to-gray-100'
            } rounded-t-lg`}>
              <CardTitle className={`flex items-center gap-3 text-2xl ${
                theme === 'gold' ? 'text-emerald-800' : 'text-slate-800'
              }`}>
                <Star className={`w-6 h-6 ${
                  theme === 'gold' ? 'text-emerald-600' : 'text-slate-600'
                }`} />
                Budget Range
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                <Label htmlFor="budget-range" className={`text-lg font-medium ${
                  theme === 'gold' ? 'text-emerald-900' : 'text-slate-900'
                }`}>Budget Range</Label>
                <select
                  id="budget-range"
                  value={formData.budget_range}
                  onChange={(e) => handleInputChange('budget_range', e.target.value)}
                  className={`w-full px-4 py-3 border-2 ${
                    theme === 'gold'
                      ? 'border-emerald-200 focus:ring-emerald-400 focus:border-emerald-400 text-emerald-900'
                      : 'border-slate-200 focus:ring-slate-400 focus:border-slate-400 text-slate-900'
                  } rounded-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 transition-all duration-300 font-medium`}
                >
                  <option value="">Select budget range</option>
                  <option value="under-50k">💰 Under ₹50,000</option>
                  <option value="50k-100k">💎 ₹50,000 - ₹1,00,000</option>
                  <option value="100k-250k">👑 ₹1,00,000 - ₹2,50,000</option>
                  <option value="250k-500k">✨ ₹2,50,000 - ₹5,00,000</option>
                  <option value="above-500k">💫 Above ₹5,00,000</option>
                  <option value="flexible">🤝 Flexible</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Design Description */}
          <Card className={`shadow-xl border-0 ${
            theme === 'gold'
              ? 'bg-gradient-to-br from-white to-purple-50'
              : 'bg-gradient-to-br from-white to-slate-50'
          } hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`}>
            <CardHeader className={`${
              theme === 'gold'
                ? 'bg-gradient-to-r from-purple-100 to-pink-100'
                : 'bg-gradient-to-r from-slate-100 to-gray-100'
            } rounded-t-lg`}>
              <CardTitle className={`flex items-center gap-3 text-2xl ${
                theme === 'gold' ? 'text-purple-800' : 'text-slate-800'
              }`}>
                <Palette className={`w-6 h-6 ${
                  theme === 'gold' ? 'text-purple-600' : 'text-slate-600'
                }`} />
                Design Description *
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Textarea
                placeholder="Describe your dream jewelry piece in detail. Include style, inspiration, colors, stones, patterns, or any specific elements you envision..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={`min-h-[120px] border-2 ${
                  theme === 'gold'
                    ? 'border-purple-200 focus:ring-purple-400 focus:border-purple-400 text-purple-900'
                    : 'border-slate-200 focus:ring-slate-400 focus:border-slate-400 text-slate-900'
                } rounded-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 transition-all duration-300 resize-none`}
                required
              />
              
              {/* Inspiration Tags */}
              <div className="mt-6 space-y-3">
                <Label className={`text-lg font-medium ${
                  theme === 'gold' ? 'text-purple-900' : 'text-slate-900'
                }`}>
                  ✨ Popular Design Inspirations:
                </Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Vintage', 'Modern', 'Traditional', 'Minimalist', 'Bohemian', 
                    'Art Deco', 'Nature-inspired', 'Geometric', 'Classic', 'Statement'
                  ].map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className={`cursor-pointer ${
                        theme === 'gold'
                          ? 'border-purple-300 text-purple-700 hover:bg-purple-100 hover:border-purple-400'
                          : 'border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400'
                      } transition-all duration-200 px-3 py-1 text-sm font-medium`}
                      onClick={() => {
                        const currentDesc = formData.description;
                        if (!currentDesc.includes(tag)) {
                          handleInputChange('description', currentDesc ? `${currentDesc}, ${tag}` : tag);
                        }
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Photo Upload Section */}
          <Card className={`shadow-xl border-0 ${
            theme === 'gold'
              ? 'bg-gradient-to-br from-white to-pink-50'
              : 'bg-gradient-to-br from-white to-slate-50'
          } hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`}>
            <CardHeader className={`${
              theme === 'gold'
                ? 'bg-gradient-to-r from-pink-100 to-rose-100'
                : 'bg-gradient-to-r from-slate-100 to-gray-100'
            } rounded-t-lg`}>
              <CardTitle className={`flex items-center gap-3 text-2xl ${
                theme === 'gold' ? 'text-pink-800' : 'text-slate-800'
              }`}>
                <Camera className={`w-6 h-6 ${
                  theme === 'gold' ? 'text-pink-600' : 'text-slate-600'
                }`} />
                Reference Photos (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Label className={`text-lg font-medium ${
                  theme === 'gold' ? 'text-pink-900' : 'text-slate-900'
                }`}>
                  📸 Upload reference images to help us understand your vision (Max 5 photos)
                </Label>
                
                {/* Upload Button */}
                <div className="flex flex-col items-center justify-center">
                  <label htmlFor="photo-upload" className={`cursor-pointer flex flex-col items-center justify-center w-full h-32 border-2 border-dashed ${
                    theme === 'gold'
                      ? 'border-pink-300 hover:border-pink-400 bg-pink-50/50'
                      : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                  } rounded-lg transition-colors duration-300`}>
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className={`w-8 h-8 mb-3 ${
                        theme === 'gold' ? 'text-pink-500' : 'text-slate-500'
                      }`} />
                      <p className={`text-sm font-medium ${
                        theme === 'gold' ? 'text-pink-700' : 'text-slate-700'
                      }`}>
                        Click to upload reference photos
                      </p>
                      <p className={`text-xs ${
                        theme === 'gold' ? 'text-pink-500' : 'text-slate-500'
                      }`}>
                        PNG, JPG, JPEG up to 10MB each
                      </p>
                    </div>
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploadedPhotos.length >= 5}
                  />
                </div>

                {/* Photo Previews */}
                {photoUrls.length > 0 && (
                  <div className="space-y-3">
                    <Label className={`text-md font-medium ${
                      theme === 'gold' ? 'text-pink-800' : 'text-slate-800'
                    }`}>
                      Uploaded Photos ({uploadedPhotos.length}/5):
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {photoUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Reference ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg shadow-md"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className={`absolute top-2 right-2 p-1 rounded-full ${
                              theme === 'gold'
                                ? 'bg-red-500 hover:bg-red-600'
                                : 'bg-red-600 hover:bg-red-700'
                            } text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div className={`absolute bottom-2 left-2 px-2 py-1 text-xs font-medium ${
                            theme === 'gold'
                              ? 'bg-pink-500 text-white'
                              : 'bg-slate-600 text-white'
                          } rounded`}>
                            {uploadedPhotos[index]?.name.substring(0, 15)}...
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Helpful Tips */}
                <div className={`mt-4 p-4 rounded-lg ${
                  theme === 'gold'
                    ? 'bg-pink-50 border border-pink-200'
                    : 'bg-slate-50 border border-slate-200'
                }`}>
                  <p className={`text-sm ${
                    theme === 'gold' ? 'text-pink-700' : 'text-slate-700'
                  }`}>
                    💡 <strong>Tip:</strong> Upload photos of jewelry styles, inspirations, or sketches that represent your vision. 
                    This helps our designers understand your preferences better!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Special Requirements */}
          <Card className={`shadow-xl border-0 ${
            theme === 'gold'
              ? 'bg-gradient-to-br from-white to-blue-50'
              : 'bg-gradient-to-br from-white to-slate-50'
          } hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`}>
            <CardHeader className={`${
              theme === 'gold'
                ? 'bg-gradient-to-r from-blue-100 to-indigo-100'
                : 'bg-gradient-to-r from-slate-100 to-gray-100'
            } rounded-t-lg`}>
              <CardTitle className={`flex items-center gap-3 text-2xl ${
                theme === 'gold' ? 'text-blue-800' : 'text-slate-800'
              }`}>
                <Star className={`w-6 h-6 ${
                  theme === 'gold' ? 'text-blue-600' : 'text-slate-600'
                }`} />
                Special Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Textarea
                placeholder="Any special requirements? Size specifications, allergies, timeline, or specific gemstones..."
                value={formData.special_requirements}
                onChange={(e) => handleInputChange('special_requirements', e.target.value)}
                className={`min-h-[100px] border-2 ${
                  theme === 'gold'
                    ? 'border-blue-200 focus:ring-blue-400 focus:border-blue-400 text-blue-900'
                    : 'border-slate-200 focus:ring-slate-400 focus:border-slate-400 text-slate-900'
                } rounded-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 transition-all duration-300 resize-none`}
              />
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className={`shadow-xl border-0 ${
            theme === 'gold'
              ? 'bg-gradient-to-br from-white to-teal-50'
              : 'bg-gradient-to-br from-white to-slate-50'
          } hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`}>
            <CardHeader className={`${
              theme === 'gold'
                ? 'bg-gradient-to-r from-teal-100 to-cyan-100'
                : 'bg-gradient-to-r from-slate-100 to-gray-100'
            } rounded-t-lg`}>
              <CardTitle className={`flex items-center gap-3 text-2xl ${
                theme === 'gold' ? 'text-teal-800' : 'text-slate-800'
              }`}>
                <Send className={`w-6 h-6 ${
                  theme === 'gold' ? 'text-teal-600' : 'text-slate-600'
                }`} />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <Label htmlFor="phone" className={`text-lg font-medium ${
                  theme === 'gold' ? 'text-teal-900' : 'text-slate-900'
                }`}>
                  📱 Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.contact_phone}
                  onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                  className={`border-2 ${
                    theme === 'gold'
                      ? 'border-teal-200 focus:ring-teal-400 focus:border-teal-400 text-teal-900'
                      : 'border-slate-200 focus:ring-slate-400 focus:border-slate-400 text-slate-900'
                  } rounded-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 transition-all duration-300 h-12`}
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="contact-time" className={`text-lg font-medium ${
                  theme === 'gold' ? 'text-teal-900' : 'text-slate-900'
                }`}>
                  ⏰ Preferred Contact Time
                </Label>
                <select
                  id="contact-time"
                  className={`w-full px-4 py-3 border-2 ${
                    theme === 'gold'
                      ? 'border-teal-200 focus:ring-teal-400 focus:border-teal-400 text-teal-900'
                      : 'border-slate-200 focus:ring-slate-400 focus:border-slate-400 text-slate-900'
                  } rounded-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 transition-all duration-300 font-medium`}
                  value={formData.preferred_contact_time}
                  onChange={(e) => handleInputChange('preferred_contact_time', e.target.value)}
                >
                  <option value="">Select preferred time</option>
                  <option value="morning">🌅 Morning (9AM - 12PM)</option>
                  <option value="afternoon">☀️ Afternoon (12PM - 5PM)</option>
                  <option value="evening">🌆 Evening (5PM - 8PM)</option>
                  <option value="anytime">🕐 Anytime</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="text-center space-y-6 pt-8">
            <Button
              type="submit"
              disabled={isSubmitting}
              className={`w-full md:w-auto px-12 py-4 text-lg font-semibold ${
                theme === 'gold'
                  ? 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700'
                  : 'bg-gradient-to-r from-slate-600 to-gray-600 hover:from-slate-700 hover:to-gray-700'
              } text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed rounded-lg`}
            >
              <Send className="w-5 h-5 mr-3" />
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Submitting Request...
                </>
              ) : (
                'Submit Design Request ✨'
              )}
            </Button>
            
            <div className={`${
              theme === 'gold'
                ? 'bg-gradient-to-r from-amber-100 to-yellow-100 border-amber-200'
                : 'bg-gradient-to-r from-slate-100 to-gray-100 border-slate-200'
            } p-6 rounded-xl border`}>
              <p className={`${
                theme === 'gold' ? 'text-amber-800' : 'text-slate-800'
              } font-medium flex items-center justify-center gap-2`}>
                <Star className={`w-5 h-5 ${
                  theme === 'gold' ? 'text-amber-600' : 'text-slate-600'
                }`} />
                * Required fields. We'll get back to you within 24 hours with a detailed consultation.
                <Star className={`w-5 h-5 ${
                  theme === 'gold' ? 'text-amber-600' : 'text-slate-600'
                }`} />
              </p>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default CustomDesign;