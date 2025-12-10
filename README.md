# ExamSim

AI-powered exam generation platform that turns course materials into practice exams.

## Features

- 🤖 **AI-Powered Exam Generation** - Upload PDFs, DOCX files, or paste text to generate custom exams
- 📊 **Performance Analytics** - Track your progress, identify weak areas, and monitor trends
- ⏱️ **Timer Support** - Practice with time limits, timer persists across page refreshes
- 🎯 **Multiple Question Types** - Multiple choice, true/false, fill-in-the-blank, select all that apply
- 📈 **Progress Tracking** - View your exam history, scores, and study streaks

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js v5
- **AI**: Google Gemini 2.5 Flash
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, Shadcn UI

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (or Neon, Supabase, etc.)
- Google API key for Gemini

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd examsim
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Required environment variables:
```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id (optional)
GOOGLE_CLIENT_SECRET=your-google-client-secret (optional)
GOOGLE_API_KEY=your-google-api-key (optional)
```

4. Run database migrations:
```bash
npm run db:generate
npm run db:migrate
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
examsim/
├── app/                    # Next.js app router pages
│   ├── (auth)/            # Auth routes (login, register)
│   ├── dashboard/         # Dashboard pages
│   ├── actions/           # Server actions
│   └── api/               # API routes
├── components/            # React components
│   ├── dashboard/        # Dashboard-specific components
│   └── ui/               # Reusable UI components
├── db/                    # Database schema and connection
├── lib/                   # Utility functions and services
│   ├── services/         # Business logic services
│   └── utils/            # Utility functions
└── types/                 # TypeScript type definitions
```

## Key Improvements

See [IMPROVEMENTS.md](./IMPROVEMENTS.md) for a detailed list of performance, security, and code quality improvements.

### Highlights:
- ✅ Database indexes for faster queries
- ✅ Optimized queries (only fetch user's data)
- ✅ File upload validation
- ✅ Environment variable validation
- ✅ TypeScript type safety improvements
- ✅ Caching layer for stats
- ✅ Error boundaries
- ✅ Timer persistence

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Railway
- Render
- AWS Amplify
- DigitalOcean App Platform

Make sure to:
- Set all required environment variables
- Run database migrations after deployment
- Configure database connection pooling if needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT
