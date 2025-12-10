import { unstable_cache } from "next/cache";
import { calculateUserStats } from "@/lib/services/stats";

/**
 * Cached user stats with 5-minute revalidation
 */
export const getCachedUserStats = unstable_cache(
  async (userId: string) => {
    return calculateUserStats(userId);
  },
  ["user-stats"],
  {
    revalidate: 300, // 5 minutes
    tags: ["user-stats"],
  }
);

