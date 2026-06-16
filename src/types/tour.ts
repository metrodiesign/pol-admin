export interface TourGuide {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface Tour {
  id: string;
  title: string;
  country: string;
  startDate: string;
  endDate: string;
  bookedCount: number;
  price: number;
  rating: number;
  heroImage: string;
  images: string[];
  guides: TourGuide[];
  duration: string;
  contactName: string;
  contactPhone: string;
  description: string;
  highlights: string[];
  program: { day: string; heading: string; body: string }[];
  services: string[];
  tags: string[];
  publish: boolean;
  postedAt: string;
  destination: string;
}

export interface Booker {
  id: string;
  name: string;
  avatarUrl: string;
  guests: number;
  approved: boolean;
}

export const ALL_SERVICES = [
  "Audio guide",
  "Food and drinks",
  "Lunch",
  "Private tour",
  "Special activities",
  "Entrance fees",
  "Gratuities",
  "Pick-up and drop off",
  "Professional guide",
  "Transport by air-conditioned",
] as const;

export type Service = (typeof ALL_SERVICES)[number];
