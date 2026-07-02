import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getEventBySlug } from "@/lib/data/events";
import { EventLanding } from "@/components/public/event-landing";
import { GeneralRumaMessage } from "@/components/public/general-ruma-message";
import { hasEnded } from "@/lib/domain/event-status";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Event not found · RUMA Events" };
  return {
    title: `${event.name} · RUMA Events`,
    description: event.description ?? undefined,
  };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();
  if (hasEnded(event)) {
    return (
      <GeneralRumaMessage
        concludedEventName={event.name}
        title="This celebration has wrapped up"
        message="Thank you to everyone who joined us. Keep an eye here for our next RUMA event."
      />
    );
  }
  return <EventLanding event={event} />;
}
