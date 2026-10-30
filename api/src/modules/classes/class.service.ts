import { AppError } from "../../common/errors/app-error.js";
import { createPaginationMeta } from "../../common/pagination.js";
import { classRepository } from "./class.repository.js";
import type { ClassInput, ClassQuery } from "./class.types.js";

export const classService = {
  async getAll(query: ClassQuery) {
    const result = await classRepository.findAll(query);
    return {
      data: result.items,
      meta: createPaginationMeta(query, result.total)
    };
  },

  async getById(id: number) {
    const item = await classRepository.findById(id);
    if (!item) throw new AppError("Không tìm thấy lớp học", 404);
    return item;
  },

  async create(input: ClassInput) {
    const id = await classRepository.create(input);
    return this.getById(id);
  },

  async update(id: number, input: Partial<ClassInput>) {
    await this.getById(id);
    await classRepository.update(id, input);
    return this.getById(id);
  },

  async remove(id: number) {
    const item = await this.getById(id);
    if (item.studentCount > 0) {
      throw new AppError("Không thể xóa lớp đang có sinh viên", 409);
    }
    await classRepository.remove(id);
  }
};
