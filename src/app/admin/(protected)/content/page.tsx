import { requireCommittee } from "@/lib/auth";
import { getSiteContent } from "@/lib/data/site-content";
import { ContentEditor } from "@/components/admin/content-editor";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  await requireCommittee();
  const content = await getSiteContent();

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <header>
        <h1 className="text-page-title font-bold text-charcoal">Homepage</h1>
        <p className="text-body text-text-secondary">
          Edit the public homepage content. Changes go live immediately.
        </p>
      </header>
      <ContentEditor content={content} />
    </div>
  );
}
