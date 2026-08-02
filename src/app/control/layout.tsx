import { MinimalsLayout } from "@/components/layout/minimals-layout";
import { ControlToaster } from "@/components/control/shared/toast";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <MinimalsLayout>
      {children}
      <ControlToaster />
    </MinimalsLayout>
  );
}
