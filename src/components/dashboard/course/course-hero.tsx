import { Flame, Award, FileBadge } from "lucide-react";
import { courseGreeting, courseStats, type CourseStat } from "@/lib/mock/course";

const ICON_MAP: Record<string, React.ElementType> = {
  flame: Flame,
  award: Award,
  "file-badge": FileBadge,
};

function StatCard({ stat }: { stat: CourseStat }) {
  const Icon = ICON_MAP[stat.icon] ?? Flame;
  return (
    <div className="dashboard-card relative px-6 py-5">
      {/* Icon — top right */}
      <div
        className="absolute right-5 top-5 flex size-11 items-center justify-center rounded-full"
        style={{ backgroundColor: `${stat.color}1F` }}
      >
        <Icon className="size-5" style={{ color: stat.color }} />
      </div>
      {/* Number */}
      <p className="text-[32px] font-bold leading-[48px] text-grey-800">{stat.value}</p>
      {/* Label */}
      <p className="mt-1 text-sm text-grey-500">{stat.title}</p>
    </div>
  );
}

export function CourseHero() {
  return (
    <div>
      <h4 className="text-2xl font-bold leading-9 text-grey-800">
        Hi, {courseGreeting.name} {"\u{1F44B}"}
      </h4>
      <p className="mt-1 text-sm text-grey-500">{courseGreeting.subtitle}</p>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {courseStats.map((stat) => (
          <StatCard key={stat.title} stat={stat} />
        ))}
      </div>
    </div>
  );
}
