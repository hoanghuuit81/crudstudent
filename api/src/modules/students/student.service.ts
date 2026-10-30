import { AppError } from "../../common/errors/app-error.js";
import { createPaginationMeta } from "../../common/pagination.js";
import { classRepository } from "../classes/class.repository.js";
import { studentRepository } from "./student.repository.js";
import type { StudentInput, StudentQuery } from "./student.types.js";

async function ensureClassExists(classId: number): Promise<void> {
  const classItem = await classRepository.findById(classId);
  if (!classItem) throw new AppError("Lớp học đã chọn không tồn tại", 422);
}

export const studentService = {
  async getAll(query: StudentQuery) {
    const result = await studentRepository.findAll(query);
    return {
      data: result.items,
      meta: createPaginationMeta(query, result.total)
    };
  },

  async getById(id: number) {
    const item = await studentRepository.findById(id);
    if (!item) throw new AppError("Không tìm thấy sinh viên", 404);
    return item;
  },

  async create(input: StudentInput) {
    await ensureClassExists(input.class_id);
    const id = await studentRepository.create(input);
    return this.getById(id);
  },

  async update(id: number, input: Partial<StudentInput>) {
    await this.getById(id);
    if (input.class_id !== undefined) await ensureClassExists(input.class_id);
    await studentRepository.update(id, input);
    return this.getById(id);
  },

  async remove(id: number) {
    await this.getById(id);
    await studentRepository.remove(id);
  }
};
