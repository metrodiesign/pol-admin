import type { Metadata } from "next";
import { KanbanBoard } from "@/components/dashboard/kanban/kanban-board";
import { kanbanColumns } from "@/lib/mock/kanban";

export const metadata: Metadata = {
  title: "Kanban | Dashboard - Minimal UI",
};

export default function KanbanPage() {
  return (
    <>
      <KanbanBoard initialColumns={kanbanColumns} />
    </>
  );
}
