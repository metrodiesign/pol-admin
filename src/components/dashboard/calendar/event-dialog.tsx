"use client";

import { useId, useState, type FormEvent } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { CalendarEvent, EventColor } from "@/types/calendar";

const COLOR_OPTIONS: Array<{ value: EventColor; label: string; bg: string }> = [
  { value: "teal",   label: "Teal",   bg: "#00b8d9" },
  { value: "red",    label: "Red",    bg: "#ff5630" },
  { value: "purple", label: "Purple", bg: "#8e33ff" },
  { value: "navy",   label: "Navy",   bg: "#003768" },
  { value: "amber",  label: "Amber",  bg: "#ffab00" },
  { value: "green",  label: "Green",  bg: "#00a76f" },
  { value: "rose",   label: "Rose",   bg: "#7a0916" },
];

interface EventDialogProps {
  open: boolean;
  onClose: () => void;
  event?: CalendarEvent | null;
  initialDate?: string;
  onSave: (event: Omit<CalendarEvent, "id"> & { id?: string }) => void;
  onDelete?: (id: string) => void;
}

function toLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function emptyEvent(date?: string): Omit<CalendarEvent, "id"> {
  const today = date ?? toLocalDateStr(new Date());
  return {
    title: "",
    start: today,
    end: today,
    allDay: false,
    color: "teal",
  };
}

export function EventDialog({
  open,
  onClose,
  event,
  initialDate,
  onSave,
  onDelete,
}: EventDialogProps) {
  // key on DialogContent forces remount (and fresh useState) whenever the
  // event or initialDate changes, eliminating the need for a setState-in-effect.
  const formKey = event?.id ?? initialDate ?? "new";

  const titleId = useId();
  const startId = useId();
  const endId = useId();
  const descriptionId = useId();

  const [form, setForm] = useState<Omit<CalendarEvent, "id"> & { id?: string }>(
    event ?? emptyEvent(initialDate)
  );

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave(form);
    onClose();
  }

  function handleDelete() {
    if (form.id && onDelete) {
      onDelete(form.id);
      onClose();
    }
  }

  const isEditing = Boolean(form.id);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent key={formKey} className="max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Event" : "Add Event"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label id={titleId} className="text-sm font-medium text-grey-700">Title</label>
            <Input
              aria-labelledby={titleId}
              placeholder="Event title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </div>

          {/* All day toggle */}
          <div className="flex items-center gap-2">
            <input
              aria-labelledby="allDay"
              type="checkbox"
              checked={!!form.allDay}
              onChange={(e) => setForm((f) => ({ ...f, allDay: e.target.checked }))}
              className="h-4 w-4 rounded border-grey-300 accent-grey-800"
            />
            <label id="allDay" className="text-sm text-grey-700">All day</label>
          </div>

          {/* Start date */}
          <div className="flex flex-col gap-1.5">
            <label id={startId} className="text-sm font-medium text-grey-700">Start date</label>
            <Input
              aria-labelledby={startId}
              type="date"
              value={form.start}
              onChange={(e) => setForm((f) => ({ ...f, start: e.target.value }))}
            />
          </div>

          {/* End date */}
          <div className="flex flex-col gap-1.5">
            <label id={endId} className="text-sm font-medium text-grey-700">End date</label>
            <Input
              aria-labelledby={endId}
              type="date"
              value={form.end}
              onChange={(e) => setForm((f) => ({ ...f, end: e.target.value }))}
            />
          </div>

          {/* Color picker */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-grey-700">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  title={c.label}
                  onClick={() => setForm((f) => ({ ...f, color: c.value }))}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full transition-transform hover:scale-110",
                    form.color === c.value && "ring-2 ring-offset-2 ring-grey-400"
                  )}
                  style={{ backgroundColor: c.bg }}
                />
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label id={descriptionId} className="text-sm font-medium text-grey-700">Description</label>
            <textarea
              aria-labelledby={descriptionId}
              rows={3}
              placeholder="Description (optional)"
              value={form.description ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full rounded-lg border border-grey-300 bg-transparent px-3.5 py-2 text-sm text-foreground transition-colors outline-0 placeholder:text-grey-500 focus:border-grey-800 resize-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            {isEditing && onDelete && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={handleDelete}
                className="mr-auto"
              >
                <Trash2 className="size-4" />
              </Button>
            )}
            <div className="ml-auto flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-foreground text-card hover:opacity-90"
              >
                {isEditing ? "Save changes" : "Add event"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
