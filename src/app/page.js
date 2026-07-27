import DiscountBanner from "@/components/DiscountBanner";
import FeatureCard from "@/components/FeatureCard";
import { HeroBanner } from "@/components/Herobanner";
import TopSellingProducts from "@/components/Topsellingproducts";
import TopVendors from "@/components/TopVendors";

export default function Home() {
  return (
    <div>
      <HeroBanner />
      <FeatureCard />
      <DiscountBanner />
      <TopSellingProducts />
      <TopVendors />
    </div>
  );
}
