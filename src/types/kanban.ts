export type Priority = "high" | "medium" | "low";

export interface KanbanAssignee {
  name: string;
  avatarUrl: string;
}

export interface KanbanCard {
  id: string;
  title: string;
  priority: Priority;
  coverImageUrl?: string;
  commentCount: number;
  attachmentCount: number;
  assignees: KanbanAssignee[];
}

export interface KanbanColumn {
  id: string;
  name: string;
  cards: KanbanCard[];
}
