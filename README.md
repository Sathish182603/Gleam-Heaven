# Gleam Haven - Indian Jewelry E-commerce Platform

A comprehensive jewelry e-commerce platform built with React, TypeScript, and Supabase, featuring dynamic theming, user authentication, and admin management.

## ✨ Features

### 🎨 Dynamic Theming
- **Gold Theme**: Warm, luxurious gold color scheme
- **Silver Theme**: Elegant, modern silver color scheme
- **Theme Switching**: Toggle between themes with database persistence
- **Responsive Design**: Beautiful UI that works on all devices

### 🔐 Authentication & User Management
- **User Registration & Login**: Secure authentication with Supabase
- **Profile Management**: Users can manage their profiles and preferences
- **Admin Panel**: Dedicated admin interface for store management
- **Role-based Access**: Admin-only features for rate management

### 💎 Product Management
- **Product Categories**: Rings, Necklaces, and Earrings
- **Metal Types**: Gold and Silver collections
- **25+ Products per Category**: Extensive product catalog
- **Live Pricing**: Dynamic pricing based on current metal rates
- **Product Filtering**: Filter by metal type (Gold/Silver/All)

### 💰 Live Metal Rates
- **Real-time Rates**: Live gold and silver rates display
- **Indian Rupee Pricing**: All prices in ₹ (Indian Rupees)
- **Admin Rate Management**: Only admins can update metal rates
- **Rate History**: Track rate changes over time

### ❤️ User Features
- **Favorites System**: Users can like/favorite products
- **Product Reviews**: Users can add and manage reviews
- **Review Management**: Users can only delete their own reviews
- **Profile Dashboard**: View favorites and manage reviews

### 🛡️ Admin Features
- **Rate Management**: Update gold and silver rates
- **User Management**: View and manage user accounts
- **Product Management**: Add, edit, and manage products
- **Analytics Dashboard**: View store performance metrics

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gleam-haven-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL migration script in `supabase/migrations/`
   - Copy your Supabase URL and anon key

4. **Configure environment variables**
   ```bash
   # Create .env.local file
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Start the development server**
   ```bash
npm run dev
```

6. **Set up admin user**
   - Visit `/admin-setup` to create the first admin user
   - This is required to access admin features

## 🗄️ Database Schema

### Tables
- **profiles**: User profile information and theme preferences
- **user_roles**: User roles (admin/user) with proper permissions
- **products**: Product catalog with categories and metal types
- **metal_rates**: Live gold and silver rates
- **reviews**: Product reviews and ratings
- **likes**: User favorite products

### Key Features
- **Row Level Security (RLS)**: Secure data access
- **Automatic Triggers**: User profile creation and timestamp updates
- **Foreign Key Constraints**: Data integrity
- **Indexes**: Optimized queries

## 🎯 Usage

### For Customers
1. **Browse Products**: Visit Rings, Necklaces, or Earrings pages
2. **Filter by Metal**: Use filter buttons to view Gold or Silver items
3. **View Details**: Click on products to see detailed information
4. **Add to Favorites**: Click the heart icon to save products
5. **Write Reviews**: Add reviews for products you've purchased
6. **Manage Profile**: Update preferences and view favorites

### For Admins
1. **Access Admin Panel**: Sign in with admin credentials
2. **Update Rates**: Modify gold and silver rates as needed
3. **Manage Products**: Add, edit, or remove products
4. **View Analytics**: Monitor store performance and user activity

## 🎨 Theme System

### Gold Theme
- Primary: Warm gold colors (#D4AF37)
- Background: Cream/beige tones
- Accent: Golden highlights
- Perfect for traditional Indian jewelry

### Silver Theme
- Primary: Cool silver tones (#C0C0C0)
- Background: Light gray/white
- Accent: Silver highlights
- Modern and elegant appearance

### Theme Switching
- Toggle between themes using the theme button in navigation
- User preferences are saved to database
- Themes persist across sessions

## 🔧 Technical Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: Radix UI, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **State Management**: React Context API
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Great experience on tablets
- **Desktop**: Full-featured desktop interface
- **Touch Friendly**: Easy navigation on touch devices

## 🔒 Security Features

- **Authentication**: Secure user authentication with Supabase
- **Authorization**: Role-based access control
- **Data Protection**: Row Level Security (RLS) policies
- **Input Validation**: Form validation and sanitization
- **CSRF Protection**: Built-in security measures

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify
1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Set environment variables in Netlify dashboard

### Other Platforms
- The app can be deployed to any static hosting service
- Ensure environment variables are properly configured
- Supabase handles the backend infrastructure

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation
- Contact the development team

## 🎉 Acknowledgments

- **Supabase** for the amazing backend platform
- **Radix UI** for accessible component primitives
- **Tailwind CSS** for the utility-first CSS framework
- **React** team for the excellent frontend library

---

**Gleam Haven** - Where tradition meets technology in Indian jewelry e-commerce.