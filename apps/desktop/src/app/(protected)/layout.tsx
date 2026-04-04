"use client";

import { AuthProvider } from "../../components/auth_provider";
import { ReportsProvider } from "../../context/reports_context";
import { WorkspaceProvider } from "../../context/workspace_context";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <ReportsProvider>
          {children}
        </ReportsProvider>
      </WorkspaceProvider>
    </AuthProvider>
  );
}
