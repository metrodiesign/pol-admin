export type ExperienceLevel =
  | "No experience"
  | "1 year exp"
  | "2 year exp"
  | "> 3 year exp";

export type EmploymentType = "Full-time" | "Part-time" | "On demand" | "Negotiable";

export type SalaryMode = "Hourly" | "Custom";

export type JobStatus = "Draft" | "Published";

export interface DescriptionSection {
  heading: string;
  paragraph?: string;
  bullets?: string[];
}

export interface Job {
  id: string;
  title: string;
  company: string;
  logoUrl: string;
  posted: string; // "DD Mon YYYY"
  candidates: number;
  experience: ExperienceLevel;
  employmentType: EmploymentType;
  salary: string; // "Negotiable" | "$85.21" etc.
  /** Explicit numeric amount for edit pre-fill (used when salary === "Negotiable" but an amount still exists) */
  salaryAmount?: string;
  role: string;
  status: JobStatus;
  /** Structured content sections — rendered as React nodes, never via dangerouslySetInnerHTML */
  descriptionSections?: DescriptionSection[];
  skills?: string[];
  benefits?: string[];
  workingSchedule?: string[];
  locations?: string[];
  expired?: string;
}

export interface JobFormValues {
  title: string;
  content: string;
  employmentTypes: EmploymentType[];
  experience: ExperienceLevel;
  role: string;
  skills: string[];
  workingSchedule: string[];
  locations: string[];
  expired: string;
  salaryMode: SalaryMode;
  salaryAmount: string;
  negotiable: boolean;
  benefits: string[];
  publish: boolean;
}
