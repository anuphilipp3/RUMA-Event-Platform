import { requireAdmin } from "@/lib/auth";
import { listStaff } from "@/lib/data/users";
import { UsersManager } from "@/components/admin/users-manager";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const me = await requireAdmin();
  const users = await listStaff();

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <header>
        <h1 className="text-page-title font-bold text-charcoal">Users</h1>
        <p className="text-body text-text-secondary">
          Manage who can access the dashboard and what they can do.
        </p>
      </header>
      <UsersManager users={users} currentUserId={me.id} />
    </div>
  );
}
