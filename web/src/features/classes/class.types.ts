export interface ClassItem {
  id: number;
  code: string;
  name: string;
  description: string | null;
  studentCount: number;
  created_at: string;
  updated_at: string;
}

export interface ClassInput {
  code: string;
  name: string;
  description: string | null;
}

export interface ClassListParams {
  q?: string;
  page?: number;
  limit?: number;
}
