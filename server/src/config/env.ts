type Env = {
  port: number;
  db: {
    host: string;
    port: number;
    user: string;
    password: string;
    name: string;
  };
  jwtSecret: string;
};

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
};

const parseNumber = (value: string, fallback: number): number => {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return fallback;
  }
  return parsed;
};

const isTest = process.env.NODE_ENV === "test";

const env: Env = {
  port: parseNumber(process.env.PORT ?? "3000", 3000),
  db: {
    host: isTest ? process.env.DB_HOST ?? "localhost" : requireEnv("DB_HOST"),
    port: parseNumber(process.env.DB_PORT ?? "5432", 5432),
    user: isTest ? process.env.DB_USER ?? "postgres" : requireEnv("DB_USER"),
    password: isTest ? process.env.DB_PASSWORD ?? "password" : requireEnv("DB_PASSWORD"),
    name: isTest ? process.env.DB_NAME ?? "youflow_test" : requireEnv("DB_NAME"),
  },
  jwtSecret: isTest ? process.env.JWT_SECRET ?? "test_secret" : requireEnv("JWT_SECRET"),
};

export default env;
