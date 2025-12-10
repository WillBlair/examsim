import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  NEXTAUTH_SECRET: z.string().min(1).default("development-secret-change-in-production"),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL").default("http://localhost:3000"),
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
  GOOGLE_API_KEY: z.string().min(1).optional(),
});

export type Env = z.infer<typeof envSchema>;

function getEnv(): Env {
  try {
    return envSchema.parse({
      ...process.env,
      // Provide defaults for development
      NODE_ENV: process.env.NODE_ENV || "development",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join("\n");
      throw new Error(`Invalid environment variables:\n${missingVars}\n\nPlease check your .env.local file.`);
    }
    throw error;
  }
}

export const env = getEnv();

