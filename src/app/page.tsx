import { getFeaturedEvent } from "@/lib/data/events";
import { getSiteContent } from "@/lib/data/site-content";
import { getRecentPhotos } from "@/lib/data/gallery";
import { getCommunityStats } from "@/lib/data/community-stats";
import { RumaHome } from "@/components/public/ruma-home";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [content, event, photos, stats] = await Promise.all([
    getSiteContent(),
    getFeaturedEvent(),
    getRecentPhotos(8),
    getCommunityStats(),
  ]);
  return (
    <RumaHome content={content} event={event} photos={photos} stats={stats} />
  );
}
