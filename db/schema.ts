import { pgTable, text, serial, timestamp, jsonb, integer, boolean, primaryKey, index } from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters";

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  password: text("password"), // Added for credentials provider
  // Onboarding fields
  username: text("username"),
  grade: text("grade"),
  subjects: jsonb("subjects"), // Storing array of subjects
  hasOnboarded: boolean("has_onboarded").default(false),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  })
);

export const exams = pgTable("exams", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }), // Linked to user
  title: text("title").notNull(),
  topic: text("topic").notNull(),
  difficulty: text("difficulty").notNull(), // 'Easy', 'Medium', 'Hard'
  timeLimit: integer("time_limit"), // Duration in minutes
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("exams_user_id_idx").on(table.userId),
  createdAtIdx: index("exams_created_at_idx").on(table.createdAt),
}));

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  examId: integer("exam_id").references(() => exams.id, { onDelete: "cascade" }).notNull(),
  questionText: text("question_text").notNull(),
  options: jsonb("options").notNull(), // Array of strings
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation"),
  hint: text("hint"), // Optional hint for the question
  type: text("type").notNull(), // 'Multiple Choice', 'True/False', etc.
  subtopic: text("subtopic"), // e.g., "Biology > Mitosis"
}, (table) => ({
  examIdIdx: index("questions_exam_id_idx").on(table.examId),
  subtopicIdx: index("questions_subtopic_idx").on(table.subtopic),
}));

export const examResults = pgTable("exam_results", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }), // Linked to user
  examId: integer("exam_id").references(() => exams.id, { onDelete: "cascade" }).notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  answers: jsonb("answers").notNull(), // Record<questionId, selectedAnswer>
}, (table) => ({
  userIdIdx: index("exam_results_user_id_idx").on(table.userId),
  examIdIdx: index("exam_results_exam_id_idx").on(table.examId),
  completedAtIdx: index("exam_results_completed_at_idx").on(table.completedAt),
}));

export const rateLimits = pgTable("rate_limits", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  action: text("action").notNull(), // e.g., 'generate_exam'
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("rate_limits_user_id_idx").on(table.userId),
  timestampIdx: index("rate_limits_timestamp_idx").on(table.timestamp),
}));

// Flashcard-related tables
export const flashcardDecks = pgTable("flashcard_decks", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  topic: text("topic"),
  cardCount: integer("card_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("flashcard_decks_user_id_idx").on(table.userId),
  createdAtIdx: index("flashcard_decks_created_at_idx").on(table.createdAt),
}));

export const flashcards = pgTable("flashcards", {
  id: serial("id").primaryKey(),
  deckId: integer("deck_id").references(() => flashcardDecks.id, { onDelete: "cascade" }).notNull(),
  front: text("front").notNull(), // Question/term side
  back: text("back").notNull(), // Answer/definition side
  hint: text("hint"), // Optional hint
  order: integer("order").default(0), // Card order in deck
  // Spaced repetition fields
  easeFactor: integer("ease_factor").default(250), // Stored as 250 = 2.5
  interval: integer("interval").default(0), // Days until next review
  repetitions: integer("repetitions").default(0), // Number of successful reviews
  nextReviewAt: timestamp("next_review_at"),
  lastReviewedAt: timestamp("last_reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  deckIdIdx: index("flashcards_deck_id_idx").on(table.deckId),
  nextReviewIdx: index("flashcards_next_review_idx").on(table.nextReviewAt),
}));

export const flashcardProgress = pgTable("flashcard_progress", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  deckId: integer("deck_id").references(() => flashcardDecks.id, { onDelete: "cascade" }).notNull(),
  cardId: integer("card_id").references(() => flashcards.id, { onDelete: "cascade" }).notNull(),
  rating: integer("rating").notNull(), // 1-4 (again, hard, good, easy)
  reviewedAt: timestamp("reviewed_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("flashcard_progress_user_id_idx").on(table.userId),
  deckIdIdx: index("flashcard_progress_deck_id_idx").on(table.deckId),
  cardIdIdx: index("flashcard_progress_card_id_idx").on(table.cardId),
}));
