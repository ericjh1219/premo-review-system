import { Star } from "lucide-react";

export default function BusinessNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-4 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
        <Star className="size-6 fill-current" />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        This share link doesn&apos;t match any business. Double-check the link and try again.
      </p>
    </div>
  );
}
