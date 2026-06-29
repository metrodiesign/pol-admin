import { cn } from "@/lib/utils";

export function Fieldset({
  className,
  ...props
}: React.ComponentProps<"fieldset">) {
  return (
    <fieldset
      className={cn(
        "[&>*+[data-slot=field-group]]:mt-6 [&>*+[data-slot=text]]:mt-1",
        "disabled:opacity-60",
        className
      )}
      {...props}
    />
  );
}

export function Legend({
  className,
  ...props
}: React.ComponentProps<"legend">) {
  return (
    <legend
      data-slot="legend"
      className={cn("text-lg font-semibold text-foreground", className)}
      {...props}
    />
  );
}

export function FieldGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        "grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2",
        className
      )}
      {...props}
    />
  );
}

export function Field({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field"
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    />
  );
}

export function Label({
  className,
  ...props
}: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn("text-sm font-medium text-foreground select-none", className)}
      {...props}
    />
  );
}

export function Description({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="description"
      className={cn("text-xs text-grey-500", className)}
      {...props}
    />
  );
}
