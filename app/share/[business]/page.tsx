import { notFound } from "next/navigation";
import { CustomerSharePage } from "@/components/share-page/customer-share-page";
import { businessExists } from "@/lib/server/business-registry";

// This existence check must run on every request — never cache or
// statically optimize this route, or a business added/removed after the
// last build would 404 (or keep resolving) incorrectly.
export const dynamic = "force-dynamic";

export default async function SharePageRoute({
  params,
}: {
  params: Promise<{ business: string }>;
}) {
  const { business: businessId } = await params;

  if (!(await businessExists(businessId))) {
    notFound();
  }

  return <CustomerSharePage businessId={businessId} />;
}
