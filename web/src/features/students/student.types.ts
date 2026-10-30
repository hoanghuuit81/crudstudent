export interface StudentItem {
  id: number;
  student_code: string;
  full_name: string;
  email: string;
  birth_date: string;
  class_id: number;
  classCode: string;
  className: string;
  created_at: string;
  updated_at: string;
}

export interface StudentInput {
  student_code: string;
  full_name: string;
  email: string;
  birth_date: string;
  class_id: number;
}

export interface StudentListParams {
  q?: string;
  classId?: number;
  page?: number;
  limit?: number;
}
