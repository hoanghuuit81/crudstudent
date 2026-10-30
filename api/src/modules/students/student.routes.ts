import { Router } from "express";
import { asyncHandler } from "../../common/http/async-handler.js";
import { studentController } from "./student.controller.js";

export const studentRouter = Router();

studentRouter.get("/", asyncHandler(studentController.index));
studentRouter.post("/", asyncHandler(studentController.store));
studentRouter.get("/:id", asyncHandler(studentController.show));
studentRouter.patch("/:id", asyncHandler(studentController.update));
studentRouter.delete("/:id", asyncHandler(studentController.destroy));
