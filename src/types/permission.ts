export type PermissionGroup = "Payment" | "Policy" | "Users" | "System" | "Reports";

export interface Permission {
  id: string;
  label: string;
  group: PermissionGroup;
}
