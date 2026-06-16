import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge } from "@/components/payment/status-badge";
import { RECONCILIATION_ROWS } from "@/lib/mock/reports";
import type { ReconciliationRow } from "@/lib/mock/reports";
import { cn } from "@/lib/utils";

function fmtTHB(n: number): string {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function PspBadge({ psp }: { psp: string }) {
  const is2c2p = psp === "2C2P";
  return (
    <div
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white",
        is2c2p ? "bg-blue-600" : "bg-emerald-600"
      )}
    >
      {is2c2p ? "2C" : "OMS"}
    </div>
  );
}

function ReconciliationStatusBadge({ row }: { row: ReconciliationRow }) {
  if (row.status === "พบส่วนต่าง") return <StatusBadge status="failed" label="พบส่วนต่าง" />;
  if (row.status === "กระทบยอดแล้ว") return <StatusBadge status="succeeded" label="กระทบยอดแล้ว" />;
  return <StatusBadge status="pending" label={row.status} />;
}

export function ReconciliationTable() {
  return (
    <Card>
      <CardHeader className="border-b px-5 py-4">
        <CardTitle>สถานะกระทบยอด (Settlement Reconciliation)</CardTitle>
        <CardDescription>เปรียบเทียบยอดในระบบกับ statement จาก PSP</CardDescription>
      </CardHeader>
      <CardContent className="px-0 py-0">
        {RECONCILIATION_ROWS.map((row, i) => (
          <div
            key={i}
            className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b px-5 py-3.5 last:border-b-0"
          >
            {/* วันที่ */}
            <span className="w-16 shrink-0 text-sm font-semibold">{row.date}</span>

            {/* PSP logo */}
            <PspBadge psp={row.psp} />

            {/* คาดการณ์ */}
            <div className="min-w-[110px]">
              <div className="text-xs text-muted-foreground">คาดการณ์</div>
              <div className="tabular-nums text-sm font-bold">฿{fmtTHB(row.expected)}</div>
            </div>

            {/* เข้าจริง */}
            <div className="min-w-[110px]">
              <div className="text-xs text-muted-foreground">เข้าจริง</div>
              <div
                className={cn(
                  "tabular-nums text-sm font-bold",
                  row.settled === 0
                    ? "text-muted-foreground"
                    : row.match
                      ? "text-success-dark"
                      : "text-error-dark"
                )}
              >
                {row.settled === 0 ? "—" : `฿${fmtTHB(row.settled)}`}
              </div>
            </div>

            {/* ส่วนต่าง */}
            <div className="min-w-[100px] flex-1">
              <div className="text-xs text-muted-foreground">ส่วนต่าง</div>
              <div
                className={cn(
                  "tabular-nums text-sm font-bold",
                  row.match ? "text-muted-foreground" : "text-error-dark"
                )}
              >
                {row.settled === 0
                  ? "—"
                  : row.match
                    ? "฿0.00"
                    : `-฿${fmtTHB(row.expected - row.settled)}`}
              </div>
            </div>

            {/* สถานะ */}
            <ReconciliationStatusBadge row={row} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
