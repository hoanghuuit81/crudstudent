import { z } from "zod";
import { paginationQuerySchema } from "../../common/schemas.js";

const studentCodeSchema = z
  .string()
  .trim()
  .min(2, "Mã sinh viên phải có ít nhất 2 ký tự")
  .max(20, "Mã sinh viên tối đa 20 ký tự")
  .regex(/^[A-Za-z0-9_-]+$/, "Mã sinh viên chỉ gồm chữ, số, dấu gạch ngang hoặc gạch dưới")
  .transform((value) => value.toUpperCase());

const studentFields = {
  student_code: studentCodeSchema,
  full_name: z.string().trim().min(2, "Họ tên phải có ít nhất 2 ký tự").max(150),
  email: z.email("Email không đúng định dạng").max(190).transform((value) => value.toLowerCase()),
  birth_date: z.iso.date("Ngày sinh không đúng định dạng YYYY-MM-DD"),
  class_id: z.coerce.number().int().positive("Vui lòng chọn lớp")
};

export const createStudentSchema = z.object(studentFields);
export const updateStudentSchema = z.object(studentFields).partial().refine(
  (value) => Object.keys(value).length > 0,
  "Cần cung cấp ít nhất một trường để cập nhật"
);

export const studentQuerySchema = paginationQuerySchema.extend({
  classId: z.preprocess(
    (value) => (value === "" || value === undefined ? undefined : value),
    z.coerce.number().int().positive().optional()
  )
});
