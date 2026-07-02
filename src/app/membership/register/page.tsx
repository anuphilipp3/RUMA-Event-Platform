import type { Metadata } from "next";
import { getOrgSettings } from "@/lib/data/org-settings";
import { MembershipFlow } from "@/components/membership/membership-flow";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Join RUMA · Membership" };

export default async function MembershipRegisterPage() {
  const settings = await getOrgSettings();
  return <MembershipFlow plans={settings.plans} brand={settings.brand} />;
}
