import { requireAdmin } from "@/lib/auth";
import { getOrgSettings } from "@/lib/data/org-settings";
import { OrgSettingsEditor } from "@/components/admin/org-settings-editor";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireAdmin();
  const settings = await getOrgSettings();

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <header>
        <h1 className="text-page-title font-bold text-charcoal">Settings</h1>
        <p className="text-body text-text-secondary">
          Association payment details and membership fees.
        </p>
      </header>
      <OrgSettingsEditor settings={settings} />
    </div>
  );
}
