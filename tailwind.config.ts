import type { Config } from "tailwindcss";

/**
 * Design tokens map 1:1 to "07 UI Design System.md".
 * Semantic tokens (kerala / gold / ivory ...) are also wired to CSS variables
 * so future events can re-theme per-event (see globals.css :root) without code
 * changes, per the doc's "Theme Customization" section.
 */
const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand palette (fixed reference values from the design system)
        kerala: {
          DEFAULT: "var(--brand-primary)",
          50: "#e9f3ee",
          600: "#0F6A4A",
          700: "#0b543a",
          800: "#083f2c",
        },
        gold: {
          DEFAULT: "var(--brand-accent)",
          600: "#D4A017",
          700: "#a97f10",
        },
        ivory: "var(--brand-background)",
        cream: "#F8F3E8",
        maroon: "#7A1E1E",
        // Text scale
        charcoal: "#1F2933",
        "text-secondary": "#667085",
        "text-muted": "#98A2B3",
        // Neutral field border
        field: "#D0D5DD",
        // shadcn semantic aliases (kept minimal)
        border: "#D0D5DD",
        input: "#D0D5DD",
        ring: "var(--brand-primary)",
        background: "var(--brand-background)",
        foreground: "#1F2933",
        destructive: { DEFAULT: "#7A1E1E", foreground: "#ffffff" },
        muted: { DEFAULT: "#F8F3E8", foreground: "#667085" },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
      },
      letterSpacing: {
        tightest: "-0.03em",
      },
      fontSize: {
        hero: ["48px", { lineHeight: "56px", fontWeight: "700" }],
        "page-title": ["32px", { lineHeight: "40px", fontWeight: "700" }],
        "section-title": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "card-title": ["18px", { lineHeight: "26px", fontWeight: "600" }],
        body: ["16px", { lineHeight: "24px" }],
        small: ["14px", { lineHeight: "20px" }],
        caption: ["12px", { lineHeight: "16px" }],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "20px",
        ticket: "24px",
      },
      maxWidth: {
        content: "1120px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
