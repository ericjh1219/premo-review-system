import { AuthGuard } from "@/components/auth-guard";
import { MustChangePasswordGuard } from "@/components/must-change-password-guard";
import { SubscriptionGuard } from "@/components/subscription-guard";
import { ImpersonationBanner } from "@/components/impersonation-banner";

export default function BusinessAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <MustChangePasswordGuard>
        <SubscriptionGuard>
          <ImpersonationBanner />
          {children}
        </SubscriptionGuard>
      </MustChangePasswordGuard>
    </AuthGuard>
  );
}
