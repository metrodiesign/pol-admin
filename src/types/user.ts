export type UserStatus = "active" | "banned";

export interface User {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  avatarUrl: string;
  phoneNumber: string;
  company: string;
  roles: string[];
  status: UserStatus;
}
