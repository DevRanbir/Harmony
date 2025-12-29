# Production Deployment Fix for Clerk Authentication

## Problem
The application is trying to connect to `localhost:8080` in production instead of the correct production URL, causing authentication failures.

## Root Cause
This is a common Clerk configuration issue where environment variables are not properly set for production, causing Clerk to default to localhost URLs.

## Solution Steps

### 1. Set Correct Environment Variables in Production

In your Railway deployment, ensure these environment variables are set:

```bash
# Required Clerk Variables
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_or_pk_live_your_key_here
CLERK_SECRET_KEY=sk_test_or_sk_live_your_secret_here

# Clerk URL Configuration (CRITICAL for production)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/login
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/dashboard

# Production Domain (Replace with your actual Railway domain)
NEXT_PUBLIC_CLERK_DOMAIN=https://harmony-production-ready.up.railway.app
```

### 2. Clerk Dashboard Configuration

In your Clerk dashboard (https://dashboard.clerk.com):

1. Go to your application settings
2. Update the **Allowed Origins** to include:
   - `https://harmony-production-ready.up.railway.app`
   - `https://*.up.railway.app` (if you want to allow all Railway subdomains)

3. Update **Redirect URLs** to include:
   - `https://harmony-production-ready.up.railway.app/login/sso-callback`
   - `https://harmony-production-ready.up.railway.app/dashboard`

4. Update **API endpoints** in Clerk to use your production domain

### 3. Railway Deployment Settings

1. In Railway dashboard, go to your project settings
2. Set environment variables listed above
3. Ensure the custom domain is properly configured
4. Redeploy the application after setting variables

### 4. Verification Steps

After deployment:
1. Check browser network tab for any localhost references
2. Verify Clerk authentication flows work without errors
3. Test sign in/sign up processes
4. Check that redirects go to production URLs

## Quick Fix Commands

If you have Railway CLI installed:

```bash
# Set environment variables via Railway CLI
railway variables set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
railway variables set CLERK_SECRET_KEY=your_secret_key
railway variables set NEXT_PUBLIC_CLERK_DOMAIN=https://harmony-production-ready.up.railway.app
railway variables set NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
railway variables set NEXT_PUBLIC_CLERK_SIGN_UP_URL=/login
railway variables set NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
railway variables set NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Redeploy
railway up
```

## Common Issues

1. **Still seeing localhost errors**: Clear browser cache and cookies
2. **CORS errors**: Update Clerk dashboard allowed origins
3. **Redirect loops**: Check that redirect URLs match exactly
4. **SSO issues**: Ensure SSO callback URLs are whitelisted in Clerk

## Files Modified

- `app/layout.tsx` - Updated Clerk configuration
- `lib/clerk-config.ts` - Added URL configuration utilities
- `.env.example` - Added all required environment variables

The key fix is ensuring all environment variables are set correctly in production and that Clerk dashboard is configured with the correct production URLs.