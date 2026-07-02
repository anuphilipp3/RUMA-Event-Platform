/**
 * Event theme presets. Selecting one fills the event's primary/accent/background
 * colors; those flow to the public pages + tickets via ThemeScope. "Custom" lets
 * an organizer pick their own colors.
 */
export interface ThemePreset {
  key: string;
  label: string;
  primary: string;
  accent: string;
  background: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    key: "onam",
    label: "Onam (Kerala Green & Gold)",
    primary: "#0F6A4A",
    accent: "#D4A017",
    background: "#FFFDF8",
  },
  {
    key: "vishu",
    label: "Vishu (Fresh Green & Kani Gold)",
    primary: "#1B7A3D",
    accent: "#F2B705",
    background: "#FFFEF5",
  },
  {
    key: "christmas",
    label: "Christmas (Deep Red & Pine)",
    primary: "#9E1B1B",
    accent: "#1E6B3A",
    background: "#FFFCF7",
  },
  {
    key: "newyear",
    label: "New Year (Charcoal & Gold)",
    primary: "#1F2933",
    accent: "#D4AF37",
    background: "#FFFDF8",
  },
  {
    key: "sports",
    label: "Sports Day (Royal Blue & Amber)",
    primary: "#123E8C",
    accent: "#F59E0B",
    background: "#FDFDFB",
  },
];

/** Match a preset to the current colors, else "custom". */
export function matchThemeKey(
  primary: string,
  accent: string,
  background: string,
): string {
  const found = THEME_PRESETS.find(
    (p) =>
      p.primary.toLowerCase() === primary.toLowerCase() &&
      p.accent.toLowerCase() === accent.toLowerCase() &&
      p.background.toLowerCase() === background.toLowerCase(),
  );
  return found?.key ?? "custom";
}
