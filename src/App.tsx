import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { CartProvider } from "@/hooks/useCart";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Rings from "./pages/Rings";
import Necklaces from "./pages/Necklaces";
import Earrings from "./pages/Earrings";
import Admin from "./pages/Admin";
import AdminSetup from "./pages/AdminSetup";
import AdminManagement from "./pages/AdminManagement";
import Cart from "./pages/Cart";
import OurStory from "./pages/OurStory";
import CustomDesign from "./pages/CustomDesign";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const Layout = () => {
  return (
    <div>
      <Outlet />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CartProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Index />} />
                    <Route path="auth" element={<Auth />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="rings" element={<Rings />} />
                    <Route path="necklaces" element={<Necklaces />} />
                    <Route path="earrings" element={<Earrings />} />
                    <Route path="admin" element={<Admin />} />
                    <Route path="admin-setup" element={<AdminSetup />} />
                    <Route path="admin-management" element={<AdminManagement />} />
                    <Route path="cart" element={<Cart />} />
                    <Route path="our-story" element={<OurStory />} />
                    <Route path="custom-design" element={<CustomDesign />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </BrowserRouter>
              <Toaster />
              <Sonner />
            </TooltipProvider>
          </QueryClientProvider>
        </CartProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;