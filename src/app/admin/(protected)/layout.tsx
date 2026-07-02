import { requireStaff } from "@/lib/auth";
import { getOrgSettings } from "@/lib/data/org-settings";
import { AdminNav } from "@/components/admin/admin-nav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireStaff();
  const { brand } = await getOrgSettings();

  return (
    <div className="flex min-h-dvh bg-ivory">
      <AdminNav email={admin.email} role={admin.role} brand={brand} />
      <main className="flex-1 pb-20 md:pb-0">
        <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
