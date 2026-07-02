import { ShieldX } from "lucide-react";
import { signOutAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-ivory px-4">
      <div className="max-w-sm text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-maroon">
          <ShieldX className="h-7 w-7" />
        </span>
        <h1 className="mt-4 text-section-title text-charcoal">
          No organizer access
        </h1>
        <p className="mt-2 text-body text-text-secondary">
          Your account is signed in but is not authorized as an organizer.
          Contact an existing admin to be added.
        </p>
        <form action={signOutAction} className="mt-6">
          <Button size="lg" variant="secondary" className="w-full">
            Sign out
          </Button>
        </form>
      </div>
    </div>
  );
}
