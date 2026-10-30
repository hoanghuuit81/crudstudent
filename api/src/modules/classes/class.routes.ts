import { Router } from "express";
import { asyncHandler } from "../../common/http/async-handler.js";
import { classController } from "./class.controller.js";

export const classRouter = Router();

classRouter.get("/", asyncHandler(classController.index));
classRouter.post("/", asyncHandler(classController.store));
classRouter.get("/:id", asyncHandler(classController.show));
classRouter.patch("/:id", asyncHandler(classController.update));
classRouter.delete("/:id", asyncHandler(classController.destroy));
