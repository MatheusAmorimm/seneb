"use client";

import { AuthProvider } from "../../components/auth_provider";
import { ReportsProvider } from "../../context/reports_context";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ReportsProvider>
        {children}
      </ReportsProvider>
    </AuthProvider>
  );
}
