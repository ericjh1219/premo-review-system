import { CreditCard } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function SubscriptionsPage() {
  return (
    <>
      <PageHeader
        title="Subscriptions"
        description="Manage platform billing and subscription plans"
      />

      <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur-sm">
        <CardContent className="flex flex-col items-center gap-3 p-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <CreditCard className="size-6" />
          </div>
          <p className="font-medium">Subscriptions coming soon</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Plan management and billing for businesses on the platform will live here.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
