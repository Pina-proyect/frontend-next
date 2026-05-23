import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-headline font-bold tracking-tight text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-lg shadow-primary/10 hover:shadow-primary/20",
        destructive:
          "bg-error text-on-error hover:bg-error/90 shadow-sm",
        outline:
          "bg-transparent ring-1 ring-outline-variant/15 text-on-surface hover:bg-surface-container-low",
        secondary:
          "bg-surface-container-high text-on-surface hover:bg-surface-container-highest",
        ghost:
          "hover:bg-surface-container-low text-on-surface",
        link: "text-primary hover:text-primary-container hover:underline underline-offset-4",
      },
      size: {
        default: "h-12 px-6 py-4",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-14 rounded-xl px-8 text-base",
        icon: "h-12 w-12",
        "icon-sm": "h-9 w-9",
        "icon-lg": "h-14 w-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
