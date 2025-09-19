import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/use-toast';
import { Crown } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();
  const { theme } = useTheme();
  const { toast } = useToast();

  // Real-time email validation
  const validateEmail = (email: string) => {
    if (!email.trim()) {
      setEmailError('');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('❌ Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  // Real-time password validation
  const validatePassword = (password: string) => {
    if (!password.trim()) {
      setPasswordError('');
      return;
    }
    if (password.length < 6) {
      setPasswordError('❌ Password must be at least 6 characters long');
    } else if (password.toLowerCase() === 'password' || password === '123456' || password === 'qwerty') {
      setPasswordError('⚠️ Please choose a stronger password');
    } else {
      setPasswordError('');
    }
  };

  // Handle email change with validation
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };

  // Handle password change with validation
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    validatePassword(value);
  };

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (!email.trim()) {
      toast({
        title: "❌ Email Required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    
    if (!password.trim()) {
      toast({
        title: "❌ Password Required",
        description: "Please enter your password",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast({
        title: "❌ Invalid Email Format",
        description: "Please enter a valid email address (e.g., user@example.com)",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    
    const { error } = await signIn(email.trim(), password);
    
    if (error) {
      toast({
        title: "❌ Sign In Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "✅ Success",
        description: "Signed in successfully! Welcome back!",
      });
      navigate('/');
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (!email.trim()) {
      toast({
        title: "❌ Email Required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    
    if (!password.trim()) {
      toast({
        title: "❌ Password Required",
        description: "Please enter a password",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast({
        title: "❌ Email is Not Valid",
        description: "Please enter a valid email address (e.g., user@gmail.com, user@yahoo.com)",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: "❌ Password Too Short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    
    if (password.toLowerCase() === 'password' || password === '123456' || password === 'qwerty') {
      toast({
        title: "⚠️ Weak Password",
        description: "Please choose a stronger password. Avoid common passwords like 'password' or '123456'",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    
    const { error } = await signUp(email.trim(), password, displayName.trim() || undefined);
    
    if (error) {
      toast({
        title: "❌ Sign Up Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "✅ Account Created Successfully!",
        description: "Please check your email for verification link. You can now sign in.",
      });
      setEmail('');
      setPassword('');
      setDisplayName('');
    }
    
    setLoading(false);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 bg-gradient-to-br ${
      theme === 'gold' 
        ? 'from-yellow-50 to-amber-100' 
        : 'from-gray-50 to-slate-100'
    }`}>
      <Card className={`w-full max-w-md shadow-lg border rounded-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-[1.02] ${
        theme === 'gold'
          ? 'bg-gradient-to-br from-yellow-50 to-white border-yellow-200'
          : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
      }`}>
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className={`p-3 rounded-full text-white transition-colors duration-300 hover:scale-110 transform ${
              theme === 'gold'
                ? 'bg-yellow-500 hover:bg-yellow-600'
                : 'bg-gray-500 hover:bg-gray-600'
            }`}>
              <Crown className="h-6 w-6" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className={`text-2xl font-bold transition-colors duration-300 ${
              theme === 'gold'
                ? 'text-yellow-700 hover:text-yellow-800'
                : 'text-gray-700 hover:text-gray-800'
            }`}>
              Gleam Haven
            </CardTitle>
            <CardDescription className="text-gray-600">
              Your gateway to exquisite Indian jewelry
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 p-6">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className={`grid w-full grid-cols-2 transition-colors duration-300 ${
              theme === 'gold'
                ? 'bg-yellow-100 hover:bg-yellow-200'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}>
              <TabsTrigger 
                value="signin" 
                className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                  theme === 'gold'
                    ? 'hover:bg-yellow-50 hover:text-yellow-700 data-[state=active]:bg-yellow-500 data-[state=active]:text-white'
                    : 'hover:bg-gray-50 hover:text-gray-700 data-[state=active]:bg-gray-500 data-[state=active]:text-white'
                }`}
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="signup" 
                className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                  theme === 'gold'
                    ? 'hover:bg-yellow-50 hover:text-yellow-700 data-[state=active]:bg-yellow-500 data-[state=active]:text-white'
                    : 'hover:bg-gray-50 hover:text-gray-700 data-[state=active]:bg-gray-500 data-[state=active]:text-white'
                }`}
              >
                Sign Up
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="mt-6">
              <div className={`p-6 rounded-lg border transition-all duration-300 hover:shadow-md ${
                theme === 'gold'
                  ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 hover:border-yellow-300'
                  : 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200 hover:border-gray-300'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 text-center ${
                  theme === 'gold' ? 'text-yellow-800' : 'text-gray-800'
                }`}>Welcome Back!</h3>
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-sm font-medium text-gray-700">
                      Email Address
                    </Label>
                    <div className="relative group">
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={handleEmailChange}
                        required
                        autoComplete="email"
                        className={`cursor-text transition-all duration-300 hover:shadow-sm ${
                          emailError 
                            ? 'border-red-500 focus:border-red-500' 
                            : theme === 'gold'
                              ? 'border-yellow-300 focus:border-yellow-500 hover:border-yellow-400 group-hover:bg-yellow-50/50'
                              : 'border-gray-300 focus:border-gray-500 hover:border-gray-400 group-hover:bg-gray-50/50'
                        }`}
                      />
                    </div>
                    {emailError && (
                      <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                        <span>⚠️</span>
                        <p>{emailError}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-sm font-medium text-gray-700">
                      Password
                    </Label>
                    <div className="relative group">
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={handlePasswordChange}
                        required
                        minLength={6}
                        autoComplete="current-password"
                        className={`cursor-text transition-all duration-300 hover:shadow-sm ${
                          passwordError 
                            ? 'border-red-500 focus:border-red-500' 
                            : theme === 'gold'
                              ? 'border-yellow-300 focus:border-yellow-500 hover:border-yellow-400 group-hover:bg-yellow-50/50'
                              : 'border-gray-300 focus:border-gray-500 hover:border-gray-400 group-hover:bg-gray-50/50'
                        }`}
                      />
                    </div>
                    {passwordError && (
                      <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                        <span>⚠️</span>
                        <p>{passwordError}</p>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className={`w-full cursor-pointer text-white transition-all duration-300 hover:shadow-lg hover:scale-[1.02] transform ${
                      theme === 'gold'
                        ? 'bg-yellow-500 hover:bg-yellow-600'
                        : 'bg-gray-500 hover:bg-gray-600'
                    }`}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Signing In...</span>
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </div>
            </TabsContent>
            
            <TabsContent value="signup" className="mt-6">
              <div className={`p-6 rounded-lg border transition-all duration-300 hover:shadow-md ${
                theme === 'gold'
                  ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 hover:border-amber-300'
                  : 'bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200 hover:border-slate-300'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 text-center ${
                  theme === 'gold' ? 'text-amber-800' : 'text-slate-800'
                }`}>Create Your Account!</h3>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-sm font-medium text-gray-700">
                      Display Name <span className="text-gray-500">(Optional)</span>
                    </Label>
                    <div className="relative group">
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Enter your name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className={`cursor-text transition-all duration-300 hover:shadow-sm ${
                          theme === 'gold'
                            ? 'border-amber-300 focus:border-amber-500 hover:border-amber-400 group-hover:bg-amber-50/50'
                            : 'border-slate-300 focus:border-slate-500 hover:border-slate-400 group-hover:bg-slate-50/50'
                        }`}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium text-gray-700">
                      Email Address
                    </Label>
                    <div className="relative group">
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={handleEmailChange}
                        required
                        autoComplete="email"
                        className={`cursor-text transition-all duration-300 hover:shadow-sm ${
                          emailError 
                            ? 'border-red-500 focus:border-red-500' 
                            : theme === 'gold'
                              ? 'border-amber-300 focus:border-amber-500 hover:border-amber-400 group-hover:bg-amber-50/50'
                              : 'border-slate-300 focus:border-slate-500 hover:border-slate-400 group-hover:bg-slate-50/50'
                        }`}
                      />
                    </div>
                    {emailError && (
                      <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                        <span>⚠️</span>
                        <p>{emailError}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-medium text-gray-700">
                      Password
                    </Label>
                    <div className="relative group">
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a password (min. 6 characters)"
                        value={password}
                        onChange={handlePasswordChange}
                        required
                        minLength={6}
                        autoComplete="new-password"
                        className={`cursor-text transition-all duration-300 hover:shadow-sm ${
                          passwordError 
                            ? 'border-red-500 focus:border-red-500' 
                            : theme === 'gold'
                              ? 'border-amber-300 focus:border-amber-500 hover:border-amber-400 group-hover:bg-amber-50/50'
                              : 'border-slate-300 focus:border-slate-500 hover:border-slate-400 group-hover:bg-slate-50/50'
                        }`}
                      />
                    </div>
                    {passwordError && (
                      <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                        <span>⚠️</span>
                        <p>{passwordError}</p>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className={`w-full cursor-pointer text-white transition-all duration-300 hover:shadow-lg hover:scale-[1.02] transform ${
                      theme === 'gold'
                        ? 'bg-amber-500 hover:bg-amber-600'
                        : 'bg-slate-500 hover:bg-slate-600'
                    }`}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating Account...</span>
                      </div>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;