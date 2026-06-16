import { PageHeader } from "@/components/shared/page-header";
import { ProductTable } from "@/components/dashboard/product/product-table";
import { PRODUCTS } from "@/lib/mock/product";

export const metadata = {
  title: "Product list | Dashboard - Minimal UI",
};

export default function ProductListPage() {
  return (
    <>
      <PageHeader
        title="List"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Product", href: "/dashboard/product/list" },
          { label: "List" },
        ]}
        action={{ label: "Add product", href: "/dashboard/product/new" }}
      />
      <ProductTable products={PRODUCTS} />
    </>
  );
}
