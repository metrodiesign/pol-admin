"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { KanbanColumn } from "./kanban-column";
import type { KanbanColumn as KanbanColumnType } from "@/types/kanban";

interface KanbanBoardProps {
  initialColumns: KanbanColumnType[];
}

export function KanbanBoard({ initialColumns }: KanbanBoardProps) {
  const [fixedColumn, setFixedColumn] = useState(false);
  const [columns, setColumns] = useState<KanbanColumnType[]>(initialColumns);

  function handleNameChange(columnId: string, newName: string) {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId ? { ...col, name: newName } : col
      )
    );
  }

  function handleDeleteColumn(columnId: string) {
    setColumns((prev) => prev.filter((col) => col.id !== columnId));
  }

  function handleClearColumn(columnId: string) {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId ? { ...col, cards: [] } : col
      )
    );
  }

  function handleAddColumn() {
    const newCol: KanbanColumnType = {
      id: `col-${Date.now()}`,
      name: "New column",
      cards: [],
    };
    setColumns((prev) => [...prev, newCol]);
  }

  function handleAddCard(_columnId: string) {
    // Interaction stub — add-card dialog would open here
  }

  function handleCardClick(_cardId: string) {
    // Interaction stub — task detail dialog would open here
  }

  return (
    <div className="flex min-h-0 flex-col">
      {/* Page header row with Fixed column toggle */}
      <div className="mb-5 flex items-center justify-between">
        <h4 className="text-2xl font-bold leading-9 text-foreground">Kanban</h4>
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-grey-700">
          Fixed column
          <Switch
            checked={fixedColumn}
            onCheckedChange={setFixedColumn}
          />
        </label>
      </div>

      {/* Board — horizontal scroll; on mobile each column is ~88vw so next column peeks */}
      <div
        className="flex gap-4 overflow-x-auto pb-4"
        style={{ minHeight: 0 }}
      >
        {columns.map((column) => (
          <div
            key={column.id}
            className="w-[88vw] sm:w-[336px]"
            style={{ flexShrink: 0 }}
          >
            <KanbanColumn
              column={column}
              onNameChange={handleNameChange}
              onDeleteColumn={handleDeleteColumn}
              onClearColumn={handleClearColumn}
              onAddCard={handleAddCard}
              onCardClick={handleCardClick}
            />
          </div>
        ))}

        {/* Add column button */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={handleAddColumn}
            className="flex h-14 w-[200px] items-center gap-1.5 whitespace-nowrap rounded-control px-4 text-sm font-bold text-grey-800 transition-colors hover:bg-grey-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Add column"
          >
            <Plus className="size-4" strokeWidth={2.5} />
            Add column
          </button>
        </div>
      </div>
    </div>
  );
}
