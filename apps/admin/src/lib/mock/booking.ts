export interface BookingStat {
  title: string;
  total: string;
  trend: { value: number; up: boolean };
}

export const bookingStats: BookingStat[] = [
  { title: "Total booking", total: "714k", trend: { value: 2.6, up: true } },
  { title: "Sold", total: "311k", trend: { value: 0.2, up: true } },
  { title: "Canceled", total: "124k", trend: { value: 0.1, up: false } },
];

export const totalIncomes = {
  total: "$18,765",
  trend: { value: 2.6, up: true },
  trendLabel: "last month",
  series: [40, 60, 45, 80, 70, 90, 65, 85, 100, 90, 110, 120],
};

export interface BookedItem {
  label: string;
  value: string;
  progress: number;
  color: string;
}

export const bookedItems: BookedItem[] = [
  { label: "PENDING", value: "9.91k", progress: 50, color: "#FFAB00" },
  { label: "CANCELED", value: "1.95k", progress: 12, color: "#FF5630" },
  { label: "SOLD", value: "9.12k", progress: 62, color: "#00A76F" },
];

export const conversionStats = [
  { label: "Sold", value: "73.9%", total: "38,566", color: "#00A76F" },
  { label: "Pending for payment", value: "45.6%", total: "18,472", color: "#FFAB00" },
];

export const toursAvailable = {
  total: 186,
  sold: 120,
  available: 66,
};

export const bookingStatistics = {
  legend: [
    { label: "Sold", value: "6.79k", color: "#00A76F" },
    { label: "Canceled", value: "1.23k", color: "#FFAC82" },
  ],
  categories: ["2018", "2019", "2020", "2021", "2022", "2023"],
  series: [
    { name: "Sold", data: [40, 32, 55, 80, 76, 68], color: "#00A76F" },
    { name: "Canceled", data: [20, 28, 18, 22, 38, 26], color: "#FFAC82" },
  ],
};

export interface Review {
  name: string;
  avatar: string;
  postedAt: string;
  rating: number;
  comment: string;
  tags: string[];
}

export const customerReviews: Review[] = [
  {
    name: "Jayvion Simon",
    avatar: "/avatars/avatar-1.webp",
    postedAt: "Posted 07 Jun 2026 10:21 pm",
    rating: 5,
    comment:
      "Occaecati est et illo quibusdam accusamus qui. Incidunt aut et molestiae vel et molestiae natus occaecati. Elit et aute amet earum vitae et vero. Delectus nisi ut accusantium dolorem rerum.",
    tags: ["Great service", "Recommended", "Best price"],
  },
  {
    name: "Lucian Obrien",
    avatar: "/avatars/avatar-2.webp",
    postedAt: "Posted 06 Jun 2026 8:15 pm",
    rating: 5,
    comment: "Amazing experience! Would definitely come back again.",
    tags: ["Top notch", "Friendly staff"],
  },
  {
    name: "Deja Brady",
    avatar: "/avatars/avatar-3.webp",
    postedAt: "Posted 05 Jun 2026 6:00 pm",
    rating: 4,
    comment: "Great place, highly recommended for families.",
    tags: ["Family friendly", "Good value"],
  },
  {
    name: "Harrison Stein",
    avatar: "/avatars/avatar-4.webp",
    postedAt: "Posted 04 Jun 2026 3:30 pm",
    rating: 4,
    comment: "Excellent service and beautiful scenery.",
    tags: ["Scenic", "Professional"],
  },
  {
    name: "Reece Chung",
    avatar: "/avatars/avatar-5.webp",
    postedAt: "Posted 03 Jun 2026 1:00 pm",
    rating: 5,
    comment: "Best tour experience I've ever had!",
    tags: ["Excellent", "Must visit"],
  },
];

export interface NewestBooking {
  name: string;
  avatar: string;
  bookedAt: string;
  price: string;
  isHot: boolean;
  guests: string;
  duration: string;
  coverImage: string;
}

export const newestBookings: NewestBooking[] = [
  {
    name: "Jayvion Simon",
    avatar: "/avatars/avatar-1.webp",
    bookedAt: "25 May 2026",
    price: "$83.74",
    isHot: true,
    guests: "3-5 guests",
    duration: "3 days 2 nights",
    coverImage: "/covers/cover-1.webp",
  },
  {
    name: "Lucian Obrien",
    avatar: "/avatars/avatar-2.webp",
    bookedAt: "24 May 2026",
    price: "$97.14",
    isHot: true,
    guests: "3-5 guests",
    duration: "3 days 2 nights",
    coverImage: "/covers/cover-2.webp",
  },
  {
    name: "Deja Brady",
    avatar: "/avatars/avatar-3.webp",
    bookedAt: "22 May 2026",
    price: "$68.71",
    isHot: true,
    guests: "3-5 guests",
    duration: "3 days 2 nights",
    coverImage: "/covers/cover-3.webp",
  },
  {
    name: "Harrison Stein",
    avatar: "/avatars/avatar-4.webp",
    bookedAt: "21 May 2026",
    price: "$85.21",
    isHot: false,
    guests: "3-5 guests",
    duration: "3 days 2 nights",
    coverImage: "/covers/cover-4.webp",
  },
  {
    name: "Reece Chung",
    avatar: "/avatars/avatar-5.webp",
    bookedAt: "20 May 2026",
    price: "$52.17",
    isHot: false,
    guests: "3-5 guests",
    duration: "3 days 2 nights",
    coverImage: "/covers/cover-5.webp",
  },
  {
    name: "Lainey Davidson",
    avatar: "/avatars/avatar-6.webp",
    bookedAt: "19 May 2026",
    price: "$25.18",
    isHot: true,
    guests: "3-5 guests",
    duration: "3 days 2 nights",
    coverImage: "/covers/cover-1.webp",
  },
  {
    name: "Cristopher Cardenas",
    avatar: "/avatars/avatar-25.webp",
    bookedAt: "18 May 2026",
    price: "$43.84",
    isHot: false,
    guests: "3-5 guests",
    duration: "3 days 2 nights",
    coverImage: "/covers/cover-2.webp",
  },
  {
    name: "Melanie Noble",
    avatar: "/avatars/avatar-5.webp",
    bookedAt: "17 May 2026",
    price: "$60.98",
    isHot: false,
    guests: "3-5 guests",
    duration: "3 days 2 nights",
    coverImage: "/covers/cover-3.webp",
  },
];

export interface BookingDetail {
  destination: string;
  destinationImage: string;
  avatar: string;
  customer: string;
  phone: string;
  checkIn: string;
  checkInTime: string;
  checkOut: string;
  checkOutTime: string;
  status: "paid" | "pending" | "cancelled";
}

export const bookingDetails: BookingDetail[] = [
  {
    destination: "Island Hopping Extravaganza",
    destinationImage: "/covers/cover-1.webp",
    avatar: "/avatars/avatar-1.webp",
    customer: "Jayvion Simon",
    phone: "+1 202-555-0143",
    checkIn: "07 Jun 2026",
    checkInTime: "1:35 am",
    checkOut: "07 Jun 2026",
    checkOutTime: "7:35 am",
    status: "paid",
  },
  {
    destination: "Cultural Wonders of Europe",
    destinationImage: "/covers/cover-2.webp",
    avatar: "/avatars/avatar-2.webp",
    customer: "Lucian Obrien",
    phone: "+1 416-555-0198",
    checkIn: "06 Jun 2026",
    checkInTime: "12:35 am",
    checkOut: "06 Jun 2026",
    checkOutTime: "8:35 am",
    status: "paid",
  },
  {
    destination: "Safari Expedition in Africa",
    destinationImage: "/covers/cover-3.webp",
    avatar: "/avatars/avatar-3.webp",
    customer: "Deja Brady",
    phone: "+44 20-555-0176",
    checkIn: "05 Jun 2026",
    checkInTime: "11:35 pm",
    checkOut: "05 Jun 2026",
    checkOutTime: "9:35 pm",
    status: "pending",
  },
  {
    destination: "Grand Canyon Explorer",
    destinationImage: "/covers/cover-4.webp",
    avatar: "/avatars/avatar-4.webp",
    customer: "Harrison Stein",
    phone: "+61 2-555-0134",
    checkIn: "04 Jun 2026",
    checkInTime: "10:35 pm",
    checkOut: "04 Jun 2026",
    checkOutTime: "1:35 am",
    status: "cancelled",
  },
  {
    destination: "Historic Cities of Asia",
    destinationImage: "/covers/cover-5.webp",
    avatar: "/avatars/avatar-5.webp",
    customer: "Reece Chung",
    phone: "+82 2-555-0189",
    checkIn: "03 Jun 2026",
    checkInTime: "9:35 pm",
    checkOut: "03 Jun 2026",
    checkOutTime: "3:35 am",
    status: "paid",
  },
];
