import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getEventBySlug } from "@/lib/data/events";
import { getOrgSettings } from "@/lib/data/org-settings";
import { RegisterFlow } from "@/components/register/register-flow";
import { GeneralRumaMessage } from "@/components/public/general-ruma-message";
import {
  isRegistrationOpen,
  registrationClosedReason,
} from "@/lib/domain/event-status";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Register · RUMA Events" };

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();
  if (!isRegistrationOpen(event)) {
    const notOpenYet = registrationClosedReason(event) === "not_open_yet";
    return (
      <GeneralRumaMessage
        concludedEventName={event.name}
        title={notOpenYet ? "Registration opens soon" : "Registration is closed"}
        message={
          notOpenYet
            ? "Registration for this event hasn't opened yet. Please check back soon."
            : "Registration for this event is no longer open. Thank you for your interest — see you at the next RUMA celebration."
        }
      />
    );
  }
  const { brand } = await getOrgSettings();
  return <RegisterFlow event={event} brand={brand} />;
}
