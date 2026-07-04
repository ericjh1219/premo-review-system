import { AuthGuard } from "@/components/auth-guard";

export default function BusinessAppLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
