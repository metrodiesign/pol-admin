"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { WidgetCard } from "../widget-card";
import { courseProgress } from "@/lib/mock/course";

export function CourseProgress() {
  return (
    <WidgetCard title="Course progress">
      <div className="flex flex-col items-center gap-4">
        <div className="relative mx-auto aspect-square w-[240px]">
          <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 240, height: 240 }}>
            <PieChart>
              <Pie data={courseProgress.data} dataKey="value" nameKey="label" cx="50%" cy="50%" innerRadius="68%" outerRadius="100%" paddingAngle={2} cornerRadius={6} startAngle={90} endAngle={-270} stroke="none" isAnimationActive={false}>
                {courseProgress.data.map((entry) => (
                  <Cell key={entry.label} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm text-grey-500">Total</span>
            <span className="text-2xl font-bold leading-tight text-grey-800">{courseProgress.total}</span>
          </div>
        </div>
        <div className="flex items-center gap-5">
          {courseProgress.data.map((entry) => (
            <div key={entry.label} className="flex items-center gap-1.5 text-xs text-grey-700">
              <span className="size-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.label}
            </div>
          ))}
        </div>
      </div>
    </WidgetCard>
  );
}
