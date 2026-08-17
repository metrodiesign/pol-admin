import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-control border border-[var(--divider)] bg-transparent px-3.5 py-3 text-sm text-foreground transition-colors outline-none placeholder:text-grey-500 focus:border-primary focus:ring-1 focus:ring-inset focus:ring-primary disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-error aria-invalid:ring-1 aria-invalid:ring-inset aria-invalid:ring-error dark:bg-input/30 dark:disabled:bg-input/80",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
