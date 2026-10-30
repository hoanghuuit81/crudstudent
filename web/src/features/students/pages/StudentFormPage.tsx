import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { StatusMessage } from "../../../components/StatusMessage";
import { getErrorMessage } from "../../../lib/api-client";
import { getClasses } from "../../classes/class.api";
import { createStudent, getStudent, updateStudent } from "../student.api";
import type { StudentInput } from "../student.types";

const emptyForm: StudentInput = {
  student_code: "",
  full_name: "",
  email: "",
  birth_date: "",
  class_id: 0
};

export function StudentFormPage() {
  const { id } = useParams();
  const studentId = id ? Number(id) : undefined;
  const isEditing = Boolean(studentId);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<StudentInput>(emptyForm);
  const [formError, setFormError] = useState("");

  const studentQuery = useQuery({
    queryKey: ["student", studentId],
    queryFn: () => getStudent(studentId!),
    enabled: isEditing
  });
  const classesQuery = useQuery({
    queryKey: ["classes", "options"],
    queryFn: () => getClasses({ limit: 100 })
  });

  useEffect(() => {
    const student = studentQuery.data?.data;
    if (!student) return;
    setForm({
      student_code: student.student_code,
      full_name: student.full_name,
      email: student.email,
      birth_date: student.birth_date,
      class_id: student.class_id
    });
  }, [studentQuery.data]);

  const saveMutation = useMutation({
    mutationFn: (input: StudentInput) => studentId ? updateStudent(studentId, input) : createStudent(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["students"] }),
        queryClient.invalidateQueries({ queryKey: ["classes"] })
      ]);
      navigate(`/students?${studentId ? "updated" : "created"}=1`);
    }
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    try {
      await saveMutation.mutateAsync(form);
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  if (studentQuery.isPending && isEditing) return <div className="page"><div className="empty-state card">Đang tải hồ sơ...</div></div>;

  return (
    <div className="page narrow-page">
      <header className="page-header">
        <div>
          <Link className="back-link" to="/students">← Quay lại danh sách</Link>
          <p className="eyebrow">Hồ sơ sinh viên</p>
          <h1>{isEditing ? "Cập nhật sinh viên" : "Thêm sinh viên mới"}</h1>
          <p>Điền đầy đủ những trường có dấu sao để lưu hồ sơ.</p>
        </div>
      </header>

      {studentQuery.isError && <StatusMessage type="error">{getErrorMessage(studentQuery.error)}</StatusMessage>}

      <form className="card student-form" onSubmit={handleSubmit}>
        {formError && <StatusMessage type="error">{formError}</StatusMessage>}
        <div className="form-grid">
          <label className="field">
            <span>Mã sinh viên <b>*</b></span>
            <input value={form.student_code} onChange={(event) => setForm({ ...form, student_code: event.target.value })} placeholder="VD: SV0025" maxLength={20} required />
            <small>Mã là duy nhất và sẽ tự chuyển thành chữ hoa.</small>
          </label>
          <label className="field">
            <span>Họ và tên <b>*</b></span>
            <input value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} placeholder="Nguyễn Văn An" maxLength={150} required />
          </label>
          <label className="field">
            <span>Email <b>*</b></span>
            <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="student@example.com" maxLength={190} required />
          </label>
          <label className="field">
            <span>Ngày sinh <b>*</b></span>
            <input type="date" value={form.birth_date} onChange={(event) => setForm({ ...form, birth_date: event.target.value })} required />
          </label>
          <label className="field full-width">
            <span>Lớp học <b>*</b></span>
            <select value={form.class_id || ""} onChange={(event) => setForm({ ...form, class_id: Number(event.target.value) })} required>
              <option value="">Chọn lớp học</option>
              {classesQuery.data?.data.map((item) => <option key={item.id} value={item.id}>{item.code} — {item.name}</option>)}
            </select>
            {classesQuery.data?.data.length === 0 && <small>Hãy tạo lớp học trước khi thêm sinh viên.</small>}
          </label>
        </div>
        <div className="form-actions form-footer">
          <Link className="button secondary" to="/students">Hủy</Link>
          <button className="button primary" disabled={saveMutation.isPending || classesQuery.isPending}>
            {saveMutation.isPending ? "Đang lưu..." : isEditing ? "Lưu thay đổi" : "Tạo sinh viên"}
          </button>
        </div>
      </form>
    </div>
  );
}
