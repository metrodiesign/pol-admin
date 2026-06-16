export interface Trend {
  value: number;
  up: boolean;
}

export type AccentColor = "primary" | "info" | "warning" | "secondary" | "error" | "success";

export interface SummaryStat {
  title: string;
  total: string;
  trend: Trend;
  series: number[];
  color: Extract<AccentColor, "primary" | "info" | "warning" | "error">;
}

export const summaryStats: SummaryStat[] = [
  {
    title: "Total active users",
    total: "18,765",
    trend: { value: 2.6, up: true },
    series: [22, 8, 35, 50, 82, 84, 77, 12, 87, 43],
    color: "primary",
  },
  {
    title: "Total installed",
    total: "4,876",
    trend: { value: 0.2, up: true },
    series: [40, 70, 50, 28, 70, 75, 7, 64, 38, 27],
    color: "info",
  },
  {
    title: "Total downloads",
    total: "678",
    trend: { value: 0.1, up: false },
    series: [56, 47, 40, 62, 73, 30, 23, 54, 67, 68],
    color: "error",
  },
];

export interface DownloadSlice {
  label: string;
  value: number;
}

export const currentDownload: { total: number; data: DownloadSlice[] } = {
  total: 188245,
  data: [
    { label: "Mac", value: 56000 },
    { label: "Window", value: 50000 },
    { label: "iOS", value: 44000 },
    { label: "Android", value: 38245 },
  ],
};

export interface RegionSeries {
  name: string;
  data: number[];
}

export const areaInstalled: {
  years: string[];
  categories: string[];
  regions: RegionSeries[];
  totals: { name: string; value: string }[];
} = {
  years: ["2023", "2022"],
  categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  regions: [
    { name: "Asia", data: [12, 10, 18, 22, 20, 12, 8, 21, 20, 14, 16, 10] },
    { name: "Europe", data: [10, 14, 12, 16, 10, 16, 14, 10, 12, 13, 11, 15] },
    { name: "Americas", data: [6, 18, 14, 9, 20, 12, 10, 14, 8, 12, 9, 16] },
  ],
  totals: [
    { name: "Asia", value: "1.23k" },
    { name: "Europe", value: "6.79k" },
    { name: "Americas", value: "1.01k" },
  ],
};

export type InvoiceStatus = "paid" | "out of date" | "progress" | "draft";

export interface Invoice {
  id: string;
  category: string;
  price: string;
  status: InvoiceStatus;
}

export const newInvoices: Invoice[] = [
  { id: "INV-1990", category: "Android", price: "$83.74", status: "paid" },
  { id: "INV-1991", category: "Mac", price: "$97.14", status: "out of date" },
  { id: "INV-1992", category: "Windows", price: "$68.71", status: "progress" },
  { id: "INV-1993", category: "Android", price: "$85.21", status: "paid" },
  { id: "INV-1994", category: "Mac", price: "$52.17", status: "paid" },
];

export interface RelatedApp {
  name: string;
  icon: string;
  price: string;
  size: string;
  downloads: string;
  rating: number;
  reviews: string;
}

export const relatedApps: RelatedApp[] = [
  { name: "Microsoft office 365", icon: "/apps/ic-app-1.webp", price: "Free", size: "9.68 Mb", downloads: "9.91k", rating: 4, reviews: "9.91k" },
  { name: "Opera", icon: "/apps/ic-app-2.webp", price: "Free", size: "1.9 Mb", downloads: "1.95k", rating: 3.5, reviews: "1.95k" },
  { name: "Adobe acrobat reader DC", icon: "/apps/ic-app-3.webp", price: "$68.71", size: "8.91 Mb", downloads: "9.12k", rating: 4.5, reviews: "9.12k" },
  { name: "Joplin", icon: "/apps/ic-app-4.webp", price: "Free", size: "6.82 Mb", downloads: "6.98k", rating: 3.5, reviews: "6.98k" },
  { name: "Topaz photo AI", icon: "/apps/ic-app-5.webp", price: "$52.17", size: "8.29 Mb", downloads: "8.49k", rating: 0.5, reviews: "8.49k" },
];

export interface CountryStat {
  code: string;
  flag: string;
  name: string;
  android: number;
  windows: number;
  apple: number;
}

export const topCountries: CountryStat[] = [
  { code: "de", flag: "🇩🇪", name: "Germany", android: 9.91, windows: 1.95, apple: 9.12 },
  { code: "gb", flag: "🇬🇧", name: "England", android: 1.95, windows: 9.12, apple: 6.98 },
  { code: "fr", flag: "🇫🇷", name: "France", android: 9.12, windows: 6.98, apple: 8.49 },
  { code: "kr", flag: "🇰🇷", name: "Korean", android: 6.98, windows: 8.49, apple: 2.03 },
  { code: "us", flag: "🇺🇸", name: "USA", android: 8.49, windows: 2.03, apple: 3.36 },
];

export interface AuthorStat {
  name: string;
  total: string;
  avatar: string;
  rank: number;
}

export const topAuthors: AuthorStat[] = [
  { name: "Jayvion Simon", total: "9.91k", avatar: "/avatars/avatar-1.webp", rank: 1 },
  { name: "Deja Brady", total: "9.12k", avatar: "/avatars/avatar-3.webp", rank: 2 },
  { name: "Lucian Obrien", total: "1.95k", avatar: "/avatars/avatar-2.webp", rank: 3 },
];

export interface CircularWidget {
  title: string;
  total: string;
  value: number;
  color: Extract<AccentColor, "primary" | "info">;
}

export const widgetCircular: CircularWidget[] = [
  { title: "Conversion", total: "38,566", value: 48, color: "primary" },
  { title: "Applications", total: "55,566", value: 75, color: "info" },
];

export const welcome = {
  name: "Jaydon Frankie",
  subtitle:
    "If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything.",
};

export interface WelcomeSlide {
  title: string;
  highlight?: string;
  subtitle: string;
  cta: string;
}

export const welcomeSlides: WelcomeSlide[] = [
  {
    title: "Welcome back 👋",
    highlight: "Jaydon Frankie",
    subtitle:
      "If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything.",
    cta: "Go now",
  },
  {
    title: "Get started faster 🚀",
    subtitle:
      "Set up your workspace in minutes and explore everything the dashboard has to offer.",
    cta: "Explore now",
  },
  {
    title: "Track your growth 📈",
    subtitle:
      "Monitor performance, downloads, and active users — all from one place.",
    cta: "View reports",
  },
];

export interface FeaturedSlide {
  category: string;
  title: string;
  caption: string;
  image: string;
}

export const featuredSlides: FeaturedSlide[] = [
  {
    category: "Featured App",
    title: "The Rise of Remote Work: Benefits, Challenges, and Future Trends",
    caption: "The aroma of freshly brewed coffee filled the air, awakening my senses.",
    image: "/cover-4.webp",
  },
  {
    category: "Featured App",
    title: "Understanding Blockchain Technology: Beyond Cryptocurrency",
    caption: "The children giggled with joy as they ran through the sprinklers on a hot summer day.",
    image: "/cover-5.webp",
  },
  {
    category: "Featured App",
    title: "Mental Health in the Digital Age: Navigating Social Media and Well-being",
    caption: "He carefully crafted a beautiful sculpture out of clay, his hands skillfully shaping the intricate details.",
    image: "/cover-3.webp",
  },
];
