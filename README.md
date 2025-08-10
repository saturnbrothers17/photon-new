# PHOTON - IIT JEE & NEET Coaching Platform

A comprehensive digital platform for PHOTON Coaching Institute in Varanasi, providing advanced features for both students and teachers in competitive exam preparation.

## 🌟 Features

### For Students
- **Interactive Test System**: Take mock tests with real-time scoring
- **AI-Powered Question Solver**: Get instant solutions with step-by-step explanations
- **Study Materials**: Access comprehensive study resources
- **Performance Analytics**: Track progress with detailed insights
- **Live Test Environment**: Secure testing with anti-cheating measures
- **Cross-Device Sync**: Seamless experience across all devices

### For Teachers
- **Advanced Dashboard**: Comprehensive teacher management system
- **AI Question Extraction**: Extract questions from PDFs using AI
- **Test Creation**: Create and manage tests with ease
- **Student Analytics**: Monitor student performance and progress
- **Material Management**: Upload and organize study materials
- **Result Analysis**: Detailed insights into student performance

### Technical Features
- **Modern UI/UX**: Built with Next.js 15 and Tailwind CSS
- **Real-time Analytics**: Vercel Analytics and Speed Insights
- **Cloud Storage**: Integrated with Google Drive and Supabase
- **AI Integration**: Gemini AI and OpenRouter for intelligent features
- **Performance Optimized**: Advanced caching and optimization
- **Mobile Responsive**: Works perfectly on all devices

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js
- **AI Services**: Google Gemini AI, OpenRouter
- **Cloud Storage**: Google Drive API
- **Analytics**: Vercel Analytics, Custom Analytics
- **Deployment**: Vercel
- **Package Manager**: pnpm

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/photon-coaching-platform.git
   cd photon-coaching-platform
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your environment variables in `.env.local`

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Google Services
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email
GOOGLE_PROJECT_ID=your_project_id
GOOGLE_PRIVATE_KEY=your_private_key

# AI Services
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_api_key

# Firebase (Optional)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
```

## 🗄️ Database Setup

1. **Create a Supabase project**
2. **Run the database schema**
   ```sql
   -- Run the SQL files in the following order:
   -- 1. supabase-advanced-schema.sql
   -- 2. supabase-rls-policies.sql
   -- 3. supabase-functions.sql
   ```

## 🚀 Deployment

### Deploy to Vercel

1. **Connect to Vercel**
   ```bash
   vercel
   ```

2. **Set environment variables in Vercel dashboard**

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Custom Domain Setup

1. Add your domain in Vercel dashboard
2. Update DNS records at your domain registrar
3. Wait for DNS propagation

## 📊 Analytics

The platform includes comprehensive analytics:

- **User Behavior**: Track student and teacher interactions
- **Performance Metrics**: Monitor test scores and completion rates
- **System Performance**: Real-time performance monitoring
- **Custom Events**: Educational platform-specific tracking

## 🔒 Security Features

- **Secure Authentication**: NextAuth.js with multiple providers
- **Row Level Security**: Supabase RLS policies
- **API Protection**: Rate limiting and validation
- **Secure Test Environment**: Anti-cheating measures
- **Data Encryption**: All sensitive data encrypted

## 📱 Mobile Support

- Fully responsive design
- Progressive Web App (PWA) features
- Touch-optimized interface
- Offline capabilities for certain features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏢 About PHOTON

PHOTON is a premier coaching institute in Varanasi, specializing in IIT JEE and NEET preparation. We combine traditional teaching excellence with modern technology to provide the best learning experience for our students.

**Address**: New Colony Kakarmatta, Sundarpur, Nagwa, Varanasi, Shivdaspur, Uttar Pradesh 221004  
**Phone**: (+91) 94505 45318  
**Email**: jpm2005physics@gmail.com

## 🌐 Live Demo

Visit our live platform: [https://photoncoaching.in](https://photoncoaching.in)

## 📞 Support

For technical support or questions about the platform, please contact our development team or create an issue in this repository.

---

Made with ❤️ by the PHOTON Development Team