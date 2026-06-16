"use client";

import { useState } from "react";
import { MoreVertical } from "lucide-react";
import { WidgetCard } from "../widget-card";
import { analyticsTasks } from "@/lib/mock/analytics";
import { cn } from "@/lib/utils";

export function AnalyticsTasks() {
  const [tasks, setTasks] = useState(analyticsTasks);

  const toggle = (index: number) => {
    setTasks((prev) =>
      prev.map((t, i) => (i === index ? { ...t, done: !t.done } : t)),
    );
  };

  return (
    <WidgetCard title="Tasks" bodyClassName="p-0">
      <ul>
        {tasks.map((task, i) => (
          <li
            key={task.label}
            className={`flex items-center gap-3 px-6 py-3.5 ${
              i < tasks.length - 1
                ? "border-b border-dashed border-grey-300"
                : ""
            }`}
          >
            <input
              type="checkbox"
              aria-labelledby={`task-${i}`}
              checked={task.done}
              onChange={() => toggle(i)}
              className="size-5 shrink-0 cursor-pointer rounded border-grey-300 accent-primary"
            />
            <label
              id={`task-${i}`}
              className={cn(
                "flex-1 cursor-pointer select-none text-sm",
                task.done
                  ? "text-grey-400 line-through"
                  : "text-grey-800",
              )}
            >
              {task.label}
            </label>
            <button
              type="button"
              aria-label="Task options"
              className="shrink-0 rounded-full p-1 text-grey-500 hover:bg-grey-100 hover:text-grey-800 transition-colors"
            >
              <MoreVertical className="size-4" />
            </button>
          </li>
        ))}
      </ul>
    </WidgetCard>
  );
}
