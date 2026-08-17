import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Course | Dashboard - Minimal UI",
};

import { CourseHero } from "@/components/dashboard/course/course-hero";
import { CourseHoursSpent } from "@/components/dashboard/course/course-hours-spent";
import { CourseProgress } from "@/components/dashboard/course/course-progress";
import { CourseContinue } from "@/components/dashboard/course/course-continue";
import { CourseFeatured } from "@/components/dashboard/course/course-featured";
import { CourseSidebar } from "@/components/dashboard/course/course-sidebar";

export default function CoursePage() {
  return (
    <div className="grid grid-cols-1 gap-6 mlg:grid-cols-[minmax(0,1fr)_272px]">
      {/* Left main column */}
      <div className="space-y-6">
        <CourseHero />
        <CourseHoursSpent />
        <div className="grid grid-cols-1 gap-6 mmd:grid-cols-2">
          <CourseProgress />
          <CourseContinue />
        </div>
        <CourseFeatured />
      </div>

      {/* Right rail */}
      <div>
        <CourseSidebar />
      </div>
    </div>
  );
}
