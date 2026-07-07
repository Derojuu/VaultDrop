import { z } from "zod";

/**
 * Runtime environment-variable validation.
 *
 * Server variables are validated lazily (only when `env` is accessed on the
 * server) so client bundles never try to read them. Public variables must be
 * prefixed with `NEXT_PUBLIC_` and are safe to reference anywhere.
 */

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_FLARE_NETWORK: z
    .enum(["coston2", "songbird", "flare"])
    .default("coston2"),
});

const serverSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  // Postgres (Supabase). Either var works; the db client prefers DATABASE_URL.
  // Optional so the app still boots without a DB; the API returns a clear
  // error at request time if neither is set.
  DATABASE_URL: z.string().optional(),
  POSTGRES_URL: z.string().optional(),
  FLARE_RPC_URL: z.string().url().optional(),
  // Which enclave backs key custody. "simulated" runs in-process (default, and
  // what the hosted demo uses); "coston2" targets the real Flare FCC extension.
  ENCLAVE_MODE: z.enum(["simulated", "coston2"]).default("simulated"),
  // Only needed when ENCLAVE_MODE=coston2 — the FCE ext-proxy endpoint.
  FCE_PROXY_URL: z.string().url().optional(),
});

/** Only `NEXT_PUBLIC_*` vars are statically inlined by Next, so list them explicitly. */
const clientEnv = {
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_FLARE_NETWORK: process.env.NEXT_PUBLIC_FLARE_NETWORK,
};

function formatErrors(error: z.ZodError) {
  return error.issues
    .map((issue) => `  • ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
}

function parse<T extends z.ZodTypeAny>(schema: T, input: unknown): z.infer<T> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new Error(
      `❌ Invalid environment variables:\n${formatErrors(result.error)}`,
    );
  }
  return result.data;
}

export const clientEnvVars = parse(clientSchema, clientEnv);

/**
 * Server env is a lazy getter so importing this module on the client is safe.
 * Access via `serverEnv()` inside server components, route handlers, actions.
 */
let cachedServerEnv: z.infer<typeof serverSchema> | null = null;
export function serverEnv() {
  if (typeof window !== "undefined") {
    throw new Error("serverEnv() must not be called on the client.");
  }
  cachedServerEnv ??= parse(serverSchema, process.env);
  return cachedServerEnv;
}

/** Convenience: the public env, importable anywhere. */
export const env = clientEnvVars;
