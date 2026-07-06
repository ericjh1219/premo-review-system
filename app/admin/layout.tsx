import { AuthGuard } from "@/components/auth-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireAdmin>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}
