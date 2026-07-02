/**
 * Homepage CMS content shape + safe defaults. The dashboard edits this; the
 * public homepage renders it. Defaults double as a fallback (so the page never
 * breaks if the row is missing) and as the editor's initial values.
 */
export interface SiteStat {
  value: string;
  label: string;
}
export interface SiteFestival {
  name: string;
  blurb: string;
}
export interface SiteCalendarItem {
  period: string;
  title: string;
}

export interface SiteContent {
  hero: {
    eyebrow: string;
    headline: string;
    subheadline: string;
  };
  /** "manual" shows the editable stats below; "auto" shows live community data. */
  statsMode: "manual" | "auto";
  stats: SiteStat[];
  about: {
    label: string;
    title: string;
    body: string[];
  };
  festivals: SiteFestival[];
  calendar: SiteCalendarItem[];
  impact: {
    label: string;
    title: string;
    body: string;
  };
  membership: {
    title: string;
    body: string;
    ctaLabel: string;
  };
  footerTagline: string;
}

export const DEFAULT_SITE_CONTENT: SiteContent = {
  hero: {
    eyebrow: "Rohan Upavan Malayali Association",
    headline: "A Home Away From Home.",
    subheadline:
      "Keeping Kerala's traditions, celebrations, and community spirit alive in Rohan Upavan.",
  },
  statsMode: "manual",
  stats: [
    { value: "150+", label: "Families" },
    { value: "500+", label: "Residents" },
    { value: "20+", label: "Events Hosted" },
    { value: "1000+", label: "Memories Created" },
  ],
  about: {
    label: "ABOUT RUMA",
    title: "A little piece of Kerala, close to home.",
    body: [
      "RUMA is a community-driven association formed by Malayali families of Rohan Upavan.",
      "We bring people together through festivals, cultural celebrations, sports, social initiatives, and family gatherings that strengthen friendships and create lasting memories.",
      "What began as a shared desire to celebrate our roots has grown into a vibrant community where traditions are preserved, families connect, and every celebration feels like home.",
    ],
  },
  festivals: [
    { name: "Onam", blurb: "Sadhya, pookalam, cultural performances, games, and togetherness." },
    { name: "Vishu", blurb: "Kani, kaineettam, and the joy of a fresh beginning." },
    { name: "Christmas & New Year", blurb: "Carols, celebrations, and community cheer." },
    { name: "Sports Day", blurb: "Friendly competition and family fun for all ages." },
    { name: "Cultural Evenings", blurb: "Music, dance, talent, and shared traditions." },
    { name: "Family Day", blurb: "Relaxed gatherings that bring neighbours closer." },
  ],
  calendar: [
    { period: "January", title: "New Year Celebration" },
    { period: "April", title: "Vishu" },
    { period: "August / September", title: "Onam" },
    { period: "December", title: "Christmas & New Year" },
  ],
  impact: {
    label: "BEYOND CELEBRATIONS",
    title: "Building more than events.",
    body: "RUMA is not just about festivals. We create opportunities for families to connect, support one another, share traditions, and build a stronger community for future generations.",
  },
  membership: {
    title: "Become part of the community",
    body: "Join a growing network of Malayali families celebrating culture, friendship, and togetherness.",
    ctaLabel: "Join RUMA",
  },
  footerTagline: "Keeping Kerala Close To Home.",
};

/** Merge stored content over defaults so partial/missing sections never crash. */
export function withDefaults(data: Partial<SiteContent> | null): SiteContent {
  if (!data) return DEFAULT_SITE_CONTENT;
  return {
    hero: { ...DEFAULT_SITE_CONTENT.hero, ...data.hero },
    statsMode: data.statsMode === "auto" ? "auto" : "manual",
    stats: data.stats?.length ? data.stats : DEFAULT_SITE_CONTENT.stats,
    about: { ...DEFAULT_SITE_CONTENT.about, ...data.about },
    festivals: data.festivals?.length
      ? data.festivals
      : DEFAULT_SITE_CONTENT.festivals,
    calendar: data.calendar?.length
      ? data.calendar
      : DEFAULT_SITE_CONTENT.calendar,
    impact: { ...DEFAULT_SITE_CONTENT.impact, ...data.impact },
    membership: { ...DEFAULT_SITE_CONTENT.membership, ...data.membership },
    footerTagline: data.footerTagline ?? DEFAULT_SITE_CONTENT.footerTagline,
  };
}
