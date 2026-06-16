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
import { PSP_BREAKDOWN } from "@/lib/mock/reports";
import { cn } from "@/lib/utils";

function fmtTHB(n: number): string {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtInt(n: number): string {
  return n.toLocaleString("th-TH");
}

function PspLogo({ name }: { name: string }) {
  const is2c2p = name === "2C2P";
  return (
    <div
      className={cn(
        "inline-flex size-7 shrink-0 items-center justify-center rounded-md text-[9px] font-bold text-white",
        is2c2p ? "bg-blue-600" : "bg-emerald-600"
      )}
    >
      {is2c2p ? "2C" : "OMS"}
    </div>
  );
}

export function PspBreakdown() {
  return (
    <Card>
      <CardHeader className="border-b px-5 py-4">
        <CardTitle>แยกตาม PSP</CardTitle>
        <CardDescription>30 วันย้อนหลัง</CardDescription>
      </CardHeader>
      <CardContent className="px-0 py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-5">PSP</TableHead>
              <TableHead className="text-right">รายการ</TableHead>
              <TableHead className="text-right">มูลค่า</TableHead>
              <TableHead className="text-right">Success</TableHead>
              <TableHead className="text-right pr-5">Settlement</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {PSP_BREAKDOWN.map((row) => (
              <TableRow key={row.psp}>
                <TableCell className="pl-5">
                  <div className="flex items-center gap-2.5">
                    <PspLogo name={row.psp} />
                    <span className="font-semibold">{row.psp}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums">{fmtInt(row.txn)}</TableCell>
                <TableCell className="text-right tabular-nums">฿{fmtTHB(row.vol)}</TableCell>
                <TableCell className="text-right tabular-nums font-bold text-success-dark">
                  {row.successRate}%
                </TableCell>
                <TableCell className="text-right pr-5">{row.settlement}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
