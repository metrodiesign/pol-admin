import { PageHeader } from "@/components/shared/page-header";
import { ProductForm } from "@/components/dashboard/product/product-form";
import { SAMPLE_PRODUCT } from "@/lib/mock/product";

export const metadata = {
  title: "Product edit | Dashboard - Minimal UI",
};

export default function ProductEditPage() {
  const product = SAMPLE_PRODUCT;

  return (
    <>
      <PageHeader
        title="Edit"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Product", href: "/dashboard/product/list" },
          { label: product.name },
        ]}
      />
      <ProductForm
        mode="edit"
        defaultValues={{
          productName: product.name,
          subDescription:
            "Featuring the original ripple design inspired by Japanese bullet trains, the Nike Air Max 97 lets you push your style full-speed ahead.",
          content: `<h6>Specifications</h6><p>Category: Mobile</p><p>Manufacturer: Apple</p><p>Warranty: 12 Months</p><p>Serial number: 358607726380311</p><p>Ships from: United States</p><h6>Product details</h6><ul><li>The foam sockliner feels soft and comfortable</li><li>Pull tab</li><li>Not intended for use as Personal Protective Equipment</li><li>Colour Shown: White/Black/Oxygen Purple/Action Grape</li><li>Style: 921826-109</li><li>Country/Region of Origin: China</li></ul><h6>Benefits</h6><ul><li>Mesh and synthetic materials on the upper keep the foot feeling comfortable and durable</li><li>Originally designed for performance running, the full-length Nike Air unit adds soft, comfortable cushioning underfoot</li><li>The foam midsole feels springy and soft</li><li>The rubber outsole adds better traction and durability</li></ul>`,
          images: product.images,
          productCode: "38BEE270",
          productSku: "WW75K5210YW/SV",
          quantity: "80",
          category: "Accessories",
          colors: ["Red", "Blue"],
          sizes: ["7", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12", "13"],
          tags: ["Technology", "Health and Wellness", "Travel", "Finance", "Education"],
          gender: ["Kids"],
          saleLabel: "SALE",
          newLabel: "NEW",
          regularPrice: "83.74",
          salePrice: "83.74",
          taxIncluded: false,
          tax: "10",
          published: true,
        }}
      />
    </>
  );
}
