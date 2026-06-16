export type UserStatus = "active" | "pending" | "banned" | "rejected" | "disabled";
export type UserPortal = "admin" | "merchant";
export type IdpProvider = "azuread" | "google" | "line";
export type PersonType = "natural" | "juristic";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  phoneNumber: string;
  company: string;
  role: string;
  status: UserStatus;
  /** CentroPay additions (optional — won't break existing usage) */
  portal?: UserPortal;
  roles?: string[];
  idp?: IdpProvider;
  empId?: string;
  location?: string;
  personType?: PersonType;
  citizenId?: string;
  agentCode?: string;
  channels?: string[];
  lastLogin?: string;
  createdAt?: string;
  requestedRole?: string;
  disabledReason?: string;
}
