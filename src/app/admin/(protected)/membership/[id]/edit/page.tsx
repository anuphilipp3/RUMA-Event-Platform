import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireCommittee } from "@/lib/auth";
import { getFamilyDetail } from "@/lib/data/membership-admin";
import { FamilyEditForm } from "@/components/admin/family-edit-form";
import type { MembershipInput } from "@/lib/domain/membership";

export const dynamic = "force-dynamic";

export default async function EditFamilyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireCommittee();
  const { id } = await params;
  const detail = await getFamilyDetail(id);
  if (!detail) notFound();

  const { family, members } = detail;
  const defaultValues: MembershipInput = {
    primaryContact: family.primary_contact,
    familyName: family.family_name,
    flatNumber: family.flat_number,
    phone: family.phone,
    email: family.email ?? "",
    membershipType: family.membership_type,
    members: members.length
      ? members.map((m) => ({
          fullName: m.full_name,
          relationship: m.relationship,
          ageGroup: m.age_group,
          bloodGroup: (m.blood_group ?? "unknown") as MembershipInput["members"][number]["bloodGroup"],
        }))
      : [{ fullName: "", relationship: "head", ageGroup: "13_plus", bloodGroup: "unknown" }],
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <Link
          href={`/admin/membership/${id}`}
          className="inline-flex items-center gap-1 text-small text-text-secondary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> {family.family_name} Family
        </Link>
        <h1 className="mt-2 text-page-title font-bold text-charcoal">Edit family</h1>
      </div>
      <FamilyEditForm familyId={id} defaultValues={defaultValues} />
    </div>
  );
}
