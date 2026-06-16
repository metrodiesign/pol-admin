import { PageHeader } from "@/components/shared/page-header";
import { ProductForm } from "@/components/dashboard/product/product-form";

export const metadata = {
  title: "Create a new product | Dashboard - Minimal UI",
};

export default function ProductCreatePage() {
  return (
    <>
      <PageHeader
        title="Create a new product"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Product", href: "/dashboard/product/list" },
          { label: "Create" },
        ]}
      />
      <ProductForm mode="create" />
    </>
  );
}
