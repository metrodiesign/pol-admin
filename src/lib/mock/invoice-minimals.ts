export type MinimalsInvoiceStatus = "paid" | "pending" | "overdue" | "draft";

export interface MinimalsInvoiceRow {
  id: string;
  invoiceNumber: string;
  customer: string;
  avatarColor: string;
  createdDate: string;
  createdTime: string;
  dueDate: string;
  dueTime: string;
  amount: string;
  sent: number;
  status: MinimalsInvoiceStatus;
}

export interface MinimalsInvoiceItem {
  title: string;
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
}

export interface MinimalsAddress {
  name: string;
  address: string;
  zipCity: string;
  phone: string;
}

export interface MinimalsInvoiceDetail {
  invoiceNumber: string;
  status: MinimalsInvoiceStatus;
  dateCreate: string;
  dueDate: string;
  from: MinimalsAddress;
  to: MinimalsAddress;
  items: MinimalsInvoiceItem[];
  shipping: number;
  discount: number;
  taxes: number;
  subtotal: number;
  total: number;
  notes: string;
  supportEmail: string;
}

// ---- Summary stats ----
export const INVOICE_STATS = {
  total: { count: 20, amount: "$46,218.04" },
  paid: { count: 10, amount: "$23,110.23" },
  pending: { count: 6, amount: "$13,825.05" },
  overdue: { count: 2, amount: "$4,655.63" },
  draft: { count: 2, amount: "$4,627.13" },
} as const;

// ---- Table rows ----
// 20 rows matching spec: 10 paid, 6 pending, 2 overdue, 2 draft
export const INVOICE_ROWS: MinimalsInvoiceRow[] = [
  {
    id: "1",
    invoiceNumber: "INV-19919",
    customer: "Amiah Pruitt",
    avatarColor: "bg-grey-300",
    createdDate: "19 May 2026",
    createdTime: "10:55 pm",
    dueDate: "12 Jul 2026",
    dueTime: "5:55 pm",
    amount: "$2,331.63",
    sent: 9,
    status: "paid",
  },
  {
    id: "2",
    invoiceNumber: "INV-19918",
    customer: "Ariana Lang",
    avatarColor: "bg-grey-300",
    createdDate: "20 May 2026",
    createdTime: "10:55 pm",
    dueDate: "11 Jul 2026",
    dueTime: "4:55 pm",
    amount: "$2,372.93",
    sent: 4,
    status: "overdue",
  },
  {
    id: "3",
    invoiceNumber: "INV-19917",
    customer: "Lawson Bass",
    avatarColor: "bg-secondary",
    createdDate: "21 May 2026",
    createdTime: "10:55 pm",
    dueDate: "10 Jul 2026",
    dueTime: "3:55 pm",
    amount: "$2,283.97",
    sent: 9,
    status: "paid",
  },
  {
    id: "4",
    invoiceNumber: "INV-19916",
    customer: "Selina Boyer",
    avatarColor: "bg-success",
    createdDate: "22 May 2026",
    createdTime: "10:55 pm",
    dueDate: "09 Jul 2026",
    dueTime: "2:55 pm",
    amount: "$2,251.84",
    sent: 8,
    status: "pending",
  },
  {
    id: "5",
    invoiceNumber: "INV-19915",
    customer: "Angelique Morse",
    avatarColor: "bg-grey-300",
    createdDate: "23 May 2026",
    createdTime: "10:55 pm",
    dueDate: "08 Jul 2026",
    dueTime: "1:55 pm",
    amount: "$2,343.51",
    sent: 11,
    status: "paid",
  },
  {
    id: "6",
    invoiceNumber: "INV-19914",
    customer: "Deja Brady",
    avatarColor: "bg-secondary",
    createdDate: "24 May 2026",
    createdTime: "10:55 pm",
    dueDate: "07 Jul 2026",
    dueTime: "12:55 pm",
    amount: "$2,188.32",
    sent: 6,
    status: "pending",
  },
  {
    id: "7",
    invoiceNumber: "INV-19913",
    customer: "Jayvion Simon",
    avatarColor: "bg-grey-300",
    createdDate: "25 May 2026",
    createdTime: "10:55 pm",
    dueDate: "06 Jul 2026",
    dueTime: "11:55 am",
    amount: "$2,456.12",
    sent: 3,
    status: "draft",
  },
  {
    id: "8",
    invoiceNumber: "INV-19912",
    customer: "Lucian Obrien",
    avatarColor: "bg-grey-300",
    createdDate: "26 May 2026",
    createdTime: "10:55 pm",
    dueDate: "05 Jul 2026",
    dueTime: "10:55 am",
    amount: "$2,102.75",
    sent: 7,
    status: "paid",
  },
  {
    id: "9",
    invoiceNumber: "INV-19911",
    customer: "Reece Chung",
    avatarColor: "bg-success",
    createdDate: "27 May 2026",
    createdTime: "10:55 pm",
    dueDate: "04 Jul 2026",
    dueTime: "9:55 am",
    amount: "$2,319.88",
    sent: 5,
    status: "pending",
  },
  {
    id: "10",
    invoiceNumber: "INV-19910",
    customer: "Lainey Davidson",
    avatarColor: "bg-grey-300",
    createdDate: "28 May 2026",
    createdTime: "10:55 pm",
    dueDate: "03 Jul 2026",
    dueTime: "8:55 am",
    amount: "$2,278.46",
    sent: 2,
    status: "overdue",
  },
  {
    id: "11",
    invoiceNumber: "INV-19909",
    customer: "Chase Day",
    avatarColor: "bg-secondary",
    createdDate: "29 May 2026",
    createdTime: "10:55 pm",
    dueDate: "02 Jul 2026",
    dueTime: "7:55 am",
    amount: "$2,194.61",
    sent: 10,
    status: "paid",
  },
  {
    id: "12",
    invoiceNumber: "INV-19908",
    customer: "Shawn Manning",
    avatarColor: "bg-grey-300",
    createdDate: "30 May 2026",
    createdTime: "10:55 pm",
    dueDate: "01 Jul 2026",
    dueTime: "6:55 am",
    amount: "$2,341.19",
    sent: 4,
    status: "pending",
  },
  {
    id: "13",
    invoiceNumber: "INV-19907",
    customer: "Soren Durham",
    avatarColor: "bg-grey-300",
    createdDate: "31 May 2026",
    createdTime: "10:55 pm",
    dueDate: "30 Jun 2026",
    dueTime: "5:55 pm",
    amount: "$2,267.84",
    sent: 8,
    status: "paid",
  },
  {
    id: "14",
    invoiceNumber: "INV-19906",
    customer: "Cortez Herring",
    avatarColor: "bg-success",
    createdDate: "01 Jun 2026",
    createdTime: "10:55 pm",
    dueDate: "29 Jun 2026",
    dueTime: "4:55 pm",
    amount: "$2,398.27",
    sent: 6,
    status: "pending",
  },
  {
    id: "15",
    invoiceNumber: "INV-19905",
    customer: "Brycen Jimenez",
    avatarColor: "bg-grey-300",
    createdDate: "02 Jun 2026",
    createdTime: "10:55 pm",
    dueDate: "28 Jun 2026",
    dueTime: "3:55 pm",
    amount: "$2,156.93",
    sent: 3,
    status: "paid",
  },
  {
    id: "16",
    invoiceNumber: "INV-19904",
    customer: "Arielle Sims",
    avatarColor: "bg-grey-300",
    createdDate: "03 Jun 2026",
    createdTime: "10:55 pm",
    dueDate: "27 Jun 2026",
    dueTime: "2:55 pm",
    amount: "$2,222.57",
    sent: 9,
    status: "pending",
  },
  {
    id: "17",
    invoiceNumber: "INV-19903",
    customer: "Melanie Noble",
    avatarColor: "bg-secondary",
    createdDate: "04 Jun 2026",
    createdTime: "10:55 pm",
    dueDate: "26 Jun 2026",
    dueTime: "1:55 pm",
    amount: "$2,489.03",
    sent: 7,
    status: "paid",
  },
  {
    id: "18",
    invoiceNumber: "INV-19902",
    customer: "Emiliano Gutierrez",
    avatarColor: "bg-grey-300",
    createdDate: "05 Jun 2026",
    createdTime: "10:55 pm",
    dueDate: "25 Jun 2026",
    dueTime: "12:55 pm",
    amount: "$2,311.44",
    sent: 5,
    status: "paid",
  },
  {
    id: "19",
    invoiceNumber: "INV-19901",
    customer: "Sasha Ramos",
    avatarColor: "bg-grey-300",
    createdDate: "06 Jun 2026",
    createdTime: "10:55 pm",
    dueDate: "24 Jun 2026",
    dueTime: "11:55 am",
    amount: "$2,178.66",
    sent: 2,
    status: "draft",
  },
  {
    id: "20",
    invoiceNumber: "INV-19900",
    customer: "Destiny Yang",
    avatarColor: "bg-success",
    createdDate: "07 Jun 2026",
    createdTime: "10:55 pm",
    dueDate: "23 Jun 2026",
    dueTime: "10:55 am",
    amount: "$2,344.91",
    sent: 11,
    status: "paid",
  },
];

// ---- Detail for INV-19919 ----
export const INVOICE_DETAIL: MinimalsInvoiceDetail = {
  invoiceNumber: "INV-19919",
  status: "paid",
  dateCreate: "19 May 2026",
  dueDate: "12 Jul 2026",
  from: {
    name: "Ariana Lang",
    address: "4642 Demetris Lane Suite 407 - Edmond, AZ / 60888",
    zipCity: "",
    phone: "Phone: +54 11 1234-5678",
  },
  to: {
    name: "Amiah Pruitt",
    address: "74794 Asha Flat Suite 890 - Lancaster, OR / 13466",
    zipCity: "",
    phone: "Phone: +64 9 123 4567",
  },
  items: [
    {
      title: "Urban Explorer Sneakers",
      description: "The sun slowly set over the horizon, painting the sky in vibrant hues of orange and pi...",
      qty: 11,
      unitPrice: 83.74,
      total: 921.14,
    },
    {
      title: "Classic Leather Loafers",
      description: "She eagerly opened the gift, her eyes sparkling with excitement.",
      qty: 10,
      unitPrice: 97.14,
      total: 971.4,
    },
    {
      title: "Mountain Trekking Boots",
      description: "The old oak tree stood tall and majestic, its branches swaying gently in the breeze.",
      qty: 7,
      unitPrice: 68.71,
      total: 480.97,
    },
  ],
  shipping: -94.25,
  discount: -20.54,
  taxes: 72.9,
  subtotal: 2373.51,
  total: 2331.63,
  notes: "We appreciate your business. Should you need us to add VAT or extra notes let us know!",
  supportEmail: "support@minimals.cc",
};

// ---- Edit invoice data (same as INV-19919 edit) ----
export const INVOICE_EDIT_DATA = {
  invoiceNumber: "INV-19919",
  status: "paid" as MinimalsInvoiceStatus,
  dateCreate: "05/19/2026",
  dueDate: "07/12/2026",
  from: {
    name: "Ariana Lang",
    address: "4642 Demetris Lane Suite 407 - Edmond, AZ / 60888",
    phone: "+54 11 1234-5678",
  },
  to: {
    name: "Amiah Pruitt",
    address: "74794 Asha Flat Suite 890 - Lancaster, OR / 13466",
    phone: "+64 9 123 4567",
  },
  items: [
    { title: "Urban Explorer Sneakers", description: "The sun slowly set over the horizon, painting the sky in vibrant hues of orange and pink.", service: "Technology", qty: 11, price: 83.74 },
    { title: "Classic Leather Loafers", description: "She eagerly opened the gift, her eyes sparkling with excitement.", service: "Health And Wellness", qty: 10, price: 97.14 },
    { title: "Mountain Trekking Boots", description: "The old oak tree stood tall and majestic, its branches swaying gently in the breeze.", service: "Travel", qty: 7, price: 68.71 },
  ],
  shipping: 94.25,
  discount: 20.54,
  taxes: 72.9,
};

export const SERVICES = ["Technology", "Health And Wellness", "Travel", "Education", "Finance", "Other"];
