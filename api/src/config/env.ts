import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DB_HOST: z.string().default("localhost"),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_NAME: z.string().default("student_manager"),
  DB_USER: z.string().default("student_app"),
  DB_PASSWORD: z.string().default("student_password"),
  CORS_ORIGIN: z.string().default("http://localhost:5173")
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("Biến môi trường không hợp lệ", result.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = result.data;
