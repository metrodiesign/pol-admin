import { CustomBreadcrumbs } from "@/components/shared/custom-breadcrumbs";
import { MailLayout } from "@/components/dashboard/mail/mail-layout";

export const metadata = {
  title: "Mail | Dashboard - Minimal UI",
};

export default function MailPage() {
  return (
    <>
      <CustomBreadcrumbs heading="Mail" links={[]} className="mb-5" />
      <MailLayout />
    </>
  );
}
