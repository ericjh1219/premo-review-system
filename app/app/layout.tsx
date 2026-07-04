import { AuthGuard } from "@/components/auth-guard";
import { SubscriptionGuard } from "@/components/subscription-guard";
import { ImpersonationBanner } from "@/components/impersonation-banner";

export default function BusinessAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <SubscriptionGuard>
        <ImpersonationBanner />
        {children}
      </SubscriptionGuard>
    </AuthGuard>
  );
}
