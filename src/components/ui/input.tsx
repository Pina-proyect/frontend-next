import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "w-full bg-surface-container-highest px-4 py-3.5 rounded-xl font-body text-sm border-none focus:ring-1 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all outline-none file:inline-flex file:h-7 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:ring-destructive/20 aria-invalid:ring-1",
        className
      )}
      {...props}
    />
  )
}

export { Input }
