import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-12 w-full min-w-0 rounded-control border border-[var(--divider)] bg-transparent px-3.5 text-sm text-foreground transition-colors outline-0 focus:outline-0 focus-visible:outline-0 file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-grey-500 focus:border-primary focus:ring-1 focus:ring-inset focus:ring-primary disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-grey-100 disabled:opacity-50 aria-invalid:border-error aria-invalid:ring-1 aria-invalid:ring-inset aria-invalid:ring-error dark:bg-input/30 dark:disabled:bg-input/80",
        className
      )}
      {...props}
    />
  )
}

export { Input }
