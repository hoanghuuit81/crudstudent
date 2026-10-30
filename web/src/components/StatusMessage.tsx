import type { ReactNode } from "react";

interface StatusMessageProps {
  type?: "success" | "error" | "info";
  children: ReactNode;
}

export function StatusMessage({ type = "info", children }: StatusMessageProps) {
  return <div className={`status-message ${type}`} role={type === "error" ? "alert" : "status"}>{children}</div>;
}
