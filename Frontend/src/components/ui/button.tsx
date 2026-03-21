import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:transform-none hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-primary/25 hover:from-primary/90 hover:to-primary hover:shadow-primary/35",
        destructive:
          "bg-gradient-to-r from-destructive to-destructive/85 text-destructive-foreground shadow-destructive/25 hover:from-destructive/90 hover:to-destructive hover:shadow-destructive/35",
        outline:
          "border border-input bg-gradient-to-r from-background to-accent/20 hover:from-accent/25 hover:to-background hover:text-accent-foreground",
        secondary:
          "bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground shadow-secondary/25 hover:from-secondary/90 hover:to-secondary hover:shadow-secondary/35",
        ghost: "bg-gradient-to-r from-transparent to-transparent hover:from-accent/40 hover:to-accent/10 hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline hover:shadow-none hover:translate-y-0",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
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
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
