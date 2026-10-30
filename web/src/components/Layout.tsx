import { NavLink, Outlet } from "react-router-dom";

export function Layout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">SH</span>
          <div>
            <strong>Student Hub</strong>
            <small>Quản lý đào tạo</small>
          </div>
        </div>
        <nav className="main-nav">
          <NavLink to="/students" className={({ isActive }) => isActive ? "active" : ""}>
            <span>👨‍🎓</span> Sinh viên
          </NavLink>
          <NavLink to="/classes" className={({ isActive }) => isActive ? "active" : ""}>
            <span>🏫</span> Lớp học
          </NavLink>
        </nav>
        <p className="sidebar-note">React · Node.js · MySQL</p>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
