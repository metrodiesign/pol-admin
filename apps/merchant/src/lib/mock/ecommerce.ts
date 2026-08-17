import type { AccentColor } from "./dashboard";

export interface EcommerceStat {
  title: string;
  total: string;
  trend: { value: number; up: boolean };
  series: number[];
  color: AccentColor;
}

export const ecommerceStats: EcommerceStat[] = [
  {
    title: "Product sold",
    total: "765",
    trend: { value: 2.6, up: true },
    series: [22, 8, 35, 50, 82, 84, 77, 12, 87, 43],
    color: "primary",
  },
  {
    title: "Total balance",
    total: "18,765",
    trend: { value: 0.1, up: false },
    series: [40, 70, 50, 28, 70, 75, 7, 64, 38, 27],
    color: "warning",
  },
  {
    title: "Sales profit",
    total: "4,876",
    trend: { value: 0.6, up: true },
    series: [56, 47, 40, 62, 73, 30, 23, 54, 67, 68],
    color: "error",
  },
];

export interface GenderSlice {
  label: string;
  value: number;
  color: string;
}

export const saleByGender: { total: number; data: GenderSlice[] } = {
  total: 2324,
  data: [
    { label: "Mens", value: 1100, color: "#00A76F" },
    { label: "Womens", value: 800, color: "#FFAB00" },
    { label: "Kids", value: 424, color: "#FF5630" },
  ],
};

export interface YearlySalesData {
  categories: string[];
  series: { name: string; data: number[]; color: string }[];
  totals: { name: string; value: string }[];
  change: string;
}

export const yearlySales: YearlySalesData = {
  categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  series: [
    {
      name: "Total income",
      data: [10, 41, 35, 51, 49, 62, 69, 91, 120, 148, 160, 180],
      color: "#00A76F",
    },
    {
      name: "Total expenses",
      data: [10, 34, 13, 56, 77, 88, 99, 77, 45, 66, 44, 30],
      color: "#FFAB00",
    },
  ],
  totals: [
    { name: "Total income", value: "1.23k" },
    { name: "Total expenses", value: "6.79k" },
  ],
  change: "(+43%) than last year",
};

export interface SalesOverviewItem {
  label: string;
  value: string;
  percent: string;
  progress: number;
  color: string;
}

export const salesOverview: SalesOverviewItem[] = [
  { label: "Total profit", value: "$8,374", percent: "10.1%", progress: 65, color: "#00A76F" },
  { label: "Total income", value: "$9,714", percent: "13.6%", progress: 80, color: "#00B8D9" },
  { label: "Total expenses", value: "$6,871", percent: "28.2%", progress: 50, color: "#FFAB00" },
];

export interface BalanceRow {
  label: string;
  value: string;
  negative?: boolean;
}

export const currentBalance = {
  total: "$187,650",
  rows: [
    { label: "Order total", value: "$287,650" },
    { label: "Earning", value: "$25,500" },
    { label: "Refunded", value: "$1,600", negative: true },
  ] as BalanceRow[],
};

export interface Salesman {
  name: string;
  avatar: string;
  product: string;
  country: string;
  countryFlag: string;
  total: string;
  rank: number;
}

export const bestSalesman: Salesman[] = [
  { name: "Jayvion Simon", avatar: "/avatars/avatar-1.webp", product: "CAP", country: "de", countryFlag: "🇩🇪", total: "$83.74", rank: 1 },
  { name: "Lucian Obrien", avatar: "/avatars/avatar-2.webp", product: "Branded shoes", country: "gb", countryFlag: "🇬🇧", total: "$97.14", rank: 2 },
  { name: "Deja Brady", avatar: "/avatars/avatar-3.webp", product: "Headphone", country: "fr", countryFlag: "🇫🇷", total: "$68.71", rank: 3 },
  { name: "Harrison Stein", avatar: "/avatars/avatar-4.webp", product: "Cell phone", country: "kr", countryFlag: "🇰🇷", total: "$85.21", rank: 4 },
  { name: "Reece Chung", avatar: "/avatars/avatar-5.webp", product: "Earings", country: "us", countryFlag: "🇺🇸", total: "$52.17", rank: 5 },
];

export interface LatestProduct {
  name: string;
  image: string;
  price: string;
  priceSale?: string;
  colors: string[];
}

export const latestProducts: LatestProduct[] = [
  { name: "Urban Explorer Sneakers", image: "/products/product-1.webp", price: "$83.74", colors: ["#000000", "#FFFFFF", "#FF5630", "#00A76F"] },
  { name: "Classic Leather Loafers", image: "/products/product-2.webp", price: "$97.14", priceSale: "$115.00", colors: ["#00A76F", "#FFAB00"] },
  { name: "Mountain Trekking Boots", image: "/products/product-3.webp", price: "$68.71", colors: ["#00B8D9", "#FF5630", "#FFAB00", "#8E33FF", "#000000", "#1C252E"] },
  { name: "Elegance Stiletto Heels", image: "/products/product-4.webp", price: "$85.21", priceSale: "$110.00", colors: ["#8E33FF", "#FF5630"] },
  { name: "Comfy Running Shoes", image: "/products/product-5.webp", price: "$52.17", colors: ["#00A76F"] },
];

export const ecommerceWelcome = {
  name: "Jaydon Frankie",
  subtitle: "Best seller of the month you have done 57.6% more sales today.",
};

export interface EcommerceWelcomeSlide {
  title: string;
  highlight?: string;
  subtitle: string;
  cta: string;
}

export const ecommerceWelcomeSlides: EcommerceWelcomeSlide[] = [
  {
    title: "Congratulations 🎉",
    highlight: "Jaydon Frankie",
    subtitle: "Best seller of the month you have done 57.6% more sales today.",
    cta: "Go now",
  },
  {
    title: "New orders today 📦",
    subtitle:
      "You received 120 new orders worth $8,420 — keep the momentum going.",
    cta: "View orders",
  },
  {
    title: "Top rated store ⭐",
    subtitle:
      "Your store reached a 4.9 rating from 2,340 happy customers this month.",
    cta: "See reviews",
  },
];

export interface ProductSlide {
  label: string;
  title: string;
  image: string;
}

export const productSlides: ProductSlide[] = [
  { label: "New", title: "Urban Explorer Sneakers", image: "/products/product-1.webp" },
  { label: "New", title: "Classic Leather Loafers", image: "/products/product-2.webp" },
  { label: "New", title: "Mountain Trekking Boots", image: "/products/product-3.webp" },
  { label: "New", title: "Elegance Stiletto Heels", image: "/products/product-4.webp" },
];
