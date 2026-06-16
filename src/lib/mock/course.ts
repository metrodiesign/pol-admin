export const courseGreeting = {
  name: "Frankie",
  subtitle: "Let's learn something new today!",
};

export interface CourseStat {
  title: string;
  value: number;
  color: string;
  icon: string;
}

export const courseStats: CourseStat[] = [
  { title: "Courses in progress", value: 6, color: "#FFAB00", icon: "flame" },
  { title: "Courses completed", value: 3, color: "#00A76F", icon: "award" },
  { title: "Certificates", value: 2, color: "#8E33FF", icon: "file-badge" },
];

export const hoursSpent = {
  categories: ["2018", "2019", "2020", "2021", "2022", "2023"],
  data: [20, 60, 38, 82, 45, 100],
};

export const courseProgress = {
  total: 90,
  data: [
    { label: "To start", value: 30, color: "rgba(145,158,171,0.24)" },
    { label: "In progress", value: 40, color: "#118D57" },
    { label: "Completed", value: 20, color: "#FFAB00" },
  ],
};

export interface ContinueCourse {
  title: string;
  lessons: string;
  progress: number;
  image: string;
  color: string;
}

export const continueCourses: ContinueCourse[] = [
  { title: "Introduction to Python Programming", lessons: "Lessons: 7/12", progress: 58.3, image: "/covers/cover-1.webp", color: "#FFAB00" },
  { title: "Digital Marketing Fundamentals", lessons: "Lessons: 8/12", progress: 66.7, image: "/covers/cover-2.webp", color: "#00B8D9" },
  { title: "Data Science with R", lessons: "Lessons: 9/12", progress: 75, image: "/covers/cover-3.webp", color: "#00A76F" },
  { title: "Graphic Design Essentials", lessons: "Lessons: 10/12", progress: 83.3, image: "/covers/cover-4.webp", color: "#FF5630" },
];

export interface FeaturedCourse {
  title: string;
  price: string;
  image: string;
  duration: string;
  students: string;
}

export const featuredCourses: FeaturedCourse[] = [
  { title: "Introduction to Python Programming", price: "$83.74", image: "/covers/cover-1.webp", duration: "1h 40m", students: "497" },
  { title: "Digital Marketing Fundamentals", price: "$97.14", image: "/covers/cover-2.webp", duration: "2h 10m", students: "763" },
  { title: "Data Science with R", price: "$68.71", image: "/covers/cover-3.webp", duration: "3h 20m", students: "684" },
  { title: "Graphic Design Essentials", price: "$85.21", image: "/covers/cover-4.webp", duration: "1h 55m", students: "451" },
  { title: "Financial Planning for Beginners", price: "$52.17", image: "/covers/cover-5.webp", duration: "2h 30m", students: "433" },
  { title: "Human Resource Management Basics", price: "$25.18", image: "/covers/cover-1.webp", duration: "1h 15m", students: "463" },
];

export const strengthRadar = {
  categories: ["English", "History", "Physics", "Geography", "Chinese", "Math"],
  data: [80, 50, 30, 40, 100, 20],
};

export interface Reminder {
  title: string;
  date: string;
  progress: number;
  color: string;
}

export const reminders: Reminder[] = [
  { title: "Introduction to Python Programming", date: "07 Jun 2026 12:00 am", progress: 58.3, color: "#00A76F" },
  { title: "Digital Marketing Fundamentals", date: "07 Jun 2026 12:00 am", progress: 66.7, color: "#8E33FF" },
  { title: "Data Science with R", date: "07 Jun 2026 12:00 am", progress: 75, color: "#FF5630" },
  { title: "Graphic Design Essentials", date: "07 Jun 2026 12:00 am", progress: 83.3, color: "#FFAB00" },
];
