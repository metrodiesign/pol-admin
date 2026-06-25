import type { Transaction } from "@/types/transaction";
import { CHANNEL_LABEL, PSP_LABEL } from "@/lib/transaction";

/** A labelled value slice — matches the DonutChart / StackedBarChart data shape. */
export interface ReportSlice {
  name: string;
  value: number;
}

export interface OriginatorRow {
  code: string;
  label: string;
  amount: number;
}

/** Sum amount by PSP, labelled via the shared PSP_LABEL map. */
export function pspSplit(txns: Transaction[]): ReportSlice[] {
  const totals = new Map<string, number>();
  for (const t of txns) {
    totals.set(t.psp, (totals.get(t.psp) ?? 0) + t.amount);
  }
  return [...totals.entries()].map(([psp, value]) => ({
    name: PSP_LABEL[psp as keyof typeof PSP_LABEL] ?? psp,
    value,
  }));
}

/** Sum amount by payment channel, labelled via the shared CHANNEL_LABEL map. */
export function channelSplit(txns: Transaction[]): ReportSlice[] {
  const totals = new Map<string, number>();
  for (const t of txns) {
    totals.set(t.channel, (totals.get(t.channel) ?? 0) + t.amount);
  }
  return [...totals.entries()].map(([channel, value]) => ({
    name: CHANNEL_LABEL[channel as keyof typeof CHANNEL_LABEL] ?? channel,
    value,
  }));
}

/** Top originators by total amount, keyed on source.code. Defaults to top 5. */
export function topOriginators(txns: Transaction[], n = 5): OriginatorRow[] {
  const rows = new Map<string, OriginatorRow>();
  for (const t of txns) {
    const existing = rows.get(t.source.code);
    if (existing) {
      existing.amount += t.amount;
    } else {
      rows.set(t.source.code, {
        code: t.source.code,
        label: t.source.label,
        amount: t.amount,
      });
    }
  }
  return [...rows.values()].sort((a, b) => b.amount - a.amount).slice(0, n);
}

export function totalVolume(txns: Transaction[]): number {
  return txns.reduce((sum, t) => sum + t.amount, 0);
}

export function totalCount(txns: Transaction[]): number {
  return txns.length;
}
