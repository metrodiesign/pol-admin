export type UserStatus = "active" | "pending" | "banned" | "rejected" | "disabled";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  phoneNumber: string;
  company: string;
  role: string;
  status: UserStatus;
}
