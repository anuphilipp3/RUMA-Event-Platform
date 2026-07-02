/**
 * Reference lookup field with a fixed, non-editable prefix chip. The user types
 * only the unique part; the full code is reassembled server-side. Reusable for
 * any code with a common prefix (family: RUMA-FAM-, bookings: RUMA-, future codes).
 */
export function PrefixedReferenceInput({
  id,
  name,
  prefix,
  placeholder,
  maxLength,
}: {
  id: string;
  name: string;
  prefix: string;
  placeholder: string;
  maxLength?: number;
}) {
  return (
    <div className="flex items-stretch overflow-hidden rounded-md border border-field bg-white transition-colors focus-within:border-kerala-600 focus-within:ring-1 focus-within:ring-kerala-600">
      <span className="flex select-none items-center whitespace-nowrap border-r border-field bg-cream px-3 font-mono text-body font-semibold tracking-wide text-text-secondary">
        {prefix}
      </span>
      <input
        id={id}
        name={name}
        required
        autoCapitalize="characters"
        autoComplete="off"
        spellCheck={false}
        maxLength={maxLength}
        placeholder={placeholder}
        className="w-full bg-transparent px-3 py-3 font-mono uppercase tracking-[0.15em] text-charcoal outline-none placeholder:tracking-normal placeholder:text-text-muted"
      />
    </div>
  );
}
