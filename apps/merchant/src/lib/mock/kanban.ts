import type { KanbanColumn } from "@/types/kanban";

// Local minimals-style avatars (matching the project's existing patterns)
const [ava1, ava2, ava3, ava4, ava5, ava6] = [
  "/avatars/avatar-1.webp",
  "/avatars/avatar-2.webp",
  "/avatars/avatar-3.webp",
  "/avatars/avatar-4.webp",
  "/avatars/avatar-5.webp",
  "/avatars/avatar-6.webp",
] as const;

// Cover images from r2.dev CDN (matching project pattern: mock/cover)
const cover12 =
  "https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/cover/cover-12.webp";
const cover5 =
  "https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/cover/cover-5.webp";

export const kanbanColumns: KanbanColumn[] = [
  {
    id: "col-todo",
    name: "To do",
    cards: [
      {
        id: "card-1",
        title: "Design New Marketing Campaign",
        priority: "high",
        coverImageUrl: cover12,
        commentCount: 1,
        attachmentCount: 4,
        assignees: [{ name: "Jayvion", avatarUrl: ava1 }],
      },
      {
        id: "card-2",
        title: "Analyze Customer Feedback",
        priority: "medium",
        commentCount: 2,
        attachmentCount: 0,
        assignees: [
          { name: "Lucian", avatarUrl: ava2 },
          { name: "Deja", avatarUrl: ava3 },
        ],
      },
      {
        id: "card-3",
        title: "Update Website Content",
        priority: "high",
        commentCount: 3,
        attachmentCount: 0,
        assignees: [
          { name: "Harrison", avatarUrl: ava4 },
          { name: "Reece", avatarUrl: ava5 },
          { name: "Lainey", avatarUrl: ava6 },
        ],
      },
    ],
  },
  {
    id: "col-inprogress",
    name: "In progress",
    cards: [
      {
        id: "card-4",
        title: "Conduct Market Research",
        priority: "medium",
        commentCount: 4,
        attachmentCount: 0,
        assignees: [
          { name: "Jayvion", avatarUrl: ava1 },
          { name: "Lucian", avatarUrl: ava2 },
          { name: "Deja", avatarUrl: ava3 },
          { name: "Harrison", avatarUrl: ava4 },
        ],
      },
      {
        id: "card-5",
        title: "Develop Software Application",
        priority: "low",
        coverImageUrl: cover5,
        commentCount: 5,
        attachmentCount: 5,
        assignees: [
          { name: "Lucian", avatarUrl: ava2 },
          { name: "Deja", avatarUrl: ava3 },
          { name: "Harrison", avatarUrl: ava4 },
          { name: "Reece", avatarUrl: ava5 },
          { name: "Lainey", avatarUrl: ava6 },
        ],
      },
    ],
  },
  {
    id: "col-ready",
    name: "Ready to test",
    cards: [],
  },
  {
    id: "col-done",
    name: "Done",
    cards: [
      {
        id: "card-6",
        title: "Organize Team Meeting",
        priority: "low",
        commentCount: 6,
        attachmentCount: 0,
        assignees: [
          { name: "Jayvion", avatarUrl: ava1 },
          { name: "Lucian", avatarUrl: ava2 },
          { name: "Deja", avatarUrl: ava3 },
          { name: "Harrison", avatarUrl: ava4 },
          { name: "Reece", avatarUrl: ava5 },
          { name: "Lainey", avatarUrl: ava6 },
        ],
      },
    ],
  },
];
