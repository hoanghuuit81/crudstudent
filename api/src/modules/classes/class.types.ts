export interface ClassRecord {
  id: number;
  code: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClassView extends ClassRecord {
  studentCount: number;
}

export interface ClassInput {
  code: string;
  name: string;
  description?: string | null;
}

export interface ClassQuery {
  q: string;
  page: number;
  limit: number;
}
