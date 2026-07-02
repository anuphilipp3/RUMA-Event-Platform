const REPEAT = 4;

function MarqueeHalf({ text, ariaHidden }: { text: string; ariaHidden?: boolean }) {
  return (
    <div className="flex shrink-0 items-center" aria-hidden={ariaHidden}>
      {Array.from({ length: REPEAT }).map((_, i) => (
        <span key={i} className="flex items-center">
          <span className="whitespace-nowrap px-6 text-small font-medium tracking-wide">
            {text}
          </span>
          <span className="text-gold-500" aria-hidden>
            ◆
          </span>
        </span>
      ))}
    </div>
  );
}

/**
 * Slim scrolling announcement bar shown above the header. Pure-CSS marquee
 * (transform only), pauses on hover, and freezes for reduced-motion users.
 * Controlled from Admin → Settings.
 */
export function AnnouncementBar({ text }: { text: string }) {
  const clean = text.trim();
  if (!clean) return null;

  return (
    <div
      role="status"
      className="group relative overflow-hidden border-b border-gold/25 bg-kerala-700 py-2 text-white"
    >
      <div className="kasavu-line absolute inset-x-0 top-0 h-0.5 opacity-80" />
      <div className="ruma-marquee flex w-max group-hover:[animation-play-state:paused]">
        <MarqueeHalf text={clean} />
        <MarqueeHalf text={clean} ariaHidden />
      </div>
    </div>
  );
}
