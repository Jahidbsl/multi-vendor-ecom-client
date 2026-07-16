import { notFound } from "next/navigation";
import ProductDetailsView from "@/components/ProductDetailsView";
import { getProductById } from "@/lib/api/produts";

export default async function ProductPage({ params }) {
  const { id } = await params;
  const productId = id.split("-")[0]; 
  
  const product = await getProductById(productId);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-default-50/50 dark:bg-zinc-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <ProductDetailsView product={product} />
      </div>
    </div>
  );
}