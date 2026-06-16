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
import { ChannelTag } from "@/components/payment/channel-tag";
import { CHANNEL_BREAKDOWN } from "@/lib/mock/reports";

function fmtTHB(n: number): string {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtInt(n: number): string {
  return n.toLocaleString("th-TH");
}

export function ChannelBreakdown() {
  const total = {
    txn: CHANNEL_BREAKDOWN.reduce((s, r) => s + r.txn, 0),
    vol: CHANNEL_BREAKDOWN.reduce((s, r) => s + r.vol, 0),
    fee: CHANNEL_BREAKDOWN.reduce((s, r) => s + r.fee, 0),
    net: CHANNEL_BREAKDOWN.reduce((s, r) => s + r.net, 0),
  };

  return (
    <Card>
      <CardHeader className="border-b px-5 py-4">
        <CardTitle>แยกตามช่องทาง</CardTitle>
        <CardDescription>30 วันย้อนหลัง</CardDescription>
      </CardHeader>
      <CardContent className="px-0 py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-5">ช่องทาง</TableHead>
              <TableHead className="text-right">รายการ</TableHead>
              <TableHead className="text-right">มูลค่า</TableHead>
              <TableHead className="text-right text-muted-foreground">ค่าธรรมเนียม</TableHead>
              <TableHead className="text-right pr-5">สุทธิ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {CHANNEL_BREAKDOWN.map((row) => (
              <TableRow key={row.channel}>
                <TableCell className="pl-5">
                  <ChannelTag channel={row.channel} />
                </TableCell>
                <TableCell className="text-right tabular-nums">{fmtInt(row.txn)}</TableCell>
                <TableCell className="text-right tabular-nums">฿{fmtTHB(row.vol)}</TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  ฿{fmtTHB(row.fee)}
                </TableCell>
                <TableCell className="text-right tabular-nums font-bold pr-5">
                  ฿{fmtTHB(row.net)}
                </TableCell>
              </TableRow>
            ))}
            {/* Total row */}
            <TableRow className="bg-muted/30 font-semibold">
              <TableCell className="pl-5">รวม</TableCell>
              <TableCell className="text-right tabular-nums">{fmtInt(total.txn)}</TableCell>
              <TableCell className="text-right tabular-nums">฿{fmtTHB(total.vol)}</TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">
                ฿{fmtTHB(total.fee)}
              </TableCell>
              <TableCell className="text-right tabular-nums font-bold pr-5">
                ฿{fmtTHB(total.net)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
