import { PageHeader } from "@/components/shared/page-header";
import { RoleToggle } from "@/components/dashboard/permission/role-toggle";

const LOREM =
  "Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Vestibulum fringilla pede sit amet augue.";

const CARDS = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  title: `Card ${i + 1}`,
  subtitle: "Proin viverra ligula",
  body: LOREM,
}));

export const metadata = {
  title: "Permission | Dashboard - Minimal UI",
};

export default function PermissionPage() {
  return (
    <>
      <PageHeader
        title="Permission"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Permission" },
        ]}
      />

      {/* Role toggle — centered, with vertical breathing room */}
      <div className="mt-6 mb-8">
        <RoleToggle />
      </div>

      {/* Card grid — always 2 columns, including mobile */}
      <div className="grid grid-cols-2 gap-6">
        {CARDS.map((card) => (
          <div key={card.id} className="dashboard-card">
            {/* Card header */}
            <div className="px-6 pt-6 pb-2">
              <h6
                className="text-lg font-semibold leading-7 text-grey-800"
                style={{ fontSize: "18px", lineHeight: "28px" }}
              >
                {card.title}
              </h6>
              <p className="mt-0.5 text-sm text-grey-600">{card.subtitle}</p>
            </div>
            {/* Card body */}
            <div className="px-6 pb-6">
              <p
                className="text-sm font-normal text-grey-600"
                style={{ lineHeight: "22px" }}
              >
                {card.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
