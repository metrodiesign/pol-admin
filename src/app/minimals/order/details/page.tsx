import Image from "next/image";
import { Plus } from "lucide-react";
import { OrderDetailsHeader } from "@/components/dashboard/order/order-details-header";
import { OrderInfoCard } from "@/components/dashboard/order/order-info-card";
import { OrderDetailItems } from "@/components/dashboard/order/order-details-items";
import { OrderHistoryTimeline } from "@/components/dashboard/order/order-history-timeline";
import { ORDER_DETAIL } from "@/lib/mock/order";

export const metadata = {
  title: "Order details | Dashboard - Minimal UI",
};

export default function OrderDetailsPage() {
  const order = ORDER_DETAIL;

  return (
    <>
      <OrderDetailsHeader
        orderNumber={order.orderNumber}
        status={order.status}
        date={order.date}
        time={order.time}
      />

      {/* Two-column grid
          Mobile stacking order per spec: History, Details, Customer, Delivery, Shipping, Payment
          On desktop (lg): left col = Details + History; right col = Customer, Delivery, Shipping, Payment
      */}
      <div className="grid grid-cols-1 gap-6 mmd:grid-cols-12">
        {/* Left column — flex col to enable mobile reorder via CSS order */}
        <div className="flex flex-col gap-6 mmd:col-span-8">
          {/* History card — order-1 on mobile so it appears first */}
          <div className="order-1 mmd:order-2">
            <OrderInfoCard title="History" showEdit={false}>
              <OrderHistoryTimeline
                events={order.history}
                keyTimes={order.keyTimes}
              />
            </OrderInfoCard>
          </div>

          {/* Details card — order-2 on mobile (appears after History) */}
          <div className="order-2 mmd:order-1">
            <OrderInfoCard title="Details">
              <OrderDetailItems
                items={order.orderItems}
                subtotal={order.subtotal}
                shipping={order.shipping}
                discount={order.discount}
                taxes={order.taxes}
                total={order.total}
              />
            </OrderInfoCard>
          </div>
        </div>

        {/* Right column — single card containing Customer/Delivery/Shipping/Payment */}
        <div className="mmd:col-span-4">
          <div className="dashboard-card overflow-hidden">
            {/* Customer section */}
            <div className="px-6 py-5">
              <div className="mb-4 flex items-center justify-between">
                <h6 className="text-base font-semibold leading-6 text-foreground">Customer</h6>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-grey-200">
                  <Image
                    src={order.customer.avatarUrl}
                    alt={order.customer.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-base font-semibold text-foreground">
                    {order.customer.name}
                  </p>
                  <p className="truncate text-xs text-grey-600">
                    {order.customer.email}
                  </p>
                </div>
              </div>

              {order.customer.ipAddress && (
                <p className="mt-3 text-sm text-foreground">
                  <span className="text-grey-600">IP address: </span>
                  {order.customer.ipAddress}
                </p>
              )}

              <button
                type="button"
                className="mt-4 flex items-center gap-1 text-xs font-bold leading-[22px] text-error transition-opacity hover:opacity-70"
              >
                <Plus className="size-4" />
                Add to blacklist
              </button>
            </div>

            {/* Dashed divider */}
            <div className="border-t border-dashed border-grey-200" />

            {/* Delivery section */}
            <div className="px-6 py-5">
              <h6 className="mb-4 text-base font-semibold leading-6 text-foreground">Delivery</h6>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-grey-600">Ship by</span>
                  <span className="font-semibold text-foreground">
                    {order.delivery.shipBy}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-grey-600">Speedy</span>
                  <span className="font-semibold text-foreground">
                    {order.delivery.speedy}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-grey-600">Tracking No.</span>
                  <a
                    href="#"
                    className="font-semibold text-foreground underline decoration-foreground/40 hover:decoration-foreground"
                  >
                    {order.delivery.trackingNo}
                  </a>
                </div>
              </div>
            </div>

            {/* Dashed divider */}
            <div className="border-t border-dashed border-grey-200" />

            {/* Shipping section */}
            <div className="px-6 py-5">
              <h6 className="mb-4 text-base font-semibold leading-6 text-foreground">Shipping</h6>
              <div className="space-y-3 text-sm">
                <div className="flex items-start justify-between gap-4">
                  <span className="shrink-0 text-grey-600">Address</span>
                  <span className="text-right font-semibold text-foreground">
                    {order.shippingAddress.address}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-grey-600">Phone number</span>
                  <span className="font-semibold text-foreground">
                    {order.shippingAddress.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Dashed divider */}
            <div className="border-t border-dashed border-grey-200" />

            {/* Payment section */}
            <div className="px-6 py-5">
              <h6 className="mb-4 text-base font-semibold leading-6 text-foreground">Payment</h6>
              <div className="flex items-center justify-between">
                <span className="font-semibold tracking-widest text-foreground">
                  **** **** **** {order.payment.cardLast4}
                </span>
                {/* Mastercard logo */}
                <div className="flex items-center">
                  <div className="size-6 rounded-full bg-[rgb(235,0,27)] opacity-90" />
                  <div className="-ml-3 size-6 rounded-full bg-[rgb(255,95,0)] opacity-70" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
