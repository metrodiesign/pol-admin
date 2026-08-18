import { MoreVertical, ArrowRight, Eye, Printer, Share2, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { newInvoices, type InvoiceStatus } from "@/lib/mock/dashboard";
import { cn } from "@/lib/utils";

const statusTone: Record<InvoiceStatus, string> = {
  paid: "bg-success/16 text-success-dark",
  "out of date": "bg-error/16 text-error-dark",
  progress: "bg-warning/16 text-warning-dark",
  draft: "bg-grey-500/16 text-grey-700",
};

function StatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-md px-1.5 text-xs font-bold",
        statusTone[status],
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export function NewInvoices() {
  return (
    <section className="dashboard-card flex h-full flex-col">
      <header className="p-6">
        <h6 className="text-lg font-semibold text-grey-800">New Invoices</h6>
      </header>
      <div className="flex-1 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-0 bg-grey-200 hover:bg-grey-200">
              <TableHead className="h-14 pl-6 font-semibold text-grey-600">Invoice ID</TableHead>
              <TableHead className="h-14 px-4 font-semibold text-grey-600">Category</TableHead>
              <TableHead className="h-14 px-4 font-semibold text-grey-600">Price</TableHead>
              <TableHead className="h-14 px-4 font-semibold text-grey-600">Status</TableHead>
              <TableHead className="h-14 w-10 pr-6" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {newInvoices.map((inv) => (
              <TableRow key={inv.id} className="border-dashed">
                <TableCell className="py-4 pl-6 font-semibold text-grey-800">{inv.id}</TableCell>
                <TableCell className="px-4 py-4 text-grey-700">{inv.category}</TableCell>
                <TableCell className="px-4 py-4 text-grey-700">{inv.price}</TableCell>
                <TableCell className="px-4 py-4">
                  <StatusBadge status={inv.status} />
                </TableCell>
                <TableCell className="py-4 pr-6 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      aria-label="More"
                      className="rounded-full p-1 text-grey-600 transition-colors hover:bg-[var(--action-hover)]"
                    >
                      <MoreVertical className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuItem>
                        <Eye className="size-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Printer className="size-4" />
                        Print
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Share2 className="size-4" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-error focus:text-error">
                        <Trash2 className="size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <footer className="border-t border-dashed border-[var(--divider)] p-3 text-right">
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-control px-3 py-1.5 text-sm font-semibold text-grey-800 transition-colors hover:bg-[var(--action-hover)]"
        >
          View all
          <ArrowRight className="size-4" />
        </button>
      </footer>
    </section>
  );
}
