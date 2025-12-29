# Harmony - The Ultimate Collaboration Platform

> **"Collaborate with ease"** - A modern, AI-powered platform designed for seamless team collaboration and intelligent assistance.

![Harmony Banner](https://img.shields.io/badge/Harmony-AI%20Collaboration%20Platform-blue?style=for-the-badge)

## 🌟 Project Overview

**Harmony** is a cutting-edge collaboration platform built with Next.js 15, featuring AI-powered chat capabilities, real-time messaging, interactive maps, 3D visualizations, and comprehensive team management tools. Created by **Ranbir**, this platform combines modern web technologies to deliver an exceptional user experience.

## 🏗️ Core Architecture

### Tech Stack Foundation
- **Frontend Framework**: Next.js 15 (App Router) with React 19
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS with Radix UI components
- **Authentication**: Clerk for secure user management
- **Database**: Firebase Realtime Database
- **AI Integration**: Google Gemini 1.5 Flash for intelligent chat
- **Maps**: Google Maps API for location services
- **3D Graphics**: Three.js with post-processing effects
- **State Management**: React Context API
- **Animations**: Framer Motion

### Project Structure
```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (Gemini chat, auth)
│   ├── dashboard/         # Main chat interface
│   ├── map/              # Interactive maps
│   ├── prices/           # Subscription management
│   ├── profile/          # User profiles
│   ├── settings/         # App configuration
│   └── login/            # Authentication flows
├── components/           # Reusable UI components
├── contexts/            # React Context providers
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries & services
└── public/              # Static assets
```

## 🎯 Core Features

### 1. **AI-Powered Chat System** 🤖
- **Gemini 1.5 Flash Integration**: Advanced AI conversations
- **Context-Aware Responses**: Maintains conversation history
- **Real-time Messaging**: Instant message delivery
- **Message Management**: Edit, delete, regenerate responses
- **Chart Generation**: AI can create visual charts on demand
- **Location Integration**: Smart location queries with map integration

### 2. **Advanced Authentication** 🔐
- **Clerk Integration**: Enterprise-grade authentication
- **SSO Support**: Single Sign-On capabilities
- **Route Protection**: Client and server-side guards
- **Session Management**: Persistent authentication state
- **User Profiles**: Comprehensive user management

### 3. **Interactive Maps** 🗺️
- **Google Maps Integration**: Full-featured mapping
- **Location Search**: Intelligent location queries
- **Multiple Map Types**: Roadmap, satellite, hybrid, terrain
- **Dark/Light Themes**: Adaptive map styling
- **Real-time Navigation**: Direction and route planning

### 4. **3D Visualizations** ✨
- **Hyperspeed Component**: Stunning 3D highway animation
- **Three.js Integration**: Advanced 3D graphics
- **Post-processing Effects**: Bloom, SMAA anti-aliasing
- **Interactive Controls**: Mouse/touch interaction
- **Performance Optimized**: Smooth 60fps animations

### 5. **Modern UI/UX** 🎨
- **Radix UI Components**: Accessible, unstyled components
- **Tailwind CSS**: Utility-first styling
- **Dark/Light Mode**: System-aware theming
- **Responsive Design**: Mobile-first approach
- **Smooth Animations**: Framer Motion transitions
- **Loading States**: Skeleton loaders and smooth transitions

## 🔧 Key Components & Architecture

### Context Providers
- **AuthContext**: Manages user authentication state
- **ChatContext**: Handles chat functionality and history
- **ThemeContext**: Controls dark/light mode
- **SettingsContext**: Application configuration
- **BookmarksContext**: Message bookmarking system

### Core Services
- **GeminiService**: AI chat integration
- **FirebaseService**: Database operations
- **ChatUtils**: Chat utility functions
- **Subscription**: Payment and subscription management

### Security & Performance
- **Route Guards**: Protected routes with authentication
- **Middleware**: Request/response processing
- **Error Boundaries**: Graceful error handling
- **Performance Monitoring**: Auth performance tracking
- **Optimized Loading**: Code splitting and lazy loading

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm/yarn/pnpm
- Firebase project
- Google Maps API key
- Gemini AI API key
- Clerk account

### Environment Setup
Create a `.env.local` file with:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/dashboard

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com/
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google Services
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_api_key
GEMINI_API_KEY=your_gemini_api_key
```

### Installation & Development

```bash
# Clone and install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📱 Key Pages & Features

### Homepage (`/`)
- **Hyperspeed 3D Animation**: Eye-catching entry experience
- **Interactive Dock**: macOS-style navigation
- **Feature Highlights**: Key platform capabilities
- **Authentication CTAs**: Sign-up/sign-in prompts

### Dashboard (`/dashboard`)
- **AI Chat Interface**: Main conversation area
- **Sidebar Navigation**: Quick access to features
- **Settings Panel**: Customization options
- **Real-time Updates**: Live message synchronization

### Maps (`/map`)
- **Interactive Google Maps**: Full-featured mapping
- **Location Search**: Find and navigate to places
- **Map Type Controls**: Switch between map views
- **Theme Integration**: Matches app theme

### Pricing (`/prices`)
- **Clerk Pricing Table**: Subscription management
- **Plan Comparison**: Feature breakdowns
- **Payment Integration**: Secure billing

## 🔌 API Routes

### `/api/chat/gemini`
- **POST**: Send messages to Gemini AI
- **Features**: Context awareness, chart generation, error handling
- **Security**: Rate limiting and input validation

### `/api/auth/*`
- **Clerk Webhooks**: User management
- **Session Handling**: Authentication state

## 🎨 UI Component System

### Design System
- **Consistent Theming**: CSS variables for colors
- **Responsive Grid**: Mobile-first layout
- **Accessibility**: ARIA compliance via Radix UI
- **Animation Library**: Smooth transitions and micro-interactions

### Key Components
- **Chat**: Main conversation interface
- **Sidebar**: Navigation and settings
- **Settings Panel**: Configuration interface
- **Loading States**: Skeleton loaders
- **Form Controls**: Input, buttons, selects

## 🔒 Security Features

- **Route Protection**: Client and server-side guards
- **Input Validation**: Sanitized user inputs
- **Error Boundaries**: Graceful error handling
- **Rate Limiting**: API protection
- **Environment Variables**: Secure configuration

## 📊 Performance Optimizations

- **Code Splitting**: Lazy-loaded components
- **Image Optimization**: Next.js Image component
- **Caching**: Strategic data caching
- **Bundle Analysis**: Optimized build sizes
- **Memory Management**: Efficient state handling

## 🌐 Deployment

### Recommended Platforms
- **Vercel**: Optimized for Next.js
- **Netlify**: Alternative deployment option
- **Self-hosted**: Docker/PM2 configurations

### Build Configuration
```bash
# Production build with Turbopack
npm run build

# Export static files (if needed)
npm run export
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is created by **Ranbir** for educational and demonstration purposes.

## 🆘 Support & Documentation

- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Community support and feature requests
- **Documentation**: Comprehensive component docs in `/docs`

---

**Harmony** represents the future of collaborative platforms - where AI meets intuitive design to create seamless user experiences. Built with modern technologies and best practices, it's designed to scale and evolve with your team's needs.

*Made with ❤️ by Ranbir*
