import { z } from "zod";

export const idSchema = z.coerce.number().int().positive("ID phải là số nguyên dương");

export const paginationQuerySchema = z.object({
  q: z.string().trim().max(100, "Từ khóa tối đa 100 ký tự").default(""),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10)
});
