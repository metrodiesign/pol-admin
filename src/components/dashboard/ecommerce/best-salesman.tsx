import Image from "next/image";
import { WidgetCard } from "../widget-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { bestSalesman } from "@/lib/mock/ecommerce";

// Soft rank chip colors matching minimals.cc palette
const RANK_STYLES: Record<
  number,
  { bg: string; text: string; label: string }
> = {
  1: { bg: "rgba(0,167,111,0.16)", text: "#007867", label: "Top 1" },
  2: { bg: "rgba(142,51,255,0.16)", text: "#5119b7", label: "Top 2" },
  3: { bg: "rgba(0,184,217,0.16)", text: "#006c9c", label: "Top 3" },
  4: { bg: "rgba(255,171,0,0.16)", text: "#b76e00", label: "Top 4" },
  5: { bg: "rgba(255,86,48,0.16)", text: "#b71d18", label: "Top 5" },
};

export function BestSalesman() {
  return (
    <WidgetCard title="Best salesman" bodyClassName="p-0 pb-0" headerClassName="pb-6">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-0 bg-grey-200 hover:bg-grey-200">
              <TableHead className="h-14 pl-6 font-semibold leading-6 text-grey-600">Seller</TableHead>
              <TableHead className="h-14 px-4 font-semibold leading-6 text-grey-600">Product</TableHead>
              <TableHead className="h-14 px-4 text-center font-semibold leading-6 text-grey-600">Country</TableHead>
              <TableHead className="h-14 px-4 text-right font-semibold leading-6 text-grey-600">Total</TableHead>
              <TableHead className="h-14 pr-6 text-right font-semibold leading-6 text-grey-600">Rank</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bestSalesman.map((s) => {
              const rankStyle =
                RANK_STYLES[s.rank] ?? {
                  bg: "rgba(145,158,171,0.16)",
                  text: "#637381",
                  label: `Top ${s.rank}`,
                };
              return (
                <TableRow key={s.name} className="border-dashed">
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center gap-3">
                      <Image
                        src={s.avatar}
                        alt={s.name}
                        width={40}
                        height={40}
                        className="size-10 rounded-full object-cover"
                      />
                      <span className="font-semibold text-grey-800">{s.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-4 text-grey-700">{s.product}</TableCell>
                  <TableCell className="px-4 py-4 text-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/flags/${s.country.toUpperCase()}.svg`}
                      alt={s.country}
                      className="mx-auto h-5 w-7 rounded-sm object-cover"
                    />
                  </TableCell>
                  <TableCell className="px-4 py-4 text-right font-semibold text-grey-800">
                    {s.total}
                  </TableCell>
                  <TableCell className="py-4 pr-6 text-right">
                    <span
                      className="inline-flex min-w-[56px] items-center justify-center rounded-md px-2 py-1 text-xs font-bold"
                      style={{
                        backgroundColor: rankStyle.bg,
                        color: rankStyle.text,
                      }}
                    >
                      {rankStyle.label}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </WidgetCard>
  );
}
