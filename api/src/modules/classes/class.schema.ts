import { z } from "zod";
import { paginationQuerySchema } from "../../common/schemas.js";

const codeSchema = z
  .string()
  .trim()
  .min(2, "Mã lớp phải có ít nhất 2 ký tự")
  .max(20, "Mã lớp tối đa 20 ký tự")
  .regex(/^[A-Za-z0-9_-]+$/, "Mã lớp chỉ gồm chữ, số, dấu gạch ngang hoặc gạch dưới")
  .transform((value) => value.toUpperCase());

export const createClassSchema = z.object({
  code: codeSchema,
  name: z.string().trim().min(2, "Tên lớp phải có ít nhất 2 ký tự").max(150),
  description: z.string().trim().max(1000).nullable().optional()
});

export const updateClassSchema = createClassSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "Cần cung cấp ít nhất một trường để cập nhật"
);

export const classQuerySchema = paginationQuerySchema;
