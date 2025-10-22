# Vercel Deployment Guide

## Environment Variables Setup

### For Local Development
1. Copy `.env.example` to `.env.local`
2. Fill in your actual values
3. **IMPORTANT**: Never commit `.env.local` to Git (it's in .gitignore)

### For Vercel Deployment

#### Step 1: Remove .env.local from Git
If `.env.local` was already committed, remove it:
\`\`\`bash
git rm --cached .env.local
git commit -m "Remove .env.local from tracking"
git push
\`\`\`

#### Step 2: Set Environment Variables in Vercel Dashboard
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

**For Local SQLite (No additional variables needed)**
- `NEXT_PUBLIC_APP_NAME=Test Generation App`
- `NODE_ENV=production`

**For Supabase (if using cloud database)**
- `SUPABASE_NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabasSUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY_ANON_KEY=your_anon_key`
- `SUPABASE_SERVICE_ROLE_KEY=your_service_role_key` (Server-only)

#### Step 3: Redeploy
After setting environment variables:
1. Go to **Deployments**
2. Click the three dots on the latest failed deployment
3. Select **Redeploy**

Or push a new commit to trigger automatic deployment.

## Important Security Notes

- **NEVER commit `.env.local` to Git** - It's already in `.gitignore`
- **NEXT_PUBLIC_* variables are exposed to the browser** - Only use for non-sensitive data
- **Server-only variables** (without NEXT_PUBLIC_) are only available on the server
- **Sensitive data** like API keys should only be set in Vercel dashboard, not in code

## Troubleshooting

### "Unknown environment variable" error
- Ensure the variable is set in Vercel dashboard
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)

### "Sensitive environment variable exposed"
- Remove any hardcoded secrets from code
- Use Vercel dashboard to set sensitive variables
- Ensure `.env.local` is in `.gitignore`

## Current Setup

This app uses **SQLite for local development** and can optionally use **Supabase for cloud deployment**. No environment variables are required for local SQLite to work.
