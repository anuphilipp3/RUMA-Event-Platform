import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-body font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kerala focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary — Kerala Green (Register, Submit, Approve, Download)
        primary: "bg-kerala-600 text-white hover:bg-kerala-700 active:bg-kerala-800",
        // Accent — Onam Gold, high-contrast dark label. For hero / colored surfaces.
        accent:
          "bg-gold-600 text-charcoal font-bold shadow-sm hover:brightness-[0.97] active:brightness-95",
        // Secondary — Soft Cream w/ green text + border
        secondary:
          "bg-cream text-kerala-600 border border-kerala-600 hover:bg-kerala-50 active:bg-kerala-50",
        // Danger — reject / cancel
        danger: "bg-red-50 text-maroon border border-red-200 hover:bg-red-100",
        ghost: "text-charcoal hover:bg-cream",
        link: "text-kerala-600 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-5", // 48px min height per design system
        sm: "h-10 px-4 text-small",
        lg: "h-14 px-8 text-card-title",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
