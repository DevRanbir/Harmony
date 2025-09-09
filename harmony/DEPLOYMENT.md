# Harmony - GitHub Pages Deployment Guide

This is a Next.js application with Clerk authentication configured for static export and GitHub Pages deployment.

## Prerequisites

1. GitHub account
2. Clerk account and application setup
3. Node.js 18+ installed

## Setup Instructions

### 1. Clerk Configuration

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application or use existing one
3. Get your API keys from the dashboard
4. Configure the following settings in Clerk:

**Allowed Origins:**
- `https://yourusername.github.io` (replace with your actual GitHub username)

**Redirect URLs:**
- `https://yourusername.github.io/harmony/login`
- `https://yourusername.github.io/harmony/dashboard`

### 2. GitHub Repository Setup

1. Push your code to a GitHub repository
2. Go to repository Settings → Secrets and Variables → Actions
3. Add the following secrets:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

### 3. GitHub Pages Configuration

1. Go to repository Settings → Pages
2. Source: Deploy from a branch
3. Branch: gh-pages (will be created automatically)
4. Folder: / (root)

### 4. Deployment

The deployment happens automatically when you push to the main/master branch. The GitHub Action will:

1. Install dependencies
2. Build the application for static export
3. Deploy to GitHub Pages

Your application will be available at: `https://yourusername.github.io/harmony`

## Manual Deployment (Alternative)

If you prefer manual deployment:

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## Environment Variables

### Development (.env.local)
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/login
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### Production (GitHub Secrets)
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

## Features

- ✅ Static export compatible
- ✅ Client-side authentication
- ✅ Protected routes
- ✅ Billing integration with Clerk
- ✅ Responsive design
- ✅ GitHub Pages deployment

## Troubleshooting

### Common Issues

1. **404 on protected routes**: Make sure client-side route protection is working
2. **Authentication not working**: Check Clerk domain and redirect URL configuration
3. **Billing not showing**: Verify Clerk billing is enabled in your dashboard

### Build Errors

If you encounter build errors:

1. Check that all server-side code has been converted to client-side
2. Ensure no middleware is being used (disabled for static export)
3. Verify all environment variables are set correctly

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run start
```

## Support

For issues related to:
- **Deployment**: Check GitHub Actions logs
- **Authentication**: Verify Clerk configuration
- **Billing**: Check Clerk billing settings in dashboard
