import { db } from "@/db";
import { exams, examResults } from "@/db/schema";
import { eq, desc, lt, and } from "drizzle-orm";

interface PaginationResult<T> {
  data: T[];
  nextCursor: number | null;
  hasMore: boolean;
}

export async function getPaginatedExams(
  userId: string,
  cursor?: number,
  limit = 20
): Promise<PaginationResult<typeof exams.$inferSelect>> {
  const conditions = cursor
    ? and(eq(exams.userId, userId), lt(exams.id, cursor))
    : eq(exams.userId, userId);

  const results = await db
    .select()
    .from(exams)
    .where(conditions)
    .orderBy(desc(exams.createdAt))
    .limit(limit + 1);

  const hasMore = results.length > limit;

  return {
    data: results.slice(0, limit),
    nextCursor: hasMore ? results[limit - 1].id : null,
    hasMore,
  };
}

export async function getPaginatedExamResults(
  userId: string,
  cursor?: number,
  limit = 20
): Promise<PaginationResult<typeof examResults.$inferSelect>> {
  const conditions = cursor
    ? and(eq(examResults.userId, userId), lt(examResults.id, cursor))
    : eq(examResults.userId, userId);

  const results = await db
    .select()
    .from(examResults)
    .where(conditions)
    .orderBy(desc(examResults.completedAt))
    .limit(limit + 1);

  const hasMore = results.length > limit;

  return {
    data: results.slice(0, limit),
    nextCursor: hasMore ? results[limit - 1].id : null,
    hasMore,
  };
}

