"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ORIGINATOR_BREAKDOWN } from "@/lib/mock/reports";
import { cn } from "@/lib/utils";

function fmtTHB(n: number): string {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtInt(n: number): string {
  return n.toLocaleString("th-TH");
}

function fmtMillions(n: number): string {
  return (n / 1_000_000).toFixed(1) + "M";
}

interface TooltipProps {
  active?: boolean;
  payload?: { value?: number; payload?: { fullName?: string } }[];
  label?: string;
}

function ChartTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value ?? 0;
  const fullName = payload[0]?.payload?.fullName ?? label;
  return (
    <div className="rounded-lg bg-grey-800/90 px-3 py-2 text-xs text-white shadow-lg">
      <p className="mb-1 font-semibold">{fullName}</p>
      <p>฿{fmtTHB(val)}</p>
    </div>
  );
}

const TYPE_STYLE: Record<string, { label: string; dotClass: string }> = {
  branch: { label: "สาขา",   dotClass: "bg-blue-600" },
  app:    { label: "แอป",    dotClass: "bg-violet-600" },
  agent:  { label: "ตัวแทน", dotClass: "bg-emerald-600" },
  broker: { label: "นายหน้า",dotClass: "bg-amber-600" },
};

export function OriginatorBreakdown() {
  const chartData = ORIGINATOR_BREAKDOWN.map((r) => ({
    name: r.id,   // 6-char latin ID — safe for XAxis ticks
    fullName: r.name,
    vol: r.vol,
    txn: r.txn,
  }));

  return (
    <Card>
      <CardHeader className="border-b px-5 py-4">
        <CardTitle>แยกตาม Originator</CardTitle>
        <CardDescription>สาขา / ตัวแทน / นายหน้า / แอป — 30 วันย้อนหลัง</CardDescription>
      </CardHeader>
      <CardContent className="px-5 pt-4 pb-0">
        {/* Bar chart */}
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer
            width="100%"
            height="100%"
            initialDimension={{ width: 600, height: 220 }}
          >
            <BarChart
              data={chartData}
              margin={{ top: 4, right: 4, bottom: 0, left: -8 }}
              barGap={4}
            >
              <CartesianGrid
                vertical={false}
                stroke="rgba(145,158,171,0.2)"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#637381", fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#637381", fontSize: 11 }}
                tickFormatter={(v: number) => fmtMillions(v)}
              />
              <Tooltip
                cursor={{ fill: "rgba(145,158,171,0.08)" }}
                content={<ChartTooltip />}
              />
              <Bar
                dataKey="vol"
                name="มูลค่า"
                fill="#0c68e9"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>

      {/* Table */}
      <CardContent className="px-0 pt-2 pb-0">
        <Table>
          <TableHeader>
            <TableRow className="border-0 bg-grey-200 hover:bg-grey-200">
              <TableHead className="pl-5 bg-grey-200">Originator</TableHead>
              <TableHead className="bg-grey-200">ประเภท</TableHead>
              <TableHead className="text-right bg-grey-200">รายการ</TableHead>
              <TableHead className="text-right pr-5 bg-grey-200">มูลค่า</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ORIGINATOR_BREAKDOWN.map((row) => {
              const style = TYPE_STYLE[row.type] ?? { label: row.type, dotClass: "bg-grey-400" };
              return (
                <TableRow key={row.id} className="border-dashed">
                  <TableCell className="pl-5">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "size-2 shrink-0 rounded-full",
                          style.dotClass
                        )}
                      />
                      <span className="font-medium">{row.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground pl-4">{row.id}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">{style.label}</span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{fmtInt(row.txn)}</TableCell>
                  <TableCell className="text-right tabular-nums font-semibold pr-5">
                    ฿{fmtTHB(row.vol)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
