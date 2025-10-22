# Database Setup Guide

## Current Setup: SQLite (Local)

Your app uses **SQLite with better-sqlite3** for local development and storage.

### How It Works:
- Database file: `data/test-app.db` (created automatically)
- No environment variables needed for local SQLite
- Perfect for development and testing
- Data persists between app restarts

### Database Tables:
1. **users** - Teacher and student accounts
2. **subjects** - Course subjects created by teachers
3. **chapters** - Chapters within subjects
4. **questions** - Questions with correct answers
5. **options** - MCQ options for questions
6. **tests** - Tests created by teachers
7. **test_questions** - Questions included in each test
8. **student_attempts** - Student test submissions
9. **student_answers** - Individual student answers

---

## Option 1: Continue with Local SQLite (Recommended for Development)

### Setup:
1. No configuration needed
2. Run `npm run dev`
3. App automatically creates `data/test-app.db`

### Advantages:
- ✅ No setup required
- ✅ Fast for development
- ✅ No external dependencies
- ✅ Data stored locally

### Disadvantages:
- ❌ Not suitable for production with multiple servers
- ❌ No cloud backup
- ❌ Limited to single machine

---

## Option 2: Migrate to Supabase (Cloud PostgreSQL)

### Why Supabase?
- Cloud-hosted PostgreSQL database
- Built-in authentication
- Real-time capabilities
- Automatic backups
- Scalable for production

### Setup Steps:

#### 1. Create Supabase Project
- Go to [supabase.com](https://supabase.com)
- Click "New Project"
- Fill in project details
- Wait for project to be created

#### 2. Get Your Credentials
From Supabase dashboard:
- Project URL → `SUPABASE_NEXT_PUBLIC_SUPABASE_URL`
- AnoSUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY_ANON_KEY`
- Service Role Key → `SUPABASE_SERVICE_ROLE_KEY`

#### 3. Update `.env.local`
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
DATABASE_URL=postgresql://postgres:password@host:5432/postgres
\`\`\`

#### 4. Run Database Migration
\`\`\`bash
npm run migrate
\`\`\`

---

## Option 3: Use PostgreSQL (Self-Hosted or Cloud)

### Connection String Format:
\`\`\`
postgresql://username:password@host:port/database_name
\`\`\`

### Add to `.env.local`:
\`\`\`env
DATABASE_URL=postgresql://user:password@localhost:5432/test_app
\`\`\`

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | No (SQLite) | PostgreSQL connection string |
| `NEXT_PUBLIC_SUPABASE_URL` | No | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Supabase service role key |
| `NODE_ENV` | No | development/production |
| `NEXT_PUBLIC_APP_NAME` | No | App display name |

---

## How to Use Environment Variables in Code

### Server-Side (API Routes, Server Components):
\`\`\`typescript
const dbUrl = process.env.DATABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
\`\`\`

### Client-Side (React Components):
\`\`\`typescript
// Must start with NEXT_PUBLIC_
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const appName = process.env.NEXT_PUBLIC_APP_NAME
\`\`\`

---

## Troubleshooting

### "Cannot find module 'better-sqlite3'"
\`\`\`bash
npm install better-sqlite3
\`\`\`

### "Database file not found"
- App automatically creates `data/test-app.db`
- Check if `data/` folder exists
- Ensure write permissions in project directory

### Environment variables not loading
1. Restart dev server: `npm run dev`
2. Check `.env.local` file exists in root directory
3. Verify variable names (case-sensitive)
4. For client-side, must start with `NEXT_PUBLIC_`

---

## Next Steps

1. **For Development**: Keep using local SQLite (no setup needed)
2. **For Production**: Set up Supabase or PostgreSQL
3. **For Deployment**: Add environment variables in Vercel/hosting platform settings

Need help migrating to a cloud database? Let me know!
