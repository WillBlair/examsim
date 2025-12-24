# ExamSim

AI-powered exam generation platform that converts course materials into practice exams and flashcards.

## Overview

ExamSim allows users to upload course materials such as PDFs, documents, or raw text. The application uses AI to parse this content and generate practice exams and flashcards, focusing on active recall and timed practice sessions. It includes features for tracking performance, monitoring study progress, and identifying areas for improvement.

## Key Features

### Content Generation
- **Parsing**: detailed extraction of concepts from uploaded PDFs, Word documents, and text.
- **Exam Generation**: Supports multiple question types including Multiple Choice, True/False, Fill-in-the-Blank, and Select All.
- **Flashcards**: Automated creation of flashcard decks from source materials.

### Practice Tools
- **Exam Simulation**: Timed exam mode to replicate testing conditions.
- **Practice Mode**: Immediate feedback with detailed explanations for each question.
- **State Persistence**: Timer and exam state are saved locally to prevent data loss on refresh.

### Analytics
- **Performance Tracking**: Detailed scoring and historical data visualization.
- **Topic Analysis**: Identification of strong and weak subtopics based on exam performance.
- **Activity Tracking**: Monitoring of daily study activity and streaks.

### Technical Features
- **Database Optimization**: Indexed queries for efficient data retrieval.
- **Caching**: Implemented caching for user statistics to improve dashboard performance.
- **Validation**: Strict type safety and validation for file uploads and environment configuration.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (via Neon)
- **ORM**: Drizzle ORM
- **AI**: Google Gemini 2.5 Flash (via Vercel AI SDK)
- **Styling**: Tailwind CSS, Shadcn UI
- **Auth**: NextAuth.js v5

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/WillBlair/examsim.git
   cd examsim
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Configure `.env.local` with the following:
   ```env
   DATABASE_URL=postgresql://user:password@host:port/db
   NEXTAUTH_SECRET=your_secret_key
   NEXTAUTH_URL=http://localhost:3000
   GOOGLE_API_KEY=your_gemini_api_key
   ```
   Refer to `lib/env.ts` for all validated variables.

4. **Initialize the database**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

5. **Run the application**
   ```bash
   npm run dev
   ```
   The application will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
├── app/                  # Next.js App Router root
│   ├── (auth)/           # Authentication routes
│   ├── dashboard/        # Main user dashboard & features
│   ├── api/              # API endpoints
│   └── actions/          # Server Actions
├── components/           # React components
│   ├── dashboard/        # Dashboard-specific components
│   └── ui/               # Reusable UI primitives
├── db/                   # Drizzle schema & migrations
├── lib/                  # Shared utilities
│   ├── services/         # Business logic
│   ├── utils/            # Helper functions
│   └── env.ts            # Environment validation
└── public/               # Static assets
```

## Recent Improvements

- **Database Indexing**: Added indexes on `userId` columns to improve query performance.
- **Service Layer**: Separated business logic from UI components.
- **Error Handling**: Implemented error boundaries for graceful failure handling.

See [IMPROVEMENTS.md](./IMPROVEMENTS.md) for a detailed changelog.

## Contributing

Contributions are welcome. Please submit a Pull Request.

## License

MIT
