// UI-only, ไม่มี endpoint รองรับ — pol-core ไม่มี analytics/summary-stat endpoint
// เลย ต้องมี dashboard summary endpoint ก่อนถึงจะ align ได้ (REQ-7.2).
export interface AnalyticsStat {
  title: string;
  total: string;
  trend: { value: number; up: boolean };
  icon: string;
  colorScheme: "primary" | "secondary" | "warning" | "error";
}

export const analyticsStats: AnalyticsStat[] = [
  { title: "Weekly sales", total: "714k", trend: { value: 2.6, up: true }, icon: "shopping-bag", colorScheme: "primary" },
  { title: "New users", total: "1.35m", trend: { value: 0.1, up: false }, icon: "users", colorScheme: "secondary" },
  { title: "Purchase orders", total: "1.72m", trend: { value: 2.8, up: true }, icon: "file-text", colorScheme: "warning" },
  { title: "Messages", total: "234", trend: { value: 3.6, up: true }, icon: "mail", colorScheme: "error" },
];

export const COLOR_MAP = {
  primary:   { text: "#004B50", bg: "rgba(0, 167, 111, 0.08)",   icon: "#00A76F", gradFrom: "rgba(0,167,111,0.72)",  gradTo: "rgba(0,167,111,0.24)"  },
  secondary: { text: "#27097A", bg: "rgba(142, 51, 255, 0.08)",  icon: "#8E33FF", gradFrom: "rgba(142,51,255,0.56)", gradTo: "rgba(142,51,255,0.18)" },
  warning:   { text: "#7A4100", bg: "rgba(255, 171, 0, 0.08)",   icon: "#FFAB00", gradFrom: "rgba(255,171,0,0.64)",  gradTo: "rgba(255,171,0,0.22)"  },
  error:     { text: "#7A0916", bg: "rgba(255, 86, 48, 0.08)",   icon: "#FF5630", gradFrom: "rgba(255,86,48,0.60)",  gradTo: "rgba(255,86,48,0.20)"  },
};

export interface VisitSlice {
  label: string;
  value: number;
  percent: string;
  color: string;
}

export const currentVisits: VisitSlice[] = [
  { label: "America", value: 4344, percent: "43.8%", color: "#00A76F" },
  { label: "Asia", value: 3105, percent: "31.3%", color: "#FFD666" },
  { label: "Europe", value: 1863, percent: "18.8%", color: "#006C9C" },
  { label: "Africa", value: 625, percent: "6.3%", color: "#FF5630" },
];

export const websiteVisits = {
  change: "(+43%) than last year",
  categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
  series: [
    { name: "Team A", data: [43, 33, 22, 37, 67, 68, 37, 24, 55], color: "#00A76F" },
    { name: "Team B", data: [51, 70, 47, 67, 40, 37, 24, 70, 24], color: "#FFAB00" },
  ],
};

export const conversionRates = {
  change: "(+43%) than last year",
  categories: ["Italy", "Japan", "China", "Canada", "France"],
  series: [
    { name: "2022", data: [44, 55, 41, 64, 22], color: "#00A76F" },
    { name: "2023", data: [53, 32, 33, 52, 13], color: "#FFAB00" },
  ],
};

export const currentSubject = {
  categories: ["English", "History", "Physics", "Geography", "Chinese", "Math"],
  series: [
    { name: "Series 1", data: [80, 50, 30, 40, 100, 20], color: "#00A76F" },
    { name: "Series 2", data: [20, 30, 40, 80, 20, 80], color: "#FFAB00" },
    { name: "Series 3", data: [44, 76, 78, 13, 43, 10], color: "#FF5630" },
  ],
};

export interface NewsItem {
  title: string;
  description: string;
  image: string;
  postedAt: string;
}

export const newsItems: NewsItem[] = [
  {
    title: "The Future of Renewable Energy: Innovations and Challenges Ahead",
    description: "The sun slowly set over the horizon, painting the sky in vibrant hues of orange and pink.",
    image: "/covers/cover-1.webp",
    postedAt: "a few seconds",
  },
  {
    title: "Exploring the Impact of Artificial Intelligence on Modern Healthcare",
    description: "She eagerly opened the gift, her eyes sparkling with excitement.",
    image: "/covers/cover-2.webp",
    postedAt: "a day",
  },
  {
    title: "Climate Change and Its Effects on Global Food Security",
    description: "The old oak tree stood tall and majestic, its branches swaying gently in the breeze.",
    image: "/covers/cover-3.webp",
    postedAt: "2 days",
  },
  {
    title: "The Rise of Remote Work: Benefits, Challenges, and Future Trends",
    description: "The aroma of freshly brewed coffee filled the air, awakening my senses.",
    image: "/covers/cover-4.webp",
    postedAt: "3 days",
  },
  {
    title: "Understanding Blockchain Technology: Beyond Cryptocurrency",
    description: "The children giggled with joy as they ran through the sprinklers on a hot summer day.",
    image: "/covers/cover-5.webp",
    postedAt: "4 days",
  },
];

export interface TimelineEvent {
  title: string;
  time: string;
  color: string;
}

export const orderTimeline: TimelineEvent[] = [
  { title: "1983, orders, $4220", time: "07 Jun 2026 10:17 pm", color: "#00A76F" },
  { title: "12 Invoices have been paid", time: "06 Jun", color: "#22C55E" },
  { title: "Order #37745 from September", time: "05 Jun", color: "#00B8D9" },
  { title: "New order placed #XF-2356", time: "04 Jun", color: "#FFAB00" },
  { title: "New order placed #XF-2346", time: "03 Jun", color: "#FF5630" },
];

export interface TrafficSite {
  name: string;
  value: string;
  icon: string;
  color: string;
}

export const trafficBySite: TrafficSite[] = [
  { name: "Facebook", value: "1.95k", icon: "facebook", color: "#1877F2" },
  { name: "Google", value: "9.12k", icon: "google", color: "#DF3E30" },
  { name: "Linkedin", value: "6.98k", icon: "linkedin", color: "#006097" },
  { name: "Twitter", value: "8.49k", icon: "twitter", color: "#1C9CEA" },
];

export const analyticsTasks = [
  { label: "Prepare Monthly Financial Report", done: true },
  { label: "Design New Marketing Campaign", done: true },
  { label: "Analyze Customer Feedback", done: false },
  { label: "Update Website Content", done: false },
  { label: "Conduct Market Research", done: false },
];
