import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { ConfirmDialog } from "../../../components/ConfirmDialog";
import { Pagination } from "../../../components/Pagination";
import { StatusMessage } from "../../../components/StatusMessage";
import { useDebouncedValue } from "../../../hooks/use-debounced-value";
import { getErrorMessage } from "../../../lib/api-client";
import { getClasses } from "../../classes/class.api";
import { deleteStudent, getStudents } from "../student.api";
import type { StudentItem } from "../student.types";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return `${parts.at(-2)?.[0] ?? ""}${parts.at(-1)?.[0] ?? ""}`.toUpperCase();
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("vi-VN").format(new Date(`${date}T00:00:00`));
}

export function StudentsPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryFromUrl = searchParams.get("q") ?? "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const classId = Number(searchParams.get("classId")) || undefined;
  const [search, setSearch] = useState(queryFromUrl);
  const [deleteTarget, setDeleteTarget] = useState<StudentItem | null>(null);
  const [notice, setNotice] = useState(searchParams.get("created") ? "Đã thêm sinh viên mới" : "");
  const debouncedSearch = useDebouncedValue(search);

  useEffect(() => {
    if (!searchParams.has("created") && !searchParams.has("updated")) return;
    if (searchParams.has("updated")) setNotice("Đã cập nhật thông tin sinh viên");
    const next = new URLSearchParams(searchParams);
    next.delete("created");
    next.delete("updated");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (debouncedSearch === queryFromUrl) return;
    const next = new URLSearchParams(searchParams);
    debouncedSearch ? next.set("q", debouncedSearch) : next.delete("q");
    next.set("page", "1");
    setSearchParams(next, { replace: true });
  }, [debouncedSearch, queryFromUrl, searchParams, setSearchParams]);

  const studentsQuery = useQuery({
    queryKey: ["students", { q: queryFromUrl, classId, page }],
    queryFn: () => getStudents({ q: queryFromUrl, classId, page, limit: 10 })
  });
  const classesQuery = useQuery({
    queryKey: ["classes", "options"],
    queryFn: () => getClasses({ limit: 100 })
  });
  const deleteMutation = useMutation({
    mutationFn: deleteStudent,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["students"] }),
        queryClient.invalidateQueries({ queryKey: ["classes"] })
      ]);
      setDeleteTarget(null);
      setNotice("Đã xóa sinh viên");
    }
  });

  function updateParam(key: string, value?: string) {
    const next = new URLSearchParams(searchParams);
    value ? next.set(key, value) : next.delete(key);
    if (key !== "page") next.set("page", "1");
    setSearchParams(next);
  }

  return (
    <div className="page">
      <header className="page-header with-action">
        <div>
          <p className="eyebrow">Hồ sơ đào tạo</p>
          <h1>Quản lý sinh viên</h1>
          <p>Tìm kiếm, lọc và cập nhật hồ sơ sinh viên trong toàn trường.</p>
        </div>
        <Link className="button primary" to="/students/new">+ Thêm sinh viên</Link>
      </header>

      {notice && <StatusMessage type="success">{notice}</StatusMessage>}
      {deleteMutation.isError && <StatusMessage type="error">{getErrorMessage(deleteMutation.error)}</StatusMessage>}

      <section className="card data-card">
        <div className="toolbar student-toolbar">
          <div>
            <p className="eyebrow">Danh sách</p>
            <h2>{studentsQuery.data?.meta.total ?? 0} sinh viên</h2>
          </div>
          <div className="toolbar-filters">
            <label className="search-box">
              <span aria-hidden="true">⌕</span>
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm mã, tên hoặc email..." />
            </label>
            <select value={classId ?? ""} onChange={(event) => updateParam("classId", event.target.value)} aria-label="Lọc theo lớp">
              <option value="">Tất cả lớp</option>
              {classesQuery.data?.data.map((item) => <option key={item.id} value={item.id}>{item.code}</option>)}
            </select>
          </div>
        </div>

        {studentsQuery.isPending && <div className="empty-state">Đang tải danh sách...</div>}
        {studentsQuery.isError && <StatusMessage type="error">{getErrorMessage(studentsQuery.error)}</StatusMessage>}
        {studentsQuery.data && studentsQuery.data.data.length === 0 && <div className="empty-state">Chưa tìm thấy sinh viên phù hợp.</div>}

        {studentsQuery.data && studentsQuery.data.data.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Sinh viên</th><th>Mã SV</th><th>Lớp</th><th>Ngày sinh</th><th className="actions-cell">Thao tác</th></tr></thead>
              <tbody>
                {studentsQuery.data.data.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="student-cell">
                        <span className="avatar">{initials(item.full_name)}</span>
                        <div><strong>{item.full_name}</strong><small>{item.email}</small></div>
                      </div>
                    </td>
                    <td><span className="code-badge">{item.student_code}</span></td>
                    <td><strong>{item.classCode}</strong><small>{item.className}</small></td>
                    <td>{formatDate(item.birth_date)}</td>
                    <td className="actions-cell">
                      <Link className="icon-button" title="Sửa sinh viên" to={`/students/${item.id}/edit`}>✎</Link>
                      <button className="icon-button danger-text" title="Xóa sinh viên" onClick={() => setDeleteTarget(item)}>×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {studentsQuery.data && <Pagination meta={studentsQuery.data.meta} onChange={(nextPage) => updateParam("page", String(nextPage))} />}
      </section>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Xóa sinh viên?"
        message={deleteTarget ? `Hồ sơ của ${deleteTarget.full_name} sẽ bị xóa khỏi hệ thống.` : ""}
        busy={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
      />
    </div>
  );
}
