import { apiRequest } from "../../lib/api-client";
import type { ItemResponse, ListResponse } from "../../types/api";
import type { StudentInput, StudentItem, StudentListParams } from "./student.types";

export function getStudents(params: StudentListParams = {}): Promise<ListResponse<StudentItem>> {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.classId) search.set("classId", String(params.classId));
  search.set("page", String(params.page ?? 1));
  search.set("limit", String(params.limit ?? 10));
  return apiRequest(`/api/v1/students?${search}`);
}

export function getStudent(id: number): Promise<ItemResponse<StudentItem>> {
  return apiRequest(`/api/v1/students/${id}`);
}

export function createStudent(input: StudentInput): Promise<ItemResponse<StudentItem>> {
  return apiRequest("/api/v1/students", { method: "POST", body: JSON.stringify(input) });
}

export function updateStudent(id: number, input: StudentInput): Promise<ItemResponse<StudentItem>> {
  return apiRequest(`/api/v1/students/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}

export function deleteStudent(id: number): Promise<void> {
  return apiRequest(`/api/v1/students/${id}`, { method: "DELETE" });
}
