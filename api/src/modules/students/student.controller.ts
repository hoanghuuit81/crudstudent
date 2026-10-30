import type { Request, Response } from "express";
import { idSchema } from "../../common/schemas.js";
import { createStudentSchema, studentQuerySchema, updateStudentSchema } from "./student.schema.js";
import { studentService } from "./student.service.js";

export const studentController = {
  async index(request: Request, response: Response) {
    const query = studentQuerySchema.parse(request.query);
    response.json(await studentService.getAll(query));
  },

  async show(request: Request, response: Response) {
    const id = idSchema.parse(request.params.id);
    response.json({ data: await studentService.getById(id) });
  },

  async store(request: Request, response: Response) {
    const input = createStudentSchema.parse(request.body);
    response.status(201).json({ data: await studentService.create(input) });
  },

  async update(request: Request, response: Response) {
    const id = idSchema.parse(request.params.id);
    const input = updateStudentSchema.parse(request.body);
    response.json({ data: await studentService.update(id, input) });
  },

  async destroy(request: Request, response: Response) {
    const id = idSchema.parse(request.params.id);
    await studentService.remove(id);
    response.status(204).send();
  }
};
