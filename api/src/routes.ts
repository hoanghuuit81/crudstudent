import { Router } from "express";
import { classRouter } from "./modules/classes/class.routes.js";
import { studentRouter } from "./modules/students/student.routes.js";

export const apiRouter = Router();

apiRouter.use("/classes", classRouter);
apiRouter.use("/students", studentRouter);
