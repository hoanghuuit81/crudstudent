import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../common/errors/app-error.js";

interface DatabaseError extends Error {
  code?: string;
}

export const notFoundHandler: RequestHandler = (request, response) => {
  response.status(404).json({ message: `Không tìm thấy ${request.method} ${request.originalUrl}` });
};

export const errorHandler: ErrorRequestHandler = (error: DatabaseError, _request, response, _next) => {
  if (error instanceof ZodError) {
    response.status(422).json({
      message: "Dữ liệu không hợp lệ",
      errors: error.flatten().fieldErrors
    });
    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({ message: error.message, details: error.details });
    return;
  }

  if (error.code === "ER_DUP_ENTRY") {
    response.status(409).json({ message: "Mã hoặc email đã tồn tại" });
    return;
  }

  if (error.code === "ER_ROW_IS_REFERENCED_2") {
    response.status(409).json({ message: "Không thể xóa vì dữ liệu này đang được sử dụng" });
    return;
  }

  console.error(error);
  response.status(500).json({ message: "Máy chủ gặp lỗi, vui lòng thử lại" });
};
