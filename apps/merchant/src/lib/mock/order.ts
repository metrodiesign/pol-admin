import type { Order, OrderDetail, OrderItem } from "@/types/order";

const AVATAR_BASE =
  "https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/avatar";

const PRODUCT_BASE =
  "https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/m-product";

const BASE_ORDERS: Array<Omit<Order, "orderItems">> = [
  {
    id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b1",
    orderNumber: "#6010",
    customer: {
      name: "Jayvion Simon",
      email: "nannie.abernathy70@yahoo.com",
      avatarUrl: `${AVATAR_BASE}/avatar-1.webp`,
    },
    date: "07 Jun 2026",
    time: "10:49 pm",
    items: 6,
    price: 484.15,
    status: "refunded",
  },
  {
    id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b2",
    orderNumber: "#6011",
    customer: {
      name: "Lucian Obrien",
      email: "ashlynn.ohara62@gmail.com",
      avatarUrl: `${AVATAR_BASE}/avatar-2.webp`,
      ipAddress: "192.158.1.38",
    },
    date: "06 Jun 2026",
    time: "9:49 pm",
    items: 1,
    price: 83.74,
    status: "completed",
  },
  {
    id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b3",
    orderNumber: "#60110",
    customer: {
      name: "Soren Durham",
      email: "vergie.block82@hotmail.com",
      avatarUrl: `${AVATAR_BASE}/avatar-3.webp`,
    },
    date: "28 May 2026",
    time: "12:49 pm",
    items: 5,
    price: 400.41,
    status: "pending",
  },
  {
    id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b4",
    orderNumber: "#60111",
    customer: {
      name: "Cortez Herring",
      email: "vito.hudson@hotmail.com",
      avatarUrl: `${AVATAR_BASE}/avatar-4.webp`,
    },
    date: "27 May 2026",
    time: "11:49 am",
    items: 1,
    price: 83.74,
    status: "completed",
  },
  {
    id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b5",
    orderNumber: "#60112",
    customer: {
      name: "Brycen Jimenez",
      email: "tyrel.greenholt@gmail.com",
      avatarUrl: `${AVATAR_BASE}/avatar-5.webp`,
    },
    date: "26 May 2026",
    time: "10:49 am",
    items: 6,
    price: 484.15,
    status: "refunded",
  },
  {
    id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b6",
    orderNumber: "#60113",
    customer: {
      name: "Angelique Morse",
      email: "benny89@yahoo.com",
      avatarUrl: `${AVATAR_BASE}/avatar-6.webp`,
    },
    date: "25 May 2026",
    time: "9:49 am",
    items: 3,
    price: 240.55,
    status: "pending",
  },
  {
    id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b7",
    orderNumber: "#60114",
    customer: {
      name: "Ariana Lang",
      email: "avery43@hotmail.com",
      avatarUrl: `${AVATAR_BASE}/avatar-7.webp`,
    },
    date: "24 May 2026",
    time: "8:49 am",
    items: 2,
    price: 167.48,
    status: "completed",
  },
  {
    id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b8",
    orderNumber: "#60115",
    customer: {
      name: "Aspen Schmitt",
      email: "mireya13@hotmail.com",
      avatarUrl: `${AVATAR_BASE}/avatar-8.webp`,
    },
    date: "23 May 2026",
    time: "7:49 am",
    items: 4,
    price: 320.20,
    status: "completed",
  },
  {
    id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b9",
    orderNumber: "#60116",
    customer: {
      name: "Branden Sharp",
      email: "ok_here@hotmail.com",
      avatarUrl: `${AVATAR_BASE}/avatar-9.webp`,
    },
    date: "22 May 2026",
    time: "6:49 am",
    items: 1,
    price: 83.74,
    status: "cancelled",
  },
  {
    id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b10",
    orderNumber: "#60117",
    customer: {
      name: "Cody Atkins",
      email: "pquigley@gmail.com",
      avatarUrl: `${AVATAR_BASE}/avatar-10.webp`,
    },
    date: "21 May 2026",
    time: "5:49 am",
    items: 2,
    price: 167.48,
    status: "pending",
  },
  {
    id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b11",
    orderNumber: "#60118",
    customer: {
      name: "Deja Brady",
      email: "joanna.oreilly@yahoo.com",
      avatarUrl: `${AVATAR_BASE}/avatar-11.webp`,
    },
    date: "20 May 2026",
    time: "4:49 pm",
    items: 5,
    price: 400.41,
    status: "pending",
  },
  {
    id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b12",
    orderNumber: "#60119",
    customer: {
      name: "Esperanza Bruen",
      email: "marcelina_hartmann@yahoo.com",
      avatarUrl: `${AVATAR_BASE}/avatar-12.webp`,
    },
    date: "19 May 2026",
    time: "3:49 pm",
    items: 3,
    price: 240.55,
    status: "completed",
  },
  {
    id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b13",
    orderNumber: "#60120",
    customer: {
      name: "Flossie OConnell",
      email: "adrianna.lindgren@yahoo.com",
      avatarUrl: `${AVATAR_BASE}/avatar-13.webp`,
    },
    date: "18 May 2026",
    time: "2:49 pm",
    items: 1,
    price: 83.74,
    status: "completed",
  },
  {
    id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b14",
    orderNumber: "#60121",
    customer: {
      name: "Gavin Lindgren",
      email: "emmitt.rodriguez@hotmail.com",
      avatarUrl: `${AVATAR_BASE}/avatar-14.webp`,
    },
    date: "17 May 2026",
    time: "1:49 pm",
    items: 4,
    price: 320.20,
    status: "pending",
  },
  {
    id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b15",
    orderNumber: "#60122",
    customer: {
      name: "Hallie Bartell",
      email: "kuhic.barton@yahoo.com",
      avatarUrl: `${AVATAR_BASE}/avatar-15.webp`,
    },
    date: "16 May 2026",
    time: "12:49 pm",
    items: 2,
    price: 167.48,
    status: "completed",
  },
  {
    id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b16",
    orderNumber: "#60123",
    customer: {
      name: "Ines Padberg",
      email: "aracely.wunsch@hotmail.com",
      avatarUrl: `${AVATAR_BASE}/avatar-16.webp`,
    },
    date: "15 May 2026",
    time: "11:49 am",
    items: 6,
    price: 484.15,
    status: "pending",
  },
  {
    id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b17",
    orderNumber: "#60124",
    customer: {
      name: "Jaylon Harris",
      email: "jarred_boyle@gmail.com",
      avatarUrl: `${AVATAR_BASE}/avatar-17.webp`,
    },
    date: "14 May 2026",
    time: "10:49 am",
    items: 3,
    price: 240.55,
    status: "completed",
  },
  {
    id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b18",
    orderNumber: "#60125",
    customer: {
      name: "Kenyon Runolfsdottir",
      email: "zenia.graham@yahoo.com",
      avatarUrl: `${AVATAR_BASE}/avatar-18.webp`,
    },
    date: "13 May 2026",
    time: "9:49 am",
    items: 1,
    price: 83.74,
    status: "completed",
  },
  {
    id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b19",
    orderNumber: "#60126",
    customer: {
      name: "Lawson Mayer",
      email: "nona_hackett@yahoo.com",
      avatarUrl: `${AVATAR_BASE}/avatar-19.webp`,
    },
    date: "12 May 2026",
    time: "8:49 am",
    items: 2,
    price: 167.48,
    status: "cancelled",
  },
  {
    id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b20",
    orderNumber: "#60127",
    customer: {
      name: "Lucio Hettinger",
      email: "orpha.wuckert@yahoo.com",
      avatarUrl: `${AVATAR_BASE}/avatar-20.webp`,
    },
    date: "11 May 2026",
    time: "7:49 am",
    items: 5,
    price: 400.41,
    status: "completed",
  },
];

// Standard product catalog the demo cycles through for each order's line items.
const CATALOG: Omit<OrderItem, "qty">[] = [
  {
    name: "Urban Explorer Sneakers",
    sku: "16H9UR0",
    imageUrl: `${PRODUCT_BASE}/product-1.webp`,
    price: 83.74,
  },
  {
    name: "Classic Leather Loafers",
    sku: "16H9UR1",
    imageUrl: `${PRODUCT_BASE}/product-2.webp`,
    price: 97.14,
  },
  {
    name: "Mountain Trekking Boots",
    sku: "16H9UR2",
    imageUrl: `${PRODUCT_BASE}/product-3.webp`,
    price: 68.71,
  },
];

// Distribute the order's total item count across catalog products with rising
// quantities (1, 2, 3…) — mirrors the live order #6010 expansion ([1, 2, 3]).
function buildItems(total: number): OrderItem[] {
  const items: OrderItem[] = [];
  let remaining = total;
  for (let i = 0; i < CATALOG.length && remaining > 0; i++) {
    const qty = Math.min(i + 1, remaining);
    items.push({ ...CATALOG[i]!, qty });
    remaining -= qty;
  }
  if (remaining > 0 && items.length > 0) {
    items[items.length - 1]!.qty += remaining;
  }
  return items;
}

export const ORDERS: Order[] = BASE_ORDERS.map((order) => ({
  ...order,
  orderItems: buildItems(order.items),
}));

export const ORDER_DETAIL: OrderDetail = {
  id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b2",
  orderNumber: "#6011",
  customer: {
    name: "Lucian Obrien",
    email: "ashlynn.ohara62@gmail.com",
    avatarUrl: `${AVATAR_BASE}/avatar-2.webp`,
    ipAddress: "192.158.1.38",
  },
  date: "06 Jun 2026",
  time: "9:51 pm",
  items: 1,
  price: 83.74,
  status: "completed",
  orderItems: [
    {
      name: "Urban Explorer Sneakers",
      sku: "16H9UR0",
      imageUrl: `${PRODUCT_BASE}/product-1.webp`,
      qty: 1,
      price: 83.74,
    },
  ],
  subtotal: 83.74,
  shipping: -10,
  discount: -10,
  taxes: 10,
  total: 73.74,
  history: [
    {
      label: "Delivery successful",
      datetime: "06 Jun 2026 9:51 pm",
      done: true,
      active: true,
    },
    {
      label: "Transporting to [2]",
      datetime: "05 Jun 2026 8:51 pm",
      done: true,
    },
    {
      label: "Transporting to [1]",
      datetime: "04 Jun 2026 7:51 pm",
      done: true,
    },
    {
      label: "The shipping unit has picked up the goods",
      datetime: "03 Jun 2026 6:51 pm",
      done: true,
    },
    {
      label: "Order has been created",
      datetime: "02 Jun 2026 5:51 pm",
      done: true,
    },
  ],
  keyTimes: [
    { label: "Order placed", datetime: "06 Jun 2026 9:51 pm" },
    { label: "Payment time", datetime: "06 Jun 2026 9:51 pm" },
    { label: "Delivery time for the carrier", datetime: "06 Jun 2026 9:51 pm" },
    { label: "Completion time", datetime: "06 Jun 2026 9:51 pm" },
  ],
  delivery: {
    shipBy: "DHL",
    speedy: "Standard",
    trackingNo: "SPX037739199373",
  },
  shippingAddress: {
    address: "19034 Verna Unions Apt. 164 - Honolulu, RI / 87535",
    phone: "365-374-4961",
  },
  payment: {
    cardLast4: "5678",
  },
};
