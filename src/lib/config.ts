export type Environment = {
  NODE_ENV: "development" | "production";
  DATABASE_URL: string;
  JWT_SECRET: string;
  NEXTAUTH_SECRET: string;
  RESEND_API_KEY: string;
  CLIENT_HOST: string;
  OPENAI_API_KEY: string;
  UPLOADTHING_TOKEN: string;
};

export const getEnv = <K extends keyof Environment>(
  key: K,
  fallback?: Environment[K],
): Environment[K] => {
  const value = process.env[key] as Environment[K] | undefined;

  if (value === undefined || value === null || value === "") {
    if (fallback) {
      return fallback;
    }
    throw new Error(`Missing environment variable: ${key}.`);
  }

  return value;
};

export default { getEnv };
