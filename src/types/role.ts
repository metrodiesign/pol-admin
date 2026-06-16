export type RoleColor = "danger" | "warning" | "info" | "neutral" | "success";
export type RolePortal = "admin" | "merchant";

export interface Role {
  id: string;
  portal: RolePortal;
  name: string;
  desc: string;
  color: RoleColor;
  /** Array of permission IDs granted to this role */
  permissions: string[];
}
