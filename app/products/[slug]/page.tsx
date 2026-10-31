import { notFound } from "next/navigation";
import { ProductDetail } from "../../../components/product-detail";
import { productById, products } from "../../../lib/catalog";

export const dynamicParams = false;
export function generateStaticParams() { return products.map((product) => ({ slug: product.id })); }
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = productById((await params).slug);
  if (!product) notFound();
  return <ProductDetail key={product.id} product={product} />;
}
