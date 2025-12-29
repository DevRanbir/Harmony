# 🚀 Harmony

> "Collaborate with ease" - The ultimate AI-powered collaboration platform for modern teams. 

---

## 📖 Description

Harmony is a cutting-edge collaboration platform built with Next.js 15, featuring AI-powered chat capabilities powered by Google Gemini, real-time messaging, interactive maps, stunning 3D visualizations, and comprehensive team management tools.  It combines modern web technologies to deliver an exceptional user experience for seamless team collaboration.

What makes it unique:
- AI-powered chat with Google Gemini 1.5 Flash
- Real-time messaging with Firebase
- Interactive Google Maps integration
- Stunning 3D hyperspeed visualizations with Three.js
- Enterprise-grade authentication with Clerk
- Modern, responsive UI with Radix UI components

---

## ✨ Features

- **AI-Powered Chat System** – Context-aware conversations with Gemini 1.5 Flash
- **Real-time Messaging** – Instant message delivery with Firebase Realtime Database
- **Message Management** – Edit, delete, and regenerate AI responses
- **Chart Generation** – AI can create visual charts on demand
- **Interactive Maps** – Google Maps with location search and navigation
- **3D Visualizations** – Hyperspeed highway animation with Three.js
- **Enterprise Authentication** – Clerk SSO with route protection
- **User Profiles** – Comprehensive profile and settings management
- **Dark/Light Themes** – Adaptive theming with smooth transitions
- **Bookmarks System** – Save and organize important chats
- **Subscription Management** – Pricing and subscription tiers
- **Responsive Design** – Optimized for all devices

---

## 🧠 Tech Stack

**Frontend**
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Radix UI Components
- Framer Motion

**Backend**
- Firebase Realtime Database
- Next.js API Routes

**Authentication**
- Clerk (SSO & Session Management)

**AI / ML**
- Google Gemini 1.5 Flash

**Maps & Visualization**
- Google Maps API
- Three.js
- Postprocessing Effects

**UI Components**
- Lottie Animations
- Recharts for data visualization
- React Markdown

---

## 🏗️ Architecture / Workflow

```text
User → Clerk Auth → Dashboard → AI Chat (Gemini) → Firebase Storage → Real-time Sync
                              ↓
                    Maps Integration → 3D Visualizations → Settings Management
```

---

## ⚙️ Installation & Setup

```bash
# Clone the repository
git clone https://github.com/DevRanbir/Harmony.git

# Navigate to project
cd Harmony/harmony

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## 🔐 Environment Variables

Create a `.env.local` file and add:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_secret_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/login
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
NEXT_PUBLIC_CLERK_DOMAIN=https://your-domain.com

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project. firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project. appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google Gemini AI
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

---

## 🧪 Usage

* Step 1: Sign up or log in with Clerk authentication
* Step 2: Access the AI-powered dashboard
* Step 3: Start chatting with Gemini AI assistant
* Step 4: Explore interactive maps and location services
* Step 5: Manage your profile and settings
* Step 6: Experience 3D visualizations and animations

---

## 🎥 Demo

* **Live Demo:** Coming soon on Railway
* **Features:**
  - AI Chat with conversation history
  - Real-time messaging
  - Interactive maps
  - 3D hyperspeed animations
  - Profile management

---

## 📂 Project Structure

```text
harmony/
├── app/                      # Next.js App Router
│   ├── api/                 # API routes (Gemini chat)
│   ├── dashboard/           # Main chat interface
│   ├── map/                 # Interactive maps
│   ├── prices/              # Subscription management
│   ├── profile/             # User profiles
│   ├── settings/            # App configuration
│   ├── login/               # Authentication
│   ├── page.tsx             # Landing page
│   ├── layout.tsx           # Root layout
│   └── not-found.tsx        # 404 page
├── components/              # Reusable components
│   ├── app-sidebar.tsx
│   ├── Hyperspeed.tsx       # 3D visualization
│   ├── Dock.tsx
│   ├── route-guard.tsx
│   └── ui/                  # UI components
├── contexts/                # React Context providers
│   ├── auth-context.tsx
│   ├── bookmarks-context.tsx
│   ├── chat-with-history-provider.tsx
│   ├── theme-context.tsx
│   └── settings-context.tsx
├── hooks/                   # Custom React hooks
├── lib/                     # Utilities & services
│   ├── clerk-config.ts
│   └── utils.ts
├── public/                  # Static assets
├── next.config.ts
├── package.json
└── README.md
```

---

## 🚧 Future Improvements

- [ ] Add video conferencing capabilities
- [ ] Implement file sharing system
- [ ] Create team collaboration features
- [ ] Add voice message support
- [ ] Implement advanced analytics dashboard
- [ ] Add mobile app version
- [ ] Create plugin/extension system
- [ ] Add multi-language support

---

## 👥 Team / Author

* **Name:** Ranbir (DevRanbir)
* **GitHub:** [https://github.com/DevRanbir](https://github.com/DevRanbir)
* **Portfolio:** [https://devranbir.github.io/](https://devranbir.github.io/)

---

## 📜 License

This project is licensed under the MIT License. 

---

## 🔧 Production Deployment

For production deployment on Railway: 

1. Set all environment variables in Railway dashboard
2. Update Clerk dashboard with production URLs
3. Configure allowed origins and redirect URLs
4. Deploy with `npm run build`
5. Monitor logs for any configuration issues

See `PRODUCTION_FIX. md` for detailed deployment guide.

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Clerk for authentication solution
- Google for Gemini AI and Maps API
- Firebase for real-time database
- Vercel for hosting solutions
- Open source community
