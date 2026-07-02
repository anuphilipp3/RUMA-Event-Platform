import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-12 w-full rounded-md border border-field bg-white px-4 text-body text-charcoal placeholder:text-text-muted focus-visible:border-kerala-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kerala/40 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-maroon aria-[invalid=true]:ring-maroon/30",
        className,
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
