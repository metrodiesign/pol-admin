import Image from "next/image";
import { Download, HardDrive, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { relatedApps, type RelatedApp } from "@/lib/mock/dashboard";

const TABS = [
  { value: "7days", label: "Top 7 days" },
  { value: "30days", label: "Top 30 days" },
  { value: "all", label: "All times" },
];

function Rating({ value, max = 5 }: { value: number; max?: number }) {
  const pct = Math.min(value / max, 1) * 100;
  return (
    <span className="relative inline-flex size-4 shrink-0" aria-label={`${value} Stars`}>
      <Star className="size-4 fill-current stroke-0 text-grey-300" />
      <span className="absolute inset-0 overflow-hidden" style={{ width: `${pct}%` }}>
        <Star className="size-4 fill-current stroke-0 text-warning" />
      </span>
    </span>
  );
}

function MetaItem({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1">
      {icon}
      {children}
    </span>
  );
}

function AppRow({ app }: { app: RelatedApp }) {
  const isPaid = app.price.startsWith("$");
  return (
    <li className="flex items-center gap-4">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-grey-500/8">
        <Image src={app.icon} alt={app.name} width={32} height={32} className="size-8 object-contain" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h6 className="truncate text-sm font-semibold leading-[22px] text-grey-800">{app.name}</h6>
          <span
            className={cn(
              "inline-flex h-[22px] shrink-0 items-center rounded-md px-1.5 text-xs font-bold",
              isPaid ? "bg-success/16 text-success-dark" : "bg-grey-500/16 text-grey-800",
            )}
          >
            {app.price}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-grey-600">
          <MetaItem icon={<Download className="size-4 text-grey-500" />}>{app.downloads}</MetaItem>
          <span className="size-1 rounded-full bg-grey-500" />
          <MetaItem icon={<HardDrive className="size-4 text-grey-500" />}>{app.size}</MetaItem>
          <span className="size-1 rounded-full bg-grey-500" />
          <MetaItem icon={<Rating value={app.rating} />}>{app.reviews}</MetaItem>
        </div>
      </div>
    </li>
  );
}

function AppList() {
  return (
    <ul className="space-y-6">
      {relatedApps.map((app) => (
        <AppRow key={app.name} app={app} />
      ))}
    </ul>
  );
}

export function RelatedApplications() {
  return (
    <section className="dashboard-card flex flex-col">
      <header className="p-6">
        <h6 className="text-lg font-semibold text-grey-800">Related applications</h6>
      </header>
      <Tabs defaultValue="7days" className="flex flex-1 flex-col">
        <TabsList variant="segment">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {TABS.map((t) => (
          <TabsContent key={t.value} value={t.value} className="px-6 pb-6 pt-5">
            <AppList />
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
