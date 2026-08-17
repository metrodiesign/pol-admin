import Image from "next/image";
import { WidgetCard } from "../widget-card";
import { continueCourses } from "@/lib/mock/course";

export function CourseContinue() {
  return (
    <WidgetCard title="Continue course" bodyClassName="p-0">
      <ul>
        {continueCourses.map((course, i) => (
          <li key={course.title} className={`flex items-center gap-4 px-6 py-3 ${i < continueCourses.length - 1 ? "border-b border-dashed border-grey-300" : ""}`}>
            <Image src={course.image} alt={course.title} width={48} height={48} className="size-12 shrink-0 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-grey-800">{course.title}</p>
              <p className="text-xs text-grey-500">{course.lessons}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-grey-200">
                  <div className="h-full rounded-full" style={{ width: `${course.progress}%`, backgroundColor: course.color }} />
                </div>
                <span className="text-xs font-semibold text-grey-600">{course.progress}%</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </WidgetCard>
  );
}
