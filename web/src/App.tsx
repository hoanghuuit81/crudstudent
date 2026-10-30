import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ClassesPage } from "./features/classes/pages/ClassesPage";
import { StudentFormPage } from "./features/students/pages/StudentFormPage";
import { StudentsPage } from "./features/students/pages/StudentsPage";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/students" replace />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="students/new" element={<StudentFormPage />} />
        <Route path="students/:id/edit" element={<StudentFormPage />} />
        <Route path="classes" element={<ClassesPage />} />
        <Route path="*" element={<Navigate to="/students" replace />} />
      </Route>
    </Routes>
  );
}
