# Test Generation App - Setup Guide

## Prerequisites

Make sure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**

## Installation Steps

### 1. Install Dependencies

Run the following command in your project directory:

\`\`\`bash
npm install
\`\`\`

This will install all required packages including:
- **better-sqlite3** - Local SQLite database
- **Next.js** - React framework
- **jsPDF & html2canvas** - PDF generation
- All UI components and utilities

### 2. Verify Installation

After installation, verify that `better-sqlite3` was installed correctly:

\`\`\`bash
npm list better-sqlite3
\`\`\`

If you see an error about `better-sqlite3` not being installed, try:

\`\`\`bash
npm install --save better-sqlite3
\`\`\`

### 3. Run the Development Server

Start the development server:

\`\`\`bash
npm run dev
\`\`\`

The app will be available at: **http://localhost:3000**

### 4. Create Your First Account

1. Go to http://localhost:3000
2. Click "Create Account"
3. Fill in the registration form:
   - **Full Name**: Your name
   - **Email**: Your email address
   - **Role**: Select "Teacher" or "Student"
   - **Password**: Create a strong password
4. Click "Create Account"

If you get a 500 error, check the following:

## Troubleshooting

### Error: "better-sqlite3 is not installed"

**Solution:**
\`\`\`bash
npm install better-sqlite3
\`\`\`

If that doesn't work, try:
\`\`\`bash
npm install --build-from-source better-sqlite3
\`\`\`

### Error: "Cannot find module 'better-sqlite3'"

**Solution:**
1. Delete `node_modules` folder
2. Delete `package-lock.json`
3. Run \`npm install\` again

### Error: "ENOENT: no such file or directory, open 'data/test-app.db'"

**Solution:**
This error should be automatically fixed by the updated code. The app will create the `data` directory if it doesn't exist. If the error persists:

1. Manually create a `data` folder in your project root
2. Restart the development server

### Error: "Database is locked"

**Solution:**
1. Stop the development server (Ctrl+C)
2. Delete the `data/test-app.db` file
3. Restart the development server

### Port 3000 Already in Use

**Solution:**
\`\`\`bash
npm run dev -- -p 3001
\`\`\`

This will run the app on port 3001 instead.

## Database

The app uses **SQLite** with the following features:
- **Location**: `data/test-app.db` (created automatically)
- **Tables**: Users, Subjects, Chapters, Questions, Tests, Student Attempts, Results
- **No external database needed** - Everything runs locally

## Project Structure

\`\`\`
test-generation-app/
├── app/
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── subjects/       # Subject management
│   │   ├── chapters/       # Chapter management
│   │   ├── questions/      # Question management
│   │   ├── tests/          # Test management
│   │   ├── attempts/       # Student test attempts
│   │   └── results/        # Results calculation
│   ├── teacher/            # Teacher dashboard
│   ├── student/            # Student interface
│   └── page.tsx            # Home page
├── components/
│   ├── auth/               # Login/Register forms
│   ├── teacher/            # Teacher components
│   ├── student/            # Student components
│   └── ui/                 # UI components
├── lib/
│   ├── db.ts              # Database setup
│   └── utils/             # Utility functions
├── data/                   # SQLite database (created at runtime)
└── package.json
\`\`\`

## Features

### Teacher Dashboard
- Create subjects and chapters
- Add questions (MCQ, Short Answer, Essay)
- Create tests from selected chapters
- Set test duration
- View all created tests

### Student Interface
- View available tests
- Attempt tests with countdown timer
- Cannot see answers during test
- Auto-submit when time runs out
- View results and detailed feedback
- Download results as PDF

## Next Steps

1. **Create a Subject**: Go to Teacher Dashboard → Add Subject
2. **Add Chapters**: Click on a subject → Add Chapter
3. **Create Questions**: Click on a chapter → Add Questions
4. **Build a Test**: Go to Tests → Create Test → Select chapters and questions
5. **Share Test**: Students can access tests from their dashboard

## Support

If you encounter any issues:
1. Check the browser console (F12) for error messages
2. Check the terminal where you ran \`npm run dev\` for server errors
3. Ensure all dependencies are installed: \`npm install\`
4. Try clearing the database: Delete \`data/test-app.db\` and restart

---

**Happy Testing!** 🎓
