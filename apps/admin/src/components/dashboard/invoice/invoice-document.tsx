import { INVOICE_DETAIL } from "@/lib/mock/invoice-minimals";
import { InvoiceStatusLabel } from "./invoice-status-label";

// Matches minimals fCurrency: thousands separators, trims trailing zeros (max 2 dp)
function fCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

// Minimal "M." logo SVG
function MinimalLogo() {
  return (
    <svg width="48" height="32" viewBox="0 0 56 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 28V4L20 20L36 4V28"
        stroke="#00A76F"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="50" cy="26" r="4" fill="#00A76F" />
    </svg>
  );
}

export function InvoiceDocument() {
  const inv = INVOICE_DETAIL;

  const subtotal = inv.subtotal;
  const shipping = inv.shipping; // negative
  const discount = inv.discount; // negative
  const taxes = inv.taxes; // percentage

  return (
    <div className="dashboard-card overflow-hidden">
      <div className="p-10 max-sm:p-6">
        {/* Header: logo left, status+number right */}
        <div className="flex items-start justify-between">
          <MinimalLogo />
          <div className="text-right">
            <InvoiceStatusLabel status={inv.status} />
            <p className="mt-1 text-lg font-semibold leading-7 text-grey-800">{inv.invoiceNumber}</p>
          </div>
        </div>

        {/* Party + dates grid */}
        <div className="mt-8 grid grid-cols-2 gap-6 max-sm:grid-cols-1 max-sm:gap-4">
          {/* Invoice from */}
          <div>
            <p className="mb-1 text-sm font-semibold text-grey-800">Invoice from</p>
            <p className="text-sm font-semibold text-grey-800">{inv.from.name}</p>
            <p className="text-sm text-grey-600">{inv.from.address}</p>
            <p className="text-sm text-grey-600">{inv.from.phone}</p>
          </div>
          {/* Invoice to */}
          <div>
            <p className="mb-1 text-sm font-semibold text-grey-800">Invoice to</p>
            <p className="text-sm font-semibold text-grey-800">{inv.to.name}</p>
            <p className="text-sm text-grey-600">{inv.to.address}</p>
            <p className="text-sm text-grey-600">{inv.to.phone}</p>
          </div>
          {/* Date create */}
          <div>
            <p className="mb-1 text-sm font-semibold text-grey-800">Date create</p>
            <p className="text-sm text-grey-600">{inv.dateCreate}</p>
          </div>
          {/* Due date */}
          <div>
            <p className="mb-1 text-sm font-semibold text-grey-800">Due date</p>
            <p className="text-sm text-grey-600">{inv.dueDate}</p>
          </div>
        </div>

        {/* Line items table */}
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[480px]">
            <thead>
              <tr>
                <th className="w-10 bg-grey-200 px-4 py-4 text-left text-sm font-semibold leading-6 text-grey-600">
                  #
                </th>
                <th className="bg-grey-200 px-4 py-4 text-left text-sm font-semibold leading-6 text-grey-600">
                  Description
                </th>
                <th className="bg-grey-200 px-4 py-4 text-right text-sm font-semibold leading-6 text-grey-600">
                  Qty
                </th>
                <th className="bg-grey-200 px-4 py-4 text-right text-sm font-semibold leading-6 text-grey-600">
                  Unit price
                </th>
                <th className="bg-grey-200 px-4 py-4 text-right text-sm font-semibold leading-6 text-grey-600">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {inv.items.map((item, idx) => (
                <tr
                  key={idx}
                  className="border-b border-dashed border-grey-200 last:border-0"
                >
                  <td className="px-4 py-4 text-sm text-grey-600">{idx + 1}</td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-semibold text-grey-800">{item.title}</p>
                    <p className="mt-0.5 max-w-sm truncate text-sm text-grey-500">
                      {item.description}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-right text-sm text-grey-800">{item.qty}</td>
                  <td className="px-4 py-4 text-right text-sm text-grey-800">
                    {fCurrency(item.unitPrice)}
                  </td>
                  <td className="px-4 py-4 text-right text-sm font-semibold text-grey-800">
                    {fCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals block */}
        <div className="mt-6 flex justify-end">
          <div className="w-full max-w-[280px] space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-grey-500">Subtotal</span>
              <span className="text-sm font-semibold text-grey-800">
                {fCurrency(subtotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-grey-500">Shipping</span>
              <span className="text-sm font-semibold text-error">
                {fCurrency(shipping)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-grey-500">Discount</span>
              <span className="text-sm font-semibold text-error">
                {fCurrency(discount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-grey-500">Taxes</span>
              <span className="text-sm font-semibold text-grey-800">{taxes}%</span>
            </div>
            <div className="flex justify-between border-t border-grey-200 pt-2">
              <span className="text-base font-semibold text-grey-800">Total</span>
              <span className="text-base font-semibold text-grey-800">
                {fCurrency(inv.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex flex-wrap justify-between gap-6 border-t border-dashed border-grey-200 pt-6">
          <div className="max-w-sm">
            <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-grey-800">
              Notes
            </p>
            <p className="text-sm text-grey-600">{inv.notes}</p>
          </div>
          <div className="text-right max-sm:text-left">
            <p className="text-sm font-semibold text-grey-800">Have a question?</p>
            <p className="text-sm text-grey-600">{inv.supportEmail}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
