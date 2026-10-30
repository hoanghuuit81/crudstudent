export interface StudentRecord {
  id: number;
  student_code: string;
  full_name: string;
  email: string;
  birth_date: string;
  class_id: number;
  created_at: string;
  updated_at: string;
}

export interface StudentView extends StudentRecord {
  classCode: string;
  className: string;
}

export interface StudentInput {
  student_code: string;
  full_name: string;
  email: string;
  birth_date: string;
  class_id: number;
}

export interface StudentQuery {
  q: string;
  page: number;
  limit: number;
  classId?: number;
}
