import type { Job, DescriptionSection } from "@/types/job";

const R2 =
  "https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/company";

const SOFTWARE_ENGINEER_SECTIONS: DescriptionSection[] = [
  {
    heading: "Job description",
    paragraph:
      "Occaecati est et illo quibusdam accusamus qui. Incidunt aut et molestiae ut facere aut. Est quidem iusto praesentium excepturi harum nihil tenetur facilisi. Ut omnis voluptates nihil accusantium doloribus eaque debitis.",
  },
  {
    heading: "Key responsibilities",
    bullets: [
      "Collaborate with agencies to finalize design drawings, obtain quotations, and coordinate local production.",
      "Oversee the production of window displays, signage, interior setups, floor plans, and special promotional displays.",
      "Update and refresh displays to support new product launches, festive campaigns, and seasonal promotions.",
      "Plan and manage store openings, renovations, and closing procedures to ensure smooth execution.",
      "Monitor and follow up on store maintenance activities and maintain accurate SKU accur records.",
      "Control expenses and ensure all activities stay within the approved budget.",
      "Work closely with suppliers to source materials, props, and display elements.",
    ],
  },
];

// 12 base entries (page 1 data from spec) then repeated/varied for 8 pages
const BASE_JOBS: Omit<Job, "id">[] = [
  {
    title: "Software Engineer",
    company: "Lueilwitz and Sons",
    logoUrl: `${R2}/company-1.webp`,
    posted: "07 Jun 2026",
    candidates: 12,
    experience: "No experience",
    employmentType: "Full-time",
    salary: "Negotiable",
    salaryAmount: "83.74",
    role: "CEO",
    status: "Draft",
    descriptionSections: SOFTWARE_ENGINEER_SECTIONS,
    skills: ["UI", "UX", "Html"],
    benefits: ["Free parking", "Bonus commission"],
    workingSchedule: ["Monday to Friday", "Weekend availability"],
    locations: ["CA", "GB"],
    expired: "06/07/2026",
  },
  {
    title: "Marketing Manager",
    company: "Baumbach Group",
    logoUrl: `${R2}/company-2.webp`,
    posted: "06 Jun 2026",
    candidates: 12,
    experience: "1 year exp",
    employmentType: "Part-time",
    salary: "Negotiable",
    role: "CTO",
    status: "Published",
  },
  {
    title: "Data Scientist",
    company: "Wix Corp",
    logoUrl: `${R2}/company-3.webp`,
    posted: "05 Jun 2026",
    candidates: 12,
    experience: "2 year exp",
    employmentType: "On demand",
    salary: "Negotiable",
    role: "Project Coordinator",
    status: "Draft",
  },
  {
    title: "Graphic Designer",
    company: "Coca-Cola Inc",
    logoUrl: `${R2}/company-4.webp`,
    posted: "04 Jun 2026",
    candidates: 12,
    experience: "> 3 year exp",
    employmentType: "Part-time",
    salary: "$85.21",
    role: "Team Leader",
    status: "Published",
  },
  {
    title: "Financial Analyst",
    company: "TikTok Ltd",
    logoUrl: `${R2}/company-5.webp`,
    posted: "03 Jun 2026",
    candidates: 12,
    experience: "1 year exp",
    employmentType: "On demand",
    salary: "$52.17",
    role: "Software Developer",
    status: "Published",
  },
  {
    title: "Human Resources Specialist",
    company: "Best Buy Co",
    logoUrl: `${R2}/company-6.webp`,
    posted: "02 Jun 2026",
    candidates: 12,
    experience: "1 year exp",
    employmentType: "Part-time",
    salary: "Negotiable",
    role: "Marketing Strategist",
    status: "Published",
  },
  {
    title: "Project Manager",
    company: "Dropbox Inc",
    logoUrl: `${R2}/company-7.webp`,
    posted: "01 Jun 2026",
    candidates: 12,
    experience: "1 year exp",
    employmentType: "Negotiable",
    salary: "$43.84",
    role: "Data Analyst",
    status: "Draft",
  },
  {
    title: "Sales Executive",
    company: "FedEx Corp",
    logoUrl: `${R2}/company-8.webp`,
    posted: "31 May 2026",
    candidates: 12,
    experience: "1 year exp",
    employmentType: "Part-time",
    salary: "$60.98",
    role: "Product Owner",
    status: "Published",
  },
  {
    title: "Content Writer",
    company: "Aldi Group",
    logoUrl: `${R2}/company-9.webp`,
    posted: "30 May 2026",
    candidates: 12,
    experience: "1 year exp",
    employmentType: "On demand",
    salary: "$98.42",
    role: "Graphic Designer",
    status: "Published",
  },
  {
    title: "Network Administrator",
    company: "Huawei Tech",
    logoUrl: `${R2}/company-10.webp`,
    posted: "29 May 2026",
    candidates: 12,
    experience: "1 year exp",
    employmentType: "Part-time",
    salary: "$53.37",
    role: "Operations Manager",
    status: "Published",
  },
  {
    title: "Customer Service Representative",
    company: "McDonald's Corp",
    logoUrl: `${R2}/company-11.webp`,
    posted: "28 May 2026",
    candidates: 12,
    experience: "1 year exp",
    employmentType: "On demand",
    salary: "Negotiable",
    role: "Customer Support Specialist",
    status: "Published",
  },
  {
    title: "Product Manager",
    company: "Spotify AB",
    logoUrl: `${R2}/company-12.webp`,
    posted: "27 May 2026",
    candidates: 12,
    experience: "1 year exp",
    employmentType: "Part-time",
    salary: "Negotiable",
    role: "Sales Manager",
    status: "Published",
  },
];

// Generate 96 jobs (8 pages x 12) using the base 12 and extending
export const JOBS: Job[] = Array.from({ length: 8 }, (_, pageIdx) =>
  BASE_JOBS.map((job, i) => ({
    ...job,
    id: `e99f09a7-dd88-49d5-b1c8-1daf80c2d7b${String(pageIdx * 12 + i + 1).padStart(1, "0")}`,
    posted:
      pageIdx === 0
        ? job.posted
        : `${String(BASE_JOBS.length - i).padStart(2, "0")} May ${2026 - pageIdx}`,
    logoUrl: `${R2}/company-${((i % 12) + 1)}.webp`,
  }))
).flat();

// First job (for details/edit pages). JOBS is always non-empty (generated from 8×12 items).
export const FIRST_JOB = JOBS[0];

export const JOB_ROLES = [
  "CEO",
  "CTO",
  "Project Coordinator",
  "Team Leader",
  "Software Developer",
  "Marketing Strategist",
  "Data Analyst",
  "Product Owner",
  "Graphic Designer",
  "Operations Manager",
  "Customer Support Specialist",
  "Sales Manager",
  "UX Designer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "DevOps Engineer",
  "Product Manager",
  "HR Manager",
  "Financial Analyst",
];

export const JOB_SKILLS = [
  "UI",
  "UX",
  "Html",
  "CSS",
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "Java",
  "Figma",
  "Sketch",
  "Adobe XD",
  "Photoshop",
  "Illustrator",
];

export const JOB_SCHEDULES = [
  "Monday to Friday",
  "Weekend availability",
  "Day shift",
  "Night shift",
  "Flexible hours",
  "Remote",
];

export const JOB_LOCATIONS = [
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
];

export const JOB_BENEFITS = [
  "Free parking",
  "Bonus commission",
  "Travel",
  "Device support",
  "Health care",
  "Training",
  "Health insurance",
  "Retirement plans",
  "Paid time off",
  "Flexible work schedule",
];
