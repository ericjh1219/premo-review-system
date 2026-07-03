export type CustomerSubmission = {
  id: string;
  name: string;
  phone: string;
  email: string;
  proofImage: string | null;
  luckyDrawEntry: boolean;
  submittedAt: string;
};

function storageKey(businessId: string) {
  return `premo-customer-submissions:${businessId}`;
}

export function loadCustomerSubmissions(businessId: string): CustomerSubmission[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(storageKey(businessId));
    return raw ? (JSON.parse(raw) as CustomerSubmission[]) : [];
  } catch {
    return [];
  }
}

export function saveCustomerSubmission(
  businessId: string,
  submission: Omit<CustomerSubmission, "id" | "submittedAt">
) {
  if (typeof window === "undefined") return;

  const entry: CustomerSubmission = {
    ...submission,
    id: `SUB-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    submittedAt: new Date().toISOString(),
  };

  const submissions = [entry, ...loadCustomerSubmissions(businessId)];
  window.localStorage.setItem(storageKey(businessId), JSON.stringify(submissions));
}
