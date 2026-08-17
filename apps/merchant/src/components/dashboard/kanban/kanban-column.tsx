"use client";

import { useState, useRef } from "react";
import { Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { KanbanCard } from "./kanban-card";
import type { KanbanColumn as KanbanColumnType } from "@/types/kanban";

interface KanbanColumnProps {
  column: KanbanColumnType;
  onNameChange?: (id: string, newName: string) => void;
  onDeleteColumn?: (id: string) => void;
  onClearColumn?: (id: string) => void;
  onAddCard?: (columnId: string) => void;
  onCardClick?: (cardId: string) => void;
}

/** 6-dot grip icon (2×3 dots) matching the minimals.cc column drag handle */
function GripDotsIcon({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <circle cx="4" cy="2.5" r="1.1" />
      <circle cx="4" cy="7" r="1.1" />
      <circle cx="4" cy="11.5" r="1.1" />
      <circle cx="10" cy="2.5" r="1.1" />
      <circle cx="10" cy="7" r="1.1" />
      <circle cx="10" cy="11.5" r="1.1" />
    </svg>
  );
}

/** Horizontal 3-dot kebab */
function KebabIcon({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  );
}

export function KanbanColumn({
  column,
  onNameChange,
  onDeleteColumn,
  onClearColumn,
  onAddCard,
  onCardClick,
}: KanbanColumnProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(column.name);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleNameSubmit() {
    setIsEditingName(false);
    const trimmed = name.trim();
    if (trimmed && trimmed !== column.name) {
      onNameChange?.(column.id, trimmed);
    } else {
      setName(column.name);
    }
  }

  return (
    <div
      className="flex w-full flex-col gap-4 rounded-2xl bg-grey-200 p-4"
      aria-label={`Column: ${column.name}`}
    >
      {/* Column header */}
      <div className="flex h-8 items-center gap-2">
        {/* Count badge — light grey pill matching live reference */}
        <span
          className="flex h-5 min-w-[20px] items-center justify-center rounded-md px-1.5 text-xs font-bold leading-none text-grey-600"
          style={{ backgroundColor: "rgba(145,158,171,0.16)" }}
        >
          {column.cards.length}
        </span>

        {/* Editable name */}
        {isEditingName ? (
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleNameSubmit();
              if (e.key === "Escape") {
                setName(column.name);
                setIsEditingName(false);
              }
            }}
            className="min-w-0 flex-1 rounded bg-transparent px-1 text-sm font-bold text-grey-800 outline-none ring-1 ring-primary focus:ring-2"
            autoFocus
            aria-label="Edit column name"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setIsEditingName(true);
              // focus after next render
              setTimeout(() => inputRef.current?.focus(), 0);
            }}
            className="min-w-0 flex-1 truncate text-left text-sm font-bold text-grey-800 hover:text-grey-600"
            aria-label={`Column name: ${column.name}`}
          >
            {column.name}
          </button>
        )}

        {/* Add card — transparent round icon button matching live */}
        <button
          type="button"
          onClick={() => onAddCard?.(column.id)}
          className="flex size-[30px] shrink-0 items-center justify-center rounded-full text-grey-800 transition-colors hover:bg-grey-500/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Add task"
        >
          <Plus className="size-[18px]" strokeWidth={2} />
        </button>

        {/* Kebab menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex size-6 shrink-0 items-center justify-center rounded-full text-grey-500 transition-colors hover:bg-grey-500/8 hover:text-grey-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Column actions"
          >
            <KebabIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => setIsEditingName(true)}>
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onClearColumn?.(column.id)}>
              Clear
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDeleteColumn?.(column.id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Drag handle */}
        <button
          type="button"
          className="flex size-6 shrink-0 cursor-grab items-center justify-center rounded-full text-grey-400 transition-colors hover:bg-grey-500/8 hover:text-grey-600 active:cursor-grabbing focus-visible:outline-none"
          aria-label="Drag to reorder column"
        >
          <GripDotsIcon />
        </button>
      </div>

      {/* Cards list */}
      <div className="flex flex-col gap-4">
        {column.cards.map((card) => (
          <KanbanCard
            key={card.id}
            card={card}
            onClick={() => onCardClick?.(card.id)}
          />
        ))}
      </div>

    </div>
  );
}
