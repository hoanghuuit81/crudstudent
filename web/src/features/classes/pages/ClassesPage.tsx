import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { ConfirmDialog } from "../../../components/ConfirmDialog";
import { Pagination } from "../../../components/Pagination";
import { StatusMessage } from "../../../components/StatusMessage";
import { useDebouncedValue } from "../../../hooks/use-debounced-value";
import { getErrorMessage } from "../../../lib/api-client";
import { createClass, deleteClass, getClasses, updateClass } from "../class.api";
import type { ClassInput, ClassItem } from "../class.types";
import { ClassForm } from "../components/ClassForm";

export function ClassesPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryFromUrl = searchParams.get("q") ?? "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const [search, setSearch] = useState(queryFromUrl);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ClassItem | null>(null);
  const [notice, setNotice] = useState("");
  const debouncedSearch = useDebouncedValue(search);

  useEffect(() => {
    if (debouncedSearch === queryFromUrl) return;
    const next = new URLSearchParams(searchParams);
    debouncedSearch ? next.set("q", debouncedSearch) : next.delete("q");
    next.set("page", "1");
    setSearchParams(next, { replace: true });
  }, [debouncedSearch, queryFromUrl, searchParams, setSearchParams]);

  const classesQuery = useQuery({
    queryKey: ["classes", { q: queryFromUrl, page }],
    queryFn: () => getClasses({ q: queryFromUrl, page, limit: 8 })
  });

  const saveMutation = useMutation({
    mutationFn: ({ input, id }: { input: ClassInput; id?: number }) =>
      id ? updateClass(id, input) : createClass(input),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["classes"] });
      setNotice(variables.id ? "Đã cập nhật lớp học" : "Đã thêm lớp học mới");
      setSelectedClass(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteClass,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["classes"] });
      setDeleteTarget(null);
      setNotice("Đã xóa lớp học");
    }
  });

  function changePage(nextPage: number) {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(nextPage));
    setSearchParams(next);
  }

  async function saveClass(input: ClassInput) {
    await saveMutation.mutateAsync({ input, id: selectedClass?.id });
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Danh mục đào tạo</p>
          <h1>Quản lý lớp học</h1>
          <p>Tạo lớp, cập nhật thông tin và theo dõi số lượng sinh viên.</p>
        </div>
      </header>

      {notice && <StatusMessage type="success">{notice}</StatusMessage>}
      {deleteMutation.isError && <StatusMessage type="error">{getErrorMessage(deleteMutation.error)}</StatusMessage>}

      <div className="two-column-layout">
        <section className="card data-card">
          <div className="toolbar">
            <div>
              <p className="eyebrow">Danh sách</p>
              <h2>{classesQuery.data?.meta.total ?? 0} lớp học</h2>
            </div>
            <label className="search-box">
              <span aria-hidden="true">⌕</span>
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm mã hoặc tên lớp..." />
            </label>
          </div>

          {classesQuery.isPending && <div className="empty-state">Đang tải danh sách...</div>}
          {classesQuery.isError && <StatusMessage type="error">{getErrorMessage(classesQuery.error)}</StatusMessage>}
          {classesQuery.data && classesQuery.data.data.length === 0 && <div className="empty-state">Chưa tìm thấy lớp học phù hợp.</div>}

          {classesQuery.data && classesQuery.data.data.length > 0 && (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Lớp học</th><th>Sinh viên</th><th>Mô tả</th><th className="actions-cell">Thao tác</th></tr></thead>
                <tbody>
                  {classesQuery.data.data.map((item) => (
                    <tr key={item.id}>
                      <td><strong>{item.code}</strong><small>{item.name}</small></td>
                      <td><span className="count-badge">{item.studentCount}</span></td>
                      <td className="description-cell">{item.description || "—"}</td>
                      <td className="actions-cell">
                        <button className="icon-button" title="Sửa lớp" onClick={() => { setSelectedClass(item); setNotice(""); }}>✎</button>
                        <button className="icon-button danger-text" title="Xóa lớp" onClick={() => setDeleteTarget(item)}>×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {classesQuery.data && <Pagination meta={classesQuery.data.meta} onChange={changePage} />}
        </section>

        <ClassForm selectedClass={selectedClass} busy={saveMutation.isPending} onSubmit={saveClass} onCancel={() => setSelectedClass(null)} />
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Xóa lớp học?"
        message={deleteTarget ? `Bạn sắp xóa lớp ${deleteTarget.code}. Lớp đang có sinh viên sẽ không thể xóa.` : ""}
        busy={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
      />
    </div>
  );
}
