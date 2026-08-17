"use client";

import Image from "next/image";
import { MoreVertical } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { strengthRadar, reminders } from "@/lib/mock/course";

export function CourseSidebar() {
  const radarData = strengthRadar.categories.map((cat, i) => ({
    subject: cat,
    value: strengthRadar.data[i],
  }));

  return (
    <div className="space-y-6">
      {/* Profile card */}
      <div className="dashboard-card relative flex flex-col items-center px-6 py-8">
        <button
          type="button"
          aria-label="More options"
          className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full text-grey-500 transition-colors hover:bg-grey-200"
        >
          <MoreVertical className="size-4" />
        </button>
        <Image
          src="/avatars/avatar-25.webp"
          alt="Jaydon Frankie"
          width={84}
          height={84}
          className="size-[84px] rounded-full object-cover"
        />
        <p className="mt-4 text-base font-semibold text-grey-800">Jaydon Frankie</p>
        <p className="mt-0.5 text-sm text-grey-500">ID: 123987</p>
      </div>

      {/* Strength radar */}
      <div className="dashboard-card p-6">
        <h6 className="text-lg font-semibold text-grey-800">Strength</h6>
        <div className="h-[220px] pt-2">
          <ResponsiveContainer
            width="100%"
            height="100%"
            initialDimension={{ width: 260, height: 220 }}
          >
            <RadarChart cx="50%" cy="50%" outerRadius="68%" data={radarData}>
              <PolarGrid stroke="rgba(145,158,171,0.24)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fontSize: 12, fill: "#637381" }}
              />
              <Radar
                name="Strength"
                dataKey="value"
                stroke="#00A76F"
                fill="#00A76F"
                fillOpacity={0.24}
                strokeWidth={2}
                isAnimationActive={false}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Reminders */}
      <div className="dashboard-card p-6">
        <h6 className="text-lg font-semibold text-grey-800">Reminders</h6>
        <ul className="mt-4 space-y-4">
          {reminders.map((r) => (
            <li key={r.title}>
              <p className="text-sm font-semibold leading-snug text-grey-800">{r.title}</p>
              <p className="mt-0.5 text-xs text-grey-500">{r.date}</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-grey-200">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${r.progress}%`, backgroundColor: r.color }}
                  />
                </div>
                <span className="w-10 text-right text-xs font-semibold text-grey-600">
                  {r.progress}%
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
