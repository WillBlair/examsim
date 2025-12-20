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

// Cache the parsed env to avoid re-parsing on every access
let cachedEnv: Env | null = null;

function getEnv(): Env {
  // Skip validation during Next.js build phase
  // The build collects page data which imports db modules but doesn't need real DB connection
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return {
      DATABASE_URL: "postgresql://placeholder:placeholder@placeholder:5432/placeholder",
      NODE_ENV: "production",
      NEXTAUTH_SECRET: "build-time-placeholder",
      NEXTAUTH_URL: "http://localhost:3000",
      GOOGLE_CLIENT_ID: undefined,
      GOOGLE_CLIENT_SECRET: undefined,
      GOOGLE_API_KEY: undefined,
    } as Env;
  }

  if (cachedEnv) {
    return cachedEnv;
  }

  try {
    cachedEnv = envSchema.parse({
      ...process.env,
      // Provide defaults for development
      NODE_ENV: process.env.NODE_ENV || "development",
    });
    return cachedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join("\n");
      throw new Error(`Invalid environment variables:\n${missingVars}\n\nPlease check your .env.local file.`);
    }
    throw error;
  }
}

// Use a getter to lazily evaluate env vars at runtime
export const env: Env = new Proxy({} as Env, {
  get(_target, prop: string) {
    const envVars = getEnv();
    return envVars[prop as keyof Env];
  },
});

