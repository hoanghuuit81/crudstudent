import type { Request, Response } from "express";
import { idSchema } from "../../common/schemas.js";
import { classService } from "./class.service.js";
import { classQuerySchema, createClassSchema, updateClassSchema } from "./class.schema.js";

export const classController = {
  async index(request: Request, response: Response) {
    const query = classQuerySchema.parse(request.query);
    response.json(await classService.getAll(query));
  },

  async show(request: Request, response: Response) {
    const id = idSchema.parse(request.params.id);
    response.json({ data: await classService.getById(id) });
  },

  async store(request: Request, response: Response) {
    const input = createClassSchema.parse(request.body);
    response.status(201).json({ data: await classService.create(input) });
  },

  async update(request: Request, response: Response) {
    const id = idSchema.parse(request.params.id);
    const input = updateClassSchema.parse(request.body);
    response.json({ data: await classService.update(id, input) });
  },

  async destroy(request: Request, response: Response) {
    const id = idSchema.parse(request.params.id);
    await classService.remove(id);
    response.status(204).send();
  }
};
