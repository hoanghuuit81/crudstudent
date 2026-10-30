import { apiRequest } from "../../lib/api-client";
import type { ItemResponse, ListResponse } from "../../types/api";
import type { ClassInput, ClassItem, ClassListParams } from "./class.types";

export function getClasses(params: ClassListParams = {}): Promise<ListResponse<ClassItem>> {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  search.set("page", String(params.page ?? 1));
  search.set("limit", String(params.limit ?? 10));
  return apiRequest(`/api/v1/classes?${search}`);
}

export function createClass(input: ClassInput): Promise<ItemResponse<ClassItem>> {
  return apiRequest("/api/v1/classes", { method: "POST", body: JSON.stringify(input) });
}

export function updateClass(id: number, input: ClassInput): Promise<ItemResponse<ClassItem>> {
  return apiRequest(`/api/v1/classes/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}

export function deleteClass(id: number): Promise<void> {
  return apiRequest(`/api/v1/classes/${id}`, { method: "DELETE" });
}
