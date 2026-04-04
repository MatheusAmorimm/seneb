"use client";

import { AuthProvider } from "../../components/auth_provider";
import { ReportsProvider } from "../../context/reports_context";
import { WorkspaceProvider } from "../../context/workspace_context";
import { NotificationProvider } from "../../context/notification_context";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <NotificationProvider>
          <ReportsProvider>
            {children}
          </ReportsProvider>
        </NotificationProvider>
      </WorkspaceProvider>
    </AuthProvider>
  );
}
