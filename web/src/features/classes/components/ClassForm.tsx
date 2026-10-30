import { useEffect, useState, type FormEvent } from "react";
import { getErrorMessage } from "../../../lib/api-client";
import type { ClassInput, ClassItem } from "../class.types";

interface ClassFormProps {
  selectedClass: ClassItem | null;
  busy: boolean;
  onSubmit: (input: ClassInput) => Promise<void>;
  onCancel: () => void;
}

const emptyForm: ClassInput = { code: "", name: "", description: "" };

export function ClassForm({ selectedClass, busy, onSubmit, onCancel }: ClassFormProps) {
  const [form, setForm] = useState<ClassInput>(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(selectedClass ? {
      code: selectedClass.code,
      name: selectedClass.name,
      description: selectedClass.description ?? ""
    } : emptyForm);
    setError("");
  }, [selectedClass]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      await onSubmit({ ...form, description: form.description?.trim() || null });
      if (!selectedClass) setForm(emptyForm);
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    }
  }

  return (
    <form className="card form-card" onSubmit={handleSubmit}>
      <div className="card-heading">
        <div>
          <p className="eyebrow">Biểu mẫu</p>
          <h2>{selectedClass ? "Cập nhật lớp" : "Thêm lớp mới"}</h2>
        </div>
      </div>

      {error && <p className="field-error" role="alert">{error}</p>}

      <label className="field">
        <span>Mã lớp <b>*</b></span>
        <input
          value={form.code}
          onChange={(event) => setForm({ ...form, code: event.target.value })}
          placeholder="VD: CNTT01"
          maxLength={20}
          required
        />
      </label>
      <label className="field">
        <span>Tên lớp <b>*</b></span>
        <input
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          placeholder="Công nghệ thông tin 01"
          maxLength={150}
          required
        />
      </label>
      <label className="field">
        <span>Mô tả</span>
        <textarea
          value={form.description ?? ""}
          onChange={(event) => setForm({ ...form, description: event.target.value })}
          placeholder="Thông tin ngắn về lớp"
          rows={4}
          maxLength={1000}
        />
      </label>
      <div className="form-actions">
        {selectedClass && <button type="button" className="button secondary" onClick={onCancel}>Hủy sửa</button>}
        <button className="button primary" disabled={busy}>
          {busy ? "Đang lưu..." : selectedClass ? "Lưu thay đổi" : "+ Thêm lớp"}
        </button>
      </div>
    </form>
  );
}
